import { BrowserRouter as Router, Routes, Route, Link, useLocation, useNavigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import axios from 'axios';
import Marketplace from './pages/Marketplace';
import ManagerDashboard from './pages/ManagerDashboard';
import TenantDashboard from './pages/TenantDashboard';
import RoommateMatching from './pages/RoommateMatching';
import Login from './pages/Login';
import Register from './pages/Register';
import PropertyDetail from './pages/PropertyDetail';

function Layout() {
  const location = useLocation();
  const navigate = useNavigate();
  const isAuthPage = location.pathname === '/login' || location.pathname === '/register';
  
  const userStr = localStorage.getItem('user');
  const user = userStr ? JSON.parse(userStr) : null;
  const userRole = user?.role;

  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    if (user && !isAuthPage) {
        axios.get(`http://localhost:8080/api/notifications/receiver/${user.id}`)
            .then(res => {
                const unread = res.data.filter((n: any) => n.status === 'PENDING').length;
                setUnreadCount(unread);
            })
            .catch(err => console.error(err));
    }
  }, [location.pathname, user?.id, isAuthPage]);

  const handleLogout = () => {
    localStorage.removeItem('user');
    navigate('/login');
  };

  return (
    <div className="min-h-screen bg-gray-50 font-sans text-gray-900">
      {!isAuthPage && (
        <nav className="bg-white border-b border-gray-200 sticky top-0 z-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between h-24">
              <div className="flex items-center">
                <Link to="/" className="flex items-center hover:opacity-80 transition-transform hover:scale-105">
                  <img src="/logo.png" alt="UniHome Logo" className="h-24 object-contain" />
                </Link>
              </div>
              <div className="flex items-center space-x-6">
                <Link to="/" className="text-gray-600 hover:text-indigo-600 font-medium transition-colors">Bảng tin</Link>
                
                {userRole === 'manager' && (
                  <>
                      <Link to="/manager/posts" className="text-gray-600 hover:text-indigo-600 font-medium transition-colors">Quản lý Bài đăng</Link>
                      <Link to="/manager/notifications" className="text-gray-600 hover:text-indigo-600 font-medium transition-colors relative">
                        Thông báo
                        {unreadCount > 0 && <span className="absolute -top-2 -right-3 bg-red-500 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full">{unreadCount}</span>}
                      </Link>
                      <Link to="/manager/profile" className="flex items-center justify-center transition-transform hover:scale-105">
                        <img src={user?.avatarUrl || `https://ui-avatars.com/api/?name=${encodeURIComponent(user?.fullName || 'U')}&background=random`} alt="Profile" className="w-9 h-9 rounded-full object-cover border-2 border-indigo-100 shadow-sm" />
                      </Link>
                  </>
                )}
                
                {userRole === 'tenant' && (
                  <>
                    <Link to="/tenant/favorites" className="text-gray-600 hover:text-indigo-600 font-medium transition-colors">Yêu thích</Link>
                    <Link to="/tenant/matching" className="text-gray-600 hover:text-indigo-600 font-medium transition-colors">Roommate Matching</Link>
                    <Link to="/tenant/notifications" className="text-gray-600 hover:text-indigo-600 font-medium transition-colors relative">
                        Thông báo
                        {unreadCount > 0 && <span className="absolute -top-2 -right-3 bg-red-500 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full">{unreadCount}</span>}
                    </Link>
                    <Link to="/tenant/profile" className="flex items-center justify-center transition-transform hover:scale-105">
                        <img src={user?.avatarUrl || `https://ui-avatars.com/api/?name=${encodeURIComponent(user?.fullName || 'U')}&background=random`} alt="Profile" className="w-9 h-9 rounded-full object-cover border-2 border-indigo-100 shadow-sm" />
                    </Link>
                  </>
                )}
                
                {user ? (
                  <button onClick={handleLogout} className="text-sm font-medium text-red-600 hover:text-red-800 transition-colors">
                    Đăng xuất
                  </button>
                ) : (
                  <Link to="/login" className="text-sm font-medium text-indigo-600 hover:text-indigo-800">Đăng nhập</Link>
                )}
              </div>
            </div>
          </div>
        </nav>
      )}
      
      <main className={!isAuthPage ? "max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8" : ""}>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/" element={<Marketplace />} />
          <Route path="/property/:id" element={<PropertyDetail />} />
          
          <Route path="/manager" element={<ManagerDashboard view="posts" />} />
          <Route path="/manager/posts" element={<ManagerDashboard view="posts" />} />
          <Route path="/manager/notifications" element={<ManagerDashboard view="notifications" />} />
          <Route path="/manager/profile" element={<ManagerDashboard view="profile" />} />
          
          <Route path="/tenant/profile" element={<TenantDashboard view="profile" />} />
          <Route path="/tenant/notifications" element={<TenantDashboard view="notifications" />} />
          <Route path="/tenant/favorites" element={<TenantDashboard view="favorites" />} />
          
          <Route path="/tenant/matching" element={<RoommateMatching />} />
        </Routes>
      </main>
    </div>
  );
}

function App() {
  return (
    <Router>
      <Layout />
    </Router>
  );
}

export default App;
