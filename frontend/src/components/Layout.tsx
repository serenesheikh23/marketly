import { useState, useEffect } from 'react';
import { Outlet, Link, useNavigate } from 'react-router-dom';
import { useAppSelector, useAppDispatch, logout } from '@/store';
import { authApi } from '@/api/client';
import Logo from './Logo';
import PageTransition from './PageTransition';
import LanguageSwitcher from './LanguageSwitcher';
import ThemeToggle from './ThemeToggle';
import Footer from './Footer';
import CartDrawer from './CartDrawer';
import SearchPalette from './SearchPalette';
import { useI18n } from '@/i18n';
import { formatPrice } from '@/utils/format';

export default function Layout() {
  const { user, isAuthenticated } = useAppSelector((s) => s.auth);
  const cartItems = useAppSelector((s) => s.cart.items);
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const { t } = useI18n();
  const roles = (user as unknown as { roles?: Array<{ name: string }> })?.roles?.map((r) => r.name) ?? [];

  const [mobileOpen, setMobileOpen] = useState(false);
  const [cartOpen, setCartOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);

  // Listen for global search open event
  useEffect(() => {
    const handler = () => setSearchOpen(true);
    window.addEventListener('open-search-palette', handler);
    return () => window.removeEventListener('open-search-palette', handler);
  }, []);

  const handleLogout = async () => {
    try { await authApi.logout(); } catch (_) { /* ignore */ }
    dispatch(logout());
    setMobileOpen(false);
    navigate('/login');
  };

  const closeMenu = () => setMobileOpen(false);
  const toggleMenu = () => setMobileOpen((v) => !v);

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-ink flex flex-col overflow-x-hidden">
      <header className="sticky top-0 z-50 border-b border-gray-200 dark:border-ink-200 bg-white/90 dark:bg-ink/90 backdrop-blur-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between gap-2 flex-wrap">
          <Link to="/" className="flex items-center gap-2 flex-shrink-0">
            <Logo size="sm" showText />
          </Link>

          {/* Desktop nav (auth-aware links) */}
          <nav className="hidden md:flex items-center gap-2 flex-1 flex-wrap">
            {isAuthenticated ? (
              <>
                <Link to="/dashboard" className="nav-link text-sm">{t('nav.dashboard')}</Link>
                {(roles.includes('admin') || roles.includes('moderator')) && (
                  <Link to="/admin" className="nav-link text-sm text-green-400">{t('nav.admin')}</Link>
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
          </nav>

          {/* Right-side icon group — visible on ALL screens */}
          <div className="ms-auto flex items-center gap-1 sm:gap-2">
            {/* Search — icon-only on mobile, with "Search" label on sm+ */}
            <button
              type="button"
              onClick={() => setSearchOpen(true)}
              className="p-2 rounded-lg text-gray-600 dark:text-ink-500
                         hover:text-gray-900 dark:hover:text-ink-900
                         hover:bg-gray-100 dark:hover:bg-ink-100
                         transition-colors"
              aria-label={t('common.search') ?? 'Search'}
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <circle cx="11" cy="11" r="8" />
                <line x1="21" y1="21" x2="16.65" y2="16.65" />
              </svg>
            </button>

            {/* Cart — always visible for authenticated users */}
            {isAuthenticated && (
              <button
                type="button"
                onClick={() => setCartOpen(true)}
                className="relative p-2 rounded-lg text-gray-600 dark:text-ink-500
                           hover:text-gray-900 dark:hover:text-ink-900
                           hover:bg-gray-100 dark:hover:bg-ink-100
                           transition-colors"
                aria-label={t('nav.cart')}
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                  <path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z" />
                  <line x1="3" y1="6" x2="21" y2="6" />
                  <path d="M16 10a4 4 0 0 1-8 0" />
                </svg>
                {cartItems.length > 0 && (
                  <span className="absolute -top-0.5 -end-0.5 bg-green-500 text-ink text-[10px] font-bold rounded-full w-4 h-4 flex items-center justify-center">
                    {cartItems.length}
                  </span>
                )}
              </button>
            )}

            <LanguageSwitcher />
            <ThemeToggle />

            {/* Hamburger — only mobile/tablet */}
            <button
              type="button"
              onClick={toggleMenu}
              className="md:hidden p-2 rounded-lg text-gray-700 dark:text-ink-700 hover:bg-gray-100 dark:hover:bg-ink-100 transition-colors"
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

      {/* Mobile menu overlay (mimics sidebar) */}
      {mobileOpen && (
        <>
          <div
            className="fixed inset-0 bg-black/50 z-40 lg:hidden"
            onClick={closeMenu}
          />
          <div
            className="md:hidden z-50 bg-white dark:bg-ink-50 border-b border-gray-200 dark:border-ink-200 shadow-lg"
          >
            <nav className="px-4 py-3 space-y-1">
              {isAuthenticated ? (
                <>
                  <Link to="/dashboard" className="nav-link" onClick={closeMenu}>{t('nav.dashboard')}</Link>
                  {(roles.includes('admin') || roles.includes('moderator')) && (
                    <Link to="/admin" className="nav-link text-green-400" onClick={closeMenu}>{t('nav.admin')}</Link>
                  )}
                  <button onClick={() => { closeMenu(); setCartOpen(true); }} className="nav-link w-full text-left">{t('nav.cart')}</button>
                  <div className="pt-2 pb-1 text-xs text-gray-500 dark:text-ink-500 font-semibold uppercase tracking-wider">Balance: {formatPrice(user?.balance)}</div>
                  <button onClick={handleLogout} className="nav-link text-status-rejected/80 hover:text-status-rejected hover:bg-status-rejected/10 w-full text-left">
                    {t('nav.signOut')}
                  </button>
                </>
              ) : (
                <>
                  <Link to="/products" className="nav-link" onClick={closeMenu}>{t('nav.products')}</Link>
                  <Link to="/login" className="nav-link" onClick={closeMenu}>{t('nav.signIn')}</Link>
                  <Link to="/register" className="nav-link" onClick={closeMenu}>{t('nav.getStarted')}</Link>
                </>
              )}
            </nav>
          </div>
        </>
      )}

      <main className="flex-1">
        <PageTransition className="max-w-7xl mx-auto px-4 sm:px-6 py-6 sm:py-10">
          <Outlet />
        </PageTransition>
      </main>

      <Footer />

      <CartDrawer isOpen={cartOpen} onClose={() => setCartOpen(false)} />
      <SearchPalette isOpen={searchOpen} onClose={() => setSearchOpen(false)} />
    </div>
  );
}