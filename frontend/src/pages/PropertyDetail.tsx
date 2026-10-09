import { useEffect, useState } from 'react';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import { api, getUser, mediaList, money, resolveMediaUrl } from '../lib/api';
import AdSlot from '../components/AdSlot';
import RoomCard from '../components/RoomCard';
import PanoramaViewer from '../components/PanoramaViewer';

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
  const [panoramas, setPanoramas] = useState<string[]>([]);
  const [activePanoramaUrl, setActivePanoramaUrl] = useState<string | null>(null);
  const [interestStatus, setInterestStatus] = useState<{ interested: boolean; matchingEnabled: boolean; favorite: boolean }>({
    interested: false,
    matchingEnabled: false,
    favorite: false
  });
  const user = getUser();

  const requireLogin = (action: string) => {
    nav('/login', { state: { from: location.pathname, action } });
  };

  const load = async () => {
    try {
      const r = await api.get(`/marketplace/listings/${id}`);
      const d = r.data;
      setProp(d);

      // Extract 360 panorama URLs
      let pList: string[] = [];
      if (d.mediaJson) {
        try {
          const arr = JSON.parse(d.mediaJson);
          if (Array.isArray(arr)) {
            pList = arr.filter((x: any) => x.mediaType === 'PANORAMA_360').map((x: any) => x.url);
          }
        } catch {}
      }
      setPanoramas(pList);

      try {
        const lr = await api.get(`/users/${d.landlordId}/public`);
        setLandlord(lr.data);
      } catch {}

      try {
        const sr = await api.get('/marketplace/listings', {
          params: { district: d.district || '', school: d.nearestSchool || '', sort: 'RELEVANCE' }
        });
        setSimilar((sr.data || []).filter((x: any) => String(x.listingId) !== String(id)).slice(0, 3));
      } catch {}

      try {
        const sv = await api.get('/content/services');
        const rows = (sv.data || []).filter((x: any) => !d.province || !x.province || x.province === d.province);
        setServices(rows.slice(0, 3));
      } catch {}

      if (user) {
        try {
          const isRes = await api.get(`/listings/${id}/interest-status`);
          setInterestStatus(isRes.data);
          if (isRes.data.matchingEnabled) {
            const mRes = await api.get(`/matching/listing/${id}`);
            setMatch(mRes.data || []);
          }
        } catch {}
      }
    } catch (e: any) {
      console.error(e);
    }
  };

  useEffect(() => {
    void load();
  }, [id]);

  if (!prop) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600" />
      </div>
    );
  }

  const media = mediaList(prop.imageUrl);
  const verification = prop.verification || {};

  const reveal = () => {
    if (!user) return requireLogin('SHOW_CONTACT');
    void api.get(`/marketplace/listings/${id}/contact`)
      .then(r => setContact(r.data))
      .catch(e => alert(e.response?.data?.message || 'Không thể xem liên hệ'));
  };

  const toggleInterest = async () => {
    if (!user) return requireLogin('INTEREST_ROOM');
    try {
      if (interestStatus.interested) {
        await api.delete(`/listings/${id}/interest`);
        setInterestStatus(prev => ({ ...prev, interested: false, matchingEnabled: false }));
        setMatch([]);
      } else {
        await api.post(`/listings/${id}/interest`, { matchingEnabled: false });
        setInterestStatus(prev => ({ ...prev, interested: true, matchingEnabled: false }));
      }
    } catch (e: any) {
      alert(e.response?.data?.message || 'Không thể cập nhật trạng thái');
    }
  };

  const toggleMatching = async () => {
    if (!user) return requireLogin('MATCH_ROOMMATE');
    try {
      const nextMatching = !interestStatus.matchingEnabled;
      await api.post(`/listings/${id}/interest`, { matchingEnabled: nextMatching });
      setInterestStatus(prev => ({ ...prev, interested: true, matchingEnabled: nextMatching }));

      if (nextMatching) {
        try {
          const r = await api.get(`/matching/listing/${id}`);
          setMatch(r.data || []);
        } catch (e: any) {
          nav(`/tenant/matching?listingId=${id}`);
        }
      } else {
        setMatch([]);
      }
    } catch (e: any) {
      alert(e.response?.data?.message || 'Không thể cập nhật tìm bạn cùng phòng');
    }
  };

  const chatUser = (otherUserId: number, contextType = 'ROOM', contextId: number = Number(prop.listingId)) => {
    if (!user) return requireLogin('CHAT');
    void api.post('/chat/conversations', { otherUserId, contextType, contextId })
      .then(() => nav(user.role === 'LANDLORD' ? '/chat' : '/tenant/chat'));
  };

  const report = () => {
    if (!user) return requireLogin('REPORT');
    const details = prompt('Mô tả vấn đề: sai giá, phòng hết, ảnh sai, phí ẩn, spam...');
    if (details) {
      void api.post('/community/reports', {
        targetType: 'LISTING',
        targetId: prop.listingId,
        reasonCode: 'USER_REPORT',
        details
      }).then(() => alert('Đã gửi báo cáo cho UniHome.'));
    }
  };

  const verifyRows = [
    ['Phòng tồn tại', verification.roomExists],
    ['Vị trí', verification.locationVerified],
    ['Ảnh / video', verification.mediaVerified],
    ['Giá thuê', verification.priceVerified],
    ['Điện nước', verification.utilityVerified],
    ['Tiện ích', verification.amenityVerified],
    ['Tình trạng còn phòng', verification.availabilityVerified]
  ];

  const landlordAvatar = landlord?.avatarUrl
    ? resolveMediaUrl(landlord.avatarUrl)
    : `https://ui-avatars.com/api/?name=${encodeURIComponent(landlord?.fullName || 'Chủ trọ')}&background=random`;

  return (
    <div className="max-w-5xl mx-auto space-y-8 pb-12">
      <div className="flex justify-between items-center">
        <button onClick={() => nav(-1)} className="text-indigo-600 font-medium hover:underline text-sm">
          ← Quay lại
        </button>
        <button onClick={() => nav('/')} className="text-sm font-semibold text-gray-600 hover:text-indigo-600">
          Trang chủ
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-[1fr_260px] gap-8">
        <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden">
          {/* Gallery */}
          <div className="relative">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-1 bg-gray-100">
              {media.length ? (
                media.map((u: string, i: number) => {
                  const resolved = resolveMediaUrl(u);
                  const isVid = u.startsWith('data:video') || u.endsWith('.mp4') || u.endsWith('.webm');
                  return (
                    <div key={i} className={`${media.length === 1 ? 'md:col-span-2' : ''} h-72 md:h-96 bg-black relative`}>
                      {isVid ? (
                        <video src={resolved} controls playsInline preload="metadata" className="w-full h-full object-cover" />
                      ) : (
                        <img src={resolved} alt={prop.title} className="w-full h-full object-cover" />
                      )}
                    </div>
                  );
                })
              ) : (
                <div className="md:col-span-2 h-64 flex items-center justify-center text-gray-400">
                  Không có hình ảnh/video
                </div>
              )}
            </div>

            {/* 360 Panorama CTA button */}
            {panoramas.length > 0 && (
              <div className="absolute bottom-4 right-4 z-10">
                <button
                  onClick={() => setActivePanoramaUrl(panoramas[0])}
                  className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2.5 rounded-2xl font-bold text-xs shadow-lg flex items-center gap-2 backdrop-blur-xs transition-all hover:scale-105"
                >
                  <span className="bg-white/20 px-1.5 py-0.5 rounded text-[10px] font-extrabold">360°</span>
                  Trải nghiệm Panorama ({panoramas.length})
                </button>
              </div>
            )}
          </div>

          <div className="p-8">
            <div className="flex justify-between items-start mb-6 gap-6">
              <div>
                <div className="flex gap-2 flex-wrap mb-3">
                  <span className="px-3 py-1 bg-indigo-50 text-indigo-700 text-xs font-bold rounded-full border border-indigo-100">
                    {prop.propertyType || 'Phòng trọ'}
                  </span>
                  {prop.packageTier !== 'FREE' && (
                    <span className="px-3 py-1 bg-amber-50 text-amber-700 text-xs font-bold rounded-full border border-amber-200">
                      ★ {prop.packageTier}
                    </span>
                  )}
                  <span className="px-3 py-1 bg-green-50 text-green-700 text-xs font-bold rounded-full border border-green-200">
                    {prop.verificationLevel === 'ON_SITE_VERIFIED'
                      ? '✓ Xác minh thực địa'
                      : prop.verificationLevel === 'REMOTE_VERIFIED'
                      ? '✓ Xác minh từ xa'
                      : 'Đã kiểm duyệt nội dung'}
                  </span>
                </div>
                <h1 className="text-3xl font-extrabold text-gray-900">{prop.title}</h1>
                <p className="text-gray-500 mt-2">
                  📍 {[prop.street, prop.ward, prop.district, prop.province].filter(Boolean).join(', ')}
                </p>
                {prop.nearestSchool && (
                  <p className="text-gray-500 mt-1">
                    🎓 {prop.nearestSchool}{' '}
                    {prop.nearestSchoolDistanceKm != null ? `• ${prop.nearestSchoolDistanceKm} km` : ''}
                  </p>
                )}
              </div>
              <p className="text-3xl font-extrabold text-indigo-600 text-right">
                {money(prop.price)}
                <span className="block text-sm font-normal text-gray-500">/ tháng</span>
              </p>
            </div>

            {/* Basic specs */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
              {[
                ['Diện tích', `${prop.area || '—'} m²`],
                ['Tầng', prop.floorText || '—'],
                ['Sức chứa', prop.maxOccupants ? `${prop.maxOccupants} người` : '—'],
                ['Tình trạng', prop.availability === 'AVAILABLE' ? 'Còn phòng' : 'Hết phòng']
              ].map(([a, b]) => (
                <div key={a} className="bg-gray-50 p-4 rounded-2xl text-center border border-gray-100">
                  <span className="block text-gray-500 text-xs mb-1">{a}</span>
                  <strong className="text-base font-bold text-gray-900">{b}</strong>
                </div>
              ))}
            </div>

            {/* Transparent Fees */}
            <h3 className="text-lg font-bold mb-3 text-gray-900">Chi phí minh bạch</h3>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3 mb-8 text-sm">
              {[
                ['Cọc', prop.deposit],
                ['Điện', prop.electricityPrice],
                ['Nước', prop.waterPrice],
                ['Internet', prop.internetPrice],
                ['Gửi xe', prop.parkingFee],
                ['Phí khác', prop.otherFees]
              ].map(([a, b]) => (
                <div key={String(a)} className="border rounded-xl p-3 bg-white">
                  <div className="text-gray-500 text-xs">{a}</div>
                  <b className="text-gray-800">{money(Number(b || 0))}</b>
                </div>
              ))}
            </div>

            {/* Description */}
            <h3 className="text-lg font-bold mb-3 text-gray-900">Thông tin chi tiết</h3>
            <p className="text-gray-700 leading-relaxed whitespace-pre-wrap bg-gray-50 p-6 rounded-2xl border mb-6 text-sm">
              {prop.description || 'Chủ trọ chưa thêm mô tả chi tiết.'}
            </p>

            <div className="grid md:grid-cols-2 gap-5 mb-6">
              <div>
                <h3 className="text-base font-bold mb-3 text-gray-900">Tiện ích</h3>
                <div className="flex flex-wrap gap-2">
                  {String(prop.amenities || '')
                    .split('|')
                    .filter(Boolean)
                    .map((x: string) => (
                      <span className="px-3 py-1.5 bg-indigo-50 text-indigo-700 rounded-full text-xs font-semibold" key={x}>
                        ✓ {x}
                      </span>
                    ))}
                  {!prop.amenities && <span className="text-xs text-gray-500">Chưa cập nhật tiện ích.</span>}
                </div>
              </div>
              <div>
                <h3 className="text-base font-bold mb-3 text-gray-900">Nội quy & Nội thất</h3>
                <p className="text-xs text-gray-700 whitespace-pre-wrap">{prop.rules || 'Chưa cập nhật nội quy.'}</p>
                <p className="text-xs text-gray-500 mt-2">
                  Nội thất: <b>{prop.furniture === 'full' ? 'Đầy đủ nội thất' : prop.furniture === 'basic' ? 'Cơ bản' : 'Không có đồ'}</b>
                </p>
              </div>
            </div>

            {/* Verification box */}
            <div className="bg-emerald-50 border border-emerald-100 rounded-2xl p-5 mb-6">
              <div className="flex justify-between gap-4">
                <div>
                  <h3 className="font-bold text-emerald-900 text-sm">Xác minh minh bạch UniHome</h3>
                  <p className="text-xs text-emerald-800 mt-0.5">
                    Mức hiện tại: <b>{prop.verificationLevel}</b>
                  </p>
                </div>
                {verification.verifiedAt && (
                  <div className="text-[11px] text-emerald-700">
                    Xác minh: {new Date(verification.verifiedAt).toLocaleDateString('vi-VN')}
                  </div>
                )}
              </div>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-2 mt-4">
                {verifyRows.map(([name, ok]: any) => (
                  <div
                    key={name}
                    className={`text-xs px-2.5 py-1.5 rounded-lg border ${
                      ok ? 'bg-white text-emerald-700 border-emerald-200' : 'bg-gray-50 text-gray-500 border-gray-200'
                    }`}
                  >
                    {ok ? '✓' : '○'} {name}
                  </div>
                ))}
              </div>
              {verification.note && (
                <p className="text-xs text-emerald-800 mt-2">Ghi chú: {verification.note}</p>
              )}
            </div>

            {/* Main Action Buttons */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
              <button
                onClick={reveal}
                className="bg-indigo-600 text-white font-bold py-3.5 px-4 rounded-xl hover:bg-indigo-700 transition-colors shadow-sm text-sm"
              >
                {contact ? `📞 ${contact.phone || 'Không có SĐT'} ${contact.zalo ? `• Zalo: ${contact.zalo}` : ''}` : 'Hiện SĐT / Zalo chủ trọ'}
              </button>

              <button
                onClick={() => chatUser(prop.landlordId)}
                className="bg-blue-50 text-blue-700 font-bold py-3.5 px-4 rounded-xl border border-blue-200 hover:bg-blue-100 transition-colors text-sm"
              >
                💬 Chat trực tiếp với chủ trọ
              </button>

              <button
                onClick={toggleInterest}
                className={`font-bold py-3.5 px-4 rounded-xl border transition-colors text-sm ${
                  interestStatus.interested
                    ? 'bg-pink-600 text-white border-pink-600 shadow-sm'
                    : 'bg-pink-50 text-pink-700 border-pink-200 hover:bg-pink-100'
                }`}
              >
                {interestStatus.interested ? '♥ Đã quan tâm phòng' : '♡ Quan tâm phòng này'}
              </button>

              <button
                onClick={toggleMatching}
                className={`font-bold py-3.5 px-4 rounded-xl border transition-colors text-sm ${
                  interestStatus.matchingEnabled
                    ? 'bg-purple-600 text-white border-purple-600 shadow-sm'
                    : 'bg-purple-50 text-purple-700 border-purple-200 hover:bg-purple-100'
                }`}
              >
                {interestStatus.matchingEnabled ? '✨ Đang tìm bạn cùng thuê' : '👥 Bật tìm bạn cùng thuê'}
              </button>
            </div>

            {/* Roommate matching candidates */}
            {match.length > 0 && (
              <div className="mt-8 p-5 bg-purple-50/50 rounded-2xl border border-purple-100">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-base font-bold text-purple-900">
                    Người cùng quan tâm phù hợp ({match.length})
                  </h3>
                  <button
                    onClick={() => nav(`/tenant/matching?listingId=${id}`)}
                    className="text-xs text-purple-700 font-bold hover:underline"
                  >
                    Xem chi tiết Matching →
                  </button>
                </div>
                <div className="space-y-3">
                  {match.map((m: any) => {
                    const candidateAvatar = m.avatarUrl
                      ? resolveMediaUrl(m.avatarUrl)
                      : `https://ui-avatars.com/api/?name=${encodeURIComponent(m.fullName)}&background=random`;
                    return (
                      <div key={m.userId} className="p-4 rounded-xl border bg-white flex items-center gap-4 shadow-sm">
                        <button onClick={() => nav(`/users/${m.userId}`)}>
                          <img src={candidateAvatar} alt={m.fullName} className="w-12 h-12 rounded-full object-cover border" />
                        </button>
                        <div className="flex-1">
                          <button onClick={() => nav(`/users/${m.userId}`)} className="font-bold text-sm text-gray-900 hover:text-indigo-600">
                            {m.fullName}
                          </button>
                          <div className="text-xs text-gray-500 mt-0.5">{m.reason}</div>
                          <div className="flex flex-wrap gap-3 mt-2 text-xs">
                            <button onClick={() => chatUser(m.userId, 'MATCHING', Number(prop.listingId))} className="text-blue-600 font-semibold hover:underline">
                              💬 Chat UniHome
                            </button>
                          </div>
                        </div>
                        <div className="text-lg font-extrabold text-green-600">{m.score}%</div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Map */}
            {prop.latitude && prop.longitude && (
              <div className="mt-8">
                <h3 className="text-base font-bold mb-3 text-gray-900">Vị trí trên bản đồ</h3>
                <iframe
                  title="Bản đồ phòng trọ"
                  className="w-full h-72 rounded-2xl border"
                  loading="lazy"
                  src={`https://maps.google.com/maps?q=${prop.latitude},${prop.longitude}&z=15&output=embed`}
                />
                <div className="text-xs text-gray-400 mt-1.5">
                  Tọa độ: {prop.latitude}, {prop.longitude}
                </div>
              </div>
            )}

            {/* Reviews */}
            <div className="mt-8">
              <h3 className="text-base font-bold mb-3 text-gray-900">Đánh giá phòng/khu trọ</h3>
              <div className="space-y-3">
                {(prop.reviews || []).map((r: any) => (
                  <div key={r.id} className="border rounded-xl p-4 bg-gray-50">
                    <div className="font-bold text-amber-500 text-sm">{'★'.repeat(r.rating || 5)}</div>
                    <div className="text-xs text-gray-700 mt-1">{r.comment}</div>
                  </div>
                ))}
                {!(prop.reviews || []).length && (
                  <div className="text-xs text-gray-500">Chưa có đánh giá nào cho khu trọ này.</div>
                )}
              </div>
              {user && (
                <button
                  onClick={() => {
                    const c = prompt('Nhập nhận xét của bạn:');
                    if (c) {
                      api.post('/community/reviews', {
                        propertyId: prop.propertyId,
                        rating: 5,
                        accuracyRating: 5,
                        priceTransparencyRating: 5,
                        utilityTransparencyRating: 5,
                        landlordCommunicationRating: 5,
                        comment: c
                      }).then(() => {
                        alert('Đã gửi đánh giá thành công.');
                        void load();
                      });
                    }
                  }}
                  className="mt-3 text-indigo-600 font-bold text-xs hover:underline"
                >
                  + Viết đánh giá
                </button>
              )}
            </div>

            <div className="mt-8 flex flex-wrap gap-4 text-xs">
              <button onClick={report} className="text-red-600 hover:underline font-semibold">
                ⚑ Báo cáo tin đăng sai lệch / vi phạm
              </button>
              <span className="text-gray-400">
                Xác nhận còn phòng: {prop.lastAvailabilityConfirmedAt ? new Date(prop.lastAvailabilityConfirmedAt).toLocaleString('vi-VN') : 'Mới đăng'}
              </span>
            </div>
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-5">
          <div className="bg-white rounded-2xl border border-gray-200 p-5 shadow-sm text-center">
            <img
              src={landlordAvatar}
              alt={landlord?.fullName || 'Chủ trọ'}
              className="w-16 h-16 rounded-full object-cover mx-auto border-2 border-indigo-100 shadow-sm"
            />
            <h3 className="font-bold text-gray-900 mt-3 text-sm">{landlord?.fullName || 'Chủ trọ UniHome'}</h3>
            <p className="text-xs text-gray-500 mt-0.5">{landlord?.followers || 0} người theo dõi</p>
            <button
              onClick={() => nav(`/users/${prop.landlordId}`)}
              className="mt-4 w-full border border-gray-200 rounded-xl py-2 text-xs font-semibold text-gray-700 hover:bg-gray-50 transition-colors"
            >
              Xem trang cá nhân
            </button>
          </div>

          <AdSlot placement="ROOM_DETAIL" className="w-full h-72" />
        </div>
      </div>

      {similar.length > 0 && (
        <section className="pt-6">
          <div className="flex justify-between items-end mb-4">
            <div>
              <h2 className="text-xl font-extrabold text-gray-900">Phòng tương tự lân cận</h2>
              <p className="text-xs text-gray-500">Gợi ý theo khu vực và mức giá phù hợp.</p>
            </div>
            <button onClick={() => nav('/')} className="text-xs text-indigo-600 font-bold hover:underline">
              Xem tất cả →
            </button>
          </div>
          <div className="grid md:grid-cols-3 gap-6">
            {similar.map(x => (
              <RoomCard key={x.listingId} item={x} />
            ))}
          </div>
        </section>
      )}

      {services.length > 0 && (
        <section className="pt-4">
          <div className="flex justify-between items-end mb-4">
            <div>
              <h2 className="text-xl font-extrabold text-gray-900">Dịch vụ tiện ích sinh viên</h2>
              <p className="text-xs text-gray-500">Chuyển đồ, giặt ủi, dọn dẹp, internet...</p>
            </div>
            <button onClick={() => nav('/services')} className="text-xs text-indigo-600 font-bold hover:underline">
              Xem dịch vụ →
            </button>
          </div>
          <div className="grid md:grid-cols-3 gap-5">
            {services.map((s: any) => (
              <div key={s.id} className="bg-white border rounded-2xl overflow-hidden hover:shadow-md transition-shadow">
                <img src={resolveMediaUrl(s.imageUrl) || '/demo/service-moving.png'} alt={s.title} className="w-full h-36 object-cover" />
                <div className="p-4">
                  <div className="text-xs text-indigo-600 font-bold">{s.category}</div>
                  <h3 className="font-bold text-sm mt-1 line-clamp-1">{s.title}</h3>
                  <p className="text-xs text-gray-500 mt-1 line-clamp-2">{s.description}</p>
                  <div className="mt-3 font-bold text-indigo-600 text-sm">Từ {money(s.priceFrom)}</div>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* 360 Panorama Interactive Modal */}
      {activePanoramaUrl && (
        <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-4xl w-full p-6 space-y-4 shadow-2xl relative">
            <div className="flex justify-between items-center border-b pb-3">
              <div className="flex items-center gap-2">
                <span className="px-2 py-0.5 bg-indigo-100 text-indigo-700 text-xs font-bold rounded-full">360°</span>
                <h3 className="font-extrabold text-base sm:text-lg text-gray-900 truncate max-w-lg">
                  Xem phòng 360° Panorama - {prop.title}
                </h3>
              </div>
              <button
                onClick={() => setActivePanoramaUrl(null)}
                className="w-8 h-8 rounded-full bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold flex items-center justify-center text-sm"
              >
                ✕
              </button>
            </div>

            {panoramas.length > 1 && (
              <div className="flex gap-2">
                {panoramas.map((u, i) => (
                  <button
                    key={i}
                    onClick={() => setActivePanoramaUrl(u)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                      activePanoramaUrl === u ? 'bg-indigo-600 text-white shadow-xs' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    Góc chụp {i + 1}
                  </button>
                ))}
              </div>
            )}

            <PanoramaViewer src={resolveMediaUrl(activePanoramaUrl)} />
          </div>
        </div>
      )}
    </div>
  );
}
