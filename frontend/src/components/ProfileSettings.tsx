import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../lib/api';

type Props = {
  profile: any;
  setProfile: (v: any) => void;
  onSaved: (v: any) => void;
  showMatching?: boolean;
};

export default function ProfileSettings({ profile, setProfile, onSaved, showMatching = true }: Props) {
  const nav = useNavigate();
  const notificationPath = profile?.role === 'LANDLORD' ? '/manager/notifications' : '/tenant/notifications';
  const [saving, setSaving] = useState(false);
  const [pw, setPw] = useState({ oldPassword: '', newPassword: '', confirm: '' });
  const [changing, setChanging] = useState(false);
  const avatar = useMemo(() => profile.avatarUrl || `https://ui-avatars.com/api/?name=${encodeURIComponent(profile.fullName || 'U')}&background=random`, [profile.avatarUrl, profile.fullName]);

  const set = (key: string, value: any) => setProfile({ ...profile, [key]: value });

  const uploadAvatar = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (!f) return;
    if (f.size > 2 * 1024 * 1024) return alert('Ảnh đại diện tối đa 2MB.');
    const reader = new FileReader();
    reader.onload = () => set('avatarUrl', String(reader.result));
    reader.readAsDataURL(f);
  };

  const useLocation = () => {
    if (!navigator.geolocation) return alert('Trình duyệt không hỗ trợ lấy vị trí.');
    navigator.geolocation.getCurrentPosition(
      p => setProfile({ ...profile, homeLat: p.coords.latitude, homeLng: p.coords.longitude }),
      () => alert('Không lấy được vị trí. Hãy cấp quyền vị trí hoặc nhập thủ công.')
    );
  };

  const save = async () => {
    setSaving(true);
    try {
      const r = await api.put('/auth/me', profile);
      localStorage.setItem('user', JSON.stringify(r.data));
      setProfile(r.data);
      onSaved(r.data);
      alert('Đã cập nhật hồ sơ.');
    } catch (e: any) {
      alert(e.response?.data?.message || 'Không thể cập nhật hồ sơ.');
    } finally { setSaving(false); }
  };

  const changePassword = async () => {
    if (!pw.oldPassword || !pw.newPassword) return alert('Nhập đủ mật khẩu cũ và mật khẩu mới.');
    if (pw.newPassword.length < 6) return alert('Mật khẩu mới tối thiểu 6 ký tự.');
    if (pw.newPassword !== pw.confirm) return alert('Xác nhận mật khẩu mới chưa khớp.');
    setChanging(true);
    try {
      await api.post('/auth/change-password', { oldPassword: pw.oldPassword, newPassword: pw.newPassword });
      setPw({ oldPassword: '', newPassword: '', confirm: '' });
      alert('Đổi mật khẩu thành công.');
    } catch (e: any) {
      alert(e.response?.data?.message || 'Không thể đổi mật khẩu.');
    } finally { setChanging(false); }
  };

  return <div className="space-y-6">
    <div className="grid grid-cols-1 lg:grid-cols-[260px_1fr] gap-6">
      <aside className="space-y-4">
        <div className="bg-white border rounded-2xl p-6 text-center shadow-sm">
          <img src={avatar} className="w-28 h-28 mx-auto rounded-full object-cover border-4 border-indigo-50" />
          <h2 className="mt-4 text-xl font-bold">{profile.fullName || 'Người dùng UniHome'}</h2>
          <p className="text-sm text-gray-500">{profile.schoolName || profile.role || 'Chưa cập nhật'}</p>
          <label className="mt-4 inline-block cursor-pointer text-sm font-semibold text-indigo-600 hover:text-indigo-800">
            Đổi ảnh đại diện
            <input type="file" accept="image/*" onChange={uploadAvatar} className="hidden" />
          </label>
          <button onClick={() => nav(`/users/${profile.id}`)} className="mt-3 block w-full border rounded-xl py-2.5 text-sm font-medium hover:bg-gray-50">Xem hồ sơ công khai</button>
        </div>
        <div className="bg-white border rounded-2xl p-4 text-sm space-y-2">
          <button onClick={() => nav('/chat')} className="w-full text-left px-3 py-2 rounded-lg hover:bg-gray-50">💬 Tin nhắn</button>
          <button onClick={() => nav(notificationPath)} className="w-full text-left px-3 py-2 rounded-lg hover:bg-gray-50">🔔 Thông báo</button>
          <button onClick={() => nav('/tenant/wallet')} className="w-full text-left px-3 py-2 rounded-lg hover:bg-gray-50">💳 Ví & giao dịch</button>
          {showMatching && <button onClick={() => nav('/tenant/matching')} className="w-full text-left px-3 py-2 rounded-lg hover:bg-purple-50 text-purple-700">✨ Hồ sơ Matching</button>}
        </div>
      </aside>

      <div className="space-y-6">
        <section className="bg-white border rounded-2xl p-6 shadow-sm">
          <div className="mb-5"><h3 className="text-xl font-bold">Thông tin tài khoản</h3><p className="text-sm text-gray-500 mt-1">Thông tin cơ bản và dữ liệu hiển thị trên UniHome.</p></div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Field label="Họ và tên"><input className="input" value={profile.fullName || ''} onChange={e => set('fullName', e.target.value)} /></Field>
            <Field label="Email đăng nhập"><input className="input bg-gray-50 text-gray-500" value={profile.email || ''} disabled /></Field>
            <Field label="Số điện thoại"><input className="input" value={profile.phone || ''} onChange={e => set('phone', e.target.value)} /></Field>
            <Field label="Ngày sinh"><input type="date" className="input" value={profile.dob || ''} onChange={e => set('dob', e.target.value)} /></Field>
            <Field label="Giới tính"><select className="input" value={profile.gender || ''} onChange={e => set('gender', e.target.value)}><option value="">Chọn giới tính</option><option value="Nam">Nam</option><option value="Nữ">Nữ</option></select></Field>
            <Field label="Trường / khu vực học tập"><input className="input" value={profile.schoolName || ''} onChange={e => set('schoolName', e.target.value)} placeholder="VD: Đại học FPT Hòa Lạc" /></Field>
          </div>
          <Field label="Giới thiệu bản thân"><textarea className="input min-h-28" value={profile.bio || ''} onChange={e => set('bio', e.target.value)} placeholder="Một vài thông tin công khai để người khác biết bạn là ai..." /></Field>
        </section>

        <section className="bg-white border rounded-2xl p-6 shadow-sm">
          <h3 className="text-xl font-bold">Liên hệ & mạng xã hội</h3>
          <p className="text-sm text-gray-500 mt-1 mb-5">Các link này có thể dùng khi matching hoặc người khác xem hồ sơ công khai.</p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Field label="Facebook"><input className="input" value={profile.facebookUrl || ''} onChange={e => set('facebookUrl', e.target.value)} placeholder="https://facebook.com/..." /></Field>
            <Field label="Zalo"><input className="input" value={profile.zaloUrl || ''} onChange={e => set('zaloUrl', e.target.value)} placeholder="https://zalo.me/..." /></Field>
            <Field label="MXH khác"><input className="input" value={profile.otherSocialUrl || ''} onChange={e => set('otherSocialUrl', e.target.value)} placeholder="Instagram / Telegram / link khác" /></Field>
          </div>
        </section>

        <section className="bg-white border rounded-2xl p-6 shadow-sm">
          <div className="flex flex-wrap items-center justify-between gap-3 mb-4"><div><h3 className="text-xl font-bold">Vị trí & phạm vi gợi ý</h3><p className="text-sm text-gray-500 mt-1">Dùng để gợi ý phòng gần bạn và Nearby Matching.</p></div><button onClick={useLocation} className="px-4 py-2 rounded-xl bg-indigo-50 text-indigo-700 border border-indigo-100 text-sm font-semibold">📍 Lấy vị trí hiện tại</button></div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Field label="Vĩ độ"><input className="input" value={profile.homeLat ?? ''} onChange={e => set('homeLat', e.target.value)} /></Field>
            <Field label="Kinh độ"><input className="input" value={profile.homeLng ?? ''} onChange={e => set('homeLng', e.target.value)} /></Field>
            <Field label="Bán kính matching"><select className="input" value={profile.matchingRadiusKm || 5} onChange={e => set('matchingRadiusKm', Number(e.target.value))}><option value={1}>1 km</option><option value={3}>3 km</option><option value={5}>5 km</option></select></Field>
          </div>
        </section>

        <div className="flex justify-end"><button onClick={save} disabled={saving} className="bg-indigo-600 disabled:opacity-60 text-white px-7 py-3 rounded-xl font-bold shadow-sm">{saving ? 'Đang lưu...' : 'Lưu toàn bộ thay đổi'}</button></div>

        <section className="bg-white border rounded-2xl p-6 shadow-sm">
          <h3 className="text-xl font-bold">Bảo mật</h3><p className="text-sm text-gray-500 mt-1 mb-5">Đổi mật khẩu tài khoản UniHome.</p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Field label="Mật khẩu hiện tại"><input type="password" className="input" value={pw.oldPassword} onChange={e => setPw({ ...pw, oldPassword: e.target.value })} /></Field>
            <Field label="Mật khẩu mới"><input type="password" className="input" value={pw.newPassword} onChange={e => setPw({ ...pw, newPassword: e.target.value })} /></Field>
            <Field label="Nhập lại mật khẩu"><input type="password" className="input" value={pw.confirm} onChange={e => setPw({ ...pw, confirm: e.target.value })} /></Field>
          </div>
          <button onClick={changePassword} disabled={changing} className="mt-4 px-5 py-2.5 rounded-xl border border-indigo-200 text-indigo-700 font-semibold hover:bg-indigo-50">{changing ? 'Đang đổi...' : 'Đổi mật khẩu'}</button>
        </section>
      </div>
    </div>
    <style>{`.input{margin-top:.25rem;width:100%;border:1px solid #d1d5db;border-radius:.65rem;padding:.7rem .8rem;outline:none}.input:focus{border-color:#6366f1;box-shadow:0 0 0 2px rgba(99,102,241,.12)}`}</style>
  </div>;
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return <label className="block text-sm font-medium text-gray-700">{label}{children}</label>;
}
