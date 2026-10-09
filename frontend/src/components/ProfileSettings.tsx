import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { api, resolveMediaUrl, updateUser } from '../lib/api';

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
  const [uploadingAvatar, setUploadingAvatar] = useState(false);
  const [avatarError, setAvatarError] = useState('');
  const [profileMsg, setProfileMsg] = useState('');
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});

  const [pw, setPw] = useState({ oldPassword: '', newPassword: '', confirm: '' });
  const [showOldPw, setShowOldPw] = useState(false);
  const [showNewPw, setShowNewPw] = useState(false);
  const [changingPw, setChangingPw] = useState(false);
  const [pwMsg, setPwMsg] = useState('');
  const [pwError, setPwError] = useState('');

  const avatar = useMemo(() => {
    if (profile.avatarUrl) return resolveMediaUrl(profile.avatarUrl);
    return `https://ui-avatars.com/api/?name=${encodeURIComponent(profile.fullName || 'UniHome')}&background=random`;
  }, [profile.avatarUrl, profile.fullName]);

  const set = (key: string, value: any) => {
    setProfile((prev: any) => ({ ...prev, [key]: value }));
    if (fieldErrors[key]) {
      setFieldErrors(prev => {
        const copy = { ...prev };
        delete copy[key];
        return copy;
      });
    }
  };

  const uploadAvatar = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setAvatarError('');
    const validMimes = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
    if (!validMimes.includes(file.type.toLowerCase())) {
      setAvatarError('Chỉ hỗ trợ file ảnh định dạng JPG, PNG, WEBP hoặc GIF');
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      setAvatarError('Kích thước ảnh đại diện tối đa 5MB');
      return;
    }

    setUploadingAvatar(true);
    try {
      const formData = new FormData();
      formData.append('file', file);
      const res = await api.post('/auth/avatar', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });

      const updated = res.data.user || { ...profile, avatarUrl: res.data.avatarUrl };
      setProfile(updated);
      updateUser(updated);
      onSaved(updated);
      setProfileMsg('Cập nhật ảnh đại diện thành công!');
    } catch (err: any) {
      setAvatarError(err.response?.data?.message || 'Không thể tải ảnh lên. Vui lòng thử lại.');
    } finally {
      setUploadingAvatar(false);
    }
  };

  const useLocation = () => {
    if (!navigator.geolocation) return alert('Trình duyệt không hỗ trợ định vị GPS.');
    navigator.geolocation.getCurrentPosition(
      p => {
        setProfile((prev: any) => ({
          ...prev,
          homeLat: Number(p.coords.latitude.toFixed(6)),
          homeLng: Number(p.coords.longitude.toFixed(6))
        }));
        setProfileMsg('Đã cập nhật tọa độ vị trí hiện tại');
      },
      () => alert('Không lấy được vị trí GPS. Vui lòng cấp quyền hoặc nhập thủ công.')
    );
  };

  const save = async () => {
    setSaving(true);
    setFieldErrors({});
    setProfileMsg('');
    try {
      const r = await api.put('/auth/me', profile);
      updateUser(r.data);
      setProfile(r.data);
      onSaved(r.data);
      setProfileMsg('Đã lưu toàn bộ thông tin hồ sơ.');
    } catch (e: any) {
      if (e.response?.data?.fieldErrors) {
        setFieldErrors(e.response.data.fieldErrors);
      } else {
        alert(e.response?.data?.message || 'Không thể cập nhật hồ sơ.');
      }
    } finally {
      setSaving(false);
    }
  };

  const changePassword = async () => {
    setPwError('');
    setPwMsg('');
    if (!pw.oldPassword || !pw.newPassword) {
      setPwError('Vui lòng nhập mật khẩu hiện tại và mật khẩu mới');
      return;
    }
    if (pw.newPassword.length < 8) {
      setPwError('Mật khẩu mới tối thiểu 8 ký tự');
      return;
    }
    if (!/(?=.*[A-Za-z])(?=.*\d)/.test(pw.newPassword)) {
      setPwError('Mật khẩu mới phải bao gồm cả chữ cái và số');
      return;
    }
    if (pw.newPassword !== pw.confirm) {
      setPwError('Xác nhận mật khẩu mới không khớp');
      return;
    }

    setChangingPw(true);
    try {
      await api.post('/auth/change-password', {
        oldPassword: pw.oldPassword,
        newPassword: pw.newPassword,
        confirm: pw.confirm
      });
      setPw({ oldPassword: '', newPassword: '', confirm: '' });
      setPwMsg('Đổi mật khẩu thành công!');
    } catch (e: any) {
      setPwError(e.response?.data?.message || 'Không thể đổi mật khẩu.');
    } finally {
      setChangingPw(false);
    }
  };

  return (
    <div className="space-y-6">
      {profileMsg && (
        <div className="p-4 rounded-xl bg-indigo-50 border border-indigo-200 text-sm text-indigo-700 flex justify-between items-center">
          <span>✓ {profileMsg}</span>
          <button onClick={() => setProfileMsg('')} className="text-indigo-500 font-bold hover:text-indigo-800">×</button>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-[280px_1fr] gap-6">
        <aside className="space-y-4">
          <div className="bg-white border border-gray-200 rounded-2xl p-6 text-center shadow-sm">
            <div className="relative w-28 h-28 mx-auto">
              <img
                src={avatar}
                alt="Avatar"
                className="w-28 h-28 rounded-full object-cover border-4 border-indigo-50 shadow-sm"
              />
              {uploadingAvatar && (
                <div className="absolute inset-0 bg-black/40 rounded-full flex items-center justify-center text-white text-xs font-bold">
                  Đang tải...
                </div>
              )}
            </div>

            <h2 className="mt-4 text-xl font-bold text-gray-900">{profile.fullName || 'Người dùng UniHome'}</h2>
            <p className="text-xs text-gray-500 mt-1">{profile.schoolName || profile.role || 'Chưa cập nhật vai trò'}</p>

            <label className="mt-4 inline-block cursor-pointer text-xs font-bold text-indigo-600 hover:text-indigo-800 px-3 py-1.5 border border-indigo-200 rounded-lg hover:bg-indigo-50 transition-colors">
              Đổi ảnh đại diện
              <input type="file" accept="image/jpeg,image/png,image/webp,image/gif" onChange={uploadAvatar} className="hidden" />
            </label>
            {avatarError && <p className="text-xs text-red-600 mt-2">{avatarError}</p>}

            <button
              onClick={() => nav(`/users/${profile.id}`)}
              className="mt-4 block w-full border border-gray-200 rounded-xl py-2 text-xs font-semibold text-gray-700 hover:bg-gray-50 transition-colors"
            >
              Xem hồ sơ công khai
            </button>
          </div>

          <div className="bg-white border border-gray-200 rounded-2xl p-4 text-xs font-semibold space-y-1.5">
            <button onClick={() => nav(profile.role === 'LANDLORD' ? '/chat' : '/tenant/chat')} className="w-full text-left px-3 py-2.5 rounded-lg hover:bg-gray-50 text-gray-700 flex items-center gap-2">
              <span>💬</span> Tin nhắn
            </button>
            <button onClick={() => nav(notificationPath)} className="w-full text-left px-3 py-2.5 rounded-lg hover:bg-gray-50 text-gray-700 flex items-center gap-2">
              <span>🔔</span> Thông báo
            </button>
            <button onClick={() => nav('/tenant/wallet')} className="w-full text-left px-3 py-2.5 rounded-lg hover:bg-gray-50 text-gray-700 flex items-center gap-2">
              <span>💳</span> Ví & giao dịch
            </button>
            {showMatching && (
              <button onClick={() => nav('/tenant/matching')} className="w-full text-left px-3 py-2.5 rounded-lg hover:bg-purple-50 text-purple-700 flex items-center gap-2 font-bold">
                <span>✨</span> Hồ sơ Matching
              </button>
            )}
          </div>
        </aside>

        <div className="space-y-6">
          {/* Account Details */}
          <section className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm">
            <div className="mb-5">
              <h3 className="text-xl font-bold text-gray-900">Thông tin tài khoản</h3>
              <p className="text-xs text-gray-500 mt-1">Thông tin cơ bản và dữ liệu hiển thị trên UniHome.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Field label="Họ và tên">
                  <input
                    className={`input ${fieldErrors.fullName ? 'border-red-400 bg-red-50/20' : ''}`}
                    value={profile.fullName || ''}
                    onChange={e => set('fullName', e.target.value)}
                  />
                </Field>
                {fieldErrors.fullName && <p className="text-xs text-red-600 mt-1">{fieldErrors.fullName}</p>}
              </div>

              <div>
                <Field label="Email đăng nhập">
                  <div className="relative">
                    <input className="input bg-gray-50 text-gray-500 cursor-not-allowed" value={profile.email || ''} disabled />
                    <span className="absolute right-3 top-3 text-[11px] font-bold text-green-600">
                      {profile.emailVerified ? '✓ Đã xác thực' : '⚠ Chưa xác thực'}
                    </span>
                  </div>
                </Field>
              </div>

              <div>
                <Field label="Số điện thoại liên hệ">
                  <div className="relative">
                    <input
                      className={`input ${fieldErrors.phone ? 'border-red-400 bg-red-50/20' : ''}`}
                      value={profile.phone || ''}
                      onChange={e => set('phone', e.target.value)}
                    />
                    <span className={`absolute right-3 top-3 text-[11px] font-bold ${profile.phoneVerified ? 'text-green-600' : 'text-amber-600'}`}>
                      {profile.phoneVerified ? '✓ Đã xác thực' : '⚠ Cần xác thực'}
                    </span>
                  </div>
                </Field>
                {fieldErrors.phone && <p className="text-xs text-red-600 mt-1">{fieldErrors.phone}</p>}
                {!profile.phoneVerified && (
                  <button
                    type="button"
                    onClick={() => nav('/verify-otp', { state: { userId: profile.id, email: profile.email, phone: profile.phone, emailVerified: profile.emailVerified, phoneVerified: false } })}
                    className="text-[11px] font-bold text-indigo-600 hover:underline mt-1"
                  >
                    Xác thực số điện thoại ngay →
                  </button>
                )}
              </div>

              <div>
                <Field label="Ngày sinh">
                  <input
                    type="date"
                    className={`input ${fieldErrors.dob ? 'border-red-400 bg-red-50/20' : ''}`}
                    value={profile.dob || ''}
                    onChange={e => set('dob', e.target.value)}
                  />
                </Field>
                {fieldErrors.dob && <p className="text-xs text-red-600 mt-1">{fieldErrors.dob}</p>}
              </div>

              <div>
                <Field label="Giới tính">
                  <select className="input" value={profile.gender || ''} onChange={e => set('gender', e.target.value)}>
                    <option value="">Chọn giới tính</option>
                    <option value="Nam">Nam</option>
                    <option value="Nữ">Nữ</option>
                  </select>
                </Field>
              </div>

              <div>
                <Field label="Trường / Cơ sở học tập">
                  <input
                    className="input"
                    value={profile.schoolName || ''}
                    onChange={e => set('schoolName', e.target.value)}
                    placeholder="VD: ĐH FPT Hà Nội, ĐH Bách Khoa..."
                  />
                </Field>
              </div>
            </div>

            <div className="mt-4">
              <Field label="Giới thiệu bản thân">
                <textarea
                  className="input min-h-24 text-sm"
                  value={profile.bio || ''}
                  onChange={e => set('bio', e.target.value)}
                  placeholder="Giới thiệu ngắn gọn tính cách, sở thích hoặc thói quen sinh hoạt..."
                />
              </Field>
            </div>
          </section>

          {/* Social Links */}
          <section className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm">
            <h3 className="text-xl font-bold text-gray-900">Liên hệ & Mạng xã hội</h3>
            <p className="text-xs text-gray-500 mt-1 mb-4">
              Để bảo vệ quyền riêng tư, thông tin mạng xã hội của người thuê chỉ được chia sẻ khi matching đạt tiêu chí hoặc được chấp thuận.
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Field label="Facebook cá nhân">
                  <input
                    className={`input ${fieldErrors.facebookUrl ? 'border-red-400 bg-red-50/20' : ''}`}
                    value={profile.facebookUrl || ''}
                    onChange={e => set('facebookUrl', e.target.value)}
                    placeholder="https://facebook.com/..."
                  />
                </Field>
                {fieldErrors.facebookUrl && <p className="text-xs text-red-600 mt-1">{fieldErrors.facebookUrl}</p>}
              </div>

              <div>
                <Field label="Zalo / Số Zalo">
                  <input
                    className={`input ${fieldErrors.zaloUrl ? 'border-red-400 bg-red-50/20' : ''}`}
                    value={profile.zaloUrl || ''}
                    onChange={e => set('zaloUrl', e.target.value)}
                    placeholder="https://zalo.me/... hoặc SĐT"
                  />
                </Field>
                {fieldErrors.zaloUrl && <p className="text-xs text-red-600 mt-1">{fieldErrors.zaloUrl}</p>}
              </div>

              <div className="md:col-span-2">
                <Field label="Mạng xã hội khác">
                  <input
                    className={`input ${fieldErrors.otherSocialUrl ? 'border-red-400 bg-red-50/20' : ''}`}
                    value={profile.otherSocialUrl || ''}
                    onChange={e => set('otherSocialUrl', e.target.value)}
                    placeholder="Instagram / Telegram / LinkedIn..."
                  />
                </Field>
                {fieldErrors.otherSocialUrl && <p className="text-xs text-red-600 mt-1">{fieldErrors.otherSocialUrl}</p>}
              </div>
            </div>
          </section>

          {/* Location & Radius */}
          <section className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm">
            <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
              <div>
                <h3 className="text-xl font-bold text-gray-900">Vị trí & Bán kính gợi ý</h3>
                <p className="text-xs text-gray-500 mt-1">Dùng để gợi ý phòng trọ lân cận và Nearby Matching.</p>
              </div>
              <button
                type="button"
                onClick={useLocation}
                className="px-3.5 py-1.5 rounded-xl bg-indigo-50 text-indigo-700 border border-indigo-100 text-xs font-bold hover:bg-indigo-100 transition-colors"
              >
                📍 Lấy vị trí GPS hiện tại
              </button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Field label="Vĩ độ (Latitude)">
                <input
                  type="number"
                  step="any"
                  className="input"
                  value={profile.homeLat ?? ''}
                  onChange={e => set('homeLat', e.target.value ? Number(e.target.value) : null)}
                />
              </Field>
              <Field label="Kinh độ (Longitude)">
                <input
                  type="number"
                  step="any"
                  className="input"
                  value={profile.homeLng ?? ''}
                  onChange={e => set('homeLng', e.target.value ? Number(e.target.value) : null)}
                />
              </Field>
              <Field label="Bán kính matching">
                <select
                  className="input"
                  value={profile.matchingRadiusKm || 5}
                  onChange={e => set('matchingRadiusKm', Number(e.target.value))}
                >
                  <option value={1}>1 km</option>
                  <option value={2}>2 km</option>
                  <option value={3}>3 km</option>
                  <option value={5}>5 km</option>
                  <option value={10}>10 km</option>
                </select>
              </Field>
            </div>
          </section>

          <div className="flex justify-end">
            <button
              type="button"
              onClick={save}
              disabled={saving}
              className="bg-indigo-600 disabled:opacity-60 text-white px-8 py-3 rounded-xl font-bold text-sm shadow-sm hover:bg-indigo-700 transition-colors"
            >
              {saving ? 'Đang lưu...' : 'Lưu toàn bộ thay đổi'}
            </button>
          </div>

          {/* Password Change */}
          <section className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm">
            <h3 className="text-xl font-bold text-gray-900">Bảo mật & Đổi mật khẩu</h3>
            <p className="text-xs text-gray-500 mt-1 mb-4">Cập nhật mật khẩu tài khoản UniHome.</p>

            {pwError && <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-xs text-red-700 mb-4">{pwError}</div>}
            {pwMsg && <div className="p-3 bg-green-50 border border-green-200 rounded-xl text-xs text-green-700 mb-4">✓ {pwMsg}</div>}

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Field label="Mật khẩu hiện tại">
                <div className="relative">
                  <input
                    type={showOldPw ? 'text' : 'password'}
                    className="input pr-8"
                    value={pw.oldPassword}
                    onChange={e => setPw({ ...pw, oldPassword: e.target.value })}
                  />
                  <button
                    type="button"
                    onClick={() => setShowOldPw(!showOldPw)}
                    className="absolute right-2.5 top-3 text-[11px] text-gray-400"
                  >
                    {showOldPw ? 'Ẩn' : 'Hiện'}
                  </button>
                </div>
              </Field>

              <Field label="Mật khẩu mới (≥8 ký tự)">
                <div className="relative">
                  <input
                    type={showNewPw ? 'text' : 'password'}
                    className="input pr-8"
                    value={pw.newPassword}
                    onChange={e => setPw({ ...pw, newPassword: e.target.value })}
                  />
                  <button
                    type="button"
                    onClick={() => setShowNewPw(!showNewPw)}
                    className="absolute right-2.5 top-3 text-[11px] text-gray-400"
                  >
                    {showNewPw ? 'Ẩn' : 'Hiện'}
                  </button>
                </div>
              </Field>

              <Field label="Nhập lại mật khẩu mới">
                <input
                  type="password"
                  className="input"
                  value={pw.confirm}
                  onChange={e => setPw({ ...pw, confirm: e.target.value })}
                />
              </Field>
            </div>

            <button
              type="button"
              onClick={changePassword}
              disabled={changingPw}
              className="mt-4 px-5 py-2.5 rounded-xl border border-indigo-200 text-indigo-700 text-xs font-bold hover:bg-indigo-50 transition-colors"
            >
              {changingPw ? 'Đang đổi...' : 'Đổi mật khẩu'}
            </button>
          </section>
        </div>
      </div>

      <style>{`.input{margin-top:.25rem;width:100%;border:1px solid #d1d5db;border-radius:.75rem;padding:.65rem .85rem;font-size:.875rem;outline:none;transition:border-color .15s}.input:focus{border-color:#6366f1;box-shadow:0 0 0 2px rgba(99,102,241,.1)}`}</style>
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return <label className="block text-xs font-semibold text-gray-700">{label}{children}</label>;
}
