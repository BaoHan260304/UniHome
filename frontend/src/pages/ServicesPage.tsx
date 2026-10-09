import { useEffect, useMemo, useState } from 'react';
import { api, getUser, money } from '../lib/api';

const cats = ['Tất cả', 'Moving', 'Cleaning', 'Taxi / Transport', 'Vehicle Rental', 'Repair', 'Internet', 'Furniture', 'Storage'];

export default function ServicesPage() {
  const [list, setList] = useState<any[]>([]);
  const [cat, setCat] = useState('Tất cả');
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [f, setF] = useState<any>({ category: 'Moving', title: '', description: '', priceFrom: '', province: '', district: '', phone: '', zaloUrl: '', imageUrl: '' });
  const user = getUser();

  const load = async () => {
    setLoading(true); setError('');
    try {
      const r = await api.get('/content/services');
      setList(r.data || []);
    } catch (e: any) {
      setError(e.response?.data?.message || 'Không tải được danh sách dịch vụ.');
    } finally { setLoading(false); }
  };

  useEffect(() => { void load(); }, []);

  const shown = useMemo(() => cat === 'Tất cả' ? list : list.filter(x => x.category === cat), [list, cat]);
  const create = () => api.post('/content/services', { ...f, priceFrom: Number(f.priceFrom || 0) })
    .then(() => { alert('Đã gửi dịch vụ để kiểm duyệt'); setOpen(false); void load(); })
    .catch(e => alert(e.response?.data?.message || 'Không thể đăng dịch vụ'));

  return <div className="space-y-8">
    <div className="flex justify-between items-end gap-4">
      <div><h1 className="text-4xl font-extrabold">Dịch vụ tiện ích</h1><p className="mt-2 text-lg text-gray-600">Chuyển trọ, vệ sinh, taxi, sửa chữa, Internet, nội thất, kho lưu trữ.</p></div>
      {['SERVICE_PROVIDER', 'ADMIN', 'SUPER_ADMIN'].includes(user?.role) && <button onClick={() => setOpen(!open)} className="bg-indigo-600 text-white px-6 py-3 rounded-xl font-bold">+ Đăng dịch vụ</button>}
    </div>

    <div className="flex flex-wrap gap-2">{cats.map(x => <button key={x} onClick={() => setCat(x)} className={`px-4 py-2 rounded-full text-sm font-medium ${cat === x ? 'bg-indigo-600 text-white' : 'bg-white border text-gray-600'}`}>{x}</button>)}</div>

    {open && <div className="bg-white border rounded-2xl p-6 grid grid-cols-1 md:grid-cols-2 gap-4">
      {[['title', 'Tên dịch vụ'], ['priceFrom', 'Giá tham khảo từ'], ['province', 'Tỉnh/TP'], ['district', 'Khu vực'], ['phone', 'SĐT'], ['zaloUrl', 'Zalo/link'], ['imageUrl', 'URL ảnh']].map(([k, l]) => <label key={k} className="text-sm font-medium">{l}<input className="mt-1 w-full border rounded-lg p-2.5" value={f[k]} onChange={e => setF({ ...f, [k]: e.target.value })} /></label>)}
      <label className="text-sm font-medium">Danh mục<select className="mt-1 w-full border rounded-lg p-2.5" value={f.category} onChange={e => setF({ ...f, category: e.target.value })}>{cats.slice(1).map(x => <option key={x}>{x}</option>)}</select></label>
      <label className="md:col-span-2 text-sm font-medium">Mô tả<textarea className="mt-1 w-full border rounded-lg p-2.5" rows={4} value={f.description} onChange={e => setF({ ...f, description: e.target.value })} /></label>
      <button onClick={create} className="md:col-span-2 bg-indigo-600 text-white py-3 rounded-xl font-medium">Gửi kiểm duyệt</button>
    </div>}

    {loading && <div className="bg-white border rounded-2xl p-12 text-center text-gray-500">Đang tải dịch vụ...</div>}
    {!loading && error && <div className="bg-red-50 border border-red-200 rounded-2xl p-8 text-center"><b className="text-red-700">Không tải được dữ liệu</b><p className="mt-2 text-sm text-red-600">{error}</p><button onClick={() => void load()} className="mt-4 bg-red-600 text-white px-5 py-2 rounded-xl">Thử lại</button></div>}
    {!loading && !error && !shown.length && <div className="bg-white border rounded-2xl p-12 text-center"><div className="text-4xl">🧰</div><h2 className="text-xl font-bold mt-3">Chưa có dịch vụ trong danh mục này</h2><p className="text-gray-500 mt-2">Hãy chọn danh mục khác hoặc quay lại sau.</p></div>}

    {!loading && !error && shown.length > 0 && <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">{shown.map(s => <div key={s.id} className="bg-white rounded-2xl border shadow-sm overflow-hidden hover:shadow-lg transition-shadow">
      <img src={s.imageUrl || '/demo/service-moving.png'} onError={(e) => { (e.currentTarget as HTMLImageElement).src = '/demo/service-moving.png'; }} className="w-full h-48 object-cover" />
      <div className="p-5"><div className="text-xs font-bold text-indigo-600">{s.category} {s.featured ? '• Featured' : ''}</div><h3 className="text-xl font-bold mt-2">{s.title}</h3><p className="text-sm text-gray-600 mt-2 line-clamp-3">{s.description}</p><div className="text-indigo-600 font-bold mt-4">Từ {money(s.priceFrom)}</div><div className="text-sm text-gray-500 mt-2">{[s.district, s.province].filter(Boolean).join(', ')}</div><div className="flex gap-3 mt-4"><a href={`tel:${s.phone}`} className="bg-indigo-600 text-white px-4 py-2 rounded-lg text-sm">Gọi</a>{s.zaloUrl && <a target="_blank" rel="noreferrer" href={s.zaloUrl} className="bg-blue-50 text-blue-700 px-4 py-2 rounded-lg text-sm">Liên hệ</a>}</div></div>
    </div>)}</div>}
  </div>;
}
