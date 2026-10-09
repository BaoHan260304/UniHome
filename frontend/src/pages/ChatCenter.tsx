import { useEffect, useRef, useState } from 'react';
import { api, getUser, resolveMediaUrl, money } from '../lib/api';
import { useNavigate } from 'react-router-dom';

export default function ChatCenter() {
  const user = getUser();
  const nav = useNavigate();
  const [convs, setConvs] = useState<any[]>([]);
  const [active, setActive] = useState<any>(null);
  const [msgs, setMsgs] = useState<any[]>([]);
  const [text, setText] = useState('');
  const [sending, setSending] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const loadConvs = async () => {
    try {
      const r = await api.get('/chat/conversations');
      const list = r.data || [];
      setConvs(list);
      // If we already have an active conversation, keep its data fresh
      if (active) {
        const found = list.find((c: any) => c.id === active.id);
        if (found) setActive(found);
      }
    } catch {}
  };

  const loadMessages = async (convId: number) => {
    try {
      const r = await api.get(`/chat/${convId}/messages`);
      setMsgs(r.data || []);
      setTimeout(scrollToBottom, 50);
    } catch {}
  };

  // Initial load
  useEffect(() => {
    if (!user) {
      nav('/login');
      return;
    }
    void loadConvs();
  }, []);

  // Polling every 3 seconds for real-time chat
  useEffect(() => {
    if (!user) return;
    const interval = setInterval(() => {
      void loadConvs();
      if (active) {
        void api.get(`/chat/${active.id}/messages`).then(r => {
          setMsgs(r.data || []);
        });
      }
    }, 3000);
    return () => clearInterval(interval);
  }, [user?.id, active?.id]);

  const selectConversation = (c: any) => {
    setActive(c);
    loadMessages(c.id);
  };

  const send = async () => {
    if (!active || !text.trim() || sending) return;
    const content = text.trim();
    setText('');
    setSending(true);

    try {
      const r = await api.post(`/chat/${active.id}/messages`, { content, type: 'TEXT' });
      setMsgs(prev => [...prev, r.data]);
      setTimeout(scrollToBottom, 50);
      void loadConvs();
    } catch (e: any) {
      alert(e.response?.data?.message || 'Không thể gửi tin nhắn');
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight">Hộp thư & Trò chuyện</h1>
        <p className="mt-1 text-sm text-gray-600">
          Trao đổi trực tiếp trên UniHome với chủ trọ, người thuê hoặc bạn cùng phòng trước khi gọi điện/Zalo.
        </p>
      </div>

      <div className="bg-white border border-gray-200 rounded-2xl shadow-sm overflow-hidden grid grid-cols-1 md:grid-cols-[340px_1fr] min-h-[640px] max-h-[800px]">
        {/* Left column: Conversations list */}
        <div className="border-r border-gray-200 flex flex-col h-full bg-white">
          <div className="p-4 border-b border-gray-200 font-bold text-sm text-gray-800 flex justify-between items-center">
            <span>Danh sách hội thoại</span>
            <span className="text-xs font-normal text-gray-500">{convs.length} cuộc trò chuyện</span>
          </div>

          <div className="flex-1 overflow-y-auto divide-y divide-gray-100">
            {convs.map(c => {
              const otherAvatar = c.otherUserAvatar
                ? resolveMediaUrl(c.otherUserAvatar)
                : `https://ui-avatars.com/api/?name=${encodeURIComponent(c.otherUserName || 'User')}&background=random`;
              const isSelected = active?.id === c.id;
              const hasUnread = (c.unreadCount || 0) > 0;

              return (
                <button
                  key={c.id}
                  onClick={() => selectConversation(c)}
                  className={`w-full p-4 flex gap-3 text-left transition-colors relative ${
                    isSelected ? 'bg-indigo-50/70' : 'hover:bg-gray-50'
                  }`}
                >
                  <div className="relative shrink-0">
                    <img src={otherAvatar} alt="" className="w-12 h-12 rounded-full object-cover border border-gray-200" />
                    {hasUnread && (
                      <span className="absolute -top-1 -right-1 bg-red-500 text-white text-[10px] font-bold w-5 h-5 rounded-full flex items-center justify-center">
                        {c.unreadCount}
                      </span>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex justify-between items-baseline">
                      <span className="font-bold text-sm text-gray-900 truncate">{c.otherUserName}</span>
                      <span className="text-[10px] text-gray-400 shrink-0 ml-1">
                        {c.lastMessageTime ? new Date(c.lastMessageTime).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' }) : ''}
                      </span>
                    </div>
                    <p className={`text-xs truncate mt-0.5 ${hasUnread ? 'font-bold text-gray-900' : 'text-gray-500'}`}>
                      {c.lastMessage || 'Chưa có tin nhắn'}
                    </p>
                    {c.contextTitle && (
                      <div className="mt-1 text-[11px] text-indigo-600 truncate bg-indigo-50/50 px-2 py-0.5 rounded-md inline-block max-w-full">
                        🏷 {c.contextTitle}
                      </div>
                    )}
                  </div>
                </button>
              );
            })}

            {convs.length === 0 && (
              <div className="p-8 text-center text-xs text-gray-400">
                Chưa có cuộc trò chuyện nào. Bạn có thể bấm "Chat với chủ trọ" trên bất kỳ tin phòng nào để bắt đầu!
              </div>
            )}
          </div>
        </div>

        {/* Right column: Active conversation */}
        <div className="flex flex-col h-full bg-gray-50/50">
          {active ? (
            <>
              {/* Header */}
              <div className="p-4 border-b border-gray-200 bg-white flex flex-wrap justify-between items-center gap-3">
                <div className="flex items-center gap-3">
                  <img
                    src={
                      active.otherUserAvatar
                        ? resolveMediaUrl(active.otherUserAvatar)
                        : `https://ui-avatars.com/api/?name=${encodeURIComponent(active.otherUserName || 'User')}&background=random`
                    }
                    alt=""
                    className="w-10 h-10 rounded-full object-cover border"
                  />
                  <div>
                    <button
                      onClick={() => nav(`/users/${active.otherUserId}`)}
                      className="font-bold text-sm text-gray-900 hover:text-indigo-600 transition-colors"
                    >
                      {active.otherUserName}
                    </button>
                    <span className="text-[11px] text-gray-400 block">
                      {active.otherUserRole === 'LANDLORD' ? 'Chủ trọ' : 'Người thuê'}
                    </span>
                  </div>
                </div>

                {/* Context card badge */}
                {active.contextTitle && (
                  <div
                    onClick={() => {
                      if (active.contextType === 'ROOM' || active.contextType === 'ROOM_MATCH') {
                        nav(`/property/${active.contextId}`);
                      } else if (active.contextType === 'SECOND_HAND') {
                        nav(`/secondhand/${active.contextId}`);
                      }
                    }}
                    className="flex items-center gap-2 px-3 py-1.5 bg-gray-50 hover:bg-indigo-50 border border-gray-200 rounded-xl cursor-pointer transition-colors max-w-sm"
                  >
                    {active.contextImage && (
                      <img
                        src={resolveMediaUrl(active.contextImage)}
                        alt=""
                        className="w-8 h-8 rounded-lg object-cover"
                      />
                    )}
                    <div className="text-left min-w-0">
                      <div className="text-xs font-semibold text-gray-800 truncate">{active.contextTitle}</div>
                      {active.contextPrice && (
                        <div className="text-[11px] font-bold text-indigo-600">{money(active.contextPrice)}</div>
                      )}
                    </div>
                  </div>
                )}
              </div>

              {/* Message bubbles */}
              <div className="flex-1 p-5 space-y-3 overflow-y-auto">
                {msgs.map(m => {
                  const isMe = m.senderId === user?.id;
                  return (
                    <div key={m.id} className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}>
                      <div
                        className={`max-w-[72%] px-4 py-2.5 rounded-2xl text-sm shadow-xs ${
                          isMe
                            ? 'bg-indigo-600 text-white rounded-br-xs'
                            : 'bg-white border border-gray-200 text-gray-900 rounded-bl-xs'
                        }`}
                      >
                        <div className="whitespace-pre-wrap leading-relaxed">{m.content}</div>
                        <div className={`text-[10px] mt-1 text-right ${isMe ? 'text-indigo-100' : 'text-gray-400'}`}>
                          {m.sentAt
                            ? new Date(m.sentAt).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })
                            : ''}
                        </div>
                      </div>
                    </div>
                  );
                })}
                <div ref={messagesEndRef} />
              </div>

              {/* Input area */}
              <div className="p-3.5 border-t border-gray-200 bg-white flex gap-2">
                <input
                  type="text"
                  value={text}
                  onChange={e => setText(e.target.value)}
                  onKeyDown={e => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      void send();
                    }
                  }}
                  className="flex-1 border border-gray-300 rounded-xl px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-indigo-500"
                  placeholder="Nhập tin nhắn... (Enter để gửi)"
                />
                <button
                  onClick={send}
                  disabled={!text.trim() || sending}
                  className="bg-indigo-600 disabled:opacity-50 text-white px-5 py-2.5 rounded-xl text-sm font-bold hover:bg-indigo-700 transition-colors"
                >
                  Gửi
                </button>
              </div>
            </>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center p-8 text-center text-gray-400 space-y-2">
              <span className="text-4xl">💬</span>
              <p className="text-sm font-medium">Chọn một cuộc trò chuyện từ danh sách bên trái để bắt đầu</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
