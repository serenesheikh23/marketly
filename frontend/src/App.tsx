import { lazy, Suspense } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useAppSelector } from '@/hooks/useAuth';
import Layout from '@/components/Layout';
import AdminLayout from '@/components/AdminLayout';
import ErrorBoundary from '@/components/ErrorBoundary';
import Analytics from '@/components/Analytics';

// Lazy load all page components
const Home           = lazy(() => import('@/pages/public/Home'));
const Products       = lazy(() => import('@/pages/public/Products'));
const CategoryPage   = lazy(() => import('@/pages/public/CategoryPage'));
const ProductPage    = lazy(() => import('@/pages/public/ProductPage'));
const Cart           = lazy(() => import('@/pages/public/Cart'));
const Login          = lazy(() => import('@/pages/public/Login'));
const Register       = lazy(() => import('@/pages/public/Register'));
const Dashboard      = lazy(() => import('@/pages/account/Dashboard'));
const Deposit        = lazy(() => import('@/pages/account/Deposit'));
const Withdraw       = lazy(() => import('@/pages/account/Withdraw'));
const Orders         = lazy(() => import('@/pages/account/Orders'));
const VipPage        = lazy(() => import('@/pages/account/VipPage'));
const ManualServices = lazy(() => import('@/pages/account/ManualServices'));
const AdminDashboard   = lazy(() => import('@/pages/admin/Dashboard'));
const AdminUsers       = lazy(() => import('@/pages/admin/Users'));
const AdminProducts    = lazy(() => import('@/pages/admin/Products'));
const AdminCategories  = lazy(() => import('@/pages/admin/Categories'));
const AdminOrders      = lazy(() => import('@/pages/admin/Orders'));
const AdminManualOrders= lazy(() => import('@/pages/admin/ManualOrders'));
const AdminDeposits    = lazy(() => import('@/pages/admin/Deposits'));
const AdminWithdrawals = lazy(() => import('@/pages/admin/Withdrawals'));
const AdminSettings    = lazy(() => import('@/pages/admin/Settings'));
const LegalPage        = lazy(() => import('@/pages/public/LegalPage'));
const NotFound         = lazy(() => import('@/pages/NotFound'));

function LoadingSpinner() {
  return (
    <div className="flex items-center justify-center py-24">
      <span className="w-8 h-8 rounded-full border-2 border-accent-500 border-t-transparent animate-spin" />
    </div>
  );
}

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { isAuthenticated } = useAppSelector((s) => s.auth);
  return isAuthenticated ? <>{children}</> : <Navigate to="/login" replace />;
}

function AdminRoute({ children }: { children: React.ReactNode }) {
  const user = useAppSelector((s) => s.auth.user);
  const roles = (user as unknown as { roles?: Array<{ name: string }> })?.roles?.map((r) => r.name) ?? [];
  const isAdmin = roles.includes('admin') || roles.includes('moderator');
  return isAdmin ? <>{children}</> : <Navigate to="/" replace />;
}

export default function App() {
  // TODO: Re-enable once Reverb is properly configured for production
  // useEcho();

  return (
    <ErrorBoundary>
      <Analytics />
      <Suspense fallback={<LoadingSpinner />}>
        <Routes>
          <Route element={<Layout />}>
            <Route path="/" element={<Home />} />
            <Route path="/products" element={<Products />} />
            <Route path="/category/:slug" element={<CategoryPage />} />
            <Route path="/product/:slug" element={<ProductPage />} />
            <Route path="/cart" element={<Cart />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/legal/:page" element={<LegalPage />} />
            <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
            <Route path="/dashboard/deposit" element={<ProtectedRoute><Deposit /></ProtectedRoute>} />
            <Route path="/dashboard/withdraw" element={<ProtectedRoute><Withdraw /></ProtectedRoute>} />
            <Route path="/dashboard/orders" element={<ProtectedRoute><Orders /></ProtectedRoute>} />
            <Route path="/dashboard/vip" element={<ProtectedRoute><VipPage /></ProtectedRoute>} />
            <Route path="/dashboard/manual-services" element={<ProtectedRoute><ManualServices /></ProtectedRoute>} />
          </Route>

          <Route element={<AdminRoute><AdminLayout /></AdminRoute>}>
            <Route path="/admin" element={<AdminDashboard />} />
            <Route path="/admin/users" element={<AdminUsers />} />
            <Route path="/admin/products" element={<AdminProducts />} />
            <Route path="/admin/categories" element={<AdminCategories />} />
            <Route path="/admin/orders" element={<AdminOrders />} />
            <Route path="/admin/orders/manual" element={<AdminManualOrders />} />
            <Route path="/admin/deposits" element={<AdminDeposits />} />
            <Route path="/admin/withdrawals" element={<AdminWithdrawals />} />
            <Route path="/admin/settings" element={<AdminSettings />} />
          </Route>

          <Route path="*" element={<NotFound />} />
        </Routes>
      </Suspense>
    </ErrorBoundary>
  );
}
