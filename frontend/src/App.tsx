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
import TenantAccountLayout from './components/TenantAccountLayout';
import AccountQuickMenu from './components/AccountQuickMenu';
import NotificationDropdown from './components/NotificationDropdown';
import ErrorBoundary from './components/ErrorBoundary';

function ChatRoute() {
  const user = getUser();
  if (user?.role === 'TENANT') {
    return <Navigate to="/tenant/chat" replace />;
  }
  return <ChatCenter />;
}

function Layout() {
  const location = useLocation();
  const navigate = useNavigate();
  const [currentUser, setCurrentUser] = useState(getUser());
  const isAuthPage = ['/login', '/register', '/forgot-password', '/verify-otp', '/social-complete'].includes(location.pathname);
  const [unreadCount, setUnreadCount] = useState(0);

  // Sync auth state reactively
  useEffect(() => {
    const handleAuthChange = () => {
      setCurrentUser(getUser());
    };
    window.addEventListener('authChange', handleAuthChange);
    return () => window.removeEventListener('authChange', handleAuthChange);
  }, []);

  useEffect(() => {
    if (currentUser && !isAuthPage) {
      void api.get('/notifications/mine')
        .then(r => setUnreadCount((r.data || []).filter((n: any) => n.status === 'UNREAD').length))
        .catch(() => setUnreadCount(0));
    }
  }, [location.pathname, currentUser?.id, isAuthPage]);

  const adminRoles = ['ADMIN', 'SUPER_ADMIN', 'MODERATOR', 'VERIFIER', 'CONTENT_ADMIN', 'FINANCE_ADMIN'];
  const role = currentUser?.role;
  const logout = () => { clearAuth(); navigate('/'); };

  return (
    <div className="min-h-screen bg-gray-50 font-sans text-gray-900">
      {!isAuthPage ? (
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
                  <Link className="hover:text-indigo-600 transition-colors" to="/blog">Blog</Link>
                  <Link className="hover:text-indigo-600 transition-colors" to="/qa">Hỏi đáp</Link>
                  <Link className="hover:text-indigo-600 transition-colors flex items-center gap-1 text-indigo-700 font-bold bg-indigo-50 px-2.5 py-1 rounded-xl border border-indigo-100" to="/rewards">
                    <span>💎</span> Ưu đãi
                  </Link>
                </div>
              </div>
              <div className="flex items-center space-x-3 sm:space-x-4">
                {role === 'LANDLORD' && (
                  <Link to="/manager/posts" className="text-gray-600 hover:text-indigo-600 font-semibold text-sm">
                    Quản lý Bài đăng
                  </Link>
                )}
                {currentUser && (
                  <Link to={role === 'TENANT' ? '/tenant/chat' : '/chat'} className="text-gray-600 hover:text-indigo-600 font-semibold text-sm">
                    Chat
                  </Link>
                )}
                {role === 'TENANT' && (
                  <Link to="/tenant/matching" className="text-gray-600 hover:text-indigo-600 font-semibold text-sm">
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
      ) : (
        <div className="absolute top-0 left-0 right-0 z-50 px-5 py-4 flex justify-between items-center">
          <Link to="/" className="flex items-center gap-2 text-xs font-bold text-indigo-700 bg-white/90 border px-4 py-2 rounded-xl shadow-xs">
            ← Trang chủ
          </Link>
          <Link to="/" className="text-xs font-medium text-gray-600 hover:text-indigo-600">
            Tiếp tục xem với tư cách khách
          </Link>
        </div>
      )}

      <main className={!isAuthPage ? 'max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8' : ''}>
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

            {/* Landlord manager routes */}
            <Route path="/manager" element={<ManagerDashboard view="posts" />} />
            <Route path="/manager/posts" element={<ManagerDashboard view="posts" />} />
            <Route path="/manager/notifications" element={<ManagerDashboard view="notifications" />} />
            <Route path="/manager/profile" element={<ManagerDashboard view="profile" />} />

            {/* Shared Chat redirect / route */}
            <Route path="/chat" element={<ChatRoute />} />

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
