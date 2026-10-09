import { useEffect, useState } from 'react';
import { api, getUser, money } from '../lib/api';
import { useLocation, useNavigate, useSearchParams } from 'react-router-dom';
import LocationPicker from '../components/LocationPicker';
export default function MatchingPage() {
  const nav = useNavigate();
  const location = useLocation();
  const user = getUser();
  const [sp] = useSearchParams();
  const listingId = sp.get('listingId');
  const [p, setP] = useState<any>({ enabled: true, radiusKm: 5, gender: user?.gender || '', cleanlinessLevel: 3 });
  const [results, setResults] = useState<any[]>([]);
  const [mode, setMode] = useState<'profile' | 'results'>('profile');
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  useEffect(() => {
    if (!user) {
      nav('/login', { state: { from: location.pathname + location.search } });
      return;
    }
    void api.get('/matching/profile')
      .then(r => setP({ enabled: true, radiusKm: 5, cleanlinessLevel: 3, ...r.data }))
      .catch(() => {});
  }, []);

  const set = (k: string, v: any) => {
    setErrorMsg('');
    setSuccessMsg('');
    setP((prev: any) => ({ ...prev, [k]: v }));
  };

  const validate = () => {
    setErrorMsg('');
    const required = [
      ['gender', 'giới tính'],
      ['schoolName', 'trường/khu vực'],
      ['budgetMin', 'ngân sách tối thiểu'],
      ['budgetMax', 'ngân sách tối đa'],
      ['sleepSchedule', 'giờ ngủ'],
      ['smoking', 'hút thuốc'],
      ['pets', 'thú cưng'],
      ['noisePreference', 'mức ồn'],
      ['expenseStyle', 'cách chia chi phí']
    ];
    const miss = required.find(([k]) => p[k] === undefined || p[k] === null || String(p[k]).trim() === '');
    if (miss) {
      setErrorMsg(`Vui lòng hoàn thành mục "${miss[1]}" trước khi lưu hồ sơ Matching.`);
      return false;
    }
    if (p.budgetMin && p.budgetMax && Number(p.budgetMin) > Number(p.budgetMax)) {
      setErrorMsg('Ngân sách tối đa phải lớn hơn hoặc bằng ngân sách tối thiểu.');
      return false;
    }
    if (!p.facebookUrl && !p.zaloUrl && !p.otherSocialUrl) {
      setErrorMsg('Hãy cung cấp ít nhất một link liên hệ (Facebook, Zalo hoặc MXH khác) để người phù hợp có thể liên hệ.');
      return false;
    }
    if (!p.enabled) {
      setErrorMsg('Bạn cần bật đồng ý tham gia Matching.');
      return false;
    }
    return true;
  };

  const save = async (quiet = false) => {
    if (!validate()) return false;
    try {
      await api.put('/matching/profile', p);
      if (!quiet) setSuccessMsg('Đã lưu hồ sơ Matching thành công.');
      return true;
    } catch (e: any) {
      const msg = e.response?.data?.message || 'Không thể lưu hồ sơ Matching';
      setErrorMsg(msg);
      return false;
    }
  };

  const find = async () => {
    setErrorMsg('');
    setSuccessMsg('');
    if (!listingId && (!p.latitude || !p.longitude)) {
      setErrorMsg('Vui lòng cung cấp tọa độ vị trí (vĩ độ, kinh độ) hoặc bấm "📍 Lấy vị trí hiện tại" để tìm bạn cùng phòng xung quanh.');
      return;
    }

    setLoading(true);
    try {
      const ok = await save(true);
      if (!ok) {
        setLoading(false);
        return;
      }
      const req = listingId
        ? api.get(`/matching/listing/${listingId}`)
        : api.get('/matching/nearby', { params: { radiusKm: p.radiusKm || 5 } });
      const r = await req;
      setResults(r.data || []);
      setMode('results');
    } catch (e: any) {
      setErrorMsg(e.response?.data?.message || 'Không tìm được kết quả phù hợp');
    } finally {
      setLoading(false);
    }
  };

  const openChat = (m: any) =>
    api.post('/chat/conversations', {
      otherUserId: m.userId,
      contextType: listingId ? 'ROOM_MATCH' : 'NEARBY_MATCH',
      contextId: Number(listingId || 0)
    }).then(() => nav('/chat'));

  const social = (m: any) => m.facebookUrl || m.zaloUrl || m.otherSocialUrl;

  return (
    <div className="space-y-8">
      <div className="flex justify-between gap-4 items-start">
        <div>
          <h1 className="text-4xl font-extrabold tracking-tight">Roommate Matching</h1>
          <p className="mt-2 text-lg text-gray-600">
            Cùng giới tính, cùng quan tâm phòng trước; nếu ít kết quả mới mở rộng trong bán kính 1–5 km. Điểm % do rule engine tính, AI chỉ giải thích.
          </p>
        </div>
        <button onClick={() => nav('/tenant/profile')} className="text-sm font-semibold text-indigo-600 hover:text-indigo-800">
          Cài đặt tài khoản →
        </button>
      </div>

      {errorMsg && (
        <div className="p-4 rounded-xl bg-red-50 border border-red-200 text-sm text-red-700 font-medium">
          {errorMsg}
        </div>
      )}

      {successMsg && (
        <div className="p-4 rounded-xl bg-green-50 border border-green-200 text-sm text-green-700 font-medium">
          {successMsg}
        </div>
      )}

      {listingId && (
        <div className="bg-purple-50 border border-purple-100 rounded-2xl p-4 text-sm text-purple-800">
          Bạn đang tìm người <b>cùng quan tâm tin #{listingId}</b>. Chỉ những người đã bật Matching cho chính phòng này mới được đưa vào danh sách.
        </div>
      )}

      {mode === 'profile' && (
        <div className="bg-white rounded-2xl border p-6 space-y-6">
          <div>
            <h2 className="text-xl font-bold">1. Thông tin bắt buộc</h2>
            <p className="text-sm text-gray-500 mt-1">Điền một lần trong hồ sơ. Bạn có thể sửa lại bất cứ lúc nào.</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <F label="Giới tính *">
              <select className="inp" value={p.gender || ''} onChange={e => set('gender', e.target.value)}>
                <option value="">Chọn giới tính</option>
                <option value="Nam">Nam</option>
                <option value="Nữ">Nữ</option>
              </select>
            </F>
            <F label="Trường / khu vực *">
              <input className="inp" value={p.schoolName || ''} onChange={e => set('schoolName', e.target.value)} placeholder="ĐH FPT, ĐHQG Hà Nội..." />
            </F>
            <F label="Bán kính gợi ý">
              <select className="inp" value={p.radiusKm || 5} onChange={e => set('radiusKm', Number(e.target.value))}>
                <option value={1}>1 km</option>
                <option value={3}>3 km</option>
                <option value={5}>5 km</option>
              </select>
            </F>
            <F label="Ngân sách tối thiểu (VNĐ) *">
              <input className="inp" inputMode="numeric" value={p.budgetMin ?? ''} onChange={e => set('budgetMin', Number(e.target.value.replace(/\D/g, '')))} placeholder="2000000" />
            </F>
            <F label="Ngân sách tối đa (VNĐ) *">
              <input className="inp" inputMode="numeric" value={p.budgetMax ?? ''} onChange={e => set('budgetMax', Number(e.target.value.replace(/\D/g, '')))} placeholder="3500000" />
            </F>
            <F label="Dự kiến vào ở">
              <input type="month" className="inp" value={p.moveInDate || ''} onChange={e => set('moveInDate', e.target.value)} />
            </F>
          </div>
          {(p.budgetMin || p.budgetMax) && (
            <div className="text-xs text-gray-500">
              Ngân sách: {money(p.budgetMin)} – {money(p.budgetMax)}
            </div>
          )}

          <div>
            <h2 className="text-xl font-bold">2. Thói quen sinh hoạt</h2>
            <p className="text-sm text-gray-500 mt-1">Đây là dữ liệu chính để tính độ tương hợp.</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <F label="Giờ ngủ *">
              <select className="inp" value={p.sleepSchedule || ''} onChange={e => set('sleepSchedule', e.target.value)}>
                <option value="">Chọn</option>
                <option value="Trước 23h">Trước 23h</option>
                <option value="23h-0h">23h–0h</option>
                <option value="Sau 0h">Sau 0h</option>
              </select>
            </F>
            <F label="Mức sạch sẽ *">
              <select className="inp" value={p.cleanlinessLevel || 3} onChange={e => set('cleanlinessLevel', Number(e.target.value))}>
                <option value={1}>1 - Thoải mái</option>
                <option value={2}>2</option>
                <option value={3}>3 - Trung bình</option>
                <option value={4}>4</option>
                <option value={5}>5 - Rất gọn gàng</option>
              </select>
            </F>
            <F label="Hút thuốc *">
              <select className="inp" value={p.smoking || ''} onChange={e => set('smoking', e.target.value)}>
                <option value="">Chọn</option>
                <option value="Không">Không</option>
                <option value="Có">Có</option>
                <option value="Chỉ ngoài phòng">Chỉ ngoài phòng</option>
              </select>
            </F>
            <F label="Thú cưng *">
              <select className="inp" value={p.pets || ''} onChange={e => set('pets', e.target.value)}>
                <option value="">Chọn</option>
                <option value="Không">Không</option>
                <option value="Có">Có</option>
                <option value="Không ngại">Không ngại</option>
              </select>
            </F>
            <F label="Nấu ăn">
              <select className="inp" value={p.cooking || ''} onChange={e => set('cooking', e.target.value)}>
                <option value="">Chọn</option>
                <option value="Có">Có</option>
                <option value="Ít">Ít</option>
                <option value="Không">Không</option>
              </select>
            </F>
            <F label="Mức ồn *">
              <select className="inp" value={p.noisePreference || ''} onChange={e => set('noisePreference', e.target.value)}>
                <option value="">Chọn</option>
                <option value="Rất yên tĩnh">Rất yên tĩnh</option>
                <option value="Yên tĩnh">Yên tĩnh</option>
                <option value="Thoải mái">Thoải mái</option>
              </select>
            </F>
            <F label="Bạn bè tới chơi">
              <select className="inp" value={p.guestFrequency || ''} onChange={e => set('guestFrequency', e.target.value)}>
                <option value="">Chọn</option>
                <option value="Hiếm khi">Hiếm khi</option>
                <option value="Ít">Ít</option>
                <option value="Thường xuyên">Thường xuyên</option>
              </select>
            </F>
            <F label="Lịch học/làm">
              <select className="inp" value={p.studyWorkSchedule || ''} onChange={e => set('studyWorkSchedule', e.target.value)}>
                <option value="">Chọn</option>
                <option value="Ban ngày">Ban ngày</option>
                <option value="Buổi tối">Buổi tối</option>
                <option value="Linh hoạt">Linh hoạt</option>
              </select>
            </F>
            <F label="Chia chi phí *">
              <select className="inp" value={p.expenseStyle || ''} onChange={e => set('expenseStyle', e.target.value)}>
                <option value="">Chọn</option>
                <option value="Chia đều">Chia đều</option>
                <option value="Theo mức sử dụng">Theo mức sử dụng</option>
                <option value="Thỏa thuận từng khoản">Thỏa thuận từng khoản</option>
              </select>
            </F>
            <F label="Phong cách giao tiếp">
              <select className="inp" value={p.communicationStyle || ''} onChange={e => set('communicationStyle', e.target.value)}>
                <option value="">Chọn</option>
                <option value="Thẳng thắn">Thẳng thắn</option>
                <option value="Nhẹ nhàng">Nhẹ nhàng</option>
                <option value="Ít giao tiếp">Ít giao tiếp</option>
                <option value="Thoải mái">Thoải mái</option>
              </select>
            </F>
          </div>

          <div>
            <h2 className="text-xl font-bold">3. Vị trí & liên hệ</h2>
            <p className="text-sm text-gray-500 mt-1">Link MXH chỉ hiển thị cho người đạt điều kiện matching.</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <F label="Facebook (URL)">
              <input className="inp" value={p.facebookUrl || ''} onChange={e => set('facebookUrl', e.target.value)} placeholder="https://facebook.com/..." />
            </F>
            <F label="Zalo (URL / SĐT)">
              <input className="inp" value={p.zaloUrl || ''} onChange={e => set('zaloUrl', e.target.value)} placeholder="https://zalo.me/..." />
            </F>
            <F label="MXH khác">
              <input className="inp" value={p.otherSocialUrl || ''} onChange={e => set('otherSocialUrl', e.target.value)} placeholder="Instagram / Telegram..." />
            </F>
            <div className="md:col-span-3">
              <LocationPicker
                latitude={p.latitude}
                longitude={p.longitude}
                address={p.schoolName}
                preferredArea={p.schoolName}
                label="Vị trí & Cụm trường Đại học mong muốn tìm bạn ở ghép"
                onChange={(loc) => {
                  setP((prev: any) => ({
                    ...prev,
                    latitude: loc.latitude,
                    longitude: loc.longitude,
                    schoolName: loc.preferredArea || prev.schoolName
                  }));
                  setSuccessMsg('Đã cập nhật vị trí và tọa độ tìm kiếm.');
                }}
              />
            </div>
          </div>

          <F label="Giới thiệu bản thân / điều quan trọng">
            <textarea className="inp min-h-24" value={p.intro || ''} onChange={e => set('intro', e.target.value)} placeholder="Ví dụ: thích yên tĩnh, học buổi tối, cần bạn chia tiền phòng rõ ràng..." />
          </F>

          <label className="flex items-start gap-3 p-4 rounded-xl bg-purple-50 border border-purple-100 cursor-pointer">
            <input className="mt-1" type="checkbox" checked={!!p.enabled} onChange={e => set('enabled', e.target.checked)} />
            <span className="text-sm">
              Tôi đồng ý tham gia Matching và cho phép người phù hợp xem các link MXH tôi cung cấp. UniHome chỉ gợi ý người cùng giới tính theo chính sách hiện tại.
            </span>
          </label>

          <div className="flex flex-wrap gap-3 pt-2">
            <button type="button" onClick={() => void save(false)} className="bg-indigo-50 hover:bg-indigo-100 text-indigo-700 border border-indigo-200 px-6 py-3 rounded-xl font-medium transition-colors">
              Lưu hồ sơ
            </button>
            <button type="button" disabled={loading} onClick={find} className="bg-indigo-600 hover:bg-indigo-700 disabled:opacity-60 text-white px-6 py-3 rounded-xl font-bold shadow-sm transition-colors">
              {loading ? 'Đang phân tích...' : listingId ? 'Tìm người cùng quan tâm phòng này' : 'Tìm người gần tôi'}
            </button>
          </div>
        </div>
      )}

      {mode === 'results' && (
        <>
          <button onClick={() => setMode('profile')} className="text-indigo-600 hover:text-indigo-800 font-medium">
            ← Chỉnh hồ sơ
          </button>
          <div className="space-y-4">
            {results.map((m: any) => (
              <div key={m.userId} className="bg-white rounded-2xl border p-6 flex flex-col md:flex-row gap-5 items-start">
                <button onClick={() => nav(`/users/${m.userId}`)}>
                  <img src={m.avatarUrl || `https://ui-avatars.com/api/?name=${encodeURIComponent(m.fullName)}`} className="w-20 h-20 rounded-full object-cover" />
                </button>
                <div className="flex-1">
                  <div className="flex items-center gap-3">
                    <button onClick={() => nav(`/users/${m.userId}`)} className="text-xl font-bold hover:text-indigo-600">
                      {m.fullName}
                    </button>
                    <span className="px-3 py-1 bg-green-50 text-green-700 rounded-full text-sm font-bold">
                      {m.score}% phù hợp
                    </span>
                  </div>
                  <p className="text-sm text-gray-500 mt-1">
                    {m.schoolName || ''} {m.distanceKm != null ? `• ${m.distanceKm} km` : ''}
                  </p>
                  <div className="mt-3 text-sm text-gray-700">{m.reason}</div>
                  <div className="mt-3 flex flex-wrap gap-2">
                    {(m.strengths || []).map((x: string) => (
                      <span key={x} className="bg-emerald-50 text-emerald-700 px-3 py-1 rounded-full text-xs">✓ {x}</span>
                    ))}
                    {(m.conflicts || []).map((x: string) => (
                      <span key={x} className="bg-orange-50 text-orange-700 px-3 py-1 rounded-full text-xs">⚠ {x}</span>
                    ))}
                  </div>
                  <div className="mt-3 flex flex-wrap gap-3 text-xs">
                    {m.facebookUrl && <a target="_blank" rel="noreferrer" href={m.facebookUrl} className="text-indigo-600 hover:underline">Facebook</a>}
                    {m.zaloUrl && <a target="_blank" rel="noreferrer" href={m.zaloUrl} className="text-indigo-600 hover:underline">Zalo</a>}
                    {m.otherSocialUrl && <a target="_blank" rel="noreferrer" href={m.otherSocialUrl} className="text-indigo-600 hover:underline">MXH khác</a>}
                    {!social(m) && <span className="text-gray-500">Không public MXH - dùng UniHome Chat</span>}
                  </div>
                </div>
                <div className="flex md:flex-col gap-2">
                  <button onClick={() => openChat(m)} className="bg-indigo-600 hover:bg-indigo-700 text-white px-5 py-2.5 rounded-xl font-bold transition-colors">
                    Chat
                  </button>
                  <button onClick={() => nav(`/users/${m.userId}`)} className="border hover:bg-gray-50 px-5 py-2.5 rounded-xl text-sm font-semibold transition-colors">
                    Hồ sơ
                  </button>
                </div>
              </div>
            ))}
            {!results.length && (
              <div className="bg-white border rounded-2xl p-12 text-center text-gray-500">
                Chưa có người đạt ngưỡng 50%. Hãy thử bán kính 5 km hoặc chờ thêm người cùng quan tâm.
              </div>
            )}
          </div>
        </>
      )}
      <style>{`.inp{margin-top:.25rem;width:100%;border:1px solid #d1d5db;border-radius:.65rem;padding:.7rem .8rem;outline:none}.inp:focus{border-color:#6366f1;box-shadow:0 0 0 2px rgba(99,102,241,.12)}`}</style>
    </div>
  );
}

function F({ label, children }: { label: string; children: React.ReactNode }) {
  return <label className="text-sm font-medium text-gray-700">{label}{children}</label>;
}
