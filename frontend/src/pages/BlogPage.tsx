import { useEffect, useMemo, useState } from 'react';
import { api } from '../lib/api';
import { useNavigate } from 'react-router-dom';

export default function BlogPage() {
  const [list, setList] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [q, setQ] = useState('');
  const [category, setCategory] = useState('');
  const nav = useNavigate();

  const load = async () => {
    setLoading(true); setError('');
    try { const r = await api.get('/content/blogs'); setList(r.data || []); }
    catch (e: any) { setError(e.response?.data?.message || 'Không tải được bài viết.'); }
    finally { setLoading(false); }
  };
  useEffect(() => { void load(); }, []);

  const categories = Array.from(new Set(list.map(x => x.category).filter(Boolean)));
  const shown = useMemo(() => list.filter(x => (!category || x.category === category) && (!q || `${x.title} ${x.summary} ${x.tags}`.toLowerCase().includes(q.toLowerCase()))), [list, q, category]);

  return <div className="space-y-8">
    <div><h1 className="text-4xl font-extrabold">Cẩm nang UniHome</h1><p className="mt-2 text-lg text-gray-600">Bài viết dạng báo về PCCC, thuê trọ an toàn, nội quy, tài sản, chất kích thích, chuyển trọ và đời sống sinh viên.</p></div>
    <div className="bg-white border rounded-2xl p-4 flex flex-col md:flex-row gap-3"><input value={q} onChange={e => setQ(e.target.value)} className="flex-1 border rounded-xl px-4 py-3" placeholder="Tìm bài viết..." /><select value={category} onChange={e => setCategory(e.target.value)} className="border rounded-xl px-4 py-3"><option value="">Tất cả chủ đề</option>{categories.map(x => <option key={x}>{x}</option>)}</select></div>
    {loading && <div className="bg-white border rounded-2xl p-12 text-center text-gray-500">Đang tải cẩm nang...</div>}
    {!loading && error && <div className="bg-red-50 border border-red-200 rounded-2xl p-8 text-center"><b className="text-red-700">Không tải được dữ liệu</b><p className="mt-2 text-sm text-red-600">{error}</p><button onClick={() => void load()} className="mt-4 bg-red-600 text-white px-5 py-2 rounded-xl">Thử lại</button></div>}
    {!loading && !error && !shown.length && <div className="bg-white border rounded-2xl p-12 text-center"><div className="text-4xl">📰</div><h2 className="text-xl font-bold mt-3">Chưa có bài viết phù hợp</h2><p className="text-gray-500 mt-2">Hãy thử chủ đề hoặc từ khóa khác.</p></div>}
    {!loading && !error && shown.length > 0 && <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-7">{shown.map(b => <article key={b.id} onClick={() => nav(`/blog/${b.id}`)} className="cursor-pointer bg-white border rounded-2xl overflow-hidden shadow-sm hover:shadow-lg transition-all"><img src={b.coverImage || '/demo/blog-pccc.png'} onError={e => { (e.currentTarget as HTMLImageElement).src = '/demo/blog-pccc.png'; }} className="w-full h-48 object-cover" /><div className="p-6"><div className="text-xs font-bold text-indigo-600 uppercase">{b.category}</div><h2 className="text-xl font-bold mt-2 line-clamp-2">{b.title}</h2><p className="text-sm text-gray-600 mt-3 line-clamp-3">{b.summary}</p><div className="mt-4 text-xs text-gray-400">{b.readingMinutes || 5} phút đọc • {b.publishedAt ? new Date(b.publishedAt).toLocaleDateString('vi-VN') : ''}</div></div></article>)}</div>}
  </div>;
}
