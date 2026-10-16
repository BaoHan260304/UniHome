import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { api, getUser, money, resolveMediaUrl } from '../lib/api';
import Pagination from '../components/Pagination';

const cats = ['Tất cả', 'Moving', 'Cleaning', 'Taxi / Transport', 'Vehicle Rental', 'Repair', 'Internet', 'Furniture', 'Storage'];

export default function ServicesPage() {
  const nav = useNavigate();
  const [list, setList] = useState<any[]>([]);
  const [cat, setCat] = useState('Tất cả');
  const [search, setSearch] = useState('');
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [totalElements, setTotalElements] = useState(0);
  const pageSize = 9;

  const [f, setF] = useState<any>({ category: 'Moving', title: '', description: '', priceFrom: '', province: '', district: '', phone: '', zaloUrl: '', imageUrl: '' });
  const user = getUser();

  const load = async (targetPage = page, targetCat = cat, targetSearch = search) => {
    setLoading(true);
    setError('');
    try {
      const params: any = { page: targetPage, size: pageSize };
      if (targetCat !== 'Tất cả') params.category = targetCat;
      if (targetSearch.trim()) params.search = targetSearch.trim();

      const r = await api.get('/content/services', { params });
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
      setError(e.response?.data?.message || 'Không tải được danh sách dịch vụ.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void load(page, cat, search);
  }, [page]);

  const handleCategoryChange = (newCat: string) => {
    setCat(newCat);
    setPage(0);
    void load(0, newCat, search);
  };

  const handleSearchSubmit = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setPage(0);
    void load(0, cat, search);
  };

  const create = () => api.post('/content/services', { ...f, priceFrom: Number(f.priceFrom || 0) })
    .then(() => { alert('Đã gửi dịch vụ để kiểm duyệt'); setOpen(false); void load(0, cat, search); })
    .catch(e => alert(e.response?.data?.message || 'Không thể đăng dịch vụ'));

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-4">
        <div>
          <h1 className="text-4xl font-extrabold text-gray-900 tracking-tight">Dịch vụ tiện ích</h1>
          <p className="mt-2 text-lg text-gray-600">Chuyển trọ, vệ sinh, taxi, sửa chữa, Internet, nội thất, kho lưu trữ.</p>
        </div>
        <button
          onClick={() => user ? setOpen(!open) : alert('Vui lòng đăng nhập để đăng dịch vụ.')}
          className="bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-3 rounded-xl font-bold shadow-sm transition-colors"
        >
          + Đăng dịch vụ
        </button>
      </div>

      {/* Search Bar & Categories */}
      <div className="space-y-4">
        <form onSubmit={handleSearchSubmit} className="flex gap-3 max-w-lg">
          <input
            type="text"
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Tìm tên dịch vụ, mô tả..."
            className="flex-1 rounded-xl border-gray-200 bg-white px-4 py-2.5 border text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
          <button type="submit" className="bg-indigo-600 text-white px-5 py-2.5 rounded-xl text-sm font-semibold hover:bg-indigo-700 transition-colors">
            Tìm
          </button>
        </form>

        <div className="flex flex-wrap gap-2">
          {cats.map(x => (
            <button
              key={x}
              onClick={() => handleCategoryChange(x)}
              className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                cat === x ? 'bg-indigo-600 text-white shadow-xs' : 'bg-white border border-gray-200 text-gray-600 hover:bg-gray-50'
              }`}
            >
              {x}
            </button>
          ))}
        </div>
      </div>

      {open && (
        <div className="bg-white border rounded-2xl p-6 grid grid-cols-1 md:grid-cols-2 gap-4 shadow-sm">
          {[['title', 'Tên dịch vụ'], ['priceFrom', 'Giá tham khảo từ'], ['province', 'Tỉnh/TP'], ['district', 'Khu vực'], ['phone', 'SĐT'], ['zaloUrl', 'Zalo/link'], ['imageUrl', 'URL ảnh']].map(([k, l]) => (
            <label key={k} className="text-sm font-medium text-gray-700">
              {l}
              <input className="mt-1 w-full border border-gray-200 rounded-lg p-2.5 text-sm" value={f[k]} onChange={e => setF({ ...f, [k]: e.target.value })} />
            </label>
          ))}
          <label className="text-sm font-medium text-gray-700">
            Danh mục
            <select className="mt-1 w-full border border-gray-200 rounded-lg p-2.5 text-sm" value={f.category} onChange={e => setF({ ...f, category: e.target.value })}>
              {cats.slice(1).map(x => <option key={x}>{x}</option>)}
            </select>
          </label>
          <label className="md:col-span-2 text-sm font-medium text-gray-700">
            Mô tả
            <textarea className="mt-1 w-full border border-gray-200 rounded-lg p-2.5 text-sm" rows={4} value={f.description} onChange={e => setF({ ...f, description: e.target.value })} />
          </label>
          <button onClick={create} className="md:col-span-2 bg-indigo-600 hover:bg-indigo-700 text-white py-3 rounded-xl font-medium transition-colors">
            Gửi kiểm duyệt
          </button>
        </div>
      )}

      {loading && (
        <div className="bg-white border border-gray-100 rounded-2xl p-16 text-center text-gray-500">
          <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-indigo-600 mx-auto mb-3" />
          Đang tải dịch vụ...
        </div>
      )}

      {!loading && error && (
        <div className="bg-red-50 border border-red-200 rounded-2xl p-8 text-center">
          <b className="text-red-700">Không tải được dữ liệu</b>
          <p className="mt-2 text-sm text-red-600">{error}</p>
          <button onClick={() => void load(page, cat, search)} className="mt-4 bg-red-600 text-white px-5 py-2 rounded-xl text-sm font-semibold">
            Thử lại
          </button>
        </div>
      )}

      {!loading && !error && !list.length && (
        <div className="bg-white border border-gray-100 rounded-2xl p-16 text-center shadow-xs">
          <div className="text-4xl">🧰</div>
          <h2 className="text-xl font-bold text-gray-800 mt-3">Chưa có dịch vụ trong danh mục này</h2>
          <p className="text-gray-500 mt-2">Hãy chọn danh mục khác hoặc quay lại sau.</p>
        </div>
      )}

      {!loading && !error && list.length > 0 && (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {list.map(s => (
              <div
                key={s.id}
                onClick={() => nav(`/services/${s.id}`)}
                className="bg-white rounded-2xl border border-gray-100 shadow-xs overflow-hidden hover:shadow-md transition-all cursor-pointer flex flex-col group"
              >
                <div className="w-full h-48 bg-gray-100 relative overflow-hidden">
                  <img
                    src={s.imageUrl ? resolveMediaUrl(s.imageUrl) : '/demo/service-moving.png'}
                    onError={(e) => { (e.currentTarget as HTMLImageElement).src = '/demo/service-moving.png'; }}
                    alt={s.title}
                    className="w-full h-full object-cover group-hover:scale-102 transition-transform duration-300"
                  />
                  {s.featured && (
                    <span className="absolute top-3 left-3 bg-indigo-600 text-white text-[10px] font-extrabold uppercase px-2.5 py-0.5 rounded-full shadow-sm">
                      Nổi bật
                    </span>
                  )}
                </div>
                <div className="p-5 flex flex-col flex-1">
                  <div className="text-xs font-bold text-indigo-600 uppercase tracking-wider">{s.category}</div>
                  <h3 className="text-lg font-bold text-gray-900 mt-1 line-clamp-1 group-hover:text-indigo-600 transition-colors">
                    {s.title}
                  </h3>
                  <p className="text-sm text-gray-600 mt-2 line-clamp-2 leading-relaxed flex-1">{s.description}</p>
                  <div className="text-indigo-600 font-extrabold text-lg mt-4">Từ {money(s.priceFrom)}</div>
                  <div className="text-xs text-gray-500 mt-1">📍 {[s.district, s.province].filter(Boolean).join(', ') || 'Toàn quốc'}</div>

                  <div className="flex gap-2 mt-4 pt-3 border-t border-gray-100">
                    <button
                      onClick={(e) => { e.stopPropagation(); nav(`/services/${s.id}`); }}
                      className="flex-1 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 font-semibold py-2 rounded-xl text-xs transition-colors text-center"
                    >
                      Xem chi tiết
                    </button>
                    {s.phone && (
                      <a
                        href={`tel:${s.phone}`}
                        onClick={e => e.stopPropagation()}
                        className="bg-indigo-600 hover:bg-indigo-700 text-white px-3.5 py-2 rounded-xl text-xs font-bold transition-colors"
                      >
                        Gọi
                      </a>
                    )}
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
            itemLabel="dịch vụ"
            className="mt-8 pt-4 border-t border-gray-100"
          />
        </>
      )}
    </div>
  );
}
