import { Outlet, Link, useNavigate } from 'react-router-dom';
import { useAppSelector, useAppDispatch, logout, translations } from '@/store';
import { authApi } from '@/api/client';
import Logo from './Logo';
import PageTransition from './PageTransition';
import LanguageSwitcher from './LanguageSwitcher';
import SocialLinks from './SocialLinks';

export default function Layout() {
  const { user, isAuthenticated } = useAppSelector((s) => s.auth);
  const { locale } = useAppSelector((s) => s.language);
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const t = translations[locale];
  const roles = (user as unknown as { roles?: Array<{ name: string }> })?.roles?.map((r) => r.name) ?? [];

  const handleLogout = async () => {
    await authApi.logout();
    dispatch(logout());
    navigate('/');
  };

  return (
    <div className="min-h-screen bg-ink flex flex-col">
      {/* ── Header ─────────────────────────────────────────── */}
      <header className="sticky top-0 z-50 border-b border-ink-200 bg-ink/80 backdrop-blur-md">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2.5">
            <Logo size="sm" showText />
          </Link>

          {/* Nav */}
          <nav className="flex items-center gap-1">
            {isAuthenticated ? (
              <>
                <Link to="/dashboard" className="nav-link text-sm">
                  {t.dashboard}
                </Link>
                {(roles.includes('admin') || roles.includes('moderator')) && (
                  <Link to="/admin" className="nav-link text-sm text-accent-400">
                    {t.admin}
                  </Link>
                )}
                <div className="mx-3 w-px h-5 bg-ink-200" />
                <span className="text-sm text-ink-600 font-medium tabular-nums">
                  ${Number(user?.balance ?? 0).toFixed(2)}
                </span>
                <button
                  onClick={handleLogout}
                  className="nav-link text-sm ml-1 text-status-rejected/80 hover:text-status-rejected hover:bg-status-rejected/10"
                >
                  {t.logout}
                </button>
                <LanguageSwitcher />
              </>
            ) : (
              <>
                <Link to="/login" className="nav-link text-sm">{t.signIn}</Link>
                <Link
                  to="/register"
                  className="btn-accent btn-sm ml-2"
                >
                  {t.getStarted}
                </Link>
                <LanguageSwitcher />
              </>
            )}
          </nav>
        </div>
      </header>

      {/* ── Main ───────────────────────────────────────────── */}
      <main className="flex-1">
        <PageTransition className="max-w-7xl mx-auto px-6 py-10">
          <Outlet />
        </PageTransition>
      </main>

      {/* ── Footer ─────────────────────────────────────────── */}
      <footer className="border-t border-ink-200 py-8 mt-auto">
        <div className="max-w-7xl mx-auto px-6 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <Logo size="sm" showText={false} />
            <span className="text-micro text-ink-500">
              &copy; {new Date().getFullYear()} marketly
            </span>
          </div>
          <SocialLinks />
          <p className="text-micro text-ink-500 text-center sm:text-right">
            All products delivered instantly. Secure payments via Binance Pay &amp; USDT.
          </p>
        </div>
      </footer>
    </div>
  );
}
