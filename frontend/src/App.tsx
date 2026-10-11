import { BrowserRouter as Router, Routes, Route, Link, useLocation, useNavigate, Navigate } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { api, clearAuth, getUser } from './lib/api';
import Marketplace from './pages/Marketplace';
import PropertyDetail from './pages/PropertyDetail';
import Login from './pages/Login';
import Register from './pages/Register';
import VerifyOtp from './pages/VerifyOtp';
import SocialCompletion from './pages/SocialCompletion';
import ForgotPassword from './pages/ForgotPassword';
import ManagerDashboard from './pages/ManagerDashboard';
import TenantDashboard from './pages/TenantDashboard';
import MatchingPage from './pages/MatchingPage';
import ChatCenter from './pages/ChatCenter';
import PublicProfile from './pages/PublicProfile';
import ServicesPage from './pages/ServicesPage';
import SecondHandPage from './pages/SecondHandPage';
import SecondHandDetail from './pages/SecondHandDetail';
import BlogPage from './pages/BlogPage';
import BlogDetail from './pages/BlogDetail';
import QaPage from './pages/QaPage';
import AdminDashboard from './pages/AdminDashboard';
import WalletPage from './pages/WalletPage';
import ServiceDetail from './pages/ServiceDetail';
import RewardsPage from './pages/RewardsPage';
import MyVouchersPage from './pages/MyVouchersPage';
import VoucherVerifyPage from './pages/VoucherVerifyPage';
import TermsPage from './pages/TermsPage';
import MyPostsPage from './pages/MyPostsPage';
import PromotionsPage from './pages/PromotionsPage';
import PostCreatePage from './pages/PostCreatePage';
import CommunityPage from './pages/CommunityPage';
import SavedListingsPage from './pages/SavedListingsPage';
import TenantAccountLayout from './components/TenantAccountLayout';
import AccountQuickMenu from './components/AccountQuickMenu';
import NotificationDropdown from './components/NotificationDropdown';
import ErrorBoundary from './components/ErrorBoundary';
import PostComposerModal from './components/PostComposerModal';
import SiteFooter from './components/SiteFooter';

