import { useEffect, useMemo, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { api, getUser, money } from '../lib/api';

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
  const [f, setF] = useState<any>({ title: '', category: 'Đồ gia dụng', price: '', conditionText: 'Đã qua sử dụng', province: '', district: '', description: '', imageUrl: '' });
  const user = getUser();

  const load = async () => {
    setLoading(true); setError('');
    try { const r = await api.get('/content/secondhand'); setList(r.data || []); }
    catch (e: any) { setError(e.response?.data?.message || 'Không tải được chợ đồ cũ.'); }
    finally { setLoading(false); }
  };

  useEffect(() => { void load(); }, []);

  const shown = useMemo(() => list.filter(x => (!q || (`${x.title} ${x.description}`.toLowerCase().includes(q.toLowerCase()))) && (!cat || x.category === cat)), [list, q, cat]);
  const create = () => {
    if (!user) return nav('/login', { state: { from: location.pathname } });
    if (!f.title.trim()) return alert('Vui lòng nhập tiêu đề.');
    api.post('/content/secondhand', { ...f, price: Number(f.price || 0) })
      .then(() => { alert('Đã đăng đồ cũ'); setOpen(false); void load(); })
      .catch(e => alert(e.response?.data?.message || 'Không thể đăng tin'));
  };

  return <div className="space-y-8">
    <div className="flex justify-between items-end gap-4"><div><h1 className="text-4xl font-extrabold">Chợ đồ cũ sinh viên</h1><p className="mt-2 text-lg text-gray-600">Tìm nhanh theo từ khóa, danh mục, giá và khu vực. Tin tự hết hạn sau khoảng 30 ngày.</p></div><button onClick={() => user ? setOpen(!open) : nav('/login', { state: { from: location.pathname } })} className="bg-indigo-600 text-white px-6 py-3 rounded-xl font-bold">+ Đăng bán</button></div>
    <div className="bg-white border rounded-2xl p-4 flex flex-col md:flex-row gap-3"><input value={q} onChange={e => setQ(e.target.value)} className="flex-1 border rounded-xl px-4 py-3" placeholder="Tìm bàn, ghế, quạt, nồi, sách..." /><select value={cat} onChange={e => setCat(e.target.value)} className="border rounded-xl px-4 py-3"><option value="">Tất cả danh mục</option>{categories.map(x => <option key={x}>{x}</option>)}</select></div>

    {open && <div className="bg-white border rounded-2xl p-6 grid grid-cols-1 md:grid-cols-2 gap-4">{[['title', 'Tiêu đề'], ['price', 'Giá'], ['province', 'Tỉnh/TP'], ['district', 'Khu vực'], ['conditionText', 'Tình trạng'], ['imageUrl', 'URL ảnh']].map(([k, l]) => <label key={k} className="text-sm font-medium">{l}<input className="mt-1 w-full border rounded-lg p-2.5" value={f[k]} onChange={e => setF({ ...f, [k]: e.target.value })} /></label>)}<label className="text-sm font-medium">Danh mục<select className="mt-1 w-full border rounded-lg p-2.5" value={f.category} onChange={e => setF({ ...f, category: e.target.value })}>{categories.map(x => <option key={x}>{x}</option>)}</select></label><label className="md:col-span-2 text-sm font-medium">Mô tả<textarea className="mt-1 w-full border rounded-lg p-2.5" rows={4} value={f.description} onChange={e => setF({ ...f, description: e.target.value })} /></label><button onClick={create} className="md:col-span-2 bg-indigo-600 text-white py-3 rounded-xl font-medium">Đăng bán</button></div>}

    {loading && <div className="bg-white border rounded-2xl p-12 text-center text-gray-500">Đang tải sản phẩm...</div>}
    {!loading && error && <div className="bg-red-50 border border-red-200 rounded-2xl p-8 text-center"><b className="text-red-700">Không tải được dữ liệu</b><p className="mt-2 text-sm text-red-600">{error}</p><button onClick={() => void load()} className="mt-4 bg-red-600 text-white px-5 py-2 rounded-xl">Thử lại</button></div>}
    {!loading && !error && !shown.length && <div className="bg-white border rounded-2xl p-12 text-center"><div className="text-4xl">📦</div><h2 className="text-xl font-bold mt-3">Chưa có sản phẩm phù hợp</h2><p className="text-gray-500 mt-2">Hãy đổi từ khóa hoặc danh mục tìm kiếm.</p></div>}

    {!loading && !error && shown.length > 0 && <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">{shown.map(x => <div key={x.id} onClick={() => nav(`/secondhand/${x.id}`)} className="cursor-pointer bg-white rounded-2xl border overflow-hidden shadow-sm hover:shadow-lg transition-shadow"><img src={x.imageUrl || '/demo/secondhand-desk.png'} onError={e => { (e.currentTarget as HTMLImageElement).src = '/demo/secondhand-desk.png'; }} className="w-full h-48 object-cover" /><div className="p-5"><h3 className="font-bold text-lg line-clamp-2">{x.title}</h3><div className="text-indigo-600 font-bold mt-2">{money(x.price)}</div><div className="text-sm text-gray-500 mt-1">{x.conditionText}</div><div className="text-xs text-gray-400 mt-1">{[x.district, x.province].filter(Boolean).join(', ')}</div><p className="text-sm text-gray-600 mt-3 line-clamp-3">{x.description}</p><div className="flex gap-2 mt-4">{user && <button onClick={e => { e.stopPropagation(); api.post('/chat/conversations', { otherUserId: x.sellerId, contextType: 'SECOND_HAND', contextId: x.id }).then(res => nav(`/chat?conversationId=${res.data?.id || res.data?.conversationId || ''}`)); }} className="bg-indigo-600 text-white px-4 py-2 rounded-lg text-sm">Chat người bán</button>}<span className="px-3 py-2 text-xs rounded-lg bg-gray-100">{x.status}</span></div></div></div>)}</div>}
  </div>;
}
