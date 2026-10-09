import { useEffect, useRef, useState } from 'react';
import { api, getUser, resolveMediaUrl, money } from '../lib/api';
import { useNavigate, useSearchParams } from 'react-router-dom';

type ChatTab = 'ALL' | 'UNREAD' | 'HIDDEN';

export default function ChatCenter() {
  const user = getUser();
  const nav = useNavigate();
  const [searchParams] = useSearchParams();
  const queryConvId = searchParams.get('conversationId');

  // Filter & Search
  const [tab, setTab] = useState<ChatTab>('ALL');
  const [keyword, setKeyword] = useState('');

  // Conversations
  const [convs, setConvs] = useState<any[]>([]);
  const [active, setActive] = useState<any>(null);
  const [headerMenuOpen, setHeaderMenuOpen] = useState(false);

  // Messages & Pagination
  const [msgs, setMsgs] = useState<any[]>([]);
  const [hasMore, setHasMore] = useState(false);
  const [loadingOlder, setLoadingOlder] = useState(false);
  const [text, setText] = useState('');
  const [sending, setSending] = useState(false);

  // Notifications & UI state
  const [actionNotice, setActionNotice] = useState<string | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);

  // Report Modal
  const [reportModalOpen, setReportModalOpen] = useState(false);
  const [reportTargetType, setReportTargetType] = useState<'MESSAGE' | 'USER'>('MESSAGE');
  const [reportTargetId, setReportTargetId] = useState<number | null>(null);
  const [reportReason, setReportReason] = useState('SPAM');
  const [reportDetails, setReportDetails] = useState('');
  const [submittingReport, setSubmittingReport] = useState(false);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const chatScrollContainerRef = useRef<HTMLDivElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);

  const showToast = (msg: string, isError = false) => {
    if (isError) {
      setActionError(msg);
      setTimeout(() => setActionError(null), 3500);
    } else {
      setActionNotice(msg);
      setTimeout(() => setActionNotice(null), 3000);
    }
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const notifyUnreadUpdated = () => {
    window.dispatchEvent(new CustomEvent('chat_unread_changed'));
  };

  // Close header dropdown menu on click outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setHeaderMenuOpen(false);
      }
    };
    if (headerMenuOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [headerMenuOpen]);

  // Load conversations list
  const loadConvs = async (selectedConvId?: number) => {
    try {
      const res = await api.get('/chat/conversations', {
        params: {
          filter: tab,
          keyword: keyword.trim() || undefined,
          page: 0,
          size: 50,
        },
      });

      const list = Array.isArray(res.data) ? res.data : (res.data?.content || []);
      setConvs(list);

      // Determine active conversation
      const targetId = selectedConvId ?? (active ? active.id : queryConvId ? Number(queryConvId) : null);
      if (targetId) {
        const found = list.find((c: any) => c.id === Number(targetId));
        if (found) {
          setActive(found);
        } else if (!active && queryConvId) {
          // If not in current list (maybe in other tab or new), fetch and select directly
          void fetchSingleConversationAndSelect(Number(queryConvId));
        }
      }
    } catch {}
  };

  const fetchSingleConversationAndSelect = async (convId: number) => {
    try {
      const r = await api.get(`/chat/${convId}/messages`, { params: { size: 30 } });
      const messagesData = Array.isArray(r.data) ? r.data : (r.data?.messages || []);
      setMsgs(messagesData);
      setHasMore(Boolean(r.data?.hasMore));
      setTimeout(scrollToBottom, 60);
      notifyUnreadUpdated();
    } catch {}
  };

  // Select conversation
  const selectConversation = async (c: any) => {
    setActive(c);
    setHeaderMenuOpen(false);
    try {
      const r = await api.get(`/chat/${c.id}/messages`, { params: { size: 30 } });
      const messagesData = Array.isArray(r.data) ? r.data : (r.data?.messages || []);
      setMsgs(messagesData);
      setHasMore(Boolean(r.data?.hasMore));
      setTimeout(scrollToBottom, 60);

      // Mark unread in list and navbar
      setConvs(prev => prev.map(item => item.id === c.id ? { ...item, unreadCount: 0 } : item));
      notifyUnreadUpdated();
    } catch {
      setMsgs([]);
      setHasMore(false);
    }
  };

  // Load older messages (pagination)
  const loadOlderMessages = async () => {
    if (!active || msgs.length === 0 || loadingOlder || !hasMore) return;
    const firstMsgId = msgs[0]?.id;
    if (!firstMsgId) return;

    setLoadingOlder(true);
    const scrollContainer = chatScrollContainerRef.current;
    const prevScrollHeight = scrollContainer ? scrollContainer.scrollHeight : 0;

    try {
      const r = await api.get(`/chat/${active.id}/messages`, {
        params: {
          beforeId: firstMsgId,
          size: 30,
        },
      });

      const olderList = Array.isArray(r.data) ? r.data : (r.data?.messages || []);
      const more = Boolean(r.data?.hasMore);
      setHasMore(more);

      if (olderList.length > 0) {
        // Prepend and deduplicate
        setMsgs(prev => {
          const existingIds = new Set(prev.map(m => m.id));
          const filteredOlder = olderList.filter((m: any) => !existingIds.has(m.id));
          return [...filteredOlder, ...prev];
        });

        // Restore scroll position
        setTimeout(() => {
          if (scrollContainer) {
            const newScrollHeight = scrollContainer.scrollHeight;
            scrollContainer.scrollTop = newScrollHeight - prevScrollHeight;
          }
        }, 30);
      }
    } catch {
      showToast('Không thể tải tin nhắn cũ hơn', true);
    } finally {
      setLoadingOlder(false);
    }
  };

  // Poll new messages
  const pollNewMessages = async () => {
    if (!active) return;
    try {
      const lastMsgId = msgs.length > 0 ? msgs[msgs.length - 1]?.id : null;
      if (lastMsgId) {
        const r = await api.get(`/chat/${active.id}/messages`, {
          params: { afterId: lastMsgId },
        });
        const newMsgs = Array.isArray(r.data) ? r.data : (r.data?.messages || []);
        if (newMsgs.length > 0) {
          setMsgs(prev => {
            const existingIds = new Set(prev.map(m => m.id));
            const fresh = newMsgs.filter((m: any) => !existingIds.has(m.id));
            return [...prev, ...fresh];
          });
          setTimeout(scrollToBottom, 60);
          notifyUnreadUpdated();
        }
      }
    } catch {}
  };

  // Send message
  const send = async () => {
    if (!active || !text.trim() || sending) return;
    if (active.isBlocked || active.isBlockedByMe || active.isBlockedByOther) {
      showToast('Không thể gửi tin nhắn do trạng thái chặn', true);
      return;
    }

    const content = text.trim();
    setText('');
    setSending(true);

    try {
      const r = await api.post(`/chat/${active.id}/messages`, { content, type: 'TEXT' });
      setMsgs(prev => [...prev, r.data]);
      setTimeout(scrollToBottom, 60);
      void loadConvs(active.id);
      notifyUnreadUpdated();
    } catch (e: any) {
      showToast(e.response?.data?.message || 'Không thể gửi tin nhắn', true);
    } finally {
      setSending(false);
    }
  };

  // Recall own message
  const handleRecallMessage = async (msgId: number) => {
    if (!window.confirm('Bạn có chắc muốn thu hồi tin nhắn này?')) return;
    try {
      await api.post(`/chat/messages/${msgId}/recall`);
      setMsgs(prev => prev.map(m => m.id === msgId ? { ...m, isRecalled: true, content: 'Tin nhắn đã được thu hồi.' } : m));
      showToast('Đã thu hồi tin nhắn');
    } catch (e: any) {
      showToast(e.response?.data?.message || 'Không thể thu hồi tin nhắn', true);
    }
  };

  // Mute / Unmute
  const handleToggleMute = async () => {
    if (!active) return;
    setHeaderMenuOpen(false);
    try {
      const res = await api.post(`/chat/${active.id}/mute`);
      const newMuted = Boolean(res.data?.isMuted);
      setActive((prev: any) => ({ ...prev, isMuted: newMuted }));
      setConvs(prev => prev.map(c => c.id === active.id ? { ...c, isMuted: newMuted } : c));
      showToast(newMuted ? 'Đã tắt thông báo cuộc trò chuyện này.' : 'Đã bật lại thông báo cuộc trò chuyện.');
    } catch (e: any) {
      showToast(e.response?.data?.message || 'Không thể thay đổi trạng thái thông báo', true);
    }
  };

  // Hide conversation
  const handleHide = async () => {
    if (!active) return;
    setHeaderMenuOpen(false);
    try {
      await api.post(`/chat/${active.id}/hide`);
      showToast('Đã ẩn cuộc trò chuyện khỏi danh sách.');
      setActive(null);
      void loadConvs();
    } catch (e: any) {
      showToast(e.response?.data?.message || 'Không thể ẩn cuộc trò chuyện', true);
    }
  };

  // Restore conversation
  const handleRestore = async (convId: number) => {
    try {
      await api.post(`/chat/${convId}/unhide`);
      showToast('Đã khôi phục cuộc trò chuyện.');
      void loadConvs();
    } catch (e: any) {
      showToast(e.response?.data?.message || 'Không thể khôi phục cuộc trò chuyện', true);
    }
  };

  // Mark as unread
  const handleMarkUnread = async () => {
    if (!active) return;
    setHeaderMenuOpen(false);
    try {
      await api.post(`/chat/${active.id}/unread`);
      showToast('Đã đánh dấu cuộc trò chuyện là chưa đọc.');
      setConvs(prev => prev.map(c => c.id === active.id ? { ...c, unreadCount: (c.unreadCount || 0) + 1 } : c));
      notifyUnreadUpdated();
    } catch (e: any) {
      showToast(e.response?.data?.message || 'Không thể đánh dấu chưa đọc', true);
    }
  };

  // Block / Unblock user
  const handleToggleBlock = async () => {
    if (!active) return;
    setHeaderMenuOpen(false);
    const isCurrentlyBlocked = active.isBlockedByMe;
    const confirmMsg = isCurrentlyBlocked
      ? `Bạn có chắc muốn bỏ chặn ${active.otherUserName}?`
      : `Bạn có chắc muốn chặn ${active.otherUserName}? Hai bạn sẽ không thể gửi tin nhắn cho nhau.`;

    if (!window.confirm(confirmMsg)) return;

    try {
      if (isCurrentlyBlocked) {
        await api.post(`/chat/unblock/${active.otherUserId}`);
        setActive((prev: any) => ({ ...prev, isBlockedByMe: false, isBlocked: Boolean(prev.isBlockedByOther) }));
        showToast(`Đã bỏ chặn ${active.otherUserName}.`);
      } else {
        await api.post(`/chat/block/${active.otherUserId}`, { reason: 'Người dùng chặn' });
        setActive((prev: any) => ({ ...prev, isBlockedByMe: true, isBlocked: true }));
        showToast(`Đã chặn ${active.otherUserName}.`);
      }
      void loadConvs(active.id);
    } catch (e: any) {
      showToast(e.response?.data?.message || 'Không thể cập nhật trạng thái chặn', true);
    }
  };

  // Open report modal
  const openReportModal = (type: 'MESSAGE' | 'USER', id: number) => {
    setHeaderMenuOpen(false);
    setReportTargetType(type);
    setReportTargetId(id);
    setReportReason('SPAM');
    setReportDetails('');
    setReportModalOpen(true);
  };

  // Submit report
  const submitReport = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!reportTargetId) return;
    setSubmittingReport(true);
    try {
      if (reportTargetType === 'MESSAGE') {
        await api.post(`/chat/messages/${reportTargetId}/report`, {
          reason: reportReason,
          description: reportDetails.trim(),
        });
      } else {
        await api.post(`/chat/users/${reportTargetId}/report`, {
          reason: reportReason,
          description: reportDetails.trim(),
        });
      }
      setReportModalOpen(false);
      showToast('Báo cáo đã được gửi thành công đến ban quản trị.');
    } catch (e: any) {
      showToast(e.response?.data?.message || 'Không thể gửi báo cáo', true);
    } finally {
      setSubmittingReport(false);
    }
  };

  // Initial load
  useEffect(() => {
    if (!user) {
      nav('/login');
      return;
    }
    void loadConvs();
  }, [tab, keyword]);

  // Polling interval
  useEffect(() => {
    if (!user) return;
    const interval = setInterval(() => {
      void pollNewMessages();
      void loadConvs(active?.id);
    }, 3000);
    return () => clearInterval(interval);
  }, [user?.id, active?.id, tab]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight">Hộp thư & Trò chuyện</h1>
        <p className="mt-1 text-sm text-gray-600">
          Trao đổi trực tiếp trên UniHome với chủ trọ, bạn cùng phòng hoặc người mua bán an toàn và minh bạch.
        </p>
      </div>

      <div className="bg-white border border-gray-200 rounded-2xl shadow-sm overflow-hidden grid grid-cols-1 md:grid-cols-[340px_1fr] min-h-[660px] max-h-[820px]">
        {/* Left column: Conversations list */}
        <div className="border-r border-gray-200 flex flex-col h-full bg-white">
          {/* Tabs header */}
          <div className="p-3 border-b border-gray-100 flex gap-1 bg-gray-50/70">
            <button
              type="button"
              onClick={() => setTab('ALL')}
              className={`flex-1 py-1.5 px-2 text-xs font-bold rounded-lg transition-colors text-center ${
                tab === 'ALL' ? 'bg-indigo-600 text-white shadow-xs' : 'text-gray-600 hover:bg-gray-200'
              }`}
            >
              Tất cả
            </button>
            <button
              type="button"
              onClick={() => setTab('UNREAD')}
              className={`flex-1 py-1.5 px-2 text-xs font-bold rounded-lg transition-colors text-center ${
                tab === 'UNREAD' ? 'bg-indigo-600 text-white shadow-xs' : 'text-gray-600 hover:bg-gray-200'
              }`}
            >
              Chưa đọc
            </button>
            <button
              type="button"
              onClick={() => setTab('HIDDEN')}
              className={`flex-1 py-1.5 px-2 text-xs font-bold rounded-lg transition-colors text-center ${
                tab === 'HIDDEN' ? 'bg-indigo-600 text-white shadow-xs' : 'text-gray-600 hover:bg-gray-200'
              }`}
            >
              Đã ẩn
            </button>
          </div>

          {/* Search box */}
          <div className="p-3 border-b border-gray-100">
            <div className="relative">
              <input
                type="text"
                value={keyword}
                onChange={e => setKeyword(e.target.value)}
                placeholder="Tìm người dùng hoặc nội dung..."
                className="w-full bg-gray-100 text-xs rounded-xl pl-8 pr-3 py-2 outline-none focus:ring-2 focus:ring-indigo-500 text-gray-900 placeholder-gray-400"
              />
              <span className="absolute left-2.5 top-2 text-xs text-gray-400">🔍</span>
              {keyword && (
                <button
                  type="button"
                  onClick={() => setKeyword('')}
                  className="absolute right-2.5 top-2 text-xs text-gray-400 hover:text-gray-600"
                >
                  ✕
                </button>
              )}
            </div>
          </div>

          {/* List items */}
          <div className="flex-1 overflow-y-auto divide-y divide-gray-100">
            {convs.map(c => {
              const otherAvatar = c.otherUserAvatar
                ? resolveMediaUrl(c.otherUserAvatar)
                : `https://ui-avatars.com/api/?name=${encodeURIComponent(c.otherUserName || 'User')}&background=6366f1&color=fff`;
              const isSelected = active?.id === c.id;
              const hasUnread = (c.unreadCount || 0) > 0;

              return (
                <div
                  key={c.id}
                  onClick={() => selectConversation(c)}
                  className={`w-full p-3.5 flex gap-3 text-left transition-colors relative cursor-pointer group ${
                    isSelected ? 'bg-indigo-50/70 border-l-4 border-indigo-600' : 'hover:bg-gray-50'
                  }`}
                >
                  <div className="relative shrink-0">
                    <img src={otherAvatar} alt="" className="w-12 h-12 rounded-full object-cover border border-gray-200" />
                    {hasUnread && (
                      <span className="absolute -top-1 -right-1 bg-red-500 text-white text-[10px] font-bold w-5 h-5 rounded-full flex items-center justify-center">
                        {c.unreadCount}
                      </span>
                    )}
                    {c.isMuted && (
                      <span className="absolute bottom-0 right-0 bg-gray-700 text-white text-[9px] w-4 h-4 rounded-full flex items-center justify-center" title="Đã tắt chuông">
                        🔕
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

                    <div className="mt-1 flex items-center justify-between gap-2">
                      {c.contextTitle ? (
                        <span className="text-[11px] text-indigo-600 truncate bg-indigo-50 px-2 py-0.5 rounded-md inline-block max-w-[180px]">
                          🏷 {c.contextTitle}
                        </span>
                      ) : <span />}

                      {tab === 'HIDDEN' && (
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            void handleRestore(c.id);
                          }}
                          className="text-[11px] font-bold text-indigo-600 hover:text-indigo-800 bg-white border border-indigo-200 px-2 py-0.5 rounded-md hover:bg-indigo-50 transition-colors shrink-0"
                        >
                          Khôi phục
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}

            {convs.length === 0 && (
              <div className="p-8 text-center text-xs text-gray-400">
                {tab === 'HIDDEN'
                  ? 'Không có cuộc trò chuyện nào bị ẩn.'
                  : tab === 'UNREAD'
                  ? 'Không có tin nhắn chưa đọc.'
                  : 'Chưa có cuộc trò chuyện nào. Bạn có thể bấm "Chat với chủ trọ" trên bất kỳ tin phòng nào để bắt đầu!'}
              </div>
            )}
          </div>
        </div>

        {/* Right column: Active conversation */}
        <div className="flex flex-col h-full bg-gray-50/50">
          {active ? (
            <>
              {/* Header */}
              <div className="p-3.5 border-b border-gray-200 bg-white flex flex-wrap justify-between items-center gap-3">
                <div className="flex items-center gap-3">
                  <img
                    src={
                      active.otherUserAvatar
                        ? resolveMediaUrl(active.otherUserAvatar)
                        : `https://ui-avatars.com/api/?name=${encodeURIComponent(active.otherUserName || 'User')}&background=6366f1&color=fff`
                    }
                    alt=""
                    className="w-10 h-10 rounded-full object-cover border"
                  />
                  <div>
                    <button
                      onClick={() => nav(`/users/${active.otherUserId}`)}
                      className="font-bold text-sm text-gray-900 hover:text-indigo-600 transition-colors flex items-center gap-1.5"
                    >
                      <span>{active.otherUserName}</span>
                      {active.isMuted && <span className="text-xs" title="Đã tắt thông báo">🔕</span>}
                    </button>
                    <span className="text-[11px] text-gray-400 block">
                      {active.otherUserRole === 'SUPER_ADMIN' || active.otherUserRole === 'ADMIN'
                        ? 'Quản trị viên UniHome'
                        : 'Người dùng UniHome'}
                    </span>
                  </div>
                </div>

                {/* Right controls: Context badge & Dropdown ⋮ */}
                <div className="flex items-center gap-2">
                  {active.contextTitle && (
                    <div
                      onClick={() => {
                        if (active.contextType === 'ROOM' || active.contextType === 'ROOM_MATCH') {
                          nav(`/property/${active.contextId}`);
                        } else if (active.contextType === 'SECOND_HAND') {
                          nav(`/secondhand/${active.contextId}`);
                        } else if (active.contextType === 'SERVICE') {
                          nav(`/services/${active.contextId}`);
                        }
                      }}
                      className="flex items-center gap-2 px-3 py-1.5 bg-gray-50 hover:bg-indigo-50 border border-gray-200 rounded-xl cursor-pointer transition-colors max-w-xs"
                      title="Xem bài đăng liên quan"
                    >
                      {active.contextImage && (
                        <img
                          src={resolveMediaUrl(active.contextImage)}
                          alt=""
                          className="w-8 h-8 rounded-lg object-cover"
                        />
                      )}
                      <div className="text-left min-w-0">
                        <div className="text-xs font-semibold text-gray-800 truncate max-w-[120px]">{active.contextTitle}</div>
                        {active.contextPrice && (
                          <div className="text-[11px] font-bold text-indigo-600">{money(active.contextPrice)}</div>
                        )}
                      </div>
                    </div>
                  )}

                  {/* ⋮ Header Dropdown Menu */}
                  <div className="relative" ref={menuRef}>
                    <button
                      type="button"
                      onClick={() => setHeaderMenuOpen(!headerMenuOpen)}
                      className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-xl transition-colors font-bold text-lg leading-none"
                      title="Tùy chọn cuộc trò chuyện"
                    >
                      ⋮
                    </button>

                    {headerMenuOpen && (
                      <div className="absolute right-0 mt-2 w-56 bg-white rounded-2xl shadow-xl border border-gray-100 py-1.5 z-50 animate-fade-in text-xs font-semibold divide-y divide-gray-50">
                        <div className="py-1">
                          <button
                            type="button"
                            onClick={() => {
                              setHeaderMenuOpen(false);
                              nav(`/users/${active.otherUserId}`);
                            }}
                            className="w-full text-left px-4 py-2 hover:bg-gray-50 text-gray-700 flex items-center gap-2.5"
                          >
                            <span>👤</span> Xem hồ sơ
                          </button>
                          <button
                            type="button"
                            onClick={handleMarkUnread}
                            className="w-full text-left px-4 py-2 hover:bg-gray-50 text-gray-700 flex items-center gap-2.5"
                          >
                            <span>📩</span> Đánh dấu chưa đọc
                          </button>
                        </div>

                        <div className="py-1">
                          <button
                            type="button"
                            onClick={handleToggleMute}
                            className="w-full text-left px-4 py-2 hover:bg-gray-50 text-gray-700 flex items-center gap-2.5"
                          >
                            <span>{active.isMuted ? '🔔' : '🔕'}</span>
                            {active.isMuted ? 'Bật thông báo' : 'Tắt thông báo'}
                          </button>
                          <button
                            type="button"
                            onClick={handleHide}
                            className="w-full text-left px-4 py-2 hover:bg-gray-50 text-gray-700 flex items-center gap-2.5"
                          >
                            <span>👁️</span> Xóa khỏi danh sách (Ẩn)
                          </button>
                        </div>

                        <div className="py-1">
                          <button
                            type="button"
                            onClick={handleToggleBlock}
                            className={`w-full text-left px-4 py-2 hover:bg-gray-50 flex items-center gap-2.5 ${
                              active.isBlockedByMe ? 'text-indigo-600 font-bold' : 'text-red-600'
                            }`}
                          >
                            <span>🚫</span>
                            {active.isBlockedByMe ? 'Bỏ chặn người dùng' : 'Chặn người dùng'}
                          </button>
                          <button
                            type="button"
                            onClick={() => openReportModal('USER', active.otherUserId)}
                            className="w-full text-left px-4 py-2 hover:bg-gray-50 text-amber-700 flex items-center gap-2.5"
                          >
                            <span>🚩</span> Báo cáo người dùng
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Toast notices */}
              {actionNotice && (
                <div className="px-4 py-2 bg-indigo-50 text-indigo-800 text-xs font-semibold border-b border-indigo-100 text-center animate-fade-in">
                  ✓ {actionNotice}
                </div>
              )}
              {actionError && (
                <div className="px-4 py-2 bg-red-50 text-red-800 text-xs font-semibold border-b border-red-100 text-center animate-fade-in">
                  ⚠ {actionError}
                </div>
              )}

              {/* Message bubbles container */}
              <div
                ref={chatScrollContainerRef}
                className="flex-1 p-5 space-y-3 overflow-y-auto"
              >
                {/* Load older button */}
                {hasMore && (
                  <div className="text-center py-1">
                    <button
                      type="button"
                      onClick={loadOlderMessages}
                      disabled={loadingOlder}
                      className="text-xs text-indigo-600 hover:text-indigo-800 bg-white border border-indigo-200 px-3.5 py-1.5 rounded-full shadow-xs hover:bg-indigo-50 transition-colors font-medium disabled:opacity-50"
                    >
                      {loadingOlder ? 'Đang tải tin cũ...' : '↑ Tải tin nhắn cũ hơn'}
                    </button>
                  </div>
                )}

                {msgs.map(m => {
                  const isMe = m.senderId === user?.id;
                  const isRecalled = m.isRecalled || m.content === 'Tin nhắn đã được thu hồi.';

                  return (
                    <div key={m.id} className={`flex ${isMe ? 'justify-end' : 'justify-start'} group`}>
                      <div
                        className={`max-w-[72%] px-4 py-2.5 rounded-2xl text-sm shadow-xs relative ${
                          isMe
                            ? 'bg-indigo-600 text-white rounded-br-xs'
                            : 'bg-white border border-gray-200 text-gray-900 rounded-bl-xs'
                        }`}
                      >
                        <div className={`whitespace-pre-wrap leading-relaxed ${isRecalled ? 'italic text-xs opacity-75' : ''}`}>
                          {m.content}
                        </div>

                        <div className={`text-[10px] mt-1 flex items-center justify-between gap-3 ${isMe ? 'text-indigo-100' : 'text-gray-400'}`}>
                          <span>
                            {m.sentAt
                              ? new Date(m.sentAt).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })
                              : ''}
                          </span>

                          <div className="flex items-center gap-2">
                            {isMe && !isRecalled && (
                              <button
                                type="button"
                                onClick={() => handleRecallMessage(m.id)}
                                className="opacity-0 group-hover:opacity-100 text-[10px] underline hover:text-white transition-opacity"
                              >
                                Thu hồi
                              </button>
                            )}

                            {!isMe && !isRecalled && (
                              <button
                                type="button"
                                onClick={() => openReportModal('MESSAGE', m.id)}
                                className="opacity-0 group-hover:opacity-100 text-[10px] text-gray-400 hover:text-red-500 transition-opacity"
                                title="Báo cáo tin nhắn này"
                              >
                                🚩 Báo cáo
                              </button>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
                <div ref={messagesEndRef} />
              </div>

              {/* Block status warning or input area */}
              {active.isBlockedByMe ? (
                <div className="p-4 border-t border-gray-200 bg-gray-50 flex items-center justify-between gap-3">
                  <div className="text-xs text-gray-600 font-medium">
                    🚫 Bạn đã chặn {active.otherUserName}. Bạn cần bỏ chặn để tiếp tục gửi tin nhắn.
                  </div>
                  <button
                    type="button"
                    onClick={handleToggleBlock}
                    className="text-xs font-bold bg-indigo-600 hover:bg-indigo-700 text-white px-3.5 py-2 rounded-xl transition-colors"
                  >
                    Bỏ chặn
                  </button>
                </div>
              ) : active.isBlockedByOther ? (
                <div className="p-4 border-t border-gray-200 bg-gray-50 text-center text-xs text-red-600 font-medium">
                  🚫 Bạn không thể gửi tin nhắn cho người dùng này do trạng thái chặn.
                </div>
              ) : (
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
              )}
            </>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center p-8 text-center text-gray-400 space-y-2">
              <span className="text-4xl">💬</span>
              <p className="text-sm font-medium">Chọn một cuộc trò chuyện từ danh sách bên trái để bắt đầu</p>
            </div>
          )}
        </div>
      </div>

      {/* Report Modal */}
      {reportModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-gray-100 animate-fade-in space-y-4">
            <div className="flex justify-between items-center border-b border-gray-100 pb-3">
              <h3 className="font-extrabold text-gray-900 text-base">
                {reportTargetType === 'MESSAGE' ? '🚩 Báo cáo tin nhắn' : '🚩 Báo cáo người dùng'}
              </h3>
              <button
                type="button"
                onClick={() => setReportModalOpen(false)}
                className="text-gray-400 hover:text-gray-600 text-lg font-bold"
              >
                ✕
              </button>
            </div>

            <form onSubmit={submitReport} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">Lý do báo cáo</label>
                <select
                  value={reportReason}
                  onChange={e => setReportReason(e.target.value)}
                  className="w-full border border-gray-300 rounded-xl px-3 py-2 text-xs outline-none focus:ring-2 focus:ring-indigo-500"
                >
                  <option value="SPAM">Tin nhắn rác / Spam</option>
                  <option value="SCAM">Lừa đảo / Đòi cọc đáng ngờ</option>
                  <option value="HARASSMENT">Quấy rối / Đe dọa / Khiếm nhã</option>
                  <option value="INAPPROPRIATE">Nội dung thô tục / Không phù hợp</option>
                  <option value="PERSONAL_INFORMATION">Tiết lộ thông tin cá nhân trái phép</option>
                  <option value="OTHER">Lý do khác</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">Chi tiết mô tả vi phạm</label>
                <textarea
                  rows={3}
                  value={reportDetails}
                  onChange={e => setReportDetails(e.target.value)}
                  placeholder="Vui lòng cung cấp thêm thông tin để ban quản trị xác minh nhanh chóng..."
                  className="w-full border border-gray-300 rounded-xl px-3 py-2 text-xs outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-gray-100">
                <button
                  type="button"
                  onClick={() => setReportModalOpen(false)}
                  className="px-4 py-2 border border-gray-300 text-gray-700 font-semibold rounded-xl text-xs hover:bg-gray-50"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  disabled={submittingReport}
                  className="px-5 py-2 bg-red-600 text-white font-bold rounded-xl text-xs hover:bg-red-700 disabled:opacity-50"
                >
                  {submittingReport ? 'Đang gửi...' : 'Gửi báo cáo'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
