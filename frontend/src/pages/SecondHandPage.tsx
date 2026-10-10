import { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { api, getUser, money, resolveMediaUrl } from '../lib/api';
import Pagination from '../components/Pagination';

const categories = ['Đồ gia dụng', 'Nội thất', 'Điện tử', 'Sách / học tập', 'Xe / phụ kiện', 'Khác'];

export default function SecondHandPage() {
  const nav = useNavigate();
  const location = useLocation();
  const [list, setList] = useState<any[]>([]);
  const [q, setQ] = useState('');
  const [cat, setCat] = useState('');
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [totalElements, setTotalElements] = useState(0);
  const pageSize = 12;

  const [f, setF] = useState<any>({
    title: '',
    category: 'Đồ gia dụng',
    price: '',
    conditionText: 'Đã qua sử dụng',
    province: '',
    district: '',
    description: '',
    imageUrl: ''
  });
  const user = getUser();

  const load = async (targetPage = page, targetCat = cat, targetSearch = q) => {
    setLoading(true);
    setError('');
    try {
      const params: any = { page: targetPage, size: pageSize };
      if (targetCat) params.category = targetCat;
      if (targetSearch.trim()) params.search = targetSearch.trim();

      const r = await api.get('/content/secondhand', { params });
      if (r.data && Array.isArray(r.data.content)) {
        setList(r.data.content);
        setTotalElements(r.data.totalElements ?? r.data.content.length);
        setTotalPages(r.data.totalPages ?? Math.ceil((r.data.totalElements || r.data.content.length) / pageSize));
        setPage(r.data.page ?? targetPage);
      } else if (Array.isArray(r.data)) {
        setList(r.data);
        setTotalElements(r.data.length);
        setTotalPages(Math.ceil(r.data.length / pageSize));
        setPage(targetPage);
      } else {
        setList([]);
        setTotalElements(0);
        setTotalPages(1);
      }
    } catch (e: any) {
      setError(e.response?.data?.message || 'Không tải được chợ đồ cũ.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void load(page, cat, q);
  }, [page]);

  const handleSearchSubmit = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setPage(0);
    void load(0, cat, q);
  };

  const handleCategoryChange = (newCat: string) => {
    setCat(newCat);
    setPage(0);
    void load(0, newCat, q);
  };

  const create = () => {
    if (!user) return nav('/login', { state: { from: location.pathname } });
    if (!f.title.trim()) return alert('Vui lòng nhập tiêu đề.');
    api.post('/content/secondhand', { ...f, price: Number(f.price || 0) })
      .then(() => {
        alert('Đã đăng đồ cũ thành công và gửi duyệt');
        setOpen(false);
        void load(0, cat, q);
      })
      .catch(e => alert(e.response?.data?.message || 'Không thể đăng tin'));
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-4">
        <div>
          <h1 className="text-4xl font-extrabold text-gray-900 tracking-tight">Chợ đồ cũ sinh viên</h1>
          <p className="mt-2 text-lg text-gray-600">Tìm nhanh theo từ khóa, danh mục, giá và khu vực. Tin tự hết hạn sau khoảng 30 ngày.</p>
        </div>
        <button
          onClick={() => user ? setOpen(!open) : nav('/login', { state: { from: location.pathname } })}
          className="bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-3 rounded-xl font-bold shadow-sm transition-colors"
        >
          + Đăng bán
        </button>
      </div>

      {/* Filter / Search Bar */}
      <div className="bg-white border border-gray-100 rounded-2xl p-4 flex flex-col md:flex-row gap-3 shadow-xs">
        <form onSubmit={handleSearchSubmit} className="flex-1 flex gap-2">
          <input
            value={q}
            onChange={e => setQ(e.target.value)}
            className="flex-1 border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
            placeholder="Tìm bàn, ghế, quạt, nồi, sách..."
          />
          <button type="submit" className="bg-indigo-600 text-white px-6 py-3 rounded-xl text-sm font-semibold hover:bg-indigo-700 transition-colors">
            Tìm
          </button>
        </form>
        <select
          value={cat}
          onChange={e => handleCategoryChange(e.target.value)}
          className="border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white"
        >
          <option value="">Tất cả danh mục</option>
          {categories.map(x => (
            <option key={x} value={x}>{x}</option>
          ))}
        </select>
      </div>

      {open && (
        <div className="bg-white border rounded-2xl p-6 grid grid-cols-1 md:grid-cols-2 gap-4 shadow-sm">
          {[['title', 'Tiêu đề'], ['price', 'Giá'], ['province', 'Tỉnh/TP'], ['district', 'Khu vực'], ['conditionText', 'Tình trạng'], ['imageUrl', 'URL ảnh']].map(([k, l]) => (
            <label key={k} className="text-sm font-medium text-gray-700">
              {l}
              <input className="mt-1 w-full border border-gray-200 rounded-lg p-2.5 text-sm" value={f[k]} onChange={e => setF({ ...f, [k]: e.target.value })} />
            </label>
          ))}
          <label className="text-sm font-medium text-gray-700">
            Danh mục
            <select className="mt-1 w-full border border-gray-200 rounded-lg p-2.5 text-sm" value={f.category} onChange={e => setF({ ...f, category: e.target.value })}>
              {categories.map(x => <option key={x}>{x}</option>)}
            </select>
          </label>
          <label className="md:col-span-2 text-sm font-medium text-gray-700">
            Mô tả
            <textarea className="mt-1 w-full border border-gray-200 rounded-lg p-2.5 text-sm" rows={4} value={f.description} onChange={e => setF({ ...f, description: e.target.value })} />
          </label>
          <button onClick={create} className="md:col-span-2 bg-indigo-600 hover:bg-indigo-700 text-white py-3 rounded-xl font-medium transition-colors">
            Đăng bán
          </button>
        </div>
      )}

      {loading && (
        <div className="bg-white border border-gray-100 rounded-2xl p-16 text-center text-gray-500">
          <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-indigo-600 mx-auto mb-3" />
          Đang tải sản phẩm...
        </div>
      )}

      {!loading && error && (
        <div className="bg-red-50 border border-red-200 rounded-2xl p-8 text-center">
          <b className="text-red-700">Không tải được dữ liệu</b>
          <p className="mt-2 text-sm text-red-600">{error}</p>
          <button onClick={() => void load(page, cat, q)} className="mt-4 bg-red-600 text-white px-5 py-2 rounded-xl text-sm font-semibold">
            Thử lại
          </button>
        </div>
      )}

      {!loading && !error && !list.length && (
        <div className="bg-white border border-gray-100 rounded-2xl p-16 text-center shadow-xs">
          <div className="text-4xl">📦</div>
          <h2 className="text-xl font-bold text-gray-800 mt-3">Chưa có sản phẩm phù hợp</h2>
          <p className="text-gray-500 mt-2">Hãy đổi từ khóa hoặc danh mục tìm kiếm.</p>
        </div>
      )}

      {!loading && !error && list.length > 0 && (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {list.map(x => (
              <div
                key={x.id}
                onClick={() => nav(`/secondhand/${x.id}`)}
                className="cursor-pointer bg-white rounded-2xl border border-gray-100 overflow-hidden shadow-xs hover:shadow-md transition-all flex flex-col group"
              >
                <div className="w-full h-48 bg-gray-100 relative overflow-hidden">
                  <img
                    src={x.imageUrl ? resolveMediaUrl(x.imageUrl) : '/demo/secondhand-desk.png'}
                    onError={e => { (e.currentTarget as HTMLImageElement).src = '/demo/secondhand-desk.png'; }}
                    alt={x.title}
                    className="w-full h-full object-cover group-hover:scale-102 transition-transform duration-300"
                  />
                  <span className="absolute top-2.5 right-2.5 px-2.5 py-0.5 text-[10px] font-bold rounded-full bg-black/60 backdrop-blur-xs text-white">
                    {x.category}
                  </span>
                </div>
                <div className="p-5 flex flex-col flex-1">
                  <h3 className="font-bold text-base text-gray-900 line-clamp-2 group-hover:text-indigo-600 transition-colors">
                    {x.title}
                  </h3>
                  <div className="text-indigo-600 font-extrabold text-lg mt-2">{money(x.price)}</div>
                  <div className="text-xs text-gray-500 mt-1">{x.conditionText || 'Đã qua sử dụng'}</div>
                  <div className="text-xs text-gray-400 mt-1 line-clamp-1">📍 {[x.district, x.province].filter(Boolean).join(', ') || 'Toàn quốc'}</div>
                  <p className="text-xs text-gray-600 mt-3 line-clamp-2 leading-relaxed flex-1">{x.description}</p>
                  <div className="flex gap-2 mt-4 pt-3 border-t border-gray-100 items-center justify-between">
                    {user && (
                      <button
                        onClick={e => {
                          e.stopPropagation();
                          api.post('/chat/conversations', { otherUserId: x.sellerId, contextType: 'SECOND_HAND', contextId: x.id })
                            .then(res => nav(`/chat?conversationId=${res.data?.id || res.data?.conversationId || ''}`));
                        }}
                        className="bg-indigo-600 hover:bg-indigo-700 text-white px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-colors"
                      >
                        Chat người bán
                      </button>
                    )}
                    <span className="px-2.5 py-1 text-[11px] font-medium rounded-lg bg-gray-100 text-gray-600">
                      {x.status === 'ACTIVE' ? 'Đang bán' : x.status}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <Pagination
            currentPage={page}
            totalPages={totalPages}
            totalElements={totalElements}
            pageSize={pageSize}
            onPageChange={newPage => {
              setPage(newPage);
              window.scrollTo({ top: 200, behavior: 'smooth' });
            }}
            itemLabel="sản phẩm"
            className="mt-8 pt-4 border-t border-gray-100"
          />
        </>
      )}
    </div>
  );
}
