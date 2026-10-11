import React, { useState, useEffect, useRef } from 'react';
import { api, getUser, resolveMediaUrl } from '../lib/api';
import { Link } from 'react-router-dom';

interface CommunityMsg {
  id: number;
  userId: number;
  authorName: string;
  authorAvatar?: string | null;
  cosmeticStyle?: string | null;
  profileBadge?: string | null;
  vipTier?: string | null;
  role?: string;
  content: string;
  createdAt: string;
  replyToId?: number | null;
  replyPreview?: {
    id: number;
    content: string;
    authorName: string;
  };
}

export default function CommunityPage() {
  const user = getUser();
  const [messages, setMessages] = useState<CommunityMsg[]>([]);
  const [loading, setLoading] = useState(true);
  const [inputText, setInputText] = useState('');
  const [replyTarget, setReplyTarget] = useState<CommunityMsg | null>(null);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState('');
  const [reportTarget, setReportTarget] = useState<CommunityMsg | null>(null);
  const [reportReason, setReportReason] = useState('Nội dung không phù hợp');
  const chatBottomRef = useRef<HTMLDivElement>(null);

  const fetchMessages = async (isInitial = false) => {
    try {
      const res = await api.get('/community/messages?limit=60');
      if (res.data?.messages) {
        setMessages(res.data.messages);
        if (isInitial) {
          setTimeout(() => chatBottomRef.current?.scrollIntoView({ behavior: 'smooth' }), 100);
        }
      }
    } catch (e: any) {
      if (isInitial) setError('Không thể tải tin nhắn cộng đồng.');
    } finally {
      if (isInitial) setLoading(false);
    }
  };

  useEffect(() => {
    void fetchMessages(true);
    const interval = setInterval(() => {
      void fetchMessages(false);
    }, 4000);
    return () => clearInterval(interval);
  }, []);

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) {
      alert('Vui lòng đăng nhập để tham gia trò chuyện.');
      return;
    }
    const text = inputText.trim();
    if (!text) return;

    setSending(true);
    setError('');
    try {
      const payload: any = { content: text };
      if (replyTarget) {
        payload.replyToId = replyTarget.id;
      }
      const res = await api.post('/community/messages', payload);
      setMessages(prev => [...prev, res.data]);
      setInputText('');
      setReplyTarget(null);
      setTimeout(() => chatBottomRef.current?.scrollIntoView({ behavior: 'smooth' }), 50);
    } catch (e: any) {
      setError(e.response?.data?.message || 'Không thể gửi tin nhắn.');
    } finally {
      setSending(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Bạn có chắc muốn xóa tin nhắn này?')) return;
    try {
      await api.delete(`/community/messages/${id}`);
      setMessages(prev => prev.filter(m => m.id !== id));
    } catch (e: any) {
      alert(e.response?.data?.message || 'Không thể xóa tin nhắn.');
    }
  };

  const handleReport = async () => {
    if (!reportTarget) return;
    try {
      await api.post(`/community/messages/${reportTarget.id}/report`, { reason: reportReason });
      alert('Đã gửi báo cáo vi phạm tới ban quản trị!');
      setReportTarget(null);
    } catch (e: any) {
      alert(e.response?.data?.message || 'Không thể gửi báo cáo.');
    }
  };

  const formatTime = (ts: string) => {
    try {
      const d = new Date(ts);
      return d.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' });
    } catch {
      return '';
    }
  };

  return (
    <div className="max-w-5xl mx-auto py-6 px-4 sm:px-6 space-y-4 animate-fade-in">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-indigo-600 via-indigo-700 to-purple-700 rounded-3xl p-6 text-white shadow-xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-2xl">💬</span>
            <h1 className="text-2xl font-black tracking-tight">Tán gẫu UniHome</h1>
            <span className="bg-emerald-500/30 text-emerald-200 text-[10px] font-extrabold px-2 py-0.5 rounded-full border border-emerald-400/40">
              TRỰC TIẾP
            </span>
          </div>
          <p className="text-xs text-indigo-100 mt-1 max-w-xl">
            Kênh trò chuyện cộng đồng công khai dành cho sinh viên. Thảo luận tìm phòng, hỏi thăm khu vực, pass đồ, tìm bạn cùng phòng và chia sẻ đời sống học đường!
          </p>
        </div>
        <div className="flex items-center gap-2 text-xs font-semibold bg-white/10 px-4 py-2 rounded-2xl border border-white/20">
          <span>👥</span> {messages.length} tin nhắn
        </div>
      </div>

      {error && (
        <div className="p-3 bg-red-50 border border-red-200 rounded-2xl text-red-700 text-xs font-bold">
          {error}
        </div>
      )}

      {/* Chat Container */}
      <div className="bg-white rounded-3xl shadow-xl border border-gray-100 flex flex-col h-[650px] overflow-hidden">
        {/* Messages Stream */}
        <div className="flex-1 p-6 overflow-y-auto space-y-4 bg-gray-50/30">
          {loading ? (
            <div className="flex items-center justify-center h-full text-xs text-gray-400">
              Đang tải tin nhắn cộng đồng...
            </div>
          ) : messages.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-center space-y-2">
              <span className="text-4xl">👋</span>
              <p className="text-sm font-bold text-gray-700">Chưa có ai nhắn tin hôm nay.</p>
              <p className="text-xs text-gray-400">Hãy là người đầu tiên mở lời chào cộng đồng UniHome!</p>
            </div>
          ) : (
            messages.map((m) => {
              const isMe = user && m.userId === user.id;
              const isAdmin = user && ['ADMIN', 'SUPER_ADMIN', 'MODERATOR'].includes(user.role);

              return (
                <div
                  key={m.id}
                  className={`flex items-start gap-3 group ${isMe ? 'flex-row-reverse' : ''}`}
                >
                  {/* Avatar */}
                  <Link to={`/users/${m.userId}`} className="shrink-0 hover:opacity-90">
                    {m.authorAvatar ? (
                      <img
                        src={resolveMediaUrl(m.authorAvatar)}
                        alt={m.authorName}
                        className="w-10 h-10 rounded-2xl object-cover border-2 border-indigo-100 shadow-xs"
                      />
                    ) : (
                      <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-indigo-500 to-purple-500 text-white font-black text-sm flex items-center justify-center shadow-xs">
                        {m.authorName ? m.authorName.charAt(0).toUpperCase() : 'U'}
                      </div>
                    )}
                  </Link>

                  {/* Message Bubble */}
                  <div className={`max-w-[75%] space-y-1 ${isMe ? 'items-end text-right' : ''}`}>
                    {/* Author Meta */}
                    <div className={`flex items-center gap-1.5 text-xs ${isMe ? 'justify-end' : ''}`}>
                      <span className="font-extrabold text-gray-900">{m.authorName}</span>
                      {m.vipTier && (
                        <span className="bg-amber-100 text-amber-800 text-[9px] font-black px-1.5 py-0.2 rounded-md border border-amber-200">
                          {m.vipTier}
                        </span>
                      )}
                      {m.role === 'ADMIN' && (
                        <span className="bg-purple-100 text-purple-800 text-[9px] font-black px-1.5 py-0.2 rounded-md border border-purple-200">
                          ADMIN
                        </span>
                      )}
                      <span className="text-[10px] text-gray-400 font-medium">
                        {formatTime(m.createdAt)}
                      </span>
                    </div>

                    {/* Replied Preview */}
                    {m.replyPreview && (
                      <div className={`text-[11px] p-2 rounded-xl border bg-gray-100/70 text-gray-600 mb-1 ${isMe ? 'border-indigo-100 text-left' : 'border-gray-200'}`}>
                        <span className="font-bold text-gray-800">@{m.replyPreview.authorName}: </span>
                        <span>{m.replyPreview.content}</span>
                      </div>
                    )}

                    {/* Bubble Content */}
                    <div
                      className={`p-3.5 rounded-2xl text-xs leading-relaxed break-words shadow-2xs ${
                        isMe
                          ? 'bg-indigo-600 text-white rounded-tr-none'
                          : 'bg-white text-gray-800 border border-gray-100 rounded-tl-none'
                      }`}
                    >
                      {m.content}
                    </div>

                    {/* Quick Actions (Reply, Delete, Report) */}
                    <div className={`flex items-center gap-2 pt-0.5 text-[10px] text-gray-400 opacity-0 group-hover:opacity-100 transition-opacity ${isMe ? 'justify-end' : ''}`}>
                      <button
                        type="button"
                        onClick={() => setReplyTarget(m)}
                        className="hover:text-indigo-600 font-semibold"
                      >
                        Trả lời
                      </button>
                      {(isMe || isAdmin) && (
                        <button
                          type="button"
                          onClick={() => handleDelete(m.id)}
                          className="hover:text-red-600 font-semibold"
                        >
                          Xóa
                        </button>
                      )}
                      {!isMe && (
                        <button
                          type="button"
                          onClick={() => setReportTarget(m)}
                          className="hover:text-amber-600 font-semibold"
                        >
                          Báo cáo
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              );
            })
          )}
          <div ref={chatBottomRef} />
        </div>

        {/* Reply Indicator */}
        {replyTarget && (
          <div className="px-6 py-2 bg-indigo-50 border-t border-indigo-100 flex items-center justify-between text-xs">
            <div className="text-indigo-900 truncate">
              Đang trả lời <strong>@{replyTarget.authorName}</strong>: "{replyTarget.content.substring(0, 40)}..."
            </div>
            <button
              type="button"
              onClick={() => setReplyTarget(null)}
              className="text-indigo-500 hover:text-indigo-800 font-bold ml-2"
            >
              ✕ Hủy
            </button>
          </div>
        )}

        {/* Input Bar */}
        <form onSubmit={handleSend} className="p-4 bg-white border-t border-gray-100 flex items-center gap-3">
          <input
            type="text"
            placeholder={user ? "Nhập tin nhắn trò chuyện cùng sinh viên..." : "Đăng nhập để trò chuyện..."}
            disabled={!user || sending}
            value={inputText}
            onChange={e => setInputText(e.target.value)}
            className="flex-1 text-xs border border-gray-200 rounded-2xl p-3 focus:outline-hidden focus:border-indigo-600 bg-gray-50/50"
          />
          <button
            type="submit"
            disabled={!user || sending || !inputText.trim()}
            className="bg-indigo-600 hover:bg-indigo-700 text-white font-black text-xs px-6 py-3 rounded-2xl shadow-md transition-all disabled:opacity-40"
          >
            {sending ? '...' : 'Gửi'}
          </button>
        </form>
      </div>

      {/* Report Modal */}
      {reportTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-fade-in">
          <div className="bg-white rounded-3xl max-w-sm w-full p-6 space-y-4 shadow-2xl border border-gray-100">
            <h3 className="font-extrabold text-sm text-gray-900">Báo cáo tin nhắn vi phạm</h3>
            <p className="text-xs text-gray-500">
              Nội dung vi phạm của <strong>@{reportTarget.authorName}</strong>: "{reportTarget.content.substring(0, 50)}..."
            </p>
            <select
              value={reportReason}
              onChange={e => setReportReason(e.target.value)}
              className="w-full text-xs border rounded-xl p-2.5 bg-gray-50"
            >
              <option value="Nội dung không phù hợp">Nội dung không phù hợp</option>
              <option value="Spam / Quảng cáo rác">Spam / Quảng cáo rác</option>
              <option value="Xúc phạm / Ngôn từ thù địch">Xúc phạm / Ngôn từ thù địch</option>
              <option value="Lừa đảo / Sai sự thật">Lừa đảo / Sai sự thật</option>
            </select>
            <div className="flex gap-2 justify-end pt-2">
              <button
                type="button"
                onClick={() => setReportTarget(null)}
                className="text-xs font-bold px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-xl"
              >
                Hủy
              </button>
              <button
                type="button"
                onClick={handleReport}
                className="text-xs font-black px-4 py-2 bg-red-600 text-white hover:bg-red-700 rounded-xl shadow-xs"
              >
                Gửi báo cáo
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
