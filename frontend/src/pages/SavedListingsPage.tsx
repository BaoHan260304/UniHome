import { useState, useEffect } from 'react';
import { api, getUser, money, resolveMediaUrl } from '../lib/api';
import { Link, useNavigate } from 'react-router-dom';

type SavedTab = 'ROOM' | 'ROOMMATE' | 'SECOND_HAND' | 'SERVICE';

export default function SavedListingsPage() {
  const user = getUser();
  const nav = useNavigate();
  const [activeTab, setActiveTab] = useState<SavedTab>('ROOM');
  const [favorites, setFavorites] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const loadFavorites = async () => {
    if (!user) {
      nav('/login', { state: { from: '/saved' } });
      return;
    }
    setLoading(true);
    try {
      const res = await api.get('/listings/favorites');
      setFavorites(res.data || []);
    } catch {
      setFavorites([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void loadFavorites();
  }, []);

  const handleRemove = async (listingId: number) => {
    try {
      await api.post(`/listings/${listingId}/favorite`);
      setFavorites(prev => prev.filter(f => f.listingId !== listingId));
    } catch (e: any) {
      alert(e.response?.data?.message || 'Không thể bỏ lưu.');
    }
  };

  // Filter items by category tab
  const filteredList = favorites.filter(item => {
    const postType = (item.postType || '').toUpperCase();
    if (activeTab === 'ROOM') {
      return postType !== 'O_GHEP' && postType !== 'ROOM_TRANSFER' && postType !== 'ROOMMATE';
    } else if (activeTab === 'ROOMMATE') {
      return postType === 'O_GHEP' || postType === 'ROOM_TRANSFER' || postType === 'ROOMMATE';
    } else if (activeTab === 'SECOND_HAND') {
      return postType === 'SECOND_HAND';
    } else if (activeTab === 'SERVICE') {
      return postType === 'SERVICE';
    }
    return true;
  });

  const getStatusBadge = (status: string, avail: string) => {
    const s = (status || '').toUpperCase();
    const a = (avail || '').toUpperCase();
    if (s === 'EXPIRED') {
      return <span className="bg-gray-100 text-gray-700 text-[10px] font-bold px-2 py-0.5 rounded-md border border-gray-300">Đã hết hạn</span>;
    }
    if (a === 'RENTED' || a === 'FULL' || s === 'RENTED') {
      return <span className="bg-red-50 text-red-700 text-[10px] font-bold px-2 py-0.5 rounded-md border border-red-200">Đã hết phòng / Đã thuê</span>;
    }
    if (s === 'SOLD') {
      return <span className="bg-red-50 text-red-700 text-[10px] font-bold px-2 py-0.5 rounded-md border border-red-200">Đã bán</span>;
    }
    return <span className="bg-emerald-50 text-emerald-700 text-[10px] font-bold px-2 py-0.5 rounded-md border border-emerald-200">Đang hiển thị</span>;
  };

  return (
    <div className="max-w-6xl mx-auto py-6 px-4 sm:px-6 space-y-6 animate-fade-in">
      {/* Page Title */}
      <div>
        <h1 className="text-3xl font-black text-gray-900 tracking-tight flex items-center gap-2">
          <span>❤️</span> Tin đã lưu & Yêu thích
        </h1>
        <p className="text-xs text-gray-500 mt-1">
          Quản lý toàn bộ danh sách phòng trọ, bạn ở ghép, đồ cũ và dịch vụ bạn đã đánh dấu quan tâm
        </p>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-gray-200 gap-6 text-xs font-bold">
        <button
          onClick={() => setActiveTab('ROOM')}
          className={`pb-3 transition-colors flex items-center gap-1.5 ${
            activeTab === 'ROOM'
              ? 'border-b-2 border-indigo-600 text-indigo-600'
              : 'text-gray-500 hover:text-gray-800'
          }`}
        >
          <span>🏠</span> Phòng trọ & Căn hộ
        </button>
        <button
          onClick={() => setActiveTab('ROOMMATE')}
          className={`pb-3 transition-colors flex items-center gap-1.5 ${
            activeTab === 'ROOMMATE'
              ? 'border-b-2 border-indigo-600 text-indigo-600'
              : 'text-gray-500 hover:text-gray-800'
          }`}
        >
          <span>🤝</span> Ở ghép & Pass phòng
        </button>
        <button
          onClick={() => setActiveTab('SECOND_HAND')}
          className={`pb-3 transition-colors flex items-center gap-1.5 ${
            activeTab === 'SECOND_HAND'
              ? 'border-b-2 border-indigo-600 text-indigo-600'
              : 'text-gray-500 hover:text-gray-800'
          }`}
        >
          <span>📦</span> Đồ cũ sinh viên
        </button>
        <button
          onClick={() => setActiveTab('SERVICE')}
          className={`pb-3 transition-colors flex items-center gap-1.5 ${
            activeTab === 'SERVICE'
              ? 'border-b-2 border-indigo-600 text-indigo-600'
              : 'text-gray-500 hover:text-gray-800'
          }`}
        >
          <span>🚚</span> Dịch vụ sinh viên
        </button>
      </div>

      {/* Content Cards */}
      {loading ? (
        <div className="p-12 text-center text-xs text-gray-400">Đang tải danh sách đã lưu...</div>
      ) : filteredList.length === 0 ? (
        <div className="bg-white rounded-3xl p-12 text-center border border-gray-100 shadow-xs space-y-3">
          <span className="text-4xl">🤍</span>
          <h3 className="font-extrabold text-sm text-gray-800">Chưa có bài đăng nào trong mục này</h3>
          <p className="text-xs text-gray-400 max-w-sm mx-auto">
            Bấm vào biểu tượng trái tim trên các bài đăng để lưu lại và xem lại bất cứ lúc nào!
          </p>
          <Link
            to="/"
            className="inline-block mt-2 bg-indigo-600 text-white font-bold text-xs px-5 py-2.5 rounded-xl hover:bg-indigo-700 transition-colors shadow-xs"
          >
            Khám phá phòng trọ ngay
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-5">
          {filteredList.map((item) => (
            <div
              key={item.id}
              className="bg-white rounded-3xl border border-gray-100 shadow-xs hover:shadow-lg transition-all overflow-hidden flex flex-col group"
            >
              {/* Image Preview */}
              <div className="relative aspect-4/3 bg-gray-100 overflow-hidden">
                <img
                  src={resolveMediaUrl(item.coverImage || item.imageUrl || '/no-image.png')}
                  alt={item.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                />
                <div className="absolute top-3 left-3">
                  {getStatusBadge(item.listingStatus, item.availability)}
                </div>
                <button
                  type="button"
                  onClick={() => handleRemove(item.listingId)}
                  title="Bỏ lưu"
                  className="absolute top-3 right-3 w-8 h-8 rounded-full bg-white/90 backdrop-blur-xs text-red-500 hover:bg-red-500 hover:text-white flex items-center justify-center transition-all shadow-xs"
                >
                  ❤️
                </button>
              </div>

              {/* Card Body */}
              <div className="p-4 flex-1 flex flex-col justify-between space-y-3">
                <div>
                  <h3 className="font-bold text-sm text-gray-900 line-clamp-2 group-hover:text-indigo-600 transition-colors">
                    {item.title}
                  </h3>
                  <div className="flex items-center justify-between mt-2">
                    <span className="text-sm font-black text-indigo-600">
                      {money(item.price)}
                      <span className="text-[10px] font-normal text-gray-400">/tháng</span>
                    </span>
                    {item.area && (
                      <span className="text-xs text-gray-500 font-medium">
                        {item.area} m²
                      </span>
                    )}
                  </div>
                  {item.address && (
                    <p className="text-[11px] text-gray-500 mt-1 line-clamp-1">
                      📍 {item.address}
                    </p>
                  )}
                </div>

                {/* Actions */}
                <div className="pt-3 border-t border-gray-100 flex items-center gap-2">
                  <Link
                    to={`/property/${item.listingId}`}
                    className="flex-1 text-center py-2 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 font-bold text-xs rounded-xl transition-colors"
                  >
                    Xem chi tiết
                  </Link>
                  <Link
                    to={`/chat?listingId=${item.listingId}`}
                    className="px-3 py-2 bg-gray-900 hover:bg-black text-white font-bold text-xs rounded-xl transition-colors"
                  >
                    💬 Chat
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
