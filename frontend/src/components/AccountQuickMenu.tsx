import { useEffect, useRef, useState } from 'react';
import type { MouseEvent as ReactMouseEvent } from 'react';
import { Link } from 'react-router-dom';
import { api, resolveMediaUrl } from '../lib/api';

interface AccountQuickMenuProps {
  user: any;
  onLogout: () => void;
}

export default function AccountQuickMenu({ user, onLogout }: AccountQuickMenuProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [rewardData, setRewardData] = useState<any>(null);
  const [walletBalance, setWalletBalance] = useState<number>(0);
  const [checkingIn, setCheckingIn] = useState(false);
  const [checkinMessage, setCheckinMessage] = useState<string | null>(null);
  const menuRef = useRef<HTMLDivElement>(null);

  const isLandlord = user?.role === 'LANDLORD';
  const isAdmin = ['ADMIN', 'SUPER_ADMIN', 'MODERATOR', 'VERIFIER', 'CONTENT_ADMIN', 'FINANCE_ADMIN'].includes(user?.role);

  const avatarSrc = user?.avatarUrl
    ? resolveMediaUrl(user.avatarUrl)
    : `https://ui-avatars.com/api/?name=${encodeURIComponent(user?.fullName || 'UniHome')}&background=random`;

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

  // Fetch balances when menu opens
  useEffect(() => {
    if (isOpen && user?.id) {
      void api.get('/rewards/account')
        .then((r) => setRewardData(r.data))
        .catch(() => {});

      void api.get('/payments/wallet')
        .then((r) => setWalletBalance(r.data?.balance || 0))
        .catch(() => {});
    }
  }, [isOpen, user?.id]);

  const handleCheckin = async (e: ReactMouseEvent) => {
    e.stopPropagation();
    if (checkingIn || !rewardData?.canCheckinToday) return;
    setCheckingIn(true);
    setCheckinMessage(null);
    try {
      const res = await api.post('/rewards/checkin');
      setCheckinMessage(res.data?.message || 'Điểm danh thành công!');
      // Refresh reward summary
      const accRes = await api.get('/rewards/account');
      setRewardData(accRes.data);
    } catch (err: any) {
      setCheckinMessage(err?.response?.data?.message || 'Không thể điểm danh lúc này');
    } finally {
      setCheckingIn(false);
    }
  };

  const formatCurrency = (val: number) => {
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(val);
  };

  return (
    <div className="relative" ref={menuRef}>
      {/* Avatar Trigger Button */}
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 p-1 rounded-full hover:ring-2 hover:ring-indigo-300 transition-all focus:outline-hidden"
        title={user?.fullName}
      >
        <img
          src={avatarSrc}
          alt={user?.fullName}
          className="w-9 h-9 rounded-full object-cover border-2 border-indigo-200 shadow-xs"
        />
      </button>

      {/* Quick Menu Dropdown Panel */}
      {isOpen && (
        <div className="absolute right-0 mt-2 w-80 bg-white rounded-3xl shadow-xl border border-gray-100 py-3 z-50 animate-fade-in divide-y divide-gray-100 text-sm">
          {/* User Info Header */}
          <div className="px-5 py-3">
            <div className="flex items-center gap-3">
              <img
                src={avatarSrc}
                alt={user?.fullName}
                className="w-12 h-12 rounded-full object-cover border border-gray-200 shadow-xs"
              />
              <div className="min-w-0 flex-1">
                <p className="font-bold text-gray-900 truncate">{user?.fullName}</p>
                <div className="flex items-center gap-2 mt-0.5">
                  <span className={`text-[10px] font-extrabold px-2 py-0.5 rounded-full ${
                    isAdmin
                      ? 'bg-purple-100 text-purple-700'
                      : isLandlord
                      ? 'bg-amber-100 text-amber-700'
                      : 'bg-indigo-100 text-indigo-700'
                  }`}>
                    {isAdmin ? 'Quản trị viên' : isLandlord ? 'Chủ trọ' : 'Khách thuê / SV'}
                  </span>
                </div>
                <p className="text-[11px] text-gray-400 truncate mt-1">{user?.email || user?.phone}</p>
              </div>
            </div>
          </div>

          {/* Wallets & Rewards Snapshot */}
          <div className="px-5 py-3 bg-gray-50/70 space-y-2.5">
            {/* UniHome Points & Check-in */}
            <div className="bg-white rounded-2xl p-3 border border-indigo-50 shadow-2xs">
              <div className="flex items-center justify-between">
                <div>
                  <span className="text-[11px] text-gray-500 font-medium">Điểm UniHome</span>
                  <div className="text-base font-extrabold text-indigo-600 flex items-center gap-1">
                    <span>💎</span> {rewardData?.balance ?? 500}
                  </div>
                </div>

                {rewardData?.canCheckinToday ? (
                  <button
                    type="button"
                    disabled={checkingIn}
                    onClick={handleCheckin}
                    className="bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold px-3 py-1.5 rounded-xl shadow-xs transition-all active:scale-95 disabled:opacity-50"
                  >
                    {checkingIn ? '...' : `Điểm danh (+${rewardData?.streakRewards?.[(rewardData?.streakDay || 1) - 1] ?? 20})`}
                  </button>
                ) : (
                  <div className="text-[11px] font-bold text-emerald-600 bg-emerald-50 px-2 py-1 rounded-lg border border-emerald-100">
                    ✓ Chuỗi {rewardData?.currentStreak || 1} ngày
                  </div>
                )}
              </div>

              {checkinMessage && (
                <p className="text-[11px] text-indigo-700 font-semibold mt-2 bg-indigo-50 p-1.5 rounded-lg text-center animate-fade-in">
                  {checkinMessage}
                </p>
              )}
            </div>

            {/* Wallet Balance */}
            <div className="flex items-center justify-between bg-white rounded-2xl p-3 border border-gray-100 shadow-2xs">
              <div>
                <span className="text-[11px] text-gray-500 font-medium">Số dư Ví UniHome</span>
                <p className="text-sm font-extrabold text-gray-900">{formatCurrency(walletBalance)}</p>
              </div>
              <Link
                to={isLandlord ? '/manager' : '/tenant/wallet'}
                onClick={() => setIsOpen(false)}
                className="text-xs font-bold text-indigo-600 hover:text-indigo-800 bg-indigo-50 px-2.5 py-1 rounded-lg border border-indigo-100 transition-colors"
              >
                Nạp ví →
              </Link>
            </div>

            {/* Vouchers Link */}
            <Link
              to="/rewards"
              onClick={() => setIsOpen(false)}
              className="flex items-center justify-between p-2 rounded-xl text-xs font-bold text-amber-700 bg-amber-50 hover:bg-amber-100/70 border border-amber-200/60 transition-colors"
            >
              <span className="flex items-center gap-1.5">
                <span>🎁</span> Đổi Voucher ưu đãi đối tác
              </span>
              <span>→</span>
            </Link>
          </div>

          {/* Quick Links */}
          <div className="py-2">
            <Link
              to={isLandlord ? '/manager/profile' : '/tenant/profile'}
              onClick={() => setIsOpen(false)}
              className="flex items-center gap-3 px-5 py-2 hover:bg-gray-50 text-gray-700 font-medium transition-colors"
            >
              <span>👤</span> Trang cá nhân & Cài đặt
            </Link>

            {isLandlord && (
              <Link
                to="/manager/posts"
                onClick={() => setIsOpen(false)}
                className="flex items-center gap-3 px-5 py-2 hover:bg-gray-50 text-gray-700 font-medium transition-colors"
              >
                <span>📋</span> Quản lý tin đăng
              </Link>
            )}

            {!isLandlord && (
              <>
                <Link
                  to="/tenant/favorites"
                  onClick={() => setIsOpen(false)}
                  className="flex items-center gap-3 px-5 py-2 hover:bg-gray-50 text-gray-700 font-medium transition-colors"
                >
                  <span>❤️</span> Danh sách phòng đã lưu
                </Link>
                <Link
                  to="/tenant/interests"
                  onClick={() => setIsOpen(false)}
                  className="flex items-center gap-3 px-5 py-2 hover:bg-gray-50 text-gray-700 font-medium transition-colors"
                >
                  <span>👀</span> Phòng trọ đang quan tâm
                </Link>
                <Link
                  to="/tenant/matching"
                  onClick={() => setIsOpen(false)}
                  className="flex items-center gap-3 px-5 py-2 hover:bg-gray-50 text-gray-700 font-medium transition-colors"
                >
                  <span>🤝</span> Hồ sơ tìm bạn cùng phòng
                </Link>
              </>
            )}

            <Link
              to="/rewards/my-vouchers"
              onClick={() => setIsOpen(false)}
              className="flex items-center gap-3 px-5 py-2 hover:bg-gray-50 text-gray-700 font-medium transition-colors"
            >
              <span>🎟</span> Voucher của tôi
            </Link>

            {isAdmin && (
              <Link
                to="/admin"
                onClick={() => setIsOpen(false)}
                className="flex items-center gap-3 px-5 py-2 hover:bg-gray-50 text-purple-700 font-bold transition-colors"
              >
                <span>⚡</span> Quản trị hệ thống (Admin)
              </Link>
            )}
          </div>

          {/* Logout */}
          <div className="py-2 px-5">
            <button
              type="button"
              onClick={() => {
                setIsOpen(false);
                onLogout();
              }}
              className="w-full flex items-center justify-center gap-2 py-2 px-4 rounded-xl text-xs font-bold text-red-600 bg-red-50 hover:bg-red-100 transition-colors"
            >
              Đăng xuất tài khoản
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
