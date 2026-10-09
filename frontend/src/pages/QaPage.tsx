import { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { api, getUser, resolveMediaUrl } from '../lib/api';

export default function QaPage() {
  const user = getUser();
  const nav = useNavigate();
  const location = useLocation();
  const [qs, setQs] = useState<any[]>([]);
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [category, setCategory] = useState('Thuê trọ');
  const [open, setOpen] = useState<number | null>(null);
  const [answers, setAnswers] = useState<Record<number, any[]>>({});
  const [answer, setAnswer] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const load = async () => {
    setLoading(true);
    setError('');
    try {
      const r = await api.get('/content/questions');
      setQs(r.data || []);
    } catch (e: any) {
      setError(e.response?.data?.message || 'Không tải được hỏi đáp.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void load();
  }, []);

  const requireLogin = () => {
    if (user) return true;
    nav('/login', { state: { from: location.pathname } });
    return false;
  };

  const ask = () => {
    if (!requireLogin()) return;
    if (!title.trim() || !content.trim()) return alert('Vui lòng nhập tiêu đề và nội dung.');
    api.post('/content/questions', { title, content, category }).then(() => {
      setTitle('');
      setContent('');
      void load();
    });
  };

  const show = async (id: number) => {
    setOpen(open === id ? null : id);
    if (!answers[id]) {
      try {
        const r = await api.get(`/content/questions/${id}/answers`);
        setAnswers(prev => ({ ...prev, [id]: r.data || [] }));
      } catch {
        setAnswers(prev => ({ ...prev, [id]: [] }));
      }
    }
  };

  const reply = (id: number) => {
    if (!requireLogin()) return;
    if (!answer.trim()) return;
    api.post(`/content/questions/${id}/answers`, { content: answer }).then(async () => {
      setAnswer('');
      const r = await api.get(`/content/questions/${id}/answers`);
      setAnswers(prev => ({ ...prev, [id]: r.data || [] }));
    });
  };

  const renderRoleBadge = (role?: string, isOfficial?: boolean) => {
    if (isOfficial || role === 'ADMIN' || role === 'SUPER_ADMIN') {
      return <span className="px-2 py-0.5 bg-red-100 text-red-700 text-[10px] font-extrabold rounded-md border border-red-200">★ BQT UniHome</span>;
    }
    if (role === 'LANDLORD') {
      return <span className="px-2 py-0.5 bg-amber-100 text-amber-800 text-[10px] font-bold rounded-md border border-amber-200">Chủ trọ</span>;
    }
    return <span className="px-2 py-0.5 bg-blue-50 text-blue-700 text-[10px] font-medium rounded-md border border-blue-200">Sinh viên</span>;
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8 pb-12">
      <div>
        <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight">Hỏi đáp Cộng đồng Sinh viên</h1>
        <p className="mt-1 text-sm text-gray-600">
          Giao lưu, hỏi kinh nghiệm tìm phòng trọ, pháp lý hợp đồng, giá điện nước cùng cộng đồng và Ban quản trị UniHome.
        </p>
      </div>

      {/* Ask Question Card */}
      <div className="bg-white border rounded-3xl p-6 shadow-xs space-y-3">
        <h2 className="font-extrabold text-base text-gray-900">Đặt câu hỏi cho cộng đồng</h2>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <input
            className="sm:col-span-2 border border-gray-200 rounded-xl px-4 py-2.5 text-xs sm:text-sm focus:outline-none focus:border-indigo-600"
            placeholder="Tiêu đề câu hỏi (VD: Kinh nghiệm thuê trọ gần ĐH FPT Hòa Lạc?)"
            value={title}
            onChange={e => setTitle(e.target.value)}
          />
          <select
            value={category}
            onChange={e => setCategory(e.target.value)}
            className="border border-gray-200 rounded-xl px-3 py-2.5 text-xs sm:text-sm focus:outline-none focus:border-indigo-600 bg-white"
          >
            <option value="Thuê trọ">Kinh nghiệm Thuê trọ</option>
            <option value="Pháp lý & Cọc">Hợp đồng & Đặt cọc</option>
            <option value="Điện nước">Giá điện nước & Chi phí</option>
            <option value="Ở ghép">Tìm bạn ở ghép</option>
            <option value="Đời sống">Đời sống sinh viên</option>
          </select>
        </div>
        <textarea
          className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-xs sm:text-sm focus:outline-none focus:border-indigo-600"
          rows={3}
          placeholder="Mô tả chi tiết câu hỏi, băn khoăn của bạn..."
          value={content}
          onChange={e => setContent(e.target.value)}
        />
        <div className="flex items-center justify-between pt-1">
          <button
            onClick={ask}
            className="bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-2.5 rounded-xl font-bold text-xs shadow-xs transition-colors"
          >
            Đăng câu hỏi
          </button>
          {!user && (
            <span className="text-xs text-gray-400">
              Đăng nhập để đặt câu hỏi hoặc gửi câu trả lời.
            </span>
          )}
        </div>
      </div>

      {loading && (
        <div className="bg-white border rounded-3xl p-12 text-center text-gray-500">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600 mx-auto mb-2" />
          Đang tải danh sách câu hỏi...
        </div>
      )}

      {!loading && error && (
        <div className="bg-red-50 border border-red-200 rounded-3xl p-8 text-center">
          <b className="text-red-700">Không tải được dữ liệu</b>
          <p className="mt-1 text-xs text-red-600">{error}</p>
          <button onClick={() => void load()} className="mt-3 bg-red-600 text-white px-4 py-2 rounded-xl text-xs font-bold">
            Thử lại
          </button>
        </div>
      )}

      {!loading && !error && !qs.length && (
        <div className="bg-white border rounded-3xl p-12 text-center">
          <div className="text-4xl mb-2">💬</div>
          <h2 className="text-lg font-bold text-gray-800">Chưa có câu hỏi nào</h2>
          <p className="text-gray-500 text-xs mt-1">Hãy là người đầu tiên đặt câu hỏi cho cộng đồng!</p>
        </div>
      )}

      {/* Questions list */}
      <div className="space-y-4">
        {qs.map(q => {
          const authorAvatar = q.authorAvatar
            ? resolveMediaUrl(q.authorAvatar)
            : `https://ui-avatars.com/api/?name=${encodeURIComponent(q.authorName || 'User')}&background=random`;

          const qAnswers = answers[q.id] || [];

          return (
            <div key={q.id} className="bg-white border rounded-3xl p-6 shadow-xs space-y-4">
              {/* Question header */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <img src={authorAvatar} alt="" className="w-8 h-8 rounded-full object-cover border" />
                  <div>
                    <div className="flex items-center gap-2">
                      <b className="text-xs text-gray-900">{q.authorName || `User #${q.userId}`}</b>
                      {renderRoleBadge(q.authorRole)}
                    </div>
                    <span className="text-[10px] text-gray-400">
                      {q.createdAt ? new Date(q.createdAt).toLocaleDateString('vi-VN') : ''}
                    </span>
                  </div>
                </div>
                <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-indigo-50 text-indigo-700 border border-indigo-100">
                  {q.category || 'Cộng đồng'}
                </span>
              </div>

              {/* Title & Content */}
              <div>
                <h3 className="text-base sm:text-lg font-extrabold text-gray-900">
                  {q.title}
                </h3>
                <p className="text-sm text-gray-700 mt-2 leading-relaxed whitespace-pre-wrap">
                  {q.content}
                </p>
              </div>

              {/* Toggle Answers button */}
              <div className="border-t pt-3 flex justify-between items-center text-xs">
                <button
                  onClick={() => void show(q.id)}
                  className="font-bold text-indigo-600 hover:underline flex items-center gap-1.5"
                >
                  <span>💬</span> {open === q.id ? 'Thu gọn câu trả lời' : `Xem câu trả lời (${qAnswers.length > 0 ? qAnswers.length : 'Trả lời ngay'})`}
                </button>
              </div>

              {/* Answers block */}
              {open === q.id && (
                <div className="bg-gray-50/70 p-4 rounded-2xl border border-gray-100 space-y-3 pt-4">
                  <div className="space-y-2.5">
                    {qAnswers.map((a: any) => {
                      const aAvatar = a.authorAvatar
                        ? resolveMediaUrl(a.authorAvatar)
                        : `https://ui-avatars.com/api/?name=${encodeURIComponent(a.authorName || 'User')}&background=random`;

                      return (
                        <div key={a.id} className="bg-white p-3.5 rounded-xl border border-gray-100 shadow-2xs space-y-1">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              <img src={aAvatar} alt="" className="w-6 h-6 rounded-full object-cover border" />
                              <b className="text-xs text-gray-800">{a.authorName || `User #${a.userId}`}</b>
                              {renderRoleBadge(a.authorRole, a.isOfficial)}
                            </div>
                            <span className="text-[10px] text-gray-400">
                              {a.createdAt ? new Date(a.createdAt).toLocaleDateString('vi-VN') : ''}
                            </span>
                          </div>
                          <div className="text-xs text-gray-700 leading-relaxed pl-8">
                            {a.content}
                          </div>
                        </div>
                      );
                    })}

                    {qAnswers.length === 0 && (
                      <div className="text-xs text-gray-400 text-center py-3">
                        Chưa có câu trả lời nào. Hãy là người đầu tiên giúp đỡ bạn sinh viên này!
                      </div>
                    )}
                  </div>

                  {/* Reply input */}
                  <div className="flex gap-2 pt-2">
                    <input
                      className="flex-1 border border-gray-200 rounded-xl px-4 py-2.5 text-xs focus:outline-none focus:border-indigo-600 bg-white"
                      placeholder="Chia sẻ kinh nghiệm hoặc câu trả lời của bạn..."
                      value={answer}
                      onChange={e => setAnswer(e.target.value)}
                      onKeyDown={e => e.key === 'Enter' && reply(q.id)}
                    />
                    <button
                      onClick={() => reply(q.id)}
                      className="bg-indigo-600 hover:bg-indigo-700 text-white px-5 py-2.5 rounded-xl font-bold text-xs shadow-xs transition-colors shrink-0"
                    >
                      Gửi trả lời
                    </button>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
