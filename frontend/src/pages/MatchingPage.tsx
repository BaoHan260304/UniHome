import { useEffect, useState } from 'react';
import { api, getUser, money } from '../lib/api';
import { useLocation, useNavigate, useSearchParams } from 'react-router-dom';

export default function MatchingPage() {
  const nav = useNavigate();
  const location = useLocation();
  const user = getUser();
  const [sp] = useSearchParams();
  const listingId = sp.get('listingId');
  const [p, setP] = useState<any>({ enabled:true, radiusKm:5, gender:user?.gender || '', cleanlinessLevel:3 });
  const [results, setResults] = useState<any[]>([]);
  const [mode, setMode] = useState<'profile'|'results'>('profile');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!user) { nav('/login', { state:{ from: location.pathname + location.search } }); return; }
    void api.get('/matching/profile').then(r => setP({ enabled:true, radiusKm:5, cleanlinessLevel:3, ...r.data }));
  }, []);

  const set = (k:string,v:any) => setP({ ...p, [k]:v });
  const useLocation = () => navigator.geolocation?.getCurrentPosition(
    pos => setP({ ...p, latitude:pos.coords.latitude, longitude:pos.coords.longitude }),
    () => alert('Không lấy được vị trí. Bạn có thể nhập thủ công.')
  );

  const validate = () => {
    const required = [['gender','giới tính'],['schoolName','trường/khu vực'],['budgetMin','ngân sách tối thiểu'],['budgetMax','ngân sách tối đa'],['sleepSchedule','giờ ngủ'],['smoking','hút thuốc'],['pets','thú cưng'],['noisePreference','mức ồn'],['expenseStyle','cách chia chi phí']];
    const miss = required.find(([k]) => p[k] === undefined || p[k] === null || String(p[k]).trim() === '');
    if (miss) { alert(`Vui lòng hoàn thành mục ${miss[1]} trước khi Matching.`); return false; }
    if (!p.facebookUrl && !p.zaloUrl && !p.otherSocialUrl) { alert('Hãy cung cấp ít nhất một link liên hệ Facebook, Zalo hoặc MXH khác để người phù hợp có thể liên hệ.'); return false; }
    if (!p.enabled) { alert('Bạn cần bật đồng ý tham gia Matching.'); return false; }
    return true;
  };

  const save = async (quiet=false) => {
    if (!validate()) return false;
    await api.put('/matching/profile', p);
    if (!quiet) alert('Đã lưu hồ sơ Matching.');
    return true;
  };

  const find = async () => {
    setLoading(true);
    try {
      const ok = await save(true); if (!ok) return;
      const req = listingId ? api.get(`/matching/listing/${listingId}`) : api.get('/matching/nearby', { params:{ radiusKm:p.radiusKm || 5 } });
      const r = await req; setResults(r.data || []); setMode('results');
    } catch (e:any) { alert(e.response?.data?.message || 'Không tìm được kết quả'); }
    finally { setLoading(false); }
  };

  const openChat = (m:any) => api.post('/chat/conversations',{otherUserId:m.userId,contextType:listingId?'ROOM_MATCH':'NEARBY_MATCH',contextId:Number(listingId||0)}).then(()=>nav('/chat'));
  const social = (m:any) => m.facebookUrl || m.zaloUrl || m.otherSocialUrl;

  return <div className="space-y-8">
    <div className="flex justify-between gap-4 items-start"><div><h1 className="text-4xl font-extrabold tracking-tight">Roommate Matching</h1><p className="mt-2 text-lg text-gray-600">Cùng giới tính, cùng quan tâm phòng trước; nếu ít kết quả mới mở rộng trong bán kính 1–5 km. Điểm % do rule engine tính, AI chỉ giải thích.</p></div><button onClick={()=>nav('/tenant/profile')} className="text-sm font-semibold text-indigo-600">Cài đặt tài khoản →</button></div>

    {listingId && <div className="bg-purple-50 border border-purple-100 rounded-2xl p-4 text-sm text-purple-800">Bạn đang tìm người <b>cùng quan tâm tin #{listingId}</b>. Chỉ những người đã bật Matching cho chính phòng này mới được đưa vào danh sách.</div>}

    {mode==='profile' && <div className="bg-white rounded-2xl border p-6 space-y-6">
      <div><h2 className="text-xl font-bold">1. Thông tin bắt buộc</h2><p className="text-sm text-gray-500 mt-1">Điền một lần trong hồ sơ. Bạn có thể sửa lại bất cứ lúc nào.</p></div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <F label="Giới tính"><select className="inp" value={p.gender||''} onChange={e=>set('gender',e.target.value)}><option value="">Chọn</option><option>Nam</option><option>Nữ</option></select></F>
        <F label="Trường / khu vực"><input className="inp" value={p.schoolName||''} onChange={e=>set('schoolName',e.target.value)} placeholder="ĐH FPT Hòa Lạc"/></F>
        <F label="Bán kính gợi ý"><select className="inp" value={p.radiusKm||5} onChange={e=>set('radiusKm',Number(e.target.value))}><option value={1}>1 km</option><option value={3}>3 km</option><option value={5}>5 km</option></select></F>
        <F label="Ngân sách tối thiểu"><input className="inp" inputMode="numeric" value={p.budgetMin??''} onChange={e=>set('budgetMin',Number(e.target.value.replace(/\D/g,'')))} placeholder="2000000"/></F>
        <F label="Ngân sách tối đa"><input className="inp" inputMode="numeric" value={p.budgetMax??''} onChange={e=>set('budgetMax',Number(e.target.value.replace(/\D/g,'')))} placeholder="3500000"/></F>
        <F label="Dự kiến vào ở"><input type="month" className="inp" value={p.moveInDate||''} onChange={e=>set('moveInDate',e.target.value)}/></F>
      </div>
      {(p.budgetMin||p.budgetMax) && <div className="text-xs text-gray-500">Ngân sách: {money(p.budgetMin)} – {money(p.budgetMax)}</div>}

      <div><h2 className="text-xl font-bold">2. Thói quen sinh hoạt</h2><p className="text-sm text-gray-500 mt-1">Đây là dữ liệu chính để tính độ tương hợp.</p></div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <F label="Giờ ngủ"><select className="inp" value={p.sleepSchedule||''} onChange={e=>set('sleepSchedule',e.target.value)}><option value="">Chọn</option><option value="Trước 23h">Trước 23h</option><option value="23h-0h">23h–0h</option><option value="Sau 0h">Sau 0h</option></select></F>
        <F label="Mức sạch sẽ"><select className="inp" value={p.cleanlinessLevel||3} onChange={e=>set('cleanlinessLevel',Number(e.target.value))}><option value={1}>1 - Thoải mái</option><option value={2}>2</option><option value={3}>3 - Trung bình</option><option value={4}>4</option><option value={5}>5 - Rất gọn gàng</option></select></F>
        <F label="Hút thuốc"><select className="inp" value={p.smoking||''} onChange={e=>set('smoking',e.target.value)}><option value="">Chọn</option><option>Không</option><option>Có</option><option>Chỉ ngoài phòng</option></select></F>
        <F label="Thú cưng"><select className="inp" value={p.pets||''} onChange={e=>set('pets',e.target.value)}><option value="">Chọn</option><option>Không</option><option>Có</option><option>Không ngại</option></select></F>
        <F label="Nấu ăn"><select className="inp" value={p.cooking||''} onChange={e=>set('cooking',e.target.value)}><option value="">Chọn</option><option>Có</option><option>Ít</option><option>Không</option></select></F>
        <F label="Mức ồn"><select className="inp" value={p.noisePreference||''} onChange={e=>set('noisePreference',e.target.value)}><option value="">Chọn</option><option>Rất yên tĩnh</option><option>Yên tĩnh</option><option>Thoải mái</option></select></F>
        <F label="Bạn bè tới chơi"><select className="inp" value={p.guestFrequency||''} onChange={e=>set('guestFrequency',e.target.value)}><option value="">Chọn</option><option>Hiếm khi</option><option>Ít</option><option>Thường xuyên</option></select></F>
        <F label="Lịch học/làm"><select className="inp" value={p.studyWorkSchedule||''} onChange={e=>set('studyWorkSchedule',e.target.value)}><option value="">Chọn</option><option>Ban ngày</option><option>Buổi tối</option><option>Linh hoạt</option></select></F>
        <F label="Chia chi phí"><select className="inp" value={p.expenseStyle||''} onChange={e=>set('expenseStyle',e.target.value)}><option value="">Chọn</option><option>Chia đều</option><option>Theo mức sử dụng</option><option>Thỏa thuận từng khoản</option></select></F>
        <F label="Phong cách giao tiếp"><select className="inp" value={p.communicationStyle||''} onChange={e=>set('communicationStyle',e.target.value)}><option value="">Chọn</option><option>Thẳng thắn</option><option>Nhẹ nhàng</option><option>Ít giao tiếp</option><option>Thoải mái</option></select></F>
      </div>

      <div><h2 className="text-xl font-bold">3. Vị trí & liên hệ</h2><p className="text-sm text-gray-500 mt-1">Link MXH chỉ hiển thị cho người đạt điều kiện matching.</p></div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <F label="Facebook"><input className="inp" value={p.facebookUrl||''} onChange={e=>set('facebookUrl',e.target.value)} placeholder="https://facebook.com/..."/></F>
        <F label="Zalo"><input className="inp" value={p.zaloUrl||''} onChange={e=>set('zaloUrl',e.target.value)} placeholder="https://zalo.me/..."/></F>
        <F label="MXH khác"><input className="inp" value={p.otherSocialUrl||''} onChange={e=>set('otherSocialUrl',e.target.value)} placeholder="Instagram / Telegram..."/></F>
        <F label="Vĩ độ"><input className="inp" value={p.latitude??''} onChange={e=>set('latitude',e.target.value)}/></F>
        <F label="Kinh độ"><input className="inp" value={p.longitude??''} onChange={e=>set('longitude',e.target.value)}/></F>
        <div className="flex items-end"><button onClick={useLocation} className="w-full border border-indigo-200 bg-indigo-50 text-indigo-700 rounded-xl py-3 text-sm font-semibold">📍 Lấy vị trí hiện tại</button></div>
      </div>
      <F label="Giới thiệu bản thân / điều quan trọng"><textarea className="inp min-h-24" value={p.intro||''} onChange={e=>set('intro',e.target.value)} placeholder="Ví dụ: thích yên tĩnh, học buổi tối, cần bạn chia tiền phòng rõ ràng..."/></F>
      <label className="flex items-start gap-3 p-4 rounded-xl bg-purple-50 border border-purple-100"><input className="mt-1" type="checkbox" checked={!!p.enabled} onChange={e=>set('enabled',e.target.checked)}/><span className="text-sm">Tôi đồng ý tham gia Matching và cho phép người phù hợp xem các link MXH tôi cung cấp. UniHome chỉ gợi ý người cùng giới tính theo chính sách hiện tại.</span></label>
      <div className="flex flex-wrap gap-3"><button onClick={()=>void save(false)} className="bg-indigo-50 text-indigo-700 border px-6 py-3 rounded-xl font-medium">Lưu hồ sơ</button><button disabled={loading} onClick={find} className="bg-indigo-600 disabled:opacity-60 text-white px-6 py-3 rounded-xl font-bold">{loading?'Đang phân tích...':listingId?'Tìm người cùng quan tâm phòng này':'Tìm người gần tôi'}</button></div>
    </div>}

    {mode==='results' && <><button onClick={()=>setMode('profile')} className="text-indigo-600">← Chỉnh hồ sơ</button><div className="space-y-4">{results.map((m:any)=><div key={m.userId} className="bg-white rounded-2xl border p-6 flex flex-col md:flex-row gap-5 items-start"><button onClick={()=>nav(`/users/${m.userId}`)}><img src={m.avatarUrl||`https://ui-avatars.com/api/?name=${encodeURIComponent(m.fullName)}`} className="w-20 h-20 rounded-full object-cover"/></button><div className="flex-1"><div className="flex items-center gap-3"><button onClick={()=>nav(`/users/${m.userId}`)} className="text-xl font-bold hover:text-indigo-600">{m.fullName}</button><span className="px-3 py-1 bg-green-50 text-green-700 rounded-full text-sm font-bold">{m.score}% phù hợp</span></div><p className="text-sm text-gray-500 mt-1">{m.schoolName||''} {m.distanceKm!=null?`• ${m.distanceKm} km`:''}</p><div className="mt-3 text-sm text-gray-700">{m.reason}</div><div className="mt-3 flex flex-wrap gap-2">{(m.strengths||[]).map((x:string)=><span key={x} className="bg-emerald-50 text-emerald-700 px-3 py-1 rounded-full text-xs">✓ {x}</span>)}{(m.conflicts||[]).map((x:string)=><span key={x} className="bg-orange-50 text-orange-700 px-3 py-1 rounded-full text-xs">⚠ {x}</span>)}</div><div className="mt-3 flex flex-wrap gap-3 text-xs">{m.facebookUrl&&<a target="_blank" href={m.facebookUrl} className="text-indigo-600">Facebook</a>}{m.zaloUrl&&<a target="_blank" href={m.zaloUrl} className="text-indigo-600">Zalo</a>}{m.otherSocialUrl&&<a target="_blank" href={m.otherSocialUrl} className="text-indigo-600">MXH khác</a>}{!social(m)&&<span className="text-gray-500">Không public MXH - dùng UniHome Chat</span>}</div></div><div className="flex md:flex-col gap-2"><button onClick={()=>openChat(m)} className="bg-indigo-600 text-white px-5 py-2.5 rounded-xl font-bold">Chat</button><button onClick={()=>nav(`/users/${m.userId}`)} className="border px-5 py-2.5 rounded-xl text-sm font-semibold">Hồ sơ</button></div></div>)}{!results.length&&<div className="bg-white border rounded-2xl p-12 text-center text-gray-500">Chưa có người đạt ngưỡng 50%. Hãy thử bán kính 5 km hoặc chờ thêm người cùng quan tâm.</div>}</div></>}
    <style>{`.inp{margin-top:.25rem;width:100%;border:1px solid #d1d5db;border-radius:.65rem;padding:.7rem .8rem;outline:none}.inp:focus{border-color:#6366f1;box-shadow:0 0 0 2px rgba(99,102,241,.12)}`}</style>
  </div>;
}

function F({label,children}:{label:string,children:React.ReactNode}) { return <label className="text-sm font-medium text-gray-700">{label}{children}</label>; }
