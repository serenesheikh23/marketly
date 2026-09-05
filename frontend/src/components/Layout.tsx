import { useState, useRef, useEffect } from 'react';
import { Outlet, Link, useNavigate } from 'react-router-dom';
import { useAppSelector, useAppDispatch, logout } from '@/store';
import { authApi } from '@/api/client';
import Logo from './Logo';
import PageTransition from './PageTransition';
import LanguageSwitcher from './LanguageSwitcher';
import ThemeToggle from './ThemeToggle';
import Footer from './Footer';
import { useI18n } from '@/i18n';
import { formatPrice } from '@/utils/format';

export default function Layout() {
  const { user, isAuthenticated } = useAppSelector((s) => s.auth);
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const { t } = useI18n();
  const roles = (user as unknown as { roles?: Array<{ name: string }> })?.roles?.map((r) => r.name) ?? [];

  const [mobileOpen, setMobileOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  // Close menu on outside click
  useEffect(() => {
    if (!mobileOpen) return;
    const handler = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setMobileOpen(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [mobileOpen]);

  const handleLogout = async () => {
    try { await authApi.logout(); } catch (_) { /* ignore */ }
    dispatch(logout());
    setMobileOpen(false);
    navigate('/login');
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-ink flex flex-col overflow-x-hidden">
      {/* ── Header ─────────────────────────────────────────── */}
      <header className="sticky top-0 z-50 border-b border-gray-200 dark:border-ink-200 bg-white/90 dark:bg-ink/90 backdrop-blur-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between gap-2 flex-wrap">

          {/* Logo */}
          <Link to="/" className="flex items-center gap-2 flex-shrink-0">
            <Logo size="sm" showText />
          </Link>

          {/* Desktop nav */}
          <nav className="hidden md:flex items-center gap-2 flex-1 flex-wrap">
            {isAuthenticated ? (
              <>
                <Link to="/dashboard" className="nav-link text-sm hidden md:inline">{t('nav.dashboard')}</Link>
                {(roles.includes('admin') || roles.includes('moderator')) && (
                  <Link to="/admin" className="nav-link text-sm text-accent-400 hidden md:inline">{t('nav.admin')}</Link>
                )}
                <div className="mx-2 w-px h-5 bg-gray-300 dark:bg-ink-200" />
                <span className="text-sm text-gray-600 dark:text-ink-600 font-medium tabular-nums">
                  {formatPrice(user?.balance)}
                </span>
                <button onClick={handleLogout} className="nav-link text-sm text-status-rejected/80 hover:text-status-rejected hover:bg-status-rejected/10">
                  {t('nav.signOut')}
                </button>
              </>
            ) : (
              <>
                <Link to="/login" className="nav-link text-sm">{t('nav.signIn')}</Link>
                <Link to="/register" className="btn-accent btn-sm">{t('nav.getStarted')}</Link>
              </>
            )}
            <div className="ms-auto flex items-center gap-2">
              <LanguageSwitcher />
              <ThemeToggle />
            </div>
          </nav>

          {/* Mobile right side: only toggles + hamburger */}
          <div className="ms-auto flex items-center gap-1 md:hidden">
            <LanguageSwitcher />
            <ThemeToggle />
            <button
              type="button"
              onClick={() => setMobileOpen((v) => !v)}
              className="relative z-50 p-2 rounded-md text-gray-700 dark:text-ink-700 hover:bg-gray-100 dark:hover:bg-ink-100 transition-colors"
              aria-label={mobileOpen ? 'Close menu' : 'Toggle menu'}
              aria-expanded={mobileOpen}
            >
              {mobileOpen ? (
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                  <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
                </svg>
              ) : (
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                  <line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="18" x2="21" y2="18"/>
                </svg>
              )}
            </button>
          </div>
        </div>
      </header>

      {/* Mobile slide-down menu */}
      {mobileOpen && (
        <div
          ref={menuRef}
          className="md:hidden z-40 bg-white dark:bg-ink-50 border-b border-gray-200 dark:border-ink-200 shadow-lg"
        >
          <nav className="px-4 py-3 space-y-1">
            {isAuthenticated ? (
              <>
                <Link to="/dashboard" className="nav-link" onClick={() => setMobileOpen(false)}>{t('nav.dashboard')}</Link>
                {(roles.includes('admin') || roles.includes('moderator')) && (
                  <Link to="/admin" className="nav-link text-accent-400" onClick={() => setMobileOpen(false)}>{t('nav.admin')}</Link>
                )}
                <Link to="/cart" className="nav-link" onClick={() => setMobileOpen(false)}>{t('nav.cart')}</Link>
                <div className="pt-2 pb-1 text-xs text-gray-500 dark:text-ink-500 font-semibold uppercase tracking-wider">Balance: {formatPrice(user?.balance)}</div>
                <button
                  onClick={handleLogout}
                  className="nav-link text-status-rejected/80 hover:text-status-rejected hover:bg-status-rejected/10 w-full text-left"
                >
                  {t('nav.signOut')}
                </button>
              </>
            ) : (
              <>
                <Link to="/products" className="nav-link" onClick={() => setMobileOpen(false)}>{t('nav.products')}</Link>
                <Link to="/login" className="nav-link" onClick={() => setMobileOpen(false)}>{t('nav.signIn')}</Link>
                <Link to="/register" className="nav-link" onClick={() => setMobileOpen(false)}>{t('nav.getStarted')}</Link>
              </>
            )}
          </nav>
        </div>
      )}

      {/* ── Main ───────────────────────────────────────────── */}
      <main className="flex-1">
        <PageTransition className="max-w-7xl mx-auto px-4 sm:px-6 py-6 sm:py-10">
          <Outlet />
        </PageTransition>
      </main>

      {/* ── Footer ─────────────────────────────────────────── */}
      <Footer />
    </div>
  );
}
