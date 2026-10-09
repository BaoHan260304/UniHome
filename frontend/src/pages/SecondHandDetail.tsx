import { useEffect, useState } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { api, getUser, money, resolveMediaUrl } from '../lib/api';

export default function SecondHandDetail() {
  const { id } = useParams();
  const nav = useNavigate();
  const location = useLocation();
  const user = getUser();
  const [item, setItem] = useState<any>();
  const [comments, setComments] = useState<any[]>([]);
  const [text, setText] = useState('');
  const [revealedPhone, setRevealedPhone] = useState<string | null>(null);
  const [revealing, setRevealing] = useState(false);

  const load = () => {
    api.get(`/content/secondhand/${id}`).then(r => {
      setItem(r.data);
      if (r.data.isContactRevealed && r.data.sellerPhone) {
        setRevealedPhone(r.data.sellerPhone);
      }
    });
    api.get(`/content/secondhand/${id}/comments`).then(r => setComments(r.data || []));
  };

  useEffect(() => {
    load();
  }, [id]);

  if (!item) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-indigo-600" />
      </div>
    );
  }

  const handleRevealContact = async () => {
    if (!user) {
      nav('/login', { state: { from: location.pathname } });
      return;
    }
    setRevealing(true);
    try {
      const res = await api.post(`/content/secondhand/${id}/reveal-contact`);
      setRevealedPhone(res.data.phone || item.contactPhone);
    } catch (e: any) {
      alert(e.response?.data?.message || 'Không thể xem số điện thoại');
    } finally {
      setRevealing(false);
    }
  };

  const handleComment = () => {
    if (!user) {
      nav('/login', { state: { from: location.pathname } });
      return;
    }
    if (!text.trim()) return;
    api.post(`/content/secondhand/${id}/comments`, { content: text }).then(() => {
      setText('');
      load();
    });
  };

  const handleChat = () => {
    if (!user) {
      nav('/login', { state: { from: location.pathname } });
      return;
    }
    api.post('/chat/conversations', {
      otherUserId: item.sellerId,
      contextType: 'SECOND_HAND',
      contextId: item.id
    }).then((res) => nav(`/chat?conversationId=${res.data?.id || res.data?.conversationId || ''}`));
  };

  const sellerAvatar = item.sellerAvatar
    ? resolveMediaUrl(item.sellerAvatar)
    : `https://ui-avatars.com/api/?name=${encodeURIComponent(item.sellerName || 'Người bán')}&background=random`;

  const displayPhone = revealedPhone || item.sellerPhone || (item.contactPhone ? item.contactPhone.slice(0, 3) + 'xx xxx xxx' : '09xx xxx xxx');

  return (
    <div className="max-w-4xl mx-auto space-y-6 pb-12">
      <div className="flex justify-between items-center">
        <button onClick={() => nav(-1)} className="text-indigo-600 font-semibold text-sm hover:underline">
          ← Quay lại danh sách đồ cũ
        </button>
        <button onClick={() => nav('/')} className="text-xs text-gray-500 hover:text-indigo-600">
          Trang chủ
        </button>
      </div>

      <div className="bg-white border rounded-3xl overflow-hidden shadow-sm">
        <div className="grid md:grid-cols-2">
          {/* Image */}
          <div className="bg-gray-100 min-h-80 flex items-center justify-center relative">
            {item.imageUrl ? (
              <img src={resolveMediaUrl(item.imageUrl)} alt={item.title} className="w-full h-full object-cover max-h-[420px]" />
            ) : (
              <div className="h-full flex items-center justify-center text-gray-400 text-sm">
                Không có ảnh sản phẩm
              </div>
            )}
            <span className="absolute top-3 left-3 bg-white/90 backdrop-blur-xs px-3 py-1 rounded-full text-xs font-bold text-gray-700 shadow-xs">
              {item.category || 'Đồ dùng'}
            </span>
          </div>

          {/* Details */}
          <div className="p-6 md:p-8 flex flex-col justify-between space-y-4">
            <div>
              <div className="flex items-center gap-2">
                <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                  {item.conditionText || 'Còn tốt'}
                </span>
                <span className="text-xs text-gray-400">
                  Mã tin: #{item.id}
                </span>
              </div>

              <h1 className="text-2xl font-extrabold text-gray-900 mt-2 leading-tight">
                {item.title}
              </h1>

              <div className="text-2xl font-extrabold text-indigo-600 mt-3">
                {money(item.price)}
              </div>

              <div className="text-xs text-gray-500 mt-2 flex items-center gap-1">
                <span>📍</span> {[item.district, item.province].filter(Boolean).join(', ') || 'Hà Nội'}
              </div>

              <p className="mt-4 text-sm text-gray-700 leading-relaxed whitespace-pre-wrap bg-gray-50 p-3.5 rounded-2xl border border-gray-100">
                {item.description || 'Người bán chưa cung cấp mô tả chi tiết.'}
              </p>
            </div>

            {/* Seller Card */}
            <div className="border-t pt-4 space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <img src={sellerAvatar} alt="" className="w-10 h-10 rounded-full object-cover border" />
                  <div>
                    <b className="text-sm text-gray-900">{item.sellerName || 'Sinh viên UniHome'}</b>
                    <div className="text-[11px] text-gray-500">Người bán đã xác minh</div>
                  </div>
                </div>
                <span className="text-xs font-bold px-2 py-0.5 bg-gray-100 text-gray-600 rounded-md">
                  {item.status || 'AVAILABLE'}
                </span>
              </div>

              {/* Masked Contact & Buttons */}
              <div className="bg-gray-50 p-3 rounded-2xl border space-y-2">
                <div className="flex justify-between items-center text-xs">
                  <span className="text-gray-500">Số điện thoại:</span>
                  <span className="font-mono font-bold text-gray-900 tracking-wider">
                    {displayPhone}
                  </span>
                </div>

                {!revealedPhone && (
                  <button
                    onClick={handleRevealContact}
                    disabled={revealing}
                    className="w-full py-2 bg-amber-50 hover:bg-amber-100 text-amber-800 border border-amber-300 rounded-xl text-xs font-bold transition-colors"
                  >
                    {revealing ? 'Đang mở số...' : '👁 Hiện số điện thoại người bán'}
                  </button>
                )}
              </div>

              <button
                onClick={handleChat}
                className="w-full bg-indigo-600 hover:bg-indigo-700 text-white py-3 rounded-xl font-bold text-sm shadow-md transition-colors flex items-center justify-center gap-2"
              >
                <span>💬</span> Nhắn tin trực tiếp với người bán
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Comments section */}
      <div className="bg-white border rounded-3xl p-6 md:p-8 space-y-4 shadow-xs">
        <h2 className="text-lg font-extrabold text-gray-900">Bình luận & Hỏi giá sản phẩm ({comments.length})</h2>
        <div className="space-y-3">
          {comments.map(c => {
            const avatar = c.authorAvatar
              ? resolveMediaUrl(c.authorAvatar)
              : `https://ui-avatars.com/api/?name=${encodeURIComponent(c.authorName || 'User')}&background=random`;

            return (
              <div key={c.id} className="bg-gray-50 rounded-2xl p-4 text-sm space-y-1.5 border border-gray-100">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <img src={avatar} alt="" className="w-6 h-6 rounded-full object-cover border" />
                    <span className="font-bold text-xs text-gray-800">{c.authorName || `User #${c.userId}`}</span>
                    {c.authorRole === 'ADMIN' || c.authorRole === 'SUPER_ADMIN' ? (
                      <span className="px-1.5 py-0.2 bg-red-100 text-red-700 text-[10px] font-bold rounded">BQT UniHome</span>
                    ) : c.authorRole === 'LANDLORD' ? (
                      <span className="px-1.5 py-0.2 bg-amber-100 text-amber-800 text-[10px] font-bold rounded">Chủ trọ</span>
                    ) : (
                      <span className="px-1.5 py-0.2 bg-blue-50 text-blue-700 text-[10px] font-medium rounded">Sinh viên</span>
                    )}
                  </div>
                  <span className="text-[11px] text-gray-400">
                    {c.createdAt ? new Date(c.createdAt).toLocaleDateString('vi-VN') : ''}
                  </span>
                </div>
                <div className="text-xs text-gray-700 leading-relaxed pl-8">{c.content}</div>
              </div>
            );
          })}
          {comments.length === 0 && (
            <div className="p-6 text-center text-xs text-gray-400">
              Chưa có bình luận nào. Hãy hỏi người bán về tình trạng đồ hoặc hẹn địa điểm lấy!
            </div>
          )}
        </div>

        <div className="flex gap-2 pt-2">
          <input
            value={text}
            onChange={e => setText(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && handleComment()}
            className="flex-1 border border-gray-200 rounded-xl px-4 py-2.5 text-xs focus:outline-none focus:border-indigo-600 bg-white"
            placeholder="Hỏi giá, tình trạng, hẹn giờ qua xem đồ..."
          />
          <button
            onClick={handleComment}
            className="bg-indigo-600 hover:bg-indigo-700 text-white px-5 py-2.5 rounded-xl font-bold text-xs shadow-xs transition-colors shrink-0"
          >
            Gửi
          </button>
        </div>
      </div>
    </div>
  );
}
