import { Outlet, Link, useNavigate } from 'react-router-dom';
import { useAppSelector, useAppDispatch, logout } from '@/store';
import { authApi } from '@/api/client';

const navItems = [
  { to: '/admin', label: 'Dashboard', exact: true },
  { to: '/admin/users', label: 'Users' },
  { to: '/admin/products', label: 'Products' },
  { to: '/admin/categories', label: 'Categories' },
  { to: '/admin/orders', label: 'Orders' },
  { to: '/admin/orders/manual', label: 'Manual Orders' },
  { to: '/admin/deposits', label: 'Deposits' },
  { to: '/admin/withdrawals', label: 'Withdrawals' },
  { to: '/admin/settings', label: 'Settings' },
];

export default function AdminLayout() {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await authApi.logout();
    dispatch(logout());
    navigate('/');
  };

  return (
    <div className="flex min-h-screen bg-gray-100">
      <aside className="w-64 bg-gray-900 text-white flex flex-col">
        <div className="p-6 border-b border-gray-700">
          <Link to="/" className="text-lg font-bold text-primary-400">Marketplace Admin</Link>
        </div>
        <nav className="flex-1 p-4 space-y-1">
          {navItems.map((item) => (
            <Link
              key={item.to}
              to={item.to}
              className="block px-4 py-2 rounded-md text-gray-300 hover:bg-gray-700 hover:text-white text-sm"
            >
              {item.label}
            </Link>
          ))}
        </nav>
        <div className="p-4 border-t border-gray-700 space-y-1">
          <Link to="/dashboard" className="block px-4 py-2 rounded-md text-gray-300 hover:bg-gray-700 text-sm">
            ← Back to Site
          </Link>
          <button
            onClick={handleLogout}
            className="w-full text-left px-4 py-2 rounded-md text-gray-300 hover:bg-gray-700 text-sm"
          >
            Logout
          </button>
        </div>
      </aside>
      <div className="flex-1 overflow-auto">
        <main className="p-8">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
