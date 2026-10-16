import { Link, Outlet, useLocation } from 'react-router-dom';

export const TENANT_TABS = [
  ['/tenant/profile', 'Trang cá nhân'],
  ['/tenant/favorites', 'Yêu thích'],
  ['/tenant/interests', 'Phòng quan tâm'],
  ['/tenant/matching', 'Hồ sơ Matching'],
  ['/tenant/wallet', 'Ví & giao dịch'],
  ['/tenant/notifications', 'Thông báo'],
  ['/tenant/chat', 'Chat']
];

export function TenantAccountNav() {
  const location = useLocation();

  return (
    <div className="flex flex-wrap gap-2.5 border-b border-gray-200 pb-4">
      {TENANT_TABS.map(([to, label]) => {
        const isActive = location.pathname === to || (to === '/tenant/chat' && location.pathname === '/chat');
        return (
          <Link
            key={to}
            to={to}
            className={`px-4 py-2.5 rounded-xl border text-sm font-semibold transition-all ${
              isActive
                ? 'bg-indigo-600 text-white border-indigo-600 shadow-sm'
                : 'bg-white text-gray-700 hover:text-indigo-600 hover:bg-gray-50 border-gray-200'
            }`}
          >
            {label}
          </Link>
        );
      })}
    </div>
  );
}

export default function TenantAccountLayout({ children }: { children?: React.ReactNode }) {
  return (
    <div className="space-y-6">
      <TenantAccountNav />
      {children ? children : <Outlet />}
    </div>
  );
}
