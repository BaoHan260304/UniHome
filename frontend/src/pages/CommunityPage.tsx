import React, { useState, useEffect, useRef } from 'react';
import { api, getUser, resolveMediaUrl, getVipCosmeticStyle } from '../lib/api';
import { Link } from 'react-router-dom';
import PremiumProfilePopover from '../components/PremiumProfilePopover';

interface CommunityMsg {
  id: number;
  channelId?: number;
  userId: number;
  authorName: string;
  authorAvatar?: string | null;
  cosmeticStyle?: string | null;
  profileBadge?: string | null;
  profileFrame?: string | null;
  vipTier?: string | null;
  role?: string;
  messageType?: string;
  content: string;
  mediaUrl?: string | null;
  gifUrl?: string | null;
  stickerPackId?: number | null;
  stickerId?: number | null;
  createdAt: string;
  updatedAt?: string | null;
  replyToId?: number | null;
  replyToMessageId?: number | null;
  replyPreview?: {
    id: number;
    content: string;
    authorName: string;
  };
  reactions?: Record<string, number>;
  myReaction?: string | null;
}

interface StickerPack {
  id: number;
  name: string;
  thumbnailUrl: string;
  stickers: Array<{
    id: number;
    name: string;
    assetUrl: string;
  }>;
}

const REACTION_EMOJIS: Record<string, string> = {
  HEART: '❤️',
  LIKE: '👍',
  LAUGH: '😂',
  FIRE: '🔥',
  WOW: '😮',
  CRY: '😢'
};

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
  const [editingMsg, setEditingMsg] = useState<CommunityMsg | null>(null);
  const [editText, setEditText] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<CommunityMsg[] | null>(null);
  const [stickerPacks, setStickerPacks] = useState<StickerPack[]>([]);
  const [showStickerPicker, setShowStickerPicker] = useState(false);
  const [selectedPackId, setSelectedPackId] = useState<number | null>(null);
  const [onlineCount, setOnlineCount] = useState(1);
  const [unreadCount, setUnreadCount] = useState(0);
  const [notificationMode, setNotificationMode] = useState('MENTION_REPLY_ONLY');
  const [showSettingsModal, setShowSettingsModal] = useState(false);
  const [showSkinPickerModal, setShowSkinPickerModal] = useState(false);
  const [userDrawerId, setUserDrawerId] = useState<number | null>(null);
  const [userDrawerMessages, setUserDrawerMessages] = useState<CommunityMsg[]>([]);
  const [popoverUserId, setPopoverUserId] = useState<number | null>(null);
  const [activeReactionPickerId, setActiveReactionPickerId] = useState<number | null>(null);
  const chatBottomRef = useRef<HTMLDivElement>(null);
  const chatStreamRef = useRef<HTMLDivElement>(null);

  const scrollToChatBottom = (behavior: ScrollBehavior = 'smooth') => {
    if (chatStreamRef.current) {
      chatStreamRef.current.scrollTo({
        top: chatStreamRef.current.scrollHeight,
        behavior
      });
    }
  };

  const fetchMessages = async (isInitial = false) => {
    try {
      const [msgRes, previewRes] = await Promise.all([
        api.get('/community/messages?limit=250'),
        api.get('/community/preview')
      ]);
      if (msgRes.data?.messages) {
        setMessages(msgRes.data.messages);
        if (isInitial) {
          setTimeout(() => scrollToChatBottom('auto'), 80);
        }
      }
      if (previewRes.data) {
        setOnlineCount(previewRes.data.onlineCount || 1);
        setUnreadCount(previewRes.data.unreadCount || 0);
      }
    } catch (e: any) {
      if (isInitial) setError('Không thể tải tin nhắn cộng đồng.');
    } finally {
      if (isInitial) setLoading(false);
    }
  };

  useEffect(() => {
    void fetchMessages(true);
    // Fetch sticker packs
    api.get('/community/stickers/packs').then(r => {
      setStickerPacks(r.data || []);
      if (r.data?.length > 0) setSelectedPackId(r.data[0].id);
    }).catch(() => {});

    // Fetch user notification settings if logged in
    if (user) {
      api.get('/community/notifications/settings').then(r => {
        if (r.data?.mode) setNotificationMode(r.data.mode);
      }).catch(() => {});
    }

    const interval = setInterval(() => {
      void fetchMessages(false);
    }, 4000);
    return () => clearInterval(interval);
  }, []);

  // Update read state whenever messages load and user is at bottom
  useEffect(() => {
    if (user && messages.length > 0) {
      const newest = messages[messages.length - 1];
      void api.post('/community/read-state', { lastReadMessageId: newest.id });
    }
  }, [messages.length, user?.id]);

  const handleSend = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!user) {
      alert('Vui lòng đăng nhập để tham gia trò chuyện.');
      return;
    }
    const text = inputText.trim();
    if (!text) return;

    setSending(true);
    setError('');
    try {
      const payload: any = { messageType: 'TEXT', content: text };
      if (replyTarget) {
        payload.replyToId = replyTarget.id;
        payload.replyToMessageId = replyTarget.id;
      }
      const res = await api.post('/community/messages', payload);
      setMessages(prev => [...prev, res.data]);
      setInputText('');
      setReplyTarget(null);
      setTimeout(() => scrollToChatBottom('smooth'), 50);
    } catch (e: any) {
      setError(e.response?.data?.message || 'Không thể gửi tin nhắn.');
    } finally {
      setSending(false);
    }
  };

  const handleSendSticker = async (sticker: { id: number; packId?: number; assetUrl: string }) => {
    if (!user) return alert('Vui lòng đăng nhập để gửi nhãn dán.');
    setSending(true);
    setShowStickerPicker(false);
    try {
      const payload: any = {
        messageType: 'STICKER',
        content: `[Nhãn dán]`,
        mediaUrl: sticker.assetUrl,
        stickerPackId: selectedPackId,
        stickerId: sticker.id
      };
      if (replyTarget) payload.replyToId = replyTarget.id;
      const res = await api.post('/community/messages', payload);
      setMessages(prev => [...prev, res.data]);
      setReplyTarget(null);
      setTimeout(() => scrollToChatBottom('smooth'), 50);
    } catch (e: any) {
      setError(e.response?.data?.message || 'Không thể gửi nhãn dán.');
    } finally {
      setSending(false);
    }
  };

  const handleToggleReaction = async (msgId: number, reactionType: string) => {
    if (!user) return alert('Vui lòng đăng nhập để tương tác cảm xúc.');
    setActiveReactionPickerId(null);
    try {
      const res = await api.post(`/community/messages/${msgId}/reaction`, { reactionType });
      setMessages(prev => prev.map(m => {
        if (m.id !== msgId) return m;
        return {
          ...m,
          reactions: res.data.reactions?.counts || {},
          myReaction: res.data.reactions?.myReaction || null
        };
      }));
    } catch (e: any) {
      console.error(e);
    }
  };

  const handleSaveEdit = async () => {
    if (!editingMsg || !editText.trim()) return;
    try {
      const res = await api.put(`/community/messages/${editingMsg.id}`, { content: editText.trim() });
      setMessages(prev => prev.map(m => m.id === editingMsg.id ? { ...m, ...res.data } : m));
      setEditingMsg(null);
      setEditText('');
    } catch (e: any) {
      alert(e.response?.data?.message || 'Không thể sửa tin nhắn');
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

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchQuery.trim()) {
      setSearchResults(null);
      return;
    }
    try {
      const res = await api.get(`/community/search?q=${encodeURIComponent(searchQuery.trim())}`);
      setSearchResults(res.data || []);
    } catch (e) {
      setSearchResults([]);
    }
  };

  const openUserHistory = async (targetUserId: number) => {
    setUserDrawerId(targetUserId);
    try {
      const res = await api.get(`/community/users/${targetUserId}/messages`);
      setUserDrawerMessages(res.data || []);
    } catch (e) {
      setUserDrawerMessages([]);
    }
  };

  const saveNotificationSettings = async (mode: string) => {
    try {
      await api.put('/community/notifications/settings', { mode });
      setNotificationMode(mode);
      setShowSettingsModal(false);
      alert('Đã lưu cấu hình thông báo kênh.');
    } catch (e: any) {
      alert('Lỗi lưu cấu hình thông báo');
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

  const displayList = searchResults !== null ? searchResults : messages;

  return (
    <div className="max-w-6xl mx-auto py-6 px-4 sm:px-6 space-y-4 animate-fade-in">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-indigo-700 via-purple-700 to-indigo-900 rounded-3xl p-6 text-white shadow-xl flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-2xl">💬</span>
            <h1 className="text-2xl font-black tracking-tight">Tán gẫu UniHome (Community Lounge V2)</h1>
            <span className="bg-emerald-500/30 text-emerald-200 text-[10px] font-extrabold px-2.5 py-0.5 rounded-full border border-emerald-400/40 flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" /> TRỰC TIẾP
            </span>
            <span className="bg-white/10 text-white text-[11px] font-bold px-2.5 py-0.5 rounded-full">
              🟢 {onlineCount} đang online
            </span>
            {unreadCount > 0 && (
              <span className="bg-amber-400 text-gray-950 text-[11px] font-black px-2.5 py-0.5 rounded-full shadow-xs">
                {unreadCount} chưa đọc
              </span>
            )}
          </div>
          <p className="text-xs text-indigo-100 mt-1.5 max-w-2xl leading-relaxed">
            Sảnh sinh viên đa kênh: Trao đổi kinh nghiệm trọ, tìm bạn ở ghép, hỏi đường trường học, pass đồ và hỗ trợ tức thì!
          </p>
        </div>

        {/* Channel controls */}
        <div className="flex items-center gap-2 text-xs font-semibold self-end md:self-auto">
          {user && (
            <>
              <button
                type="button"
                onClick={() => setShowSkinPickerModal(true)}
                className="bg-white/10 hover:bg-white/20 px-3 py-2 rounded-xl border border-white/20 text-xs font-bold transition-colors flex items-center gap-1.5"
                title="Đổi phong cách hoạt ảnh VIP (Skin)"
              >
                <span>✨</span> Hiệu ứng VIP
              </button>
              <button
                type="button"
                onClick={() => setShowSettingsModal(true)}
                className="bg-white/10 hover:bg-white/20 px-3 py-2 rounded-xl border border-white/20 text-xs font-bold transition-colors flex items-center gap-1.5"
              >
                <span>🔔</span> Thông báo
              </button>
            </>
          )}
          <div className="bg-white/10 px-3.5 py-2 rounded-xl border border-white/20 text-xs font-bold">
            {messages.length} tin nhắn
          </div>
        </div>
      </div>

      {/* Search Bar */}
      <div className="bg-white p-3 rounded-2xl border border-gray-200 shadow-xs flex items-center justify-between gap-3">
        <form onSubmit={handleSearch} className="flex-1 flex items-center gap-2">
          <span className="text-gray-400 text-sm pl-2">🔍</span>
          <input
            type="text"
            placeholder="Tìm kiếm nội dung tin nhắn cộng đồng..."
            value={searchQuery}
            onChange={e => {
              setSearchQuery(e.target.value);
              if (!e.target.value.trim()) setSearchResults(null);
            }}
            className="flex-1 text-xs outline-none bg-transparent"
          />
          {searchQuery && (
            <button
              type="button"
              onClick={() => { setSearchQuery(''); setSearchResults(null); }}
              className="text-xs text-gray-400 hover:text-gray-600 px-2 font-bold"
            >
              ✕
            </button>
          )}
          <button
            type="submit"
            className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs px-4 py-2 rounded-xl transition-colors shadow-xs"
          >
            Tìm kiếm
          </button>
        </form>

        {searchResults !== null && (
          <div className="text-xs text-indigo-700 font-bold bg-indigo-50 px-3 py-1.5 rounded-xl border border-indigo-100">
            Kết quả: {searchResults.length} tin • <button onClick={() => setSearchResults(null)} className="underline hover:text-indigo-900">Xem tất cả</button>
          </div>
        )}
      </div>

      {error && (
        <div className="p-3 bg-red-50 border border-red-200 rounded-2xl text-red-700 text-xs font-bold">
          {error}
        </div>
      )}

      {/* Chat Container */}
      <div className="bg-white rounded-3xl shadow-xl border border-gray-100 flex flex-col h-[650px] overflow-hidden relative">
        {/* Messages Stream */}
        <div ref={chatStreamRef} className="flex-1 p-6 overflow-y-auto space-y-4 bg-gray-50/40">
          {loading ? (
            <div className="flex items-center justify-center h-full text-xs text-gray-400">
              Đang tải sảnh tán gẫu cộng đồng...
            </div>
          ) : displayList.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-center space-y-2">
              <span className="text-4xl">👋</span>
              <p className="text-sm font-bold text-gray-700">Chưa có ai nhắn tin hôm nay.</p>
              <p className="text-xs text-gray-400">Hãy là người đầu tiên mở lời chào cộng đồng UniHome!</p>
            </div>
          ) : (
            displayList.map((m) => {
              const isMe = user && m.userId === user.id;
              const isAdmin = user && ['ADMIN', 'SUPER_ADMIN', 'MODERATOR'].includes(user.role);
              const cosmetic = getVipCosmeticStyle(m.cosmeticStyle);

              return (
                <div
                  key={m.id}
                  className={`flex items-start gap-3 group ${isMe ? 'flex-row-reverse' : ''}`}
                >
                  {/* Avatar */}
                  <div className="relative shrink-0">
                    <button
                      onClick={() => setPopoverUserId(m.userId)}
                      className="hover:opacity-90 block"
                      title="Xem hồ sơ nổi bật"
                    >
                      {m.authorAvatar ? (
                        <img
                          src={resolveMediaUrl(m.authorAvatar)}
                          alt={m.authorName}
                          className={`w-10 h-10 rounded-2xl object-cover border-2 shadow-xs ${cosmetic.glowClass}`}
                        />
                      ) : (
                        <div className={`w-10 h-10 rounded-2xl bg-gradient-to-tr from-indigo-500 to-purple-500 text-white font-black text-sm flex items-center justify-center shadow-xs ${cosmetic.glowClass}`}>
                          {m.authorName ? m.authorName.charAt(0).toUpperCase() : 'U'}
                        </div>
                      )}
                    </button>
                  </div>

                  {/* Message Bubble */}
                  <div className={`max-w-[75%] space-y-1 ${isMe ? 'items-end text-right' : ''}`}>
                    {/* Author Meta */}
                    <div className={`flex items-center gap-1.5 text-xs ${isMe ? 'justify-end' : ''}`}>
                      <button
                        onClick={() => setPopoverUserId(m.userId)}
                        className={`font-black hover:underline ${cosmetic.textClass}`}
                      >
                        {m.authorName}
                      </button>
                      {m.role === 'ADMIN' && (
                        <span className="bg-purple-100 text-purple-800 text-[9px] font-black px-1.5 py-0.2 rounded-md border border-purple-200">
                          ADMIN
                        </span>
                      )}
                      <span className="text-[10px] text-gray-400 font-medium">
                        {formatTime(m.createdAt)}
                      </span>
                      {m.updatedAt && (
                        <span className="text-[9px] text-gray-400 italic">(đã sửa)</span>
                      )}
                    </div>

                    {/* Replied Preview */}
                    {m.replyPreview && (
                      <div className={`text-[11px] p-2 rounded-xl border bg-gray-100/70 text-gray-600 mb-1 ${isMe ? 'border-indigo-100 text-left' : 'border-gray-200'}`}>
                        <span className="font-bold text-gray-800">@{m.replyPreview.authorName}: </span>
                        <span>{m.replyPreview.content}</span>
                      </div>
                    )}

                    {/* Bubble Content according to Message Type */}
                    {m.messageType === 'STICKER' && m.mediaUrl ? (
                      <div className={`p-2 rounded-2xl ${cosmetic.bubbleClass}`}>
                        <img
                          src={resolveMediaUrl(m.mediaUrl)}
                          alt="Sticker"
                          className="w-32 h-32 object-contain hover:scale-105 transition-transform"
                        />
                      </div>
                    ) : m.messageType === 'IMAGE' && m.mediaUrl ? (
                      <div className={`p-1 rounded-2xl overflow-hidden max-w-sm ${cosmetic.bubbleClass}`}>
                        <img
                          src={resolveMediaUrl(m.mediaUrl)}
                          alt="Attachment"
                          className="rounded-xl max-h-60 object-cover border"
                        />
                      </div>
                    ) : (
                      <div
                        className={`p-3.5 rounded-2xl text-xs leading-relaxed break-words shadow-2xs ${
                          isMe
                            ? `bg-indigo-600 text-white rounded-tr-none ${cosmetic.bubbleClass}`
                            : `bg-white text-gray-800 border border-gray-100 rounded-tl-none ${cosmetic.bubbleClass}`
                        }`}
                      >
                        {m.content}
                      </div>
                    )}

                    {/* Reactions Bar */}
                    {m.reactions && Object.keys(m.reactions).length > 0 && (
                      <div className={`flex items-center gap-1.5 flex-wrap pt-0.5 ${isMe ? 'justify-end' : ''}`}>
                        {Object.entries(m.reactions).map(([rType, cnt]) => {
                          const isMine = m.myReaction === rType;
                          return (
                            <button
                              key={rType}
                              onClick={() => handleToggleReaction(m.id, rType)}
                              className={`text-[11px] px-2 py-0.5 rounded-full border flex items-center gap-1 transition-transform active:scale-90 ${
                                isMine
                                  ? 'bg-indigo-50 border-indigo-300 text-indigo-700 font-bold'
                                  : 'bg-white border-gray-200 text-gray-600 hover:bg-gray-50'
                              }`}
                            >
                              <span>{REACTION_EMOJIS[rType] || '👍'}</span>
                              <span>{cnt}</span>
                            </button>
                          );
                        })}
                      </div>
                    )}

                    {/* Quick Actions (Reactions, Reply, Edit, Delete, Report) */}
                    <div className={`flex items-center gap-2 pt-0.5 text-[10px] text-gray-400 opacity-0 group-hover:opacity-100 transition-opacity ${isMe ? 'justify-end' : ''}`}>
                      {/* Reaction Picker Button */}
                      <div className="relative">
                        <button
                          type="button"
                          onClick={() => setActiveReactionPickerId(activeReactionPickerId === m.id ? null : m.id)}
                          className="hover:text-amber-500 font-bold"
                          title="Bày tỏ cảm xúc"
                        >
                          😃 Thả tim
                        </button>
                        {activeReactionPickerId === m.id && (
                          <div className="absolute bottom-6 left-0 bg-white rounded-full shadow-lg border p-1 flex items-center gap-1 z-30 animate-fade-in">
                            {Object.entries(REACTION_EMOJIS).map(([type, emo]) => (
                              <button
                                key={type}
                                onClick={() => handleToggleReaction(m.id, type)}
                                className="hover:scale-125 transition-transform p-1 text-sm"
                              >
                                {emo}
                              </button>
                            ))}
                          </div>
                        )}
                      </div>

                      <button
                        type="button"
                        onClick={() => setReplyTarget(m)}
                        className="hover:text-indigo-600 font-semibold"
                      >
                        Trả lời
                      </button>

                      <button
                        type="button"
                        onClick={() => openUserHistory(m.userId)}
                        className="hover:text-indigo-600 font-semibold"
                        title="Xem lịch sử chat công khai của thành viên này"
                      >
                        Lịch sử
                      </button>

                      {isMe && (
                        <button
                          type="button"
                          onClick={() => { setEditingMsg(m); setEditText(m.content); }}
                          className="hover:text-indigo-600 font-semibold"
                        >
                          Sửa
                        </button>
                      )}

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

        {/* Sticker Picker Drawer */}
        {showStickerPicker && (
          <div className="p-4 bg-white border-t border-gray-200 space-y-3 max-h-60 overflow-y-auto">
            <div className="flex items-center justify-between">
              <div className="flex gap-2 overflow-x-auto pb-1">
                {stickerPacks.map(p => (
                  <button
                    key={p.id}
                    onClick={() => setSelectedPackId(p.id)}
                    className={`px-3 py-1 text-xs font-bold rounded-xl whitespace-nowrap ${
                      selectedPackId === p.id ? 'bg-indigo-600 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    {p.name}
                  </button>
                ))}
              </div>
              <button onClick={() => setShowStickerPicker(false)} className="text-gray-400 font-bold text-xs">✕ Đóng</button>
            </div>

            <div className="grid grid-cols-4 sm:grid-cols-6 gap-3">
              {stickerPacks.find(p => p.id === selectedPackId)?.stickers.map(st => (
                <button
                  key={st.id}
                  onClick={() => handleSendSticker(st)}
                  className="p-2 border rounded-xl hover:bg-indigo-50 hover:border-indigo-200 transition-all text-center flex flex-col items-center group"
                >
                  <img src={resolveMediaUrl(st.assetUrl)} alt={st.name} className="w-14 h-14 object-contain group-hover:scale-110 transition-transform" />
                  <span className="text-[10px] text-gray-500 mt-1 truncate max-w-full">{st.name}</span>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Input Bar */}
        <form onSubmit={handleSend} className="p-4 bg-white border-t border-gray-100 flex items-center gap-2">
          {/* Sticker picker toggle */}
          <button
            type="button"
            onClick={() => setShowStickerPicker(!showStickerPicker)}
            className="p-2 text-gray-500 hover:text-indigo-600 hover:bg-gray-100 rounded-xl transition-colors text-base"
            title="Gửi nhãn dán UniHome"
          >
            🐼
          </button>

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

      {/* Edit Message Modal */}
      {editingMsg && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-fade-in">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 space-y-4 shadow-2xl border border-gray-100">
            <h3 className="font-extrabold text-sm text-gray-900">Chỉnh sửa tin nhắn</h3>
            <textarea
              rows={3}
              value={editText}
              onChange={e => setEditText(e.target.value)}
              className="w-full text-xs border rounded-2xl p-3 outline-none focus:ring-2 focus:ring-indigo-500"
            />
            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setEditingMsg(null)}
                className="text-xs font-bold px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-xl"
              >
                Hủy
              </button>
              <button
                type="button"
                onClick={handleSaveEdit}
                className="text-xs font-black px-4 py-2 bg-indigo-600 text-white hover:bg-indigo-700 rounded-xl shadow-xs"
              >
                Lưu chỉnh sửa
              </button>
            </div>
          </div>
        </div>
      )}

      {/* User Public History Drawer */}
      {userDrawerId && (
        <div className="fixed inset-0 z-50 flex justify-end bg-black/40 backdrop-blur-xs animate-fade-in">
          <div className="bg-white w-full max-w-md h-full p-6 space-y-4 shadow-2xl overflow-y-auto flex flex-col justify-between">
            <div className="space-y-4">
              <div className="flex justify-between items-center border-b pb-3">
                <div>
                  <h3 className="font-extrabold text-base text-gray-900">Lịch sử chat công khai</h3>
                  <p className="text-xs text-gray-500">Người dùng #{userDrawerId}</p>
                </div>
                <button onClick={() => setUserDrawerId(null)} className="text-gray-400 hover:text-gray-600 font-bold text-lg">✕</button>
              </div>

              <div className="space-y-2.5">
                {userDrawerMessages.map(dm => (
                  <div key={dm.id} className="p-3 bg-gray-50 rounded-2xl border border-gray-100 text-xs space-y-1">
                    <div className="text-[10px] text-gray-400">{formatTime(dm.createdAt)}</div>
                    <div className="text-gray-800">{dm.content}</div>
                  </div>
                ))}
                {!userDrawerMessages.length && (
                  <div className="text-center text-xs text-gray-400 py-12">Chưa có tin nhắn công khai nào.</div>
                )}
              </div>
            </div>

            <div className="pt-4 border-t">
              <Link
                to={`/users/${userDrawerId}`}
                className="w-full block text-center bg-indigo-50 text-indigo-700 hover:bg-indigo-100 font-bold text-xs py-2.5 rounded-xl border border-indigo-200 transition-colors"
              >
                Xem trang cá nhân đầy đủ →
              </Link>
            </div>
          </div>
        </div>
      )}

      {/* Notification Settings Modal */}
      {showSettingsModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-fade-in">
          <div className="bg-white rounded-3xl max-w-sm w-full p-6 space-y-4 shadow-2xl border border-gray-100">
            <h3 className="font-extrabold text-base text-gray-900">Cài đặt thông báo Tán gẫu</h3>
            <div className="space-y-2 text-xs">
              {[
                { key: 'ALL_MESSAGES', label: 'Tất cả tin nhắn mới' },
                { key: 'MENTION_REPLY_ONLY', label: 'Chỉ khi được nhắc tên (@) hoặc trả lời' },
                { key: 'IMPORTANT_ONLY', label: 'Chỉ tin quan trọng từ Admin' },
                { key: 'FULL_MUTE', label: 'Tắt toàn bộ thông báo kênh' }
              ].map(opt => (
                <label key={opt.key} className="flex items-center gap-2 p-2.5 rounded-xl border hover:bg-gray-50 cursor-pointer">
                  <input
                    type="radio"
                    name="mode"
                    checked={notificationMode === opt.key}
                    onChange={() => saveNotificationSettings(opt.key)}
                  />
                  <span className="font-semibold text-gray-800">{opt.label}</span>
                </label>
              ))}
            </div>
            <div className="flex justify-end pt-2">
              <button
                type="button"
                onClick={() => setShowSettingsModal(false)}
                className="text-xs font-bold px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-xl"
              >
                Đóng
              </button>
            </div>
          </div>
        </div>
      )}

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

      {/* VIP Skin Picker Modal */}
      {showSkinPickerModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-fade-in">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 space-y-4 shadow-2xl border border-gray-100">
            <div className="flex items-center justify-between border-b pb-3">
              <div>
                <h3 className="font-extrabold text-base text-gray-900 flex items-center gap-2">
                  <span>✨</span> Bộ sưu tập Skin hoạt ảnh VIP (8 Skins)
                </h3>
                <p className="text-xs text-gray-500 mt-0.5">
                  Đổi phong cách viền sáng, chữ đổi màu và hoạt ảnh khung chat chuyển động mượt mà.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setShowSkinPickerModal(false)}
                className="text-gray-400 hover:text-gray-600 font-bold text-lg"
              >
                ✕
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-h-[380px] overflow-y-auto p-1">
              {[
                { id: 'NEON_VIOLET', name: 'Tím Neon Cyberpunk', desc: 'Viền hồng tím chuyển sắc, ánh sáng neon rực rỡ', previewClass: 'vip-name-neon', bubbleClass: 'vip-bubble-neon' },
                { id: 'AURORA', name: 'Cực quang phương Bắc', desc: 'Dải cực quang xanh ngọc, lục bảo chuyển động nhẹ', previewClass: 'vip-name-aurora', bubbleClass: 'vip-bubble-aurora' },
                { id: 'SUNSET_GOLD', name: 'Hoàng hôn dát vàng', desc: 'Sắc cam ấm, hổ phách, hoàng hôn rực rỡ', previewClass: 'vip-name-sunset', bubbleClass: 'vip-bubble-sunset' },
                { id: 'CRIMSON_EDGE', name: 'Đỏ hồng thạch lựu', desc: 'Viền ruby nhịp thở đỏ thẫm uy lực', previewClass: 'vip-name-crimson', bubbleClass: 'vip-bubble-crimson' },
                { id: 'ICE_BLUE', name: 'Băng thanh hàn ngọc', desc: 'Xanh băng tuyết, ánh lướt cạnh tinh thể', previewClass: 'vip-name-ice', bubbleClass: 'vip-bubble-ice' },
                { id: 'HOLOGRAPHIC', name: 'Lăng kính Hologram', desc: 'Quang phổ đa sắc chuyển động lăng kính', previewClass: 'vip-name-holographic', bubbleClass: 'vip-bubble-holographic' },
                { id: 'SAKURA_BLOOM', name: 'Hoa anh đào nở', desc: 'Cánh hoa anh đào rơi/xoay trôi quanh khung chat', previewClass: 'vip-name-sakura', bubbleClass: 'vip-bubble-sakura' },
                { id: 'THUNDER_STRIKE', name: 'Tia chớp hoàng kim', desc: 'Tia sét điện quang vàng chạy dọc viền chat', previewClass: 'vip-name-thunder', bubbleClass: 'vip-bubble-thunder' }
              ].map(skin => (
                <div
                  key={skin.id}
                  onClick={async () => {
                    try {
                      await api.put('/users/cosmetic-style', { cosmeticStyle: skin.id });
                      setShowSkinPickerModal(false);
                      await fetchMessages();
                      alert(`Đã kích hoạt Skin hoạt ảnh: ${skin.name}`);
                    } catch (e: any) {
                      alert('Không thể cập nhật phong cách hoạt ảnh lúc này');
                    }
                  }}
                  className={`p-3 rounded-2xl border cursor-pointer hover:scale-[1.02] transition-all flex flex-col justify-between gap-2 ${skin.bubbleClass}`}
                >
                  <div>
                    <p className={`text-xs font-black ${skin.previewClass}`}>
                      {skin.name}
                    </p>
                    <p className="text-[10px] text-gray-500 mt-1 leading-relaxed">
                      {skin.desc}
                    </p>
                  </div>
                  <span className="text-[10px] font-bold text-indigo-600 bg-white/80 self-end px-2 py-0.5 rounded-lg border border-indigo-100 shadow-2xs">
                    Áp dụng →
                  </span>
                </div>
              ))}
            </div>

            <div className="flex justify-end pt-2 border-t">
              <button
                type="button"
                onClick={() => setShowSkinPickerModal(false)}
                className="text-xs font-bold px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-xl"
              >
                Đóng
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Premium Profile Popover Modal */}
      {popoverUserId && (
        <PremiumProfilePopover
          userId={popoverUserId}
          isOpen={Boolean(popoverUserId)}
          onClose={() => setPopoverUserId(null)}
        />
      )}
    </div>
  );
}
