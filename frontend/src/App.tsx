import { Routes, Route, Navigate } from 'react-router-dom';
import { useAppSelector } from '@/hooks/useAuth';
import { useEcho } from '@/hooks/useEcho';
import Layout from '@/components/Layout';
import AdminLayout from '@/components/AdminLayout';
import Home from '@/pages/public/Home';
import CategoryPage from '@/pages/public/CategoryPage';
import ProductPage from '@/pages/public/ProductPage';
import Cart from '@/pages/public/Cart';
import Login from '@/pages/public/Login';
import Register from '@/pages/public/Register';
import Dashboard from '@/pages/account/Dashboard';
import Deposit from '@/pages/account/Deposit';
import Withdraw from '@/pages/account/Withdraw';
import Orders from '@/pages/account/Orders';
import VipPage from '@/pages/account/VipPage';
import ManualServices from '@/pages/account/ManualServices';
import AdminDashboard from '@/pages/admin/Dashboard';
import AdminUsers from '@/pages/admin/Users';
import AdminProducts from '@/pages/admin/Products';
import AdminCategories from '@/pages/admin/Categories';
import AdminOrders from '@/pages/admin/Orders';
import AdminManualOrders from '@/pages/admin/ManualOrders';
import AdminDeposits from '@/pages/admin/Deposits';
import AdminWithdrawals from '@/pages/admin/Withdrawals';
import AdminSettings from '@/pages/admin/Settings';

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
  useEcho();

  return (
    <Routes>
      <Route element={<Layout />}>
        <Route path="/" element={<Home />} />
        <Route path="/category/:slug" element={<CategoryPage />} />
        <Route path="/product/:slug" element={<ProductPage />} />
        <Route path="/cart" element={<Cart />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
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
    </Routes>
  );
}
