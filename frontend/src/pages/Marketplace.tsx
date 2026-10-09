import { useEffect, useState } from 'react';
import { api, getUser } from '../lib/api';
import RoomCard from '../components/RoomCard';
import AdSlot from '../components/AdSlot';
import { useLocation, useNavigate } from 'react-router-dom';

export default function Marketplace() {
  const [list, setList] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [q, setQ] = useState<any>({ search:'', province:'', district:'', school:'', minPrice:'', maxPrice:'', radiusKm:'', propertyType:'', verified:'', sort:'RELEVANCE', lat:'', lng:'', furniture:'', amenity:'', floor:'', maxOccupants:'', availability:'AVAILABLE' });
  const user = getUser();
  const nav = useNavigate();
  const location = useLocation();

  const load = () => {
    setLoading(true);
    const params = Object.fromEntries(Object.entries(q).filter(([,v]) => v !== ''));
    void api.get('/marketplace/listings', { params }).then(r => setList(r.data || [])).catch(() => setList([])).finally(() => setLoading(false));
  };
  useEffect(() => { load(); }, []);

  const locate = () => navigator.geolocation?.getCurrentPosition(
    p => setQ({ ...q, lat: p.coords.latitude.toString(), lng: p.coords.longitude.toString(), radiusKm: q.radiusKm || '5' }),
    () => alert('Không lấy được vị trí. Bạn có thể nhập khu vực/trường.')
  );
  const favorite = (id:number) => {
    if (!user) return nav('/login', { state: { from: location.pathname, action: 'FAVORITE' } });
    void api.post(`/listings/${id}/favorite`).then(() => alert('Đã cập nhật Yêu thích')).catch(e => alert(e.response?.data?.message || 'Lỗi'));
  };

  return <div className="space-y-8 animate-in fade-in duration-500">
    <div><h1 className="text-4xl font-extrabold text-gray-900 tracking-tight">Bảng tin Phòng Trọ</h1><p className="mt-2 text-lg text-gray-600">Tìm phòng theo khu vực, trường, khoảng cách, giá, tiện ích và mức xác minh.</p></div>
    <AdSlot placement="TOP_BANNER" className="w-full h-28" />

    <div className="bg-white p-4 rounded-2xl shadow-sm border border-gray-100 space-y-4">
      <div className="flex flex-col sm:flex-row gap-4"><input className="flex-1 rounded-xl border-gray-200 bg-gray-50 px-4 py-3 border" placeholder="Tên phòng, đường, khu vực..." value={q.search} onChange={e => setQ({...q, search:e.target.value})} onKeyDown={e => e.key==='Enter' && load()} /><button onClick={load} className="bg-indigo-600 text-white px-8 py-3 rounded-xl font-medium shadow-md">Tìm kiếm</button></div>
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-3 pt-2 border-t border-gray-100">
        <input className="f" placeholder="Tỉnh/TP" value={q.province} onChange={e=>setQ({...q,province:e.target.value})}/>
        <input className="f" placeholder="Quận/Huyện" value={q.district} onChange={e=>setQ({...q,district:e.target.value})}/>
        <input className="f" placeholder="Trường ĐH" value={q.school} onChange={e=>setQ({...q,school:e.target.value})}/>
        <select className="f" value={q.radiusKm} onChange={e=>setQ({...q,radiusKm:e.target.value})}><option value="">Bán kính</option><option value="1">1 km</option><option value="3">3 km</option><option value="5">5 km</option></select>
        <input className="f" placeholder="Giá từ" value={q.minPrice} onChange={e=>setQ({...q,minPrice:e.target.value.replace(/\D/g,'')})}/>
        <input className="f" placeholder="Giá đến" value={q.maxPrice} onChange={e=>setQ({...q,maxPrice:e.target.value.replace(/\D/g,'')})}/>
        <select className="f" value={q.propertyType} onChange={e=>setQ({...q,propertyType:e.target.value})}><option value="">Loại phòng</option><option>Phòng trọ</option><option>Chung cư mini</option><option>Ở ghép</option><option>Căn hộ dịch vụ</option></select>
        <select className="f" value={q.furniture} onChange={e=>setQ({...q,furniture:e.target.value})}><option value="">Nội thất</option><option value="full">Full đồ</option><option value="basic">Cơ bản</option><option value="none">Không đồ</option></select>
        <input className="f" placeholder="Tiện ích (máy giặt...)" value={q.amenity} onChange={e=>setQ({...q,amenity:e.target.value})}/>
        <input className="f" placeholder="Tầng (VD: 2)" value={q.floor} onChange={e=>setQ({...q,floor:e.target.value})}/>
        <select className="f" value={q.maxOccupants} onChange={e=>setQ({...q,maxOccupants:e.target.value})}><option value="">Số người</option><option value="1">1+</option><option value="2">2+</option><option value="3">3+</option><option value="4">4+</option></select>
        <select className="f" value={q.verified} onChange={e=>setQ({...q,verified:e.target.value})}><option value="">Mức xác minh</option><option value="true">Đã xác minh</option></select>
        <select className="f" value={q.availability} onChange={e=>setQ({...q,availability:e.target.value})}><option value="">Tất cả tình trạng</option><option value="AVAILABLE">Còn phòng</option><option value="RESERVED">Đang giữ chỗ</option></select>
        <select className="f" value={q.sort} onChange={e=>setQ({...q,sort:e.target.value})}><option value="RELEVANCE">Phù hợp nhất</option><option value="DISTANCE">Gần nhất</option><option value="PRICE_ASC">Giá thấp → cao</option><option value="PRICE_DESC">Giá cao → thấp</option><option value="NEWEST">Mới nhất</option></select>
        <button onClick={locate} className="rounded-xl border border-indigo-200 bg-indigo-50 px-3 py-2.5 text-sm text-indigo-700 font-medium">📍 Dùng vị trí hiện tại</button>
        <button onClick={()=>setQ({ search:'', province:'', district:'', school:'', minPrice:'', maxPrice:'', radiusKm:'', propertyType:'', verified:'', sort:'RELEVANCE', lat:'', lng:'', furniture:'', amenity:'', floor:'', maxOccupants:'', availability:'AVAILABLE' })} className="rounded-xl border px-3 py-2.5 text-sm text-gray-600">Xóa bộ lọc</button>
      </div>
    </div>

    {loading ? <div className="flex justify-center h-64 items-center"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600" /></div> : <div className="grid grid-cols-1 lg:grid-cols-[1fr_180px] gap-8"><div><div className="mb-4 text-sm text-gray-500">Tìm thấy <b>{list.length}</b> tin phù hợp. VIP chỉ tăng ưu tiên sau khi tin đã phù hợp với bộ lọc.</div><div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8">{list.map((x:any)=><RoomCard key={x.listingId} item={x} onFavorite={favorite}/>)}</div>{!list.length&&<div className="bg-white border rounded-2xl p-12 text-center text-gray-500">Chưa có phòng phù hợp. Hãy nới khu vực, giá hoặc bán kính.</div>}</div><div className="hidden lg:block"><AdSlot placement="RIGHT_SIDEBAR" className="w-full h-[520px] sticky top-32"/></div></div>}
    <style>{`.f{border:1px solid #d1d5db;background:#f9fafb;border-radius:.75rem;padding:.65rem .75rem;font-size:.875rem;min-width:0}`}</style>
  </div>;
}
