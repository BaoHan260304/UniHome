import { useEffect, useMemo, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { api, getUser, money } from '../lib/api';
import PostComposerModal from '../components/PostComposerModal';

const STATUS_TABS = [
  { key: 'ALL', label: 'Tất cả trạng thái' },
  { key: 'ACTIVE', label: 'Đang hiển thị' },
  { key: 'PENDING_REVIEW', label: 'Chờ kiểm duyệt' },
  { key: 'REJECTED', label: 'Cần chỉnh sửa' },
  { key: 'HIDDEN', label: 'Đã ẩn / Tạm dừng' },
  { key: 'SOLD', label: 'Đã bán / Hết phòng' },
  { key: 'EXPIRED', label: 'Hết hạn' }
];

const CATEGORY_TABS = [
  { key: 'ALL', label: 'Tất cả danh mục' },
  { key: 'ROOM', label: '🏠 Phòng & Căn hộ' },
  { key: 'ROOMMATE', label: '👥 Ở ghép & Sang nhượng' },
  { key: 'SECOND_HAND', label: '📦 Đồ cũ sinh viên' },
  { key: 'SERVICE', label: '🛠️ Dịch vụ sinh viên' }
];

export default function MyPostsPage() {
  const nav = useNavigate();
  const location = useLocation();
  const user = getUser();

  const [posts, setPosts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchKeyword, setSearchKeyword] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('ALL');
  const [selectedStatus, setSelectedStatus] = useState('ALL');
  const [composerOpen, setComposerOpen] = useState(false);
  const [actionMsg, setActionMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  useEffect(() => {
    if (!user) {
      nav('/login', { state: { from: location.pathname } });
      return;
    }
    loadPosts();
  }, [user?.id]);

  const loadPosts = async () => {
    setLoading(true);
    try {
      const res = await api.get('/my-posts');
      setPosts(res.data || []);
    } catch (e: any) {
      setActionMsg({ type: 'error', text: 'Không tải được danh sách bài đăng của bạn.' });
    } finally {
      setLoading(false);
    }
  };

  const filteredPosts = useMemo(() => {
    return posts.filter((p) => {
      // Category filter
      if (selectedCategory !== 'ALL') {
        if (selectedCategory === 'ROOMMATE') {
          if (p.category !== 'ROOM' || !['ROOMMATE_SEARCH', 'TENANT_TRANSFER'].includes(p.relationship)) {
            return false;
          }
        } else if (p.category !== selectedCategory) {
          return false;
        }
      }

      // Status filter
      if (selectedStatus !== 'ALL') {
        const normStatus = (p.status || '').toUpperCase();
        if (selectedStatus === 'ACTIVE' && !['ACTIVE', 'APPROVED'].includes(normStatus)) return false;
        if (selectedStatus === 'PENDING_REVIEW' && !['PENDING_REVIEW', 'PENDING'].includes(normStatus)) return false;
        if (selectedStatus === 'SOLD' && !['SOLD', 'FULL'].includes(normStatus)) return false;
        if (selectedStatus === 'HIDDEN' && normStatus !== 'HIDDEN' && normStatus !== 'PAUSED') return false;
        if (selectedStatus === 'REJECTED' && normStatus !== 'REJECTED') return false;
        if (selectedStatus === 'EXPIRED' && normStatus !== 'EXPIRED') return false;
      }

      // Search keyword
      if (searchKeyword.trim()) {
        const kw = searchKeyword.toLowerCase();
        const matchTitle = (p.title || '').toLowerCase().includes(kw);
        const matchAddr = (p.address || '').toLowerCase().includes(kw);
        if (!matchTitle && !matchAddr) return false;
      }

      return true;
    });
  }, [posts, selectedCategory, selectedStatus, searchKeyword]);

  // Actions
  const handleToggleHide = async (p: any) => {
    try {
      const nextStatus = p.status === 'HIDDEN' ? 'ACTIVE' : 'HIDDEN';
      if (p.category === 'ROOM') {
        await api.put(`/listings/${p.id}/status`, { status: nextStatus });
      } else if (p.category === 'SECOND_HAND') {
        await api.put(`/content/secondhand/${p.id}`, { ...p, status: nextStatus });
      } else if (p.category === 'SERVICE') {
        await api.put(`/content/services/${p.id}`, { ...p, status: nextStatus });
      }
      setActionMsg({ type: 'success', text: `Đã ${nextStatus === 'HIDDEN' ? 'ẩn' : 'mở hiển thị'} bài đăng.` });
      loadPosts();
    } catch (e: any) {
      setActionMsg({ type: 'error', text: 'Thao tác không thành công.' });
    }
  };

  const handleMarkSold = async (p: any) => {
    try {
      const targetStatus = p.category === 'ROOM' ? 'FULL' : 'SOLD';
      if (p.category === 'ROOM') {
        await api.put(`/listings/${p.id}/status`, { status: targetStatus });
      } else if (p.category === 'SECOND_HAND') {
        await api.put(`/content/secondhand/${p.id}`, { ...p, status: targetStatus });
      }
      setActionMsg({ type: 'success', text: 'Đã cập nhật trạng thái hoàn tất / hết phòng.' });
      loadPosts();
    } catch (e: any) {
      setActionMsg({ type: 'error', text: 'Không thể cập nhật trạng thái.' });
    }
  };

  const handleDelete = async (p: any) => {
    if (!window.confirm(`Bạn có chắc chắn muốn xóa bài đăng "${p.title}"?`)) return;
    try {
      if (p.category === 'ROOM') {
        await api.delete(`/listings/${p.id}`);
      } else if (p.category === 'SECOND_HAND') {
        await api.delete(`/content/secondhand/${p.id}`);
      } else if (p.category === 'SERVICE') {
        await api.delete(`/content/services/${p.id}`);
      }
      setActionMsg({ type: 'success', text: 'Đã xóa bài đăng.' });
      loadPosts();
    } catch (e: any) {
      setActionMsg({ type: 'error', text: 'Không thể xóa bài đăng.' });
    }
  };

  const getDetailLink = (p: any) => {
    if (p.category === 'ROOM') return `/property/${p.id}`;
    if (p.category === 'SECOND_HAND') return `/secondhand/${p.id}`;
    if (p.category === 'SERVICE') return `/services/${p.id}`;
    return '#';
  };

  const renderStatusBadge = (status: string) => {
    const s = (status || '').toUpperCase();
    if (s === 'ACTIVE' || s === 'APPROVED') {
      return <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">Đang hiển thị</span>;
    }
    if (s === 'PENDING_REVIEW' || s === 'PENDING') {
      return <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-amber-50 text-amber-700 border border-amber-200">Chờ duyệt</span>;
    }
    if (s === 'REJECTED') {
      return <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-red-50 text-red-700 border border-red-200">Cần chỉnh sửa</span>;
    }
    if (s === 'HIDDEN' || s === 'PAUSED') {
      return <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-gray-100 text-gray-600 border border-gray-200">Đã ẩn</span>;
    }
    if (s === 'SOLD' || s === 'FULL') {
      return <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-purple-50 text-purple-700 border border-purple-200">Đã bán / Hết phòng</span>;
    }
    return <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-gray-50 text-gray-500 border border-gray-200">{s}</span>;
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight">
            Quản lý Tin đăng của tôi
          </h1>
          <p className="text-xs sm:text-sm text-gray-500 mt-1">
            Tổng hợp toàn bộ phòng trọ, ở ghép, pass đồ cũ và dịch vụ bạn đã đăng tải trên UniHome
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => nav('/promotions')}
            className="px-4 py-2.5 rounded-xl text-xs font-bold bg-indigo-50 text-indigo-700 hover:bg-indigo-100 border border-indigo-200 transition-colors flex items-center gap-1.5"
          >
            <span>💎</span> Gói VIP & Đẩy tin
          </button>
          <button
            type="button"
            onClick={() => setComposerOpen(true)}
            className="px-5 py-2.5 rounded-xl text-xs font-bold bg-indigo-600 text-white shadow-xs hover:bg-indigo-700 active:scale-95 transition-all flex items-center gap-1.5"
          >
            <span>+</span> Đăng tin mới
          </button>
        </div>
      </div>

      {actionMsg && (
        <div className={`p-4 rounded-2xl text-xs font-medium border ${actionMsg.type === 'success' ? 'bg-emerald-50 text-emerald-700 border-emerald-200' : 'bg-red-50 text-red-700 border-red-200'}`}>
          {actionMsg.text}
        </div>
      )}

      {/* Category Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
        {CATEGORY_TABS.map((cat) => (
          <button
            key={cat.key}
            type="button"
            onClick={() => setSelectedCategory(cat.key)}
            className={`px-4 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all border ${
              selectedCategory === cat.key
                ? 'bg-indigo-600 text-white border-indigo-600 shadow-xs'
                : 'bg-white text-gray-600 border-gray-200 hover:bg-gray-50'
            }`}
          >
            {cat.label}
          </button>
        ))}
      </div>

      {/* Search and Status Filter */}
      <div className="bg-white p-4 rounded-2xl border border-gray-200 shadow-xs space-y-3">
        <div className="flex flex-col md:flex-row items-center gap-3">
          <div className="relative flex-1 w-full">
            <span className="absolute left-3.5 top-3 text-gray-400 text-xs">🔍</span>
            <input
              type="text"
              value={searchKeyword}
              onChange={(e) => setSearchKeyword(e.target.value)}
              placeholder="Tìm theo tiêu đề, địa chỉ bài đăng..."
              className="w-full pl-9 pr-4 py-2.5 text-xs border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none"
            />
          </div>
          <div className="flex items-center gap-2 overflow-x-auto w-full md:w-auto pb-1 scrollbar-none">
            {STATUS_TABS.map((st) => (
              <button
                key={st.key}
                type="button"
                onClick={() => setSelectedStatus(st.key)}
                className={`px-3 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-colors ${
                  selectedStatus === st.key
                    ? 'bg-gray-900 text-white'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                {st.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Posts List */}
      {loading ? (
        <div className="bg-white rounded-2xl border border-gray-200 p-12 text-center text-xs text-gray-500">
          Đang tải danh sách bài đăng...
        </div>
      ) : filteredPosts.length === 0 ? (
        <div className="bg-white rounded-2xl border border-gray-200 p-12 text-center space-y-3">
          <div className="text-4xl">📝</div>
          <h3 className="text-base font-bold text-gray-800">Không tìm thấy bài đăng nào</h3>
          <p className="text-xs text-gray-500 max-w-sm mx-auto">
            {searchKeyword || selectedCategory !== 'ALL' || selectedStatus !== 'ALL'
              ? 'Không có bài đăng nào khớp với tiêu chí tìm kiếm hoặc bộ lọc hiện tại.'
              : 'Bạn chưa đăng bài nào trên UniHome. Hãy bắt đầu đăng tin để tiếp cận sinh viên ngay!'}
          </p>
          <button
            type="button"
            onClick={() => setComposerOpen(true)}
            className="mt-3 px-5 py-2.5 rounded-xl text-xs font-bold bg-indigo-600 text-white hover:bg-indigo-700"
          >
            + Đăng tin ngay
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredPosts.map((p) => {
            const isVip = Boolean(p.vipTier && p.vipTier !== 'NONE');
            return (
              <div
                key={`${p.category}-${p.id}`}
                className={`bg-white rounded-2xl border transition-all p-5 shadow-xs flex flex-col md:flex-row gap-5 ${
                  isVip ? 'border-indigo-300 ring-1 ring-indigo-200/50' : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                {/* Thumbnail */}
                <div className="relative w-full md:w-48 h-36 shrink-0 rounded-xl overflow-hidden bg-gray-100 border border-gray-100">
                  <img
                    src={p.imageUrl || '/demo/room-1.jpg'}
                    alt={p.title}
                    onError={(e) => {
                      (e.currentTarget as HTMLImageElement).src = '/demo/room-1.jpg';
                    }}
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute top-2 left-2 flex flex-col gap-1">
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-black/70 text-white backdrop-blur-xs">
                      {p.category === 'ROOM' ? 'Phòng trọ' : p.category === 'SECOND_HAND' ? 'Đồ cũ' : 'Dịch vụ'}
                    </span>
                    {isVip && (
                      <span className="text-[10px] font-extrabold px-2 py-0.5 rounded-md bg-amber-500 text-white shadow-xs">
                        👑 {p.vipBadge || p.vipTier}
                      </span>
                    )}
                  </div>
                </div>

                {/* Content */}
                <div className="flex-1 flex flex-col justify-between min-w-0">
                  <div className="space-y-1.5">
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <div className="flex items-center gap-2">
                        {renderStatusBadge(p.status)}
                        {p.relationship && (
                          <span className="text-[11px] text-gray-500 bg-gray-50 px-2 py-0.5 rounded-md border border-gray-200">
                            {p.relationship === 'OWNER' ? 'Chính chủ' : p.relationship === 'ROOMMATE_SEARCH' ? 'Tìm ở ghép' : p.relationship === 'TENANT_TRANSFER' ? 'Sang nhượng' : 'Môi giới/QL'}
                          </span>
                        )}
                      </div>
                      <div className="text-xs text-gray-400">
                        Cập nhật: {p.updatedAt ? new Date(p.updatedAt).toLocaleDateString('vi-VN') : 'Mới'}
                      </div>
                    </div>

                    <h3 className="font-bold text-gray-900 text-base leading-snug line-clamp-1 hover:text-indigo-600 transition-colors">
                      <a href={getDetailLink(p)} target="_blank" rel="noreferrer">
                        {p.title}
                      </a>
                    </h3>

                    <div className="flex items-center gap-3 text-xs">
                      <span className="font-extrabold text-indigo-600 font-mono text-sm">
                        {money(p.price)}
                      </span>
                      {p.address && (
                        <span className="text-gray-500 line-clamp-1 flex items-center gap-1">
                          <span>📍</span> {p.address}
                        </span>
                      )}
                    </div>

                    {/* Stats */}
                    <div className="flex items-center gap-4 text-xs text-gray-500 pt-1">
                      <span title="Lượt xem">👁️ {p.viewCount || 0} xem</span>
                      <span title="Lượt yêu thích">❤️ {p.favoriteCount || 0} thích</span>
                      <span title="Số cuộc trò chuyện">💬 {p.chatCount || 0} chat</span>
                    </div>
                  </div>

                  {/* Action buttons row */}
                  <div className="pt-4 mt-3 border-t border-gray-100 flex flex-wrap items-center justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <a
                        href={getDetailLink(p)}
                        target="_blank"
                        rel="noreferrer"
                        className="px-3 py-1.5 rounded-lg text-xs font-semibold text-gray-700 bg-gray-100 hover:bg-gray-200 transition-colors"
                      >
                        Xem tin
                      </a>

                      <button
                        type="button"
                        onClick={() => nav(`/promotions?postId=${p.id}&category=${p.category}`)}
                        className="px-3 py-1.5 rounded-lg text-xs font-bold text-indigo-700 bg-indigo-50 hover:bg-indigo-100 border border-indigo-200 transition-colors flex items-center gap-1"
                      >
                        <span>🚀</span> Đẩy tin / VIP
                      </button>

                      {p.status !== 'SOLD' && p.status !== 'FULL' && (
                        <button
                          type="button"
                          onClick={() => handleMarkSold(p)}
                          className="px-3 py-1.5 rounded-lg text-xs font-semibold text-purple-700 bg-purple-50 hover:bg-purple-100 transition-colors"
                        >
                          {p.category === 'ROOM' ? 'Hết phòng' : 'Đã bán'}
                        </button>
                      )}

                      <button
                        type="button"
                        onClick={() => handleToggleHide(p)}
                        className="px-3 py-1.5 rounded-lg text-xs font-semibold text-gray-600 hover:bg-gray-100 transition-colors"
                      >
                        {p.status === 'HIDDEN' ? 'Mở lại' : 'Ẩn tin'}
                      </button>
                    </div>

                    <button
                      type="button"
                      onClick={() => handleDelete(p)}
                      className="px-3 py-1.5 rounded-lg text-xs font-semibold text-red-600 hover:bg-red-50 transition-colors"
                    >
                      Xóa
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Post Composer Modal */}
      <PostComposerModal isOpen={composerOpen} onClose={() => setComposerOpen(false)} />
    </div>
  );
}
