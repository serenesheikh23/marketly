import { Outlet, Link, useNavigate } from 'react-router-dom';
import { useAppSelector, useAppDispatch, logout } from '@/store';
import { authApi } from '@/api/client';

export default function Layout() {
  const { user, isAuthenticated } = useAppSelector((s) => s.auth);
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const roles = (user as unknown as { roles?: Array<{ name: string }> })?.roles?.map((r) => r.name) ?? [];

  const handleLogout = async () => {
    await authApi.logout();
    dispatch(logout());
    navigate('/');
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16 items-center">
            <Link to="/" className="text-xl font-bold text-primary-600">Marketplace</Link>
            <nav className="flex items-center gap-4">
              {isAuthenticated ? (
                <>
                  <Link to="/dashboard" className="text-sm text-gray-600 hover:text-primary-600">Dashboard</Link>
                  {roles.includes('admin') || roles.includes('moderator') ? (
                    <Link to="/admin" className="text-sm text-gray-600 hover:text-primary-600">Admin</Link>
                  ) : null}
                  <span className="text-sm text-gray-500">${Number(user?.balance ?? 0).toFixed(2)}</span>
                  <button onClick={handleLogout} className="text-sm text-gray-600 hover:text-red-600">Logout</button>
                </>
              ) : (
                <>
                  <Link to="/login" className="text-sm text-gray-600 hover:text-primary-600">Login</Link>
                  <Link to="/register" className="btn-primary text-sm py-1.5">Sign Up</Link>
                </>
              )}
            </nav>
          </div>
        </div>
      </header>
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Outlet />
      </main>
      <footer className="border-t border-gray-200 py-6 text-center text-sm text-gray-500">
        &copy; {new Date().getFullYear()} Digital Marketplace. All rights reserved.
      </footer>
    </div>
  );
}
