import { useEffect, useState } from 'react';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import { api, getUser, mediaList, money } from '../lib/api';
import AdSlot from '../components/AdSlot';
import RoomCard from '../components/RoomCard';

export default function PropertyDetail() {
  const { id } = useParams();
  const nav = useNavigate();
  const location = useLocation();
  const [prop, setProp] = useState<any>();
  const [landlord, setLandlord] = useState<any>();
  const [contact, setContact] = useState<any>();
  const [match, setMatch] = useState<any[]>([]);
  const [similar, setSimilar] = useState<any[]>([]);
  const [services, setServices] = useState<any[]>([]);
  const user = getUser();

  const requireLogin = (action: string) => {
    nav('/login', { state: { from: location.pathname, action } });
  };

  const load = async () => {
    const r = await api.get(`/marketplace/listings/${id}`);
    const d = r.data;
    setProp(d);
    try { setLandlord((await api.get(`/users/${d.landlordId}/public`)).data); } catch {}
    try {
      const sr = await api.get('/marketplace/listings', { params: { district: d.district || '', school: d.nearestSchool || '', sort: 'RELEVANCE' } });
      setSimilar((sr.data || []).filter((x: any) => String(x.listingId) !== String(id)).slice(0, 3));
    } catch {}
    try {
      const sv = await api.get('/content/services');
      const rows = (sv.data || []).filter((x: any) => !d.province || !x.province || x.province === d.province);
      setServices(rows.slice(0, 3));
    } catch {}
  };

  useEffect(() => { void load(); }, [id]);

  if (!prop) return <div className="flex justify-center items-center h-64"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600" /></div>;
  const media = mediaList(prop.imageUrl);
  const verification = prop.verification || {};

  const reveal = () => {
    if (!user) return requireLogin('SHOW_CONTACT');
    void api.get(`/marketplace/listings/${id}/contact`).then(r => setContact(r.data)).catch(e => alert(e.response?.data?.message || 'Không thể xem liên hệ'));
  };

  const interest = (matchingEnabled = false) => {
    if (!user) return requireLogin(matchingEnabled ? 'MATCH_ROOMMATE' : 'INTEREST_ROOM');
    void api.post(`/listings/${id}/interest`, { matchingEnabled }).then(() => {
      if (!matchingEnabled) return alert('Đã thêm phòng vào danh sách quan tâm.');
      alert('Đã quan tâm và bật tìm bạn cùng phòng.');
      api.get(`/matching/listing/${id}`).then(r => setMatch(r.data || [])).catch((e) => {
        if (e.response?.status === 400 || e.response?.status === 409) nav(`/tenant/matching?listingId=${id}`);
        else nav(`/tenant/matching?listingId=${id}`);
      });
    });
  };

  const chatUser = (otherUserId: number, contextType = 'ROOM', contextId: number = Number(prop.listingId)) => {
    if (!user) return requireLogin('CHAT');
    void api.post('/chat/conversations', { otherUserId, contextType, contextId }).then(() => nav('/chat'));
  };

  const report = () => {
    if (!user) return requireLogin('REPORT');
    const details = prompt('Mô tả vấn đề: sai giá, phòng hết, ảnh sai, phí ẩn, spam...');
    if (details) void api.post('/community/reports', { targetType: 'LISTING', targetId: prop.listingId, reasonCode: 'USER_REPORT', details }).then(() => alert('Đã gửi báo cáo cho UniHome.'));
  };

  const verifyRows = [
    ['Phòng tồn tại', verification.roomExists], ['Vị trí', verification.locationVerified], ['Ảnh / video', verification.mediaVerified],
    ['Giá thuê', verification.priceVerified], ['Điện nước', verification.utilityVerified], ['Tiện ích', verification.amenityVerified], ['Tình trạng còn phòng', verification.availabilityVerified]
  ];

  return <div className="max-w-5xl mx-auto space-y-8 pb-12">
    <div className="flex justify-between items-center"><button onClick={() => nav(-1)} className="text-indigo-600 font-medium hover:underline">← Quay lại</button><button onClick={() => nav('/')} className="text-sm font-semibold text-gray-600 hover:text-indigo-600">Trang chủ</button></div>

    <div className="grid grid-cols-1 lg:grid-cols-[1fr_250px] gap-8">
      <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-1 bg-gray-100">
          {media.length ? media.map((u: string, i: number) => <div key={i} className={`${media.length === 1 ? 'md:col-span-2' : ''} h-72 md:h-96`}>{u.startsWith('data:video') ? <video src={u} controls className="w-full h-full object-cover" /> : <img src={u} className="w-full h-full object-cover" />}</div>) : <div className="md:col-span-2 h-64 flex items-center justify-center text-gray-400">Không có hình ảnh/video</div>}
        </div>

        <div className="p-8">
          <div className="flex justify-between items-start mb-6 gap-6">
            <div>
              <div className="flex gap-2 flex-wrap mb-3">
                <span className="px-3 py-1 bg-indigo-50 text-indigo-700 text-xs font-bold rounded-full border border-indigo-100">{prop.propertyType || 'Phòng trọ'}</span>
                {prop.packageTier !== 'FREE' && <span className="px-3 py-1 bg-amber-50 text-amber-700 text-xs font-bold rounded-full border border-amber-200">★ {prop.packageTier}</span>}
                <span className="px-3 py-1 bg-green-50 text-green-700 text-xs font-bold rounded-full border border-green-200">{prop.verificationLevel === 'ON_SITE_VERIFIED' ? '✓ Xác minh thực địa' : prop.verificationLevel === 'REMOTE_VERIFIED' ? '✓ Xác minh từ xa' : 'Đã kiểm duyệt nội dung'}</span>
              </div>
              <h1 className="text-3xl font-extrabold text-gray-900">{prop.title}</h1>
              <p className="text-gray-500 mt-2">📍 {[prop.street, prop.ward, prop.district, prop.province].filter(Boolean).join(', ')}</p>
              {prop.nearestSchool && <p className="text-gray-500 mt-1">🎓 {prop.nearestSchool} {prop.nearestSchoolDistanceKm != null ? `• ${prop.nearestSchoolDistanceKm} km` : ''}</p>}
            </div>
            <p className="text-3xl font-extrabold text-indigo-600 text-right">{money(prop.price)}<span className="block text-sm font-normal text-gray-500">/ tháng</span></p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">{[
            ['Diện tích', `${prop.area || '—'} m²`], ['Tầng', prop.floorText || '—'], ['Sức chứa', prop.maxOccupants ? `${prop.maxOccupants} người` : '—'], ['Trạng thái', prop.availability === 'AVAILABLE' ? 'Còn phòng' : prop.availability]
          ].map(([a, b]) => <div key={a} className="bg-gray-50 p-4 rounded-2xl text-center border border-gray-100"><span className="block text-gray-500 text-sm mb-1">{a}</span><strong className="text-lg">{b}</strong></div>)}</div>

          <h3 className="text-xl font-bold mb-4">Chi phí minh bạch</h3>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3 mb-8 text-sm">{[
            ['Cọc', prop.deposit], ['Điện', prop.electricityPrice], ['Nước', prop.waterPrice], ['Internet', prop.internetPrice], ['Gửi xe', prop.parkingFee], ['Phí khác', prop.otherFees]
          ].map(([a, b]) => <div key={String(a)} className="border rounded-xl p-3 bg-white"><div className="text-gray-500">{a}</div><b>{money(Number(b || 0))}</b></div>)}</div>

          <h3 className="text-xl font-bold mb-4">Thông tin chi tiết</h3>
          <p className="text-gray-700 leading-relaxed whitespace-pre-wrap bg-gray-50 p-6 rounded-2xl border mb-6">{prop.description || 'Chủ trọ chưa thêm mô tả.'}</p>
          <div className="grid md:grid-cols-2 gap-5 mb-6">
            <div><h3 className="text-lg font-bold mb-3">Tiện ích</h3><div className="flex flex-wrap gap-2">{String(prop.amenities || '').split('|').filter(Boolean).map((x: string) => <span className="px-3 py-1.5 bg-indigo-50 text-indigo-700 rounded-full text-sm" key={x}>{x}</span>)}{!prop.amenities && <span className="text-sm text-gray-500">Chưa cập nhật.</span>}</div></div>
            <div><h3 className="text-lg font-bold mb-3">Nội quy</h3><p className="text-sm text-gray-700 whitespace-pre-wrap">{prop.rules || 'Chưa cập nhật nội quy.'}</p><p className="text-sm text-gray-500 mt-2">Nội thất: <b>{prop.furniture || 'Chưa cập nhật'}</b></p></div>
          </div>

          <div className="bg-emerald-50 border border-emerald-100 rounded-2xl p-5 mb-6">
            <div className="flex justify-between gap-4"><div><h3 className="font-bold text-emerald-900">Xác minh UniHome</h3><p className="text-sm text-emerald-800 mt-1">Mức hiện tại: <b>{prop.verificationLevel}</b></p></div>{verification.verifiedAt && <div className="text-xs text-emerald-700">Xác minh: {new Date(verification.verifiedAt).toLocaleDateString('vi-VN')}</div>}</div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-2 mt-4">{verifyRows.map(([name, ok]: any) => <div key={name} className={`text-xs px-3 py-2 rounded-lg border ${ok ? 'bg-white text-emerald-700 border-emerald-200' : 'bg-gray-50 text-gray-500 border-gray-200'}`}>{ok ? '✓' : '○'} {name}</div>)}</div>
            {verification.note && <p className="text-xs text-emerald-800 mt-3">Ghi chú: {verification.note}</p>}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <button onClick={reveal} className="bg-indigo-600 text-white font-bold text-lg py-4 rounded-xl hover:bg-indigo-700">{contact ? `${contact.phone || 'Không có SĐT'} ${contact.zalo ? `• ${contact.zalo}` : ''}` : 'Hiện SĐT / Zalo chủ trọ'}</button>
            <button onClick={() => chatUser(prop.landlordId)} className="bg-blue-50 text-blue-700 font-bold text-lg py-4 rounded-xl border border-blue-100">Chat với chủ trọ</button>
            <button onClick={() => interest(false)} className="bg-pink-50 text-pink-700 font-bold text-lg py-4 rounded-xl border border-pink-100">♥ Quan tâm phòng</button>
            <button onClick={() => interest(true)} className="bg-purple-100 text-purple-700 font-bold text-lg py-4 rounded-xl border border-purple-200">Tìm bạn cùng thuê phòng này</button>
          </div>

          {match.length > 0 && <div className="mt-8"><div className="flex justify-between items-center mb-4"><h3 className="text-xl font-bold">Người cùng quan tâm phù hợp</h3><button onClick={() => nav(`/tenant/matching?listingId=${id}`)} className="text-sm text-purple-700 font-semibold">Xem Matching đầy đủ →</button></div><div className="space-y-3">{match.map((m: any) => <div key={m.userId} className="p-4 rounded-2xl border bg-white flex items-center gap-4"><button onClick={() => nav(`/users/${m.userId}`)}><img src={m.avatarUrl || `https://ui-avatars.com/api/?name=${encodeURIComponent(m.fullName)}`} className="w-14 h-14 rounded-full object-cover" /></button><div className="flex-1"><button onClick={() => nav(`/users/${m.userId}`)} className="font-bold hover:text-indigo-600">{m.fullName}</button><div className="text-sm text-gray-500">{m.reason}</div><div className="flex flex-wrap gap-3 mt-2 text-xs">{m.facebookUrl && <a className="text-indigo-600" href={m.facebookUrl} target="_blank">Facebook</a>}{m.zaloUrl && <a className="text-indigo-600" href={m.zaloUrl} target="_blank">Zalo</a>}{m.otherSocialUrl && <a className="text-indigo-600" href={m.otherSocialUrl} target="_blank">MXH khác</a>}<button onClick={() => chatUser(m.userId, 'MATCHING', Number(prop.listingId))} className="text-blue-600 font-semibold">Chat UniHome</button></div></div><div className="text-xl font-extrabold text-green-600">{m.score}%</div></div>)}</div></div>}

          {prop.latitude && prop.longitude && <div className="mt-8"><h3 className="text-xl font-bold mb-4">Vị trí & bản đồ</h3><iframe title="Bản đồ phòng trọ" className="w-full h-72 rounded-2xl border" loading="lazy" src={`https://maps.google.com/maps?q=${prop.latitude},${prop.longitude}&z=15&output=embed`} /><div className="text-xs text-gray-500 mt-2">Tọa độ: {prop.latitude}, {prop.longitude}</div></div>}

          <div className="mt-8"><h3 className="text-xl font-bold mb-4">Đánh giá phòng/khu trọ</h3><div className="space-y-3">{(prop.reviews || []).map((r: any) => <div key={r.id} className="border rounded-xl p-4 bg-gray-50"><div className="font-bold">{r.rating || 0}★</div><div className="text-sm text-gray-700 mt-1">{r.comment}</div><div className="text-xs text-gray-400 mt-1">Accuracy {r.accuracyRating || '-'} • Price {r.priceTransparencyRating || '-'} • Utility {r.utilityTransparencyRating || '-'}</div></div>)}{!(prop.reviews || []).length && <div className="text-sm text-gray-500">Chưa có đánh giá.</div>}</div>{user && <button onClick={() => { const c = prompt('Nhận xét của bạn'); if (c) api.post('/community/reviews', { propertyId: prop.propertyId, rating: 5, accuracyRating: 5, priceTransparencyRating: 5, utilityTransparencyRating: 5, landlordCommunicationRating: 5, comment: c }).then(() => { alert('Đã gửi đánh giá'); void load(); }); }} className="mt-3 text-indigo-600 font-medium text-sm">+ Viết đánh giá</button>}</div>

          <div className="mt-8 flex flex-wrap gap-4 text-sm"><button onClick={report} className="text-red-600 hover:underline">⚑ Báo cáo tin sai/vi phạm</button><span className="text-gray-400">Cập nhật gần nhất: {prop.lastAvailabilityConfirmedAt ? new Date(prop.lastAvailabilityConfirmedAt).toLocaleString('vi-VN') : 'Chưa xác nhận'}</span></div>
        </div>
      </div>

      <div className="space-y-5">
        <div className="bg-white rounded-2xl border p-5 shadow-sm"><h3 className="font-bold mb-3">Chủ trọ</h3><div className="flex items-center gap-3"><img src={landlord?.avatarUrl || `https://ui-avatars.com/api/?name=${encodeURIComponent(landlord?.fullName || 'Landlord')}`} className="w-12 h-12 rounded-full object-cover" /><div><button onClick={() => nav(`/users/${prop.landlordId}`)} className="font-bold hover:text-indigo-600">{landlord?.fullName || 'Chủ trọ'}</button><div className="text-xs text-gray-500">{landlord?.followers || 0} người theo dõi</div></div></div><button onClick={() => nav(`/users/${prop.landlordId}`)} className="mt-4 w-full border rounded-xl py-2 text-sm font-medium">Xem hồ sơ chủ trọ</button></div>
        <AdSlot placement="ROOM_DETAIL" className="w-full h-72" />
      </div>
    </div>

    {similar.length > 0 && <section><div className="flex justify-between items-end mb-4"><div><h2 className="text-2xl font-extrabold">Phòng tương tự</h2><p className="text-sm text-gray-500">Gợi ý theo khu vực/trường và mức độ phù hợp.</p></div><button onClick={() => nav('/')} className="text-sm text-indigo-600 font-semibold">Xem tất cả →</button></div><div className="grid md:grid-cols-3 gap-6">{similar.map(x => <RoomCard key={x.listingId} item={x} />)}</div></section>}

    {services.length > 0 && <section><div className="flex justify-between items-end mb-4"><div><h2 className="text-2xl font-extrabold">Dịch vụ tiện ích liên quan</h2><p className="text-sm text-gray-500">Chuyển trọ, vệ sinh, sửa chữa, Internet...</p></div><button onClick={() => nav('/services')} className="text-sm text-indigo-600 font-semibold">Xem dịch vụ →</button></div><div className="grid md:grid-cols-3 gap-5">{services.map((s: any) => <div key={s.id} className="bg-white border rounded-2xl overflow-hidden"><img src={s.imageUrl || '/demo/service-moving.png'} className="w-full h-36 object-cover" /><div className="p-4"><div className="text-xs text-indigo-600 font-bold">{s.category}</div><h3 className="font-bold mt-1">{s.title}</h3><p className="text-sm text-gray-500 mt-2 line-clamp-2">{s.description}</p><div className="mt-3 font-bold text-indigo-600">Từ {money(s.priceFrom)}</div></div></div>)}</div></section>}
  </div>;
}
