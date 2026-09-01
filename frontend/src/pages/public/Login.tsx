import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { authApi } from '@/api/client';
import { useAppDispatch, setUser } from '@/store';
import toast from 'react-hot-toast';

export default function Login() {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await authApi.login({ email, password });
      const userData = res.data.user;
      const roles = userData.roles ?? [];
      dispatch(setUser({ ...userData, roles }));
      toast.success('Welcome back!');
      const isAdmin = roles.some((r: { name: string }) => r.name === 'admin' || r.name === 'moderator');
      navigate(isAdmin ? '/admin' : '/dashboard');
    } catch (err: any) {
      toast.error(err.response?.data?.message ?? 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto card">
      <h1 className="text-2xl font-bold mb-6">Login</h1>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="label">Email</label>
          <input type="email" required className="input" value={email} onChange={(e) => setEmail(e.target.value)} />
        </div>
        <div>
          <label className="label">Password</label>
          <input type="password" required className="input" value={password} onChange={(e) => setPassword(e.target.value)} />
        </div>
        <button type="submit" disabled={loading} className="btn-primary w-full">
          {loading ? 'Signing in…' : 'Sign In'}
        </button>
      </form>
      <p className="text-sm text-center mt-4 text-gray-600">
        Don't have an account? <Link to="/register" className="text-primary-600">Sign up</Link>
      </p>

      <div className="mt-6 p-3 bg-gray-50 rounded text-xs text-gray-500">
        <strong>Demo accounts (password: <code>password</code>):</strong>
        <ul className="mt-1 space-y-0.5">
          <li>admin@demo.test — full admin</li>
          <li>mod@demo.test — moderator</li>
          <li>vip2@demo.test, vip1@demo.test, user@demo.test</li>
        </ul>
      </div>
    </div>
  );
}
