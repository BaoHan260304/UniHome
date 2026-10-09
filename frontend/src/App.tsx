import { BrowserRouter as Router, Routes, Route, Link, useLocation, useNavigate } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { api, clearAuth, getUser } from './lib/api';
import Marketplace from './pages/Marketplace';
import PropertyDetail from './pages/PropertyDetail';
import Login from './pages/Login';
import Register from './pages/Register';
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
import ErrorBoundary from './components/ErrorBoundary';

function Layout() {
  const location = useLocation();
  const navigate = useNavigate();
  const user = getUser();
  const isAuthPage = ['/login', '/register', '/forgot-password'].includes(location.pathname);
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    if (user && !isAuthPage) {
      void api.get('/notifications/mine')
        .then(r => setUnreadCount((r.data || []).filter((n: any) => n.status === 'UNREAD').length))
        .catch(() => setUnreadCount(0));
    }
  }, [location.pathname, user?.id, isAuthPage]);

  const adminRoles = ['ADMIN', 'SUPER_ADMIN', 'MODERATOR', 'VERIFIER', 'CONTENT_ADMIN', 'FINANCE_ADMIN'];
  const role = user?.role;
  const logout = () => { clearAuth(); navigate('/'); };

  return (
    <div className="min-h-screen bg-gray-50 font-sans text-gray-900">
      {!isAuthPage ? (
        <nav className="bg-white border-b border-gray-200 sticky top-0 z-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between h-24">
              <div className="flex items-center gap-5">
                <Link to="/" className="flex items-center hover:opacity-80 transition-transform hover:scale-105">
                  <img src="/logo.png" alt="UniHome Logo" className="h-24 object-contain" />
                </Link>
                <div className="hidden xl:flex items-center gap-4 text-sm font-medium text-gray-600">
                  <Link className="hover:text-indigo-600" to="/">Phòng trọ</Link>
                  <Link className="hover:text-indigo-600" to="/services">Dịch vụ</Link>
                  <Link className="hover:text-indigo-600" to="/secondhand">Đồ cũ</Link>
                  <Link className="hover:text-indigo-600" to="/blog">Blog</Link>
                  <Link className="hover:text-indigo-600" to="/qa">Hỏi đáp</Link>
                </div>
              </div>
              <div className="flex items-center space-x-5">
                {role === 'LANDLORD' && <Link to="/manager/posts" className="text-gray-600 hover:text-indigo-600 font-medium">Quản lý Bài đăng</Link>}
                {user && <Link to="/chat" className="text-gray-600 hover:text-indigo-600 font-medium">Chat</Link>}
                {role === 'TENANT' && <Link to="/tenant/matching" className="text-gray-600 hover:text-indigo-600 font-medium">Matching</Link>}
                {adminRoles.includes(role) && <Link to="/admin" className="text-gray-600 hover:text-indigo-600 font-medium">Admin</Link>}
                {user && <Link to={role === 'LANDLORD' ? '/manager/notifications' : '/tenant/notifications'} className="text-gray-600 hover:text-indigo-600 font-medium relative">Thông báo{unreadCount > 0 && <span className="absolute -top-2 -right-3 bg-red-500 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full">{unreadCount}</span>}</Link>}
                {user ? <>
                  <Link to={role === 'LANDLORD' ? '/manager/profile' : '/tenant/profile'} className="flex items-center justify-center transition-transform hover:scale-105">
                    <img src={user.avatarUrl || `https://ui-avatars.com/api/?name=${encodeURIComponent(user.fullName || 'U')}&background=random`} className="w-9 h-9 rounded-full object-cover border-2 border-indigo-100 shadow-sm" />
                  </Link>
                  <button onClick={logout} className="text-sm font-medium text-red-600 hover:text-red-800">Đăng xuất</button>
                </> : <Link to="/login" state={{ from: location.pathname }} className="text-sm font-medium text-indigo-600 hover:text-indigo-800">Đăng nhập</Link>}
              </div>
            </div>
          </div>
        </nav>
      ) : (
        <div className="absolute top-0 left-0 right-0 z-50 px-5 py-4 flex justify-between items-center">
          <Link to="/" className="flex items-center gap-2 text-sm font-semibold text-indigo-700 bg-white/90 border px-4 py-2 rounded-xl shadow-sm">← Trang chủ</Link>
          <Link to="/" className="text-sm font-medium text-gray-600 hover:text-indigo-600">Tiếp tục xem với tư cách khách</Link>
        </div>
      )}
      <main className={!isAuthPage ? 'max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8' : ''}>
        <ErrorBoundary key={location.pathname}>
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/forgot-password" element={<ForgotPassword />} />
            <Route path="/" element={<Marketplace />} />
            <Route path="/property/:id" element={<PropertyDetail />} />
            <Route path="/manager" element={<ManagerDashboard view="posts" />} />
            <Route path="/manager/posts" element={<ManagerDashboard view="posts" />} />
            <Route path="/manager/notifications" element={<ManagerDashboard view="notifications" />} />
            <Route path="/manager/profile" element={<ManagerDashboard view="profile" />} />
            <Route path="/tenant/profile" element={<TenantDashboard view="profile" />} />
            <Route path="/tenant/favorites" element={<TenantDashboard view="favorites" />} />
            <Route path="/tenant/interests" element={<TenantDashboard view="interests" />} />
            <Route path="/tenant/notifications" element={<TenantDashboard view="notifications" />} />
            <Route path="/tenant/matching" element={<MatchingPage />} />
            <Route path="/tenant/wallet" element={<WalletPage />} />
            <Route path="/chat" element={<ChatCenter />} />
            <Route path="/users/:id" element={<PublicProfile />} />
            <Route path="/services" element={<ServicesPage />} />
            <Route path="/secondhand" element={<SecondHandPage />} />
            <Route path="/secondhand/:id" element={<SecondHandDetail />} />
            <Route path="/blog" element={<BlogPage />} />
            <Route path="/blog/:id" element={<BlogDetail />} />
            <Route path="/qa" element={<QaPage />} />
            <Route path="/admin" element={<AdminDashboard />} />
            <Route path="*" element={<div className="bg-white border rounded-2xl p-12 text-center"><h1 className="text-3xl font-extrabold">Không tìm thấy trang</h1><p className="mt-2 text-gray-500">Đường dẫn không tồn tại hoặc đã được thay đổi.</p><Link to="/" className="inline-block mt-5 bg-indigo-600 text-white px-6 py-3 rounded-xl">Về trang chủ</Link></div>} />
          </Routes>
        </ErrorBoundary>
      </main>
    </div>
  );
}

export default function App() { return <Router><Layout /></Router>; }
