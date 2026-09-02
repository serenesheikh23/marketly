import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || '/api',
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
    Accept: 'application/json',
  },
});

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('auth_user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export default api;

// Auth
export const authApi = {
  register: (data: { name: string; email: string; password: string; password_confirmation: string }) =>
    api.post('/auth/register', data),
  login: (data: { email: string; password: string }) => api.post('/auth/login', data),
  logout: () => api.post('/auth/logout'),
  me: () => api.get('/auth/me'),
};

// Categories
export const categoryApi = {
  list: () => api.get('/categories'),
  show: (slug: string) => api.get(`/categories/${slug}`),
  formSchema: (slug: string) => api.get(`/categories/${slug}/form-schema`),
};

// Products
export const productApi = {
  list: (params?: Record<string, string>) => api.get('/products', { params }),
  show: (slug: string) => api.get(`/products/${slug}`),
};

// Orders
export const orderApi = {
  list: () => api.get('/orders'),
  create: (data: { items: Array<{ product_id: number; quantity: number; payload?: Record<string, unknown> }>; payment_method: string }) =>
    api.post('/orders', data),
  show: (id: number) => api.get(`/orders/${id}`),
};

// Deposits
export const depositApi = {
  list: () => api.get('/deposits'),
  create: (data: { amount: number; method: string }) => api.post('/deposits', data),
};

// Withdrawals
export const withdrawalApi = {
  list: () => api.get('/withdrawals'),
  create: (data: { amount: number; wallet_address: string; method: string }) =>
    api.post('/withdrawals', data),
};

// VIP
export const vipApi = {
  status: () => api.get('/vip/status'),
  upgrade: (target: string) => api.post('/vip/upgrade', { target }),
};

// Transactions
export const transactionApi = {
  list: () => api.get('/transactions'),
};

// Admin — Users
export const adminUserApi = {
  list: (params?: Record<string, string>) => api.get('/admin/users', { params }),
  update: (id: number, data: Record<string, unknown>) => api.patch(`/admin/users/${id}`, data),
  delete: (id: number) => api.delete(`/admin/users/${id}`),
};

// Admin — Products
export const adminProductApi = {
  list: (params?: Record<string, string>) => api.get('/admin/products', { params }),
  create: (data: Record<string, unknown>) => api.post('/admin/products', data),
  update: (id: number, data: Record<string, unknown>) => api.patch(`/admin/products/${id}`, data),
  delete: (id: number) => api.delete(`/admin/products/${id}`),
};

// Admin — Categories
export const adminCategoryApi = {
  list: () => api.get('/admin/categories'),
  create: (data: Record<string, unknown>) => api.post('/admin/categories', data),
  update: (id: number, data: Record<string, unknown>) => api.patch(`/admin/categories/${id}`, data),
  delete: (id: number) => api.delete(`/admin/categories/${id}`),
};

// Admin — Orders
export const adminOrderApi = {
  list: (params?: Record<string, string>) => api.get('/admin/orders', { params }),
  pendingManual: () => api.get('/admin/orders/pending-manual'),
  updateStatus: (id: number, data: { status: string; notes?: string }) =>
    api.patch(`/admin/orders/${id}/status`, data),
};

// Admin — Deposits
export const adminDepositApi = {
  list: (params?: Record<string, string>) => api.get('/admin/deposits', { params }),
  approve: (id: number) => api.post(`/admin/deposits/${id}/approve`),
  reject: (id: number, reason: string) => api.post(`/admin/deposits/${id}/reject`, { reason }),
};

// Admin — Withdrawals
export const adminWithdrawalApi = {
  list: (params?: Record<string, string>) => api.get('/admin/withdrawals', { params }),
  approve: (id: number) => api.post(`/admin/withdrawals/${id}/approve`),
  reject: (id: number, reason: string) => api.post(`/admin/withdrawals/${id}/reject`, { reason }),
};

// Admin — Settings
export const adminSettingsApi = {
  list: () => api.get('/admin/settings'),
  update: (data: { key: string; value: string; type?: string }) => api.post('/admin/settings', data),
  bulkUpdate: (items: Array<{ key: string; value: string; type?: string }>) =>
    api.post('/admin/settings/bulk', { items }),
};

// Admin — Dashboard
export const adminDashboardApi = {
  stats: () => api.get('/admin/dashboard'),
};
