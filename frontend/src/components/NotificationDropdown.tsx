import { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../lib/api';

interface NotificationDropdownProps {
  user: any;
  unreadCount: number;
  onRefreshCount: () => void;
}

export default function NotificationDropdown({ user, unreadCount, onRefreshCount }: NotificationDropdownProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<'activity' | 'news'>('activity');
  const [notifications, setNotifications] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  const isLandlord = user?.role === 'LANDLORD';
  const fullPageUrl = isLandlord ? '/manager/notifications' : '/tenant/notifications';

  // Close on outside click
  useEffect(() => {
    const handleOutsideClick = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    if (isOpen) {
      document.addEventListener('mousedown', handleOutsideClick);
    }
    return () => document.removeEventListener('mousedown', handleOutsideClick);
  }, [isOpen]);

  useEffect(() => {
    if (isOpen && user?.id) {
      setLoading(true);
      void api.get('/notifications/mine')
        .then((r) => setNotifications(r.data || []))
        .catch(() => setNotifications([]))
        .finally(() => setLoading(false));
    }
  }, [isOpen, user?.id]);

  const markAllAsRead = async () => {
    try {
      const unreadList = notifications.filter((n) => n.status === 'UNREAD');
      await Promise.all(unreadList.map((n) => api.post(`/notifications/${n.id}/read`)));
      setNotifications((prev) => prev.map((n) => ({ ...n, status: 'READ' })));
      onRefreshCount();
    } catch {}
  };

  const markSingleAsRead = async (id: number) => {
    try {
      await api.post(`/notifications/${id}/read`);
      setNotifications((prev) => prev.map((n) => (n.id === id ? { ...n, status: 'READ' } : n)));
      onRefreshCount();
    } catch {}
  };

  // Filter by tab
  const activityTypes = ['INTEREST', 'MATCHING', 'CHAT', 'MESSAGE', 'LISTING_APPROVED', 'LISTING_REJECTED'];
  const filteredList = notifications.filter((n) => {
    const isActivity = activityTypes.includes(n.type?.toUpperCase());
    return activeTab === 'activity' ? isActivity : !isActivity;
  });

  return (
    <div className="relative" ref={menuRef}>
      {/* Bell Icon Trigger */}
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2 text-gray-600 hover:text-indigo-600 rounded-full hover:bg-gray-100 transition-colors focus:outline-hidden"
        title="Thông báo"
      >
        <span className="text-lg">🔔</span>
        {unreadCount > 0 && (
          <span className="absolute top-1 right-1 bg-red-500 text-white text-[10px] font-bold px-1.5 py-0.2 rounded-full min-w-4 text-center">
            {unreadCount > 99 ? '99+' : unreadCount}
          </span>
        )}
      </button>

      {/* Dropdown Panel */}
      {isOpen && (
        <div className="absolute right-0 mt-2 w-88 bg-white rounded-3xl shadow-xl border border-gray-100 py-3 z-50 animate-fade-in divide-y divide-gray-100 text-sm">
          {/* Header */}
          <div className="px-5 py-2.5 flex items-center justify-between">
            <h3 className="font-extrabold text-gray-900 text-sm">Thông báo</h3>
            {notifications.some((n) => n.status === 'UNREAD') && (
              <button
                type="button"
                onClick={markAllAsRead}
                className="text-[11px] font-bold text-indigo-600 hover:text-indigo-800 transition-colors"
              >
                Đánh dấu đã đọc
              </button>
            )}
          </div>

          {/* Tabs */}
          <div className="px-5 pt-2 flex gap-4 text-xs font-bold border-b border-gray-100">
            <button
              type="button"
              onClick={() => setActiveTab('activity')}
              className={`pb-2 transition-colors border-b-2 ${
                activeTab === 'activity'
                  ? 'border-indigo-600 text-indigo-600'
                  : 'border-transparent text-gray-400 hover:text-gray-700'
              }`}
            >
              Hoạt động
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('news')}
              className={`pb-2 transition-colors border-b-2 ${
                activeTab === 'news'
                  ? 'border-indigo-600 text-indigo-600'
                  : 'border-transparent text-gray-400 hover:text-gray-700'
              }`}
            >
              Tin tức & Ưu đãi
            </button>
          </div>

          {/* List Content */}
          <div className="max-h-80 overflow-y-auto divide-y divide-gray-50">
            {loading ? (
              <div className="py-8 text-center text-xs text-gray-400">Đang tải thông báo...</div>
            ) : filteredList.length === 0 ? (
              <div className="py-8 text-center text-xs text-gray-400">
                Chưa có thông báo nào trong mục này
              </div>
            ) : (
              filteredList.slice(0, 8).map((n) => {
                const isUnread = n.status === 'UNREAD';
                return (
                  <div
                    key={n.id}
                    onClick={() => isUnread && markSingleAsRead(n.id)}
                    className={`px-5 py-3 hover:bg-gray-50 transition-colors cursor-pointer flex gap-3 items-start ${
                      isUnread ? 'bg-indigo-50/40' : ''
                    }`}
                  >
                    <span className="text-base mt-0.5">
                      {n.type === 'MATCHING'
                        ? '🤝'
                        : n.type === 'CHAT' || n.type === 'MESSAGE'
                        ? '💬'
                        : n.type === 'INTEREST'
                        ? '👀'
                        : n.type === 'PACKAGE_ACTIVE'
                        ? '⭐'
                        : '📢'}
                    </span>
                    <div className="flex-1 min-w-0">
                      <p className={`text-xs leading-relaxed ${isUnread ? 'font-bold text-gray-900' : 'text-gray-600'}`}>
                        {n.message}
                      </p>
                      <span className="text-[10px] text-gray-400 mt-1 block">
                        {n.createdAt ? new Date(n.createdAt).toLocaleDateString('vi-VN') : 'Vừa xong'}
                      </span>
                    </div>
                    {isUnread && <span className="w-2 h-2 rounded-full bg-indigo-600 mt-1.5 shrink-0"></span>}
                  </div>
                );
              })
            )}
          </div>

          {/* Footer View All */}
          <div className="px-5 py-2.5 text-center bg-gray-50/50">
            <Link
              to={fullPageUrl}
              onClick={() => setIsOpen(false)}
              className="text-xs font-bold text-indigo-600 hover:text-indigo-800 transition-colors"
            >
              Xem tất cả thông báo →
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}
