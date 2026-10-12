import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { api, getUser, resolveMediaUrl, getVipCosmeticStyle } from '../lib/api';

export interface PopoverUserData {
  id: number;
  fullName: string;
  avatarUrl?: string;
  coverUrl?: string;
  bio?: string;
  role?: string;
  schoolName?: string;
  followers?: number;
  following?: number;
  isFollowing?: boolean;
  vipTier?: string;
  cosmeticStyle?: string;
  activeListingsCount?: number;
}

interface Props {
  userId: number;
  isOpen: boolean;
  onClose: () => void;
  position?: { top: number; left: number };
  initialData?: Partial<PopoverUserData>;
}

export default function PremiumProfilePopover({
  userId,
  isOpen,
  onClose,
  initialData
}: Props) {
  const nav = useNavigate();
  const currentUser = getUser();
  const [profile, setProfile] = useState<PopoverUserData | null>(null);
  const [loading, setLoading] = useState(true);
  const [isFollowing, setIsFollowing] = useState(false);
  const [followerCount, setFollowerCount] = useState(0);
  const [followLoading, setFollowLoading] = useState(false);

  const isMe = currentUser && Number(currentUser.id) === Number(userId);
  const isAdminTarget = profile?.role && ['ADMIN', 'SUPER_ADMIN', 'MODERATOR'].includes(profile.role);

  useEffect(() => {
    if (!isOpen || !userId) return;

    let mounted = true;
    setLoading(true);

    api.get(`/users/${userId}/public`)
      .then(res => {
        if (!mounted) return;
        const d = res.data;
        const activeCount = Array.isArray(d.listings)
          ? d.listings.filter((l: any) => l.status === 'ACTIVE').length
          : 0;

        setProfile({
          id: d.id,
          fullName: d.fullName,
          avatarUrl: d.avatarUrl,
          coverUrl: d.coverUrl,
          bio: d.bio,
          role: d.role,
          schoolName: d.schoolName,
          followers: d.followers || 0,
          following: d.following || 0,
          isFollowing: Boolean(d.isFollowing),
          vipTier: d.vipTier,
          cosmeticStyle: d.cosmeticStyle || 'DEFAULT',
          activeListingsCount: activeCount
        });
        setIsFollowing(Boolean(d.isFollowing));
        setFollowerCount(d.followers || 0);
      })
      .catch(() => {
        if (!mounted) return;
        if (initialData) {
          setProfile({
            id: userId,
            fullName: initialData.fullName || 'Người dùng UniHome',
            avatarUrl: initialData.avatarUrl,
            bio: initialData.bio,
            role: initialData.role || 'USER',
            followers: 0,
            following: 0,
            isFollowing: false,
            cosmeticStyle: initialData.cosmeticStyle || 'DEFAULT',
            activeListingsCount: 0
          });
        }
      })
      .finally(() => {
        if (mounted) setLoading(false);
      });

    return () => {
      mounted = false;
    };
  }, [isOpen, userId]);

  if (!isOpen) return null;

  const vipCosmetics = getVipCosmeticStyle(profile?.cosmeticStyle);

  const handleFollowToggle = async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!currentUser) {
      nav('/login');
      return;
    }
    if (followLoading) return;
    setFollowLoading(true);
    try {
      const res = await api.post(`/users/${userId}/follow`);
      setIsFollowing(Boolean(res.data.following));
      if (typeof res.data.followers === 'number') {
        setFollowerCount(res.data.followers);
      } else {
        setFollowerCount(prev => (res.data.following ? prev + 1 : Math.max(0, prev - 1)));
      }
    } catch (e: any) {
      alert(e.response?.data?.message || 'Không thể thực hiện theo dõi');
    } finally {
      setFollowLoading(false);
    }
  };

  const handleDirectMessage = (e: React.MouseEvent) => {
    e.stopPropagation();
    onClose();
    if (!currentUser) {
      nav('/login');
      return;
    }
    nav(`/chat?partnerId=${userId}`);
  };

  const handleViewFullProfile = (e: React.MouseEvent) => {
    e.stopPropagation();
    onClose();
    nav(`/users/${userId}`);
  };

  const handleEditProfile = (e: React.MouseEvent) => {
    e.stopPropagation();
    onClose();
    nav('/profile');
  };

  const handleReportUser = (e: React.MouseEvent) => {
    e.stopPropagation();
    alert(`Đã gửi yêu cầu kiểm tra tài khoản #${userId} tới Đội ngũ Quản trị.`);
    onClose();
  };

  // Cover image fallback gradient based on VIP style
  const defaultBannerGradient = {
    NEON_VIOLET: 'from-purple-900 via-indigo-900 to-pink-900',
    AURORA: 'from-emerald-900 via-teal-900 to-cyan-900',
    SUNSET_GOLD: 'from-amber-900 via-orange-900 to-rose-900',
    CRIMSON_EDGE: 'from-rose-950 via-red-900 to-neutral-900',
    ICE_BLUE: 'from-cyan-950 via-sky-900 to-blue-900',
    HOLOGRAPHIC: 'from-fuchsia-950 via-purple-900 to-indigo-950',
    SAKURA_BLOOM: 'from-pink-950 via-rose-900 to-stone-900',
    THUNDER_STRIKE: 'from-amber-950 via-yellow-900 to-zinc-900',
    DEFAULT: 'from-indigo-800 to-slate-900'
  }[profile?.cosmeticStyle || 'DEFAULT'] || 'from-indigo-800 to-slate-900';

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-2xs animate-fade-in"
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-sm overflow-hidden rounded-3xl bg-white shadow-2xl border border-gray-100 transition-all transform animate-in zoom-in-95 duration-200"
        onClick={e => e.stopPropagation()}
      >
        {/* Close Button */}
        <button
          type="button"
          onClick={onClose}
          className="absolute top-3 right-3 z-30 flex h-7 w-7 items-center justify-center rounded-full bg-black/50 text-white hover:bg-black/80 transition-colors text-xs font-bold"
          title="Đóng"
        >
          ✕
        </button>

        {/* 1. Large Cover Banner */}
        <div className="relative h-28 w-full overflow-hidden bg-gray-900">
          {profile?.coverUrl ? (
            <img
              src={resolveMediaUrl(profile.coverUrl)}
              alt="Cover"
              className="h-full w-full object-cover"
            />
          ) : (
            <div className={`h-full w-full bg-gradient-to-r ${defaultBannerGradient} opacity-90`} />
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent" />
        </div>

        {/* 2. Overlapping Avatar & VIP Frame */}
        <div className="px-5 pt-0 pb-5">
          <div className="relative -mt-12 flex items-end justify-between">
            <div className="relative">
              {profile?.avatarUrl ? (
                <img
                  src={resolveMediaUrl(profile.avatarUrl)}
                  alt={profile.fullName}
                  className={`h-22 w-22 rounded-full border-4 border-white object-cover shadow-lg ${vipCosmetics.glowClass}`}
                />
              ) : (
                <div
                  className={`flex h-22 w-22 items-center justify-center rounded-full border-4 border-white bg-gradient-to-tr from-indigo-600 to-purple-600 text-2xl font-black text-white shadow-lg ${vipCosmetics.glowClass}`}
                >
                  {profile?.fullName ? profile.fullName.charAt(0).toUpperCase() : 'U'}
                </div>
              )}
            </div>

            {/* Quick Action in Header Row */}
            <div className="mb-1 flex items-center gap-2">
              {isMe ? (
                <button
                  type="button"
                  onClick={handleEditProfile}
                  className="rounded-xl bg-gray-100 hover:bg-gray-200 px-3 py-1.5 text-xs font-bold text-gray-700 transition-colors shadow-2xs"
                >
                  ✏️ Sửa hồ sơ
                </button>
              ) : isAdminTarget ? (
                <span className="rounded-lg bg-purple-100 text-purple-800 text-[10px] font-black px-2 py-1 border border-purple-200">
                  🛡️ BAN QUẢN TRỊ
                </span>
              ) : (
                <button
                  type="button"
                  onClick={handleFollowToggle}
                  disabled={followLoading}
                  className={`rounded-xl px-3 py-1.5 text-xs font-bold transition-all shadow-xs ${
                    isFollowing
                      ? 'bg-gray-100 hover:bg-gray-200 text-gray-700 border border-gray-300'
                      : 'bg-indigo-600 hover:bg-indigo-700 text-white'
                  }`}
                >
                  {isFollowing ? '✓ Đang theo dõi' : '+ Theo dõi'}
                </button>
              )}
            </div>
          </div>

          {/* 3. Name & Identity Meta (Zero static badges) */}
          <div className="mt-3">
            <div className="flex items-center gap-2 flex-wrap">
              <h3 className={`text-lg font-black tracking-tight ${vipCosmetics.textClass}`}>
                {profile?.fullName || (loading ? 'Đang tải...' : 'Người dùng UniHome')}
              </h3>
            </div>

            <div className="mt-1 flex items-center gap-2 text-xs text-gray-500 font-medium">
              <span className="rounded-md bg-indigo-50 px-2 py-0.5 font-bold text-indigo-700 text-[11px]">
                {profile?.role === 'LANDLORD'
                  ? 'Chủ trọ'
                  : profile?.role === 'TENANT'
                  ? 'Người thuê'
                  : profile?.role === 'SERVICE_PROVIDER'
                  ? 'Đối tác dịch vụ'
                  : 'Thành viên'}
              </span>
              {profile?.schoolName && <span>🎓 {profile.schoolName}</span>}
            </div>

            {/* Bio */}
            <p className="mt-2 text-xs text-gray-600 leading-relaxed line-clamp-3">
              {profile?.bio || 'Chưa cập nhật phần giới thiệu cá nhân.'}
            </p>

            {/* 4. Public Counters: Active Listings & Followers */}
            <div className="mt-4 grid grid-cols-3 divide-x divide-gray-100 rounded-2xl bg-gray-50/80 p-2.5 text-center text-xs border border-gray-100">
              <div>
                <p className="font-extrabold text-gray-900">{followerCount}</p>
                <p className="text-[10px] text-gray-400 font-medium">Người theo dõi</p>
              </div>
              <div>
                <p className="font-extrabold text-gray-900">{profile?.following || 0}</p>
                <p className="text-[10px] text-gray-400 font-medium">Đang theo dõi</p>
              </div>
              <div>
                <p className="font-extrabold text-gray-900">{profile?.activeListingsCount || 0}</p>
                <p className="text-[10px] text-gray-400 font-medium">Tin đang đăng</p>
              </div>
            </div>

            {/* 5. Action Buttons (View Profile, DM, Report) */}
            <div className="mt-4 space-y-2">
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={handleViewFullProfile}
                  className="w-full rounded-xl bg-indigo-50 hover:bg-indigo-100 px-3 py-2 text-xs font-bold text-indigo-700 transition-colors text-center border border-indigo-100"
                >
                  Xem trang cá nhân
                </button>

                {!isMe && !isAdminTarget ? (
                  <button
                    type="button"
                    onClick={handleDirectMessage}
                    className="w-full rounded-xl bg-indigo-600 hover:bg-indigo-700 px-3 py-2 text-xs font-bold text-white transition-colors text-center shadow-xs"
                  >
                    💬 Nhắn tin
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={handleViewFullProfile}
                    className="w-full rounded-xl bg-gray-100 hover:bg-gray-200 px-3 py-2 text-xs font-bold text-gray-700 transition-colors text-center"
                  >
                    Xem bài đăng ({profile?.activeListingsCount || 0})
                  </button>
                )}
              </div>

              {!isMe && !isAdminTarget && (
                <button
                  type="button"
                  onClick={handleReportUser}
                  className="w-full text-center text-[11px] font-semibold text-gray-400 hover:text-red-500 py-1 transition-colors"
                >
                  ⚠️ Báo cáo hoặc chặn người dùng này
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