function Layout() {
  const location = useLocation();
  const navigate = useNavigate();
  const [currentUser, setCurrentUser] = useState(getUser());
  const isAuthPage = ['/login', '/register', '/forgot-password', '/verify-otp', '/social-complete'].includes(location.pathname);
  const isAdminPage = location.pathname.startsWith('/admin');
  const [unreadCount, setUnreadCount] = useState(0);
  const [unreadChatCount, setUnreadChatCount] = useState(0);
  const [composerOpen, setComposerOpen] = useState(false);
  const [welcomeBanner, setWelcomeBanner] = useState<{ show: boolean; needCheckin: boolean }>({ show: false, needCheckin: false });

  // Sync auth state reactively
  useEffect(() => {
    const handleAuthChange = () => {
      const u = getUser();
      setCurrentUser(u);
      if (u) checkWelcome(u);
    };
    window.addEventListener('authChange', handleAuthChange);
    return () => window.removeEventListener('authChange', handleAuthChange);
  }, []);

  const checkWelcome = (u: any) => {
    const today = new Date().toISOString().slice(0, 10);
    const key = `unihome_welcome_${u.id}_${today}`;
    if (!sessionStorage.getItem(key)) {
      sessionStorage.setItem(key, 'true');
      void api.get('/rewards/account').then(r => {
        setWelcomeBanner({
          show: true,
          needCheckin: !r.data?.checkedInToday
        });
      }).catch(() => {
        setWelcomeBanner({ show: true, needCheckin: false });
      });
    }
  };

  useEffect(() => {
    if (currentUser && !isAuthPage) {
      checkWelcome(currentUser);
      void api.get('/notifications/mine')
        .then(r => setUnreadCount((r.data || []).filter((n: any) => n.status === 'UNREAD').length))
        .catch(() => setUnreadCount(0));

      void api.get('/chat/unread-count')
        .then(r => setUnreadChatCount(r.data?.unreadMessages ?? r.data?.unreadCount ?? 0))
        .catch(() => setUnreadChatCount(0));
    }
  }, [location.pathname, currentUser?.id, isAuthPage]);

  // Reactive listener for chat unread events
  useEffect(() => {
    const refreshChatUnread = () => {
      if (currentUser && !isAuthPage) {
        void api.get('/chat/unread-count')
          .then(r => setUnreadChatCount(r.data?.unreadMessages ?? r.data?.unreadCount ?? 0))
          .catch(() => setUnreadChatCount(0));
      }
    };
    window.addEventListener('chat_unread_changed', refreshChatUnread);
    const interval = setInterval(refreshChatUnread, 8000);
    return () => {
      window.removeEventListener('chat_unread_changed', refreshChatUnread);
      clearInterval(interval);
    };
  }, [currentUser?.id, isAuthPage]);

  const adminRoles = ['ADMIN', 'SUPER_ADMIN', 'MODERATOR', 'VERIFIER', 'CONTENT_ADMIN', 'FINANCE_ADMIN'];
  const role = currentUser?.role;
  const isAdmin = adminRoles.includes(role);

  // Admin Role Interceptor: Admin accessing commercial user routes redirects to /admin
  useEffect(() => {
    if (isAdmin && !isAdminPage && !isAuthPage) {
      const commercialRoutes = ['/rewards', '/wallet', '/my-posts', '/tenant/matching', '/tenant/wallet', '/post/new'];
      const isCommercial = commercialRoutes.some(p => location.pathname.startsWith(p));
      if (isCommercial) {
        alert('Chức năng dành cho người dùng thương mại. Chuyển hướng về bảng điều khiển Quản trị viên.');
        navigate('/admin');
      }
    }
  }, [location.pathname, isAdmin, isAdminPage, isAuthPage]);

  const logout = () => { clearAuth(); navigate('/'); };

  return (
    <div className="min-h-screen bg-gray-50 font-sans text-gray-900 flex flex-col justify-between">
      {/* Welcome Banner Toast */}
      {welcomeBanner.show && currentUser && !isAdminPage && (
        <div className="bg-gradient-to-r from-indigo-900 via-indigo-800 to-purple-900 text-white px-4 py-2.5 text-xs font-semibold flex items-center justify-between border-b border-indigo-700/50 shadow-md">
          <div className="flex items-center gap-2 max-w-4xl mx-auto flex-1 justify-center">
            <span>👋</span>
            <span>Chào mừng <strong>{currentUser.fullName || currentUser.username}</strong> quay lại UniHome!</span>
            {welcomeBanner.needCheckin && (
              <span className="ml-3 flex items-center gap-1.5 bg-amber-400 text-gray-900 px-2.5 py-0.5 rounded-full font-black text-[11px] shadow-xs">
                <span>🎁</span> Chưa nhận +20 điểm hôm nay:
                <Link to="/rewards" onClick={() => setWelcomeBanner({ ...welcomeBanner, show: false })} className="underline font-black hover:text-black">
                  Nhận ngay →
                </Link>
              </span>
            )}
          </div>
          <button
            onClick={() => setWelcomeBanner({ ...welcomeBanner, show: false })}
            className="text-indigo-300 hover:text-white font-bold ml-4"
          >
            ✕
          </button>
        </div>
      )}

      {!isAuthPage && !isAdminPage ? (
        <nav className="bg-white border-b border-gray-200 sticky top-0 z-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between h-20 items-center">
              <div className="flex items-center gap-6">
                <Link to="/" className="flex items-center hover:opacity-90 transition-transform">
                  <img src="/logo.png" alt="UniHome Logo" className="h-16 object-contain" />
                </Link>
                <div className="hidden xl:flex items-center gap-5 text-sm font-semibold text-gray-600">
                  <Link className="hover:text-indigo-600 transition-colors" to="/">Phòng trọ</Link>
                  <Link className="hover:text-indigo-600 transition-colors" to="/services">Dịch vụ</Link>
                  <Link className="hover:text-indigo-600 transition-colors" to="/secondhand">Đồ cũ</Link>
                  <Link className="hover:text-indigo-600 transition-colors font-bold text-indigo-600 flex items-center gap-1" to="/community">
                    <span>💬</span> Tán gẫu
                  </Link>
                  <Link className="hover:text-indigo-600 transition-colors" to="/blog">Blog</Link>
                  <Link className="hover:text-indigo-600 transition-colors" to="/qa">Hỏi đáp</Link>
                  <Link className="hover:text-indigo-600 transition-colors flex items-center gap-1 text-indigo-700 font-bold bg-indigo-50 px-2.5 py-1 rounded-xl border border-indigo-100" to="/rewards">
                    <span>💎</span> Ưu đãi
                  </Link>
                </div>
              </div>
              <div className="flex items-center space-x-2.5 sm:space-x-3.5">
                {/* Global + Đăng tin button */}
                <button
                  type="button"
                  onClick={() => {
                    if (isAdmin) {
                      alert('Chức năng dành cho người dùng thương mại.');
                      return;
                    }
                    setComposerOpen(true);
                  }}
                  className="text-xs font-bold bg-emerald-600 hover:bg-emerald-700 text-white px-3 sm:px-4 py-2 rounded-xl shadow-xs transition-all flex items-center gap-1.5 active:scale-95"
                >
                  <span className="text-sm font-black">+</span> Đăng tin
                </button>

                {currentUser && (
                  <Link to="/saved" className="text-gray-600 hover:text-indigo-600 font-semibold text-sm hidden md:inline-block">
                    Đã lưu
                  </Link>
                )}
                {currentUser && (
                  <Link to="/my-posts" className="text-gray-600 hover:text-indigo-600 font-semibold text-sm hidden md:inline-block">
                    Tin đã đăng
                  </Link>
                )}
                {currentUser && (
                  <Link to="/chat" className="text-gray-600 hover:text-indigo-600 font-semibold text-sm relative">
                    Chat
                    {unreadChatCount > 0 && (
                      <span className="ml-1 bg-red-500 text-white text-[10px] font-extrabold px-1.5 py-0.5 rounded-full inline-block leading-none">
                        {unreadChatCount}
                      </span>
                    )}
                  </Link>
                )}
                {currentUser && (
                  <Link to="/tenant/matching" className="text-gray-600 hover:text-indigo-600 font-semibold text-sm hidden lg:inline-block">
                    Matching
                  </Link>
                )}
                {adminRoles.includes(role) && (
                  <Link to="/admin" className="text-indigo-600 hover:text-indigo-800 font-bold text-sm bg-indigo-50 px-3 py-1.5 rounded-xl border border-indigo-200">
                    Admin
                  </Link>
                )}
                {currentUser && (
                  <NotificationDropdown
                    user={currentUser}
                    unreadCount={unreadCount}
                    onRefreshCount={() => setUnreadCount(0)}
                  />
                )}
                {currentUser ? (
                  <AccountQuickMenu user={currentUser} onLogout={logout} />
                ) : (
                  <Link
                    to="/login"
                    state={{ from: location.pathname }}
                    className="text-xs font-bold bg-indigo-600 text-white px-4 py-2 rounded-xl shadow-xs hover:bg-indigo-700 transition-colors"
                  >
                    Đăng nhập
                  </Link>
                )}
              </div>
            </div>
          </div>
        </nav>
      ) : !isAdminPage ? (
        <div className="absolute top-0 left-0 right-0 z-50 px-5 py-4 flex justify-between items-center">
          <Link to="/" className="flex items-center gap-2 text-xs font-bold text-indigo-700 bg-white/90 border px-4 py-2 rounded-xl shadow-xs">
            ← Trang chủ
          </Link>
          <Link to="/" className="text-xs font-medium text-gray-600 hover:text-indigo-600">
            Tiếp tục xem với tư cách khách
          </Link>
        </div>
      ) : null}

      {/* Global Post Composer Modal */}
      <PostComposerModal isOpen={composerOpen} onClose={() => setComposerOpen(false)} />

      <main className={!isAuthPage && !isAdminPage ? 'max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 flex-1 w-full' : 'flex-1 w-full'}>
        <ErrorBoundary key={location.pathname}>
          <Routes>
            {/* Auth routes */}
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/verify-otp" element={<VerifyOtp />} />
            <Route path="/social-complete" element={<SocialCompletion />} />
            <Route path="/forgot-password" element={<ForgotPassword />} />

            {/* Public routes */}
            <Route path="/" element={<Marketplace />} />
            <Route path="/property/:id" element={<PropertyDetail />} />
            <Route path="/users/:id" element={<PublicProfile />} />
            <Route path="/services" element={<ServicesPage />} />
            <Route path="/services/:id" element={<ServiceDetail />} />
            <Route path="/secondhand" element={<SecondHandPage />} />
            <Route path="/secondhand/:id" element={<SecondHandDetail />} />
            <Route path="/blog" element={<BlogPage />} />
            <Route path="/blog/:id" element={<BlogDetail />} />
            <Route path="/qa" element={<QaPage />} />
            <Route path="/rewards" element={<RewardsPage />} />
            <Route path="/rewards/my-vouchers" element={<MyVouchersPage />} />
            <Route path="/voucher/verify/:token" element={<VoucherVerifyPage />} />
            <Route path="/terms" element={<TermsPage />} />
            <Route path="/community" element={<CommunityPage />} />
            <Route path="/saved" element={<SavedListingsPage />} />
            <Route path="/post/new" element={<PostCreatePage />} />
            <Route path="/post/new/:category" element={<PostCreatePage />} />

            {/* Unified posts & promotions */}
            <Route path="/my-posts" element={<MyPostsPage />} />
            <Route path="/promotions" element={<PromotionsPage />} />

            {/* Landlord manager routes (backward compatibility) */}
            <Route path="/manager" element={<Navigate to="/my-posts" replace />} />
            <Route path="/manager/posts" element={<MyPostsPage />} />
            <Route path="/manager/notifications" element={<ManagerDashboard view="notifications" />} />
            <Route path="/manager/profile" element={<TenantDashboard view="profile" />} />

            {/* Unified Chat route */}
            <Route path="/chat" element={<ChatCenter />} />

            {/* Tenant nested routes with persistent TenantAccountLayout */}
            <Route path="/tenant" element={<TenantAccountLayout />}>
              <Route index element={<Navigate to="/tenant/profile" replace />} />
              <Route path="profile" element={<TenantDashboard view="profile" />} />
              <Route path="favorites" element={<TenantDashboard view="favorites" />} />
              <Route path="interests" element={<TenantDashboard view="interests" />} />
              <Route path="notifications" element={<TenantDashboard view="notifications" />} />
              <Route path="matching" element={<MatchingPage />} />
              <Route path="wallet" element={<WalletPage />} />
              <Route path="chat" element={<ChatCenter />} />
            </Route>

            {/* Admin console */}
            <Route path="/admin" element={<AdminDashboard />} />

            {/* 404 fallback */}
            <Route
              path="*"
              element={
                <div className="bg-white border rounded-2xl p-12 text-center shadow-xs">
                  <h1 className="text-3xl font-extrabold text-gray-900">Không tìm thấy trang</h1>
                  <p className="mt-2 text-sm text-gray-500">Đường dẫn không tồn tại hoặc đã được thay đổi.</p>
                  <Link to="/" className="inline-block mt-5 bg-indigo-600 text-white px-6 py-2.5 rounded-xl font-bold text-xs hover:bg-indigo-700">
                    Về trang chủ
                  </Link>
                </div>
              }
            />
          </Routes>
        </ErrorBoundary>
      </main>

      {/* Persistent Site Footer on non-auth, non-admin pages */}
      {!isAuthPage && !isAdminPage && <SiteFooter />}
    </div>
  );
}

export default function App() {
  return (
    <Router>
      <Layout />
    </Router>
  );
}
