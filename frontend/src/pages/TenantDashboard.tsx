import { useEffect, useState } from 'react';
import { api, getUser, money, resolveMediaUrl } from '../lib/api';
import { useLocation, useNavigate } from 'react-router-dom';
import ProfileSettings from '../components/ProfileSettings';

export default function TenantDashboard({ view }: { view: 'profile' | 'favorites' | 'interests' | 'notifications' }) {
  const nav = useNavigate();
  const location = useLocation();
  const user = getUser();
  const [profile, setProfile] = useState<any>(user || {});
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [actionMsg, setActionMsg] = useState('');

  const loadData = () => {
    if (!user) {
      nav('/login', { state: { from: location.pathname } });
      return;
    }
    if (view === 'profile') {
      void api.get('/auth/me').then(r => setProfile(r.data)).catch(() => {});
      return;
    }
    setLoading(true);
    const req = view === 'favorites'
      ? api.get('/listings/favorites')
      : view === 'interests'
      ? api.get('/listings/interests')
      : api.get('/notifications/mine');

    void req
      .then(r => setData(r.data || []))
      .catch(() => setData([]))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    loadData();
  }, [view]);

  const toggleMatching = async (listingId: number, currentEnabled: boolean) => {
    const lid = Number(listingId);
    if (!Number.isFinite(lid) || lid <= 0) return;
    try {
      await api.post(`/listings/${lid}/interest`, { matchingEnabled: !currentEnabled });
      setActionMsg(!currentEnabled ? 'Đã bật tìm bạn cùng phòng cho tin này.' : 'Đã tắt tìm bạn cùng phòng.');
      loadData();
    } catch (e: any) {
      alert(e.response?.data?.message || 'Không thể cập nhật trạng thái');
    }
  };

  const removeInterest = async (listingId: number) => {
    const lid = Number(listingId);
    if (!Number.isFinite(lid) || lid <= 0) return;
    if (!window.confirm('Bạn có chắc muốn bỏ quan tâm phòng này?')) return;
    try {
      await api.delete(`/listings/${lid}/interest`);
      loadData();
    } catch (e: any) {
      alert(e.response?.data?.message || 'Không thể bỏ quan tâm');
    }
  };

  const removeFavorite = async (listingId: number) => {
    const lid = Number(listingId);
    if (!Number.isFinite(lid) || lid <= 0) return;
    try {
      await api.post(`/listings/${lid}/favorite`);
      loadData();
    } catch (e: any) {
      alert(e.response?.data?.message || 'Không thể thao tác');
    }
  };

  return (
    <div className="space-y-8">
      {actionMsg && (
        <div className="p-4 rounded-xl bg-indigo-50 border border-indigo-200 text-sm text-indigo-700 flex justify-between items-center">
          <span>{actionMsg}</span>
          <button onClick={() => setActionMsg('')} className="text-indigo-500 hover:text-indigo-800 font-bold">×</button>
        </div>
      )}

      {view === 'profile' && (
        <>
          <div>
            <h1 className="text-4xl font-extrabold tracking-tight">Trang cá nhân & Cài đặt</h1>
            <p className="mt-2 text-lg text-gray-600">
              Cập nhật thông tin cá nhân, liên hệ, vị trí, bảo mật và hồ sơ công khai.
            </p>
          </div>
          <ProfileSettings profile={profile} setProfile={setProfile} onSaved={setProfile} showMatching />
        </>
      )}

      {view === 'favorites' && (
        <>
          <div>
            <h1 className="text-4xl font-extrabold tracking-tight">Phòng đã lưu</h1>
            <p className="mt-2 text-lg text-gray-600">Danh sách phòng bạn đã đánh dấu yêu thích để xem lại.</p>
          </div>
          {loading ? (
            <Loading />
          ) : data.length === 0 ? (
            <Empty text="Bạn chưa lưu phòng nào vào danh sách yêu thích." ctaText="Khám phá phòng trọ" onCta={() => nav('/')} />
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {data.map((x: any) => {
                const cover = x.coverImage || 'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=800';
                return (
                  <div key={x.listingId} className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden flex flex-col hover:shadow-md transition-shadow">
                    <div className="relative aspect-[4/3] bg-gray-100 overflow-hidden">
                      <img src={resolveMediaUrl(cover)} alt={x.title} className="w-full h-full object-cover" />
                      <div className="absolute top-3 left-3 flex flex-col gap-1.5">
                        <span className={`text-white text-xs font-bold px-2.5 py-1 rounded-full ${x.availability === 'AVAILABLE' ? 'bg-green-600/90' : 'bg-red-600/90'}`}>
                          {x.availability === 'AVAILABLE' ? 'Còn phòng' : 'Hết phòng'}
                        </span>
                      </div>
                      <button
                        onClick={() => removeFavorite(x.listingId)}
                        className="absolute top-3 right-3 w-8 h-8 rounded-full bg-white/90 text-red-500 flex items-center justify-center hover:bg-white text-sm shadow-sm"
                        title="Bỏ lưu"
                      >
                        ✕
                      </button>
                    </div>
                    <div className="p-5 flex flex-col flex-1">
                      <h3 className="font-bold text-gray-900 text-lg line-clamp-1">{x.title}</h3>
                      <p className="text-sm text-gray-500 mt-1 line-clamp-1">
                        📍 {[x.street, x.ward, x.district, x.province].filter(Boolean).join(', ')}
                      </p>
                      <p className="text-xl font-extrabold text-indigo-600 mt-3">
                        {money(x.price)}<span className="text-xs font-normal text-gray-500"> / tháng</span>
                      </p>
                      <div className="mt-auto pt-4 border-t flex gap-2">
                        <button
                          onClick={() => nav(`/property/${x.listingId}`)}
                          className="flex-1 bg-indigo-600 hover:bg-indigo-700 text-white font-medium py-2 rounded-xl text-sm transition-colors"
                        >
                          Xem chi tiết
                        </button>
                        <button
                          onClick={() => removeFavorite(x.listingId)}
                          className="px-3 py-2 border border-gray-200 hover:bg-gray-50 text-gray-600 rounded-xl text-sm font-medium"
                        >
                          Bỏ lưu
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </>
      )}

      {view === 'interests' && (
        <>
          <div>
            <h1 className="text-4xl font-extrabold tracking-tight">Phòng đang quan tâm</h1>
            <p className="mt-2 text-lg text-gray-600">
              Những phòng bạn đang theo dõi hoặc bật tính năng tìm bạn cùng thuê.
            </p>
          </div>
          {loading ? (
            <Loading />
          ) : data.length === 0 ? (
            <Empty text="Bạn chưa quan tâm phòng trọ nào." ctaText="Tìm phòng ngay" onCta={() => nav('/')} />
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {data.map((x: any) => {
                const cover = x.coverImage || 'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=800';
                const isFull = x.availability === 'FULL' || x.availability === 'RENTED';
                return (
                  <div key={x.listingId} className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden flex flex-col hover:shadow-md transition-shadow">
                    <div className="relative aspect-[4/3] bg-gray-100 overflow-hidden">
                      <img src={resolveMediaUrl(cover)} alt={x.title} className="w-full h-full object-cover" />
                      <div className="absolute top-3 left-3 flex flex-col gap-1.5">
                        <span className={`text-white text-xs font-bold px-2.5 py-1 rounded-full ${!isFull ? 'bg-green-600/90' : 'bg-red-600/90'}`}>
                          {!isFull ? 'Còn phòng' : 'Hiện đã hết phòng'}
                        </span>
                        {x.matchingEnabled && (
                          <span className="bg-purple-600/90 text-white text-xs font-bold px-2.5 py-1 rounded-full shadow-sm">
                            Đang tìm bạn ở ghép
                          </span>
                        )}
                      </div>
                    </div>
                    <div className="p-5 flex flex-col flex-1">
                      <h3 className="font-bold text-gray-900 text-lg line-clamp-1">{x.title}</h3>
                      <p className="text-sm text-gray-500 mt-1 line-clamp-1">
                        📍 {[x.street, x.ward, x.district, x.province].filter(Boolean).join(', ')}
                      </p>
                      {x.nearestSchool && (
                        <p className="text-xs text-gray-500 mt-1">🎓 {x.nearestSchool}</p>
                      )}
                      <p className="text-xl font-extrabold text-indigo-600 mt-3">
                        {money(x.price)}<span className="text-xs font-normal text-gray-500"> / tháng</span>
                      </p>

                      <div className="mt-4 pt-3 border-t space-y-2">
                        <div className="flex items-center justify-between text-xs text-gray-600">
                          <span>Ứng viên cùng phòng: <b>{x.matchingCandidateCount || 0} người</b></span>
                          <button
                            onClick={() => toggleMatching(x.listingId, x.matchingEnabled)}
                            className={`font-semibold hover:underline ${x.matchingEnabled ? 'text-purple-600' : 'text-gray-500'}`}
                          >
                            {x.matchingEnabled ? '✓ Bật tìm bạn' : '○ Tắt tìm bạn'}
                          </button>
                        </div>
                        <div className="flex gap-2 pt-1">
                          <button
                            onClick={() => nav(`/property/${x.listingId}`)}
                            className="flex-1 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 font-semibold py-2 rounded-xl text-xs transition-colors"
                          >
                            Xem phòng
                          </button>
                          {x.matchingEnabled && (
                            <button
                              onClick={() => nav(`/tenant/matching?listingId=${x.listingId}`)}
                              className="flex-1 bg-purple-600 hover:bg-purple-700 text-white font-semibold py-2 rounded-xl text-xs transition-colors"
                            >
                              Người phù hợp ({x.matchingCandidateCount || 0})
                            </button>
                          )}
                          <button
                            onClick={() => removeInterest(x.listingId)}
                            className="px-2.5 py-2 border border-gray-200 hover:bg-gray-50 text-gray-600 rounded-xl text-xs font-medium"
                            title="Bỏ quan tâm"
                          >
                            Bỏ
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </>
      )}

      {view === 'notifications' && (
        <>
          <div>
            <h1 className="text-4xl font-extrabold">Thông báo</h1>
            <p className="mt-2 text-lg text-gray-600">Duyệt tin, matching, thanh toán và cập nhật hệ thống.</p>
          </div>
          {loading ? (
            <Loading />
          ) : data.length === 0 ? (
            <Empty text="Bạn chưa có thông báo nào." />
          ) : (
            <div className="space-y-3">
              {data.map((n: any) => (
                <div key={n.id} className="bg-white p-5 rounded-2xl border shadow-sm flex justify-between items-start gap-4">
                  <div>
                    <span className="text-xs px-2.5 py-0.5 rounded-full font-bold bg-indigo-50 text-indigo-700">
                      {n.type || 'THÔNG BÁO'}
                    </span>
                    <div className="mt-2 text-gray-800 text-sm font-medium">{n.message}</div>
                    <div className="text-xs text-gray-400 mt-2">
                      {n.createdAt ? new Date(n.createdAt).toLocaleString('vi-VN') : ''}
                    </div>
                  </div>
                  {n.status === 'UNREAD' && (
                    <span className="w-2.5 h-2.5 rounded-full bg-indigo-600 shrink-0 mt-2" />
                  )}
                </div>
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );
}

function Loading() {
  return (
    <div className="h-48 flex items-center justify-center">
      <div className="animate-spin h-10 w-10 border-b-2 border-indigo-600 rounded-full" />
    </div>
  );
}

function Empty({ text, ctaText, onCta }: { text: string; ctaText?: string; onCta?: () => void }) {
  return (
    <div className="bg-white border rounded-2xl p-12 text-center text-gray-500 space-y-4">
      <p>{text}</p>
      {ctaText && onCta && (
        <button
          onClick={onCta}
          className="bg-indigo-600 hover:bg-indigo-700 text-white px-5 py-2.5 rounded-xl font-medium text-sm transition-colors"
        >
          {ctaText}
        </button>
      )}
    </div>
  );
}
