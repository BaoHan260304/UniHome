import { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { api, getUser } from '../lib/api';

export default function QaPage() {
  const user = getUser();
  const nav = useNavigate();
  const location = useLocation();
  const [qs, setQs] = useState<any[]>([]);
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [open, setOpen] = useState<number | null>(null);
  const [answers, setAnswers] = useState<Record<number, any[]>>({});
  const [answer, setAnswer] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const load = async () => {
    setLoading(true); setError('');
    try { const r = await api.get('/content/questions'); setQs(r.data || []); }
    catch (e: any) { setError(e.response?.data?.message || 'Không tải được hỏi đáp.'); }
    finally { setLoading(false); }
  };

  useEffect(() => { void load(); }, []);

  const requireLogin = () => {
    if (user) return true;
    nav('/login', { state: { from: location.pathname } });
    return false;
  };

  const ask = () => {
    if (!requireLogin()) return;
    if (!title.trim() || !content.trim()) return alert('Vui lòng nhập tiêu đề và nội dung.');
    api.post('/content/questions', { title, content, category: 'Thuê trọ' }).then(() => { setTitle(''); setContent(''); void load(); });
  };

  const show = async (id: number) => {
    setOpen(open === id ? null : id);
    if (!answers[id]) {
      try { setAnswers({ ...answers, [id]: (await api.get(`/content/questions/${id}/answers`)).data || [] }); }
      catch { setAnswers({ ...answers, [id]: [] }); }
    }
  };

  const reply = (id: number) => {
    if (!requireLogin()) return;
    if (!answer.trim()) return;
    api.post(`/content/questions/${id}/answers`, { content: answer }).then(async () => {
      setAnswer('');
      setAnswers({ ...answers, [id]: (await api.get(`/content/questions/${id}/answers`)).data || [] });
    });
  };

  return <div className="space-y-8">
    <div><h1 className="text-4xl font-extrabold">Hỏi đáp cộng đồng</h1><p className="mt-2 text-lg text-gray-600">Sinh viên, chủ trọ và nhà cung cấp có thể cùng trả lời. Nội dung vi phạm có thể bị báo cáo và ẩn bởi Admin.</p></div>
    <div className="bg-white border rounded-2xl p-6"><h2 className="font-bold mb-4">Đặt câu hỏi</h2><input className="w-full border rounded-xl px-4 py-3 mb-3" placeholder="Tiêu đề câu hỏi" value={title} onChange={e => setTitle(e.target.value)} /><textarea className="w-full border rounded-xl px-4 py-3" rows={3} placeholder="Nội dung..." value={content} onChange={e => setContent(e.target.value)} /><button onClick={ask} className="mt-3 bg-indigo-600 text-white px-6 py-3 rounded-xl font-medium">Đăng câu hỏi</button>{!user && <span className="ml-3 text-xs text-gray-400">Đăng nhập khi bạn muốn đăng hoặc trả lời.</span>}</div>
    {loading && <div className="bg-white border rounded-2xl p-12 text-center text-gray-500">Đang tải câu hỏi...</div>}
    {!loading && error && <div className="bg-red-50 border border-red-200 rounded-2xl p-8 text-center"><b className="text-red-700">Không tải được dữ liệu</b><p className="mt-2 text-sm text-red-600">{error}</p><button onClick={() => void load()} className="mt-4 bg-red-600 text-white px-5 py-2 rounded-xl">Thử lại</button></div>}
    {!loading && !error && !qs.length && <div className="bg-white border rounded-2xl p-12 text-center"><div className="text-4xl">💬</div><h2 className="text-xl font-bold mt-3">Chưa có câu hỏi nào</h2><p className="text-gray-500 mt-2">Hãy là người đầu tiên đặt câu hỏi cho cộng đồng.</p></div>}
    <div className="space-y-4">{qs.map(q => <div key={q.id} className="bg-white border rounded-2xl p-6"><button onClick={() => void show(q.id)} className="text-left w-full"><div className="text-xs font-bold text-indigo-600 mb-1">{q.category || 'Cộng đồng'}</div><h3 className="text-xl font-bold">{q.title}</h3><p className="text-gray-600 mt-2">{q.content}</p><div className="text-xs text-gray-400 mt-3">Bấm để xem câu trả lời</div></button>{open === q.id && <div className="mt-5 border-t pt-5 space-y-3">{(answers[q.id] || []).map(a => <div key={a.id} className="bg-gray-50 rounded-xl p-4 text-sm"><b>User #{a.userId}</b><div className="mt-1">{a.content}</div></div>)}{!(answers[q.id] || []).length && <div className="text-sm text-gray-400">Chưa có câu trả lời.</div>}<div className="flex gap-2"><input className="flex-1 border rounded-xl px-4 py-3" placeholder="Viết câu trả lời..." value={answer} onChange={e => setAnswer(e.target.value)} /><button onClick={() => reply(q.id)} className="bg-indigo-600 text-white px-5 rounded-xl">Trả lời</button></div></div>}</div>)}</div>
  </div>;
}
