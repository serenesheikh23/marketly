import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { authApi } from '@/api/client';
import { useAppDispatch, setUser } from '@/store';
import toast from 'react-hot-toast';

export default function Register() {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const [form, setForm] = useState({ name: '', email: '', password: '', password_confirmation: '' });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await authApi.register(form);
      dispatch(setUser(res.data.user));
      toast.success('Account created!');
      navigate('/dashboard');
    } catch (err: any) {
      toast.error(err.response?.data?.message ?? 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto card">
      <h1 className="text-2xl font-bold mb-6">Create Account</h1>
      <form onSubmit={handleSubmit} className="space-y-4">
        {[
          { key: 'name', label: 'Name', type: 'text' },
          { key: 'email', label: 'Email', type: 'email' },
          { key: 'password', label: 'Password', type: 'password' },
          { key: 'password_confirmation', label: 'Confirm Password', type: 'password' },
        ].map((f) => (
          <div key={f.key}>
            <label className="label">{f.label}</label>
            <input
              type={f.type}
              required
              minLength={f.key.includes('password') ? 8 : undefined}
              className="input"
              value={(form as any)[f.key]}
              onChange={(e) => setForm((p) => ({ ...p, [f.key]: e.target.value }))}
            />
          </div>
        ))}
        <button type="submit" disabled={loading} className="btn-primary w-full">
          {loading ? 'Creating…' : 'Sign Up'}
        </button>
      </form>
      <p className="text-sm text-center mt-4 text-gray-600">
        Already have an account? <Link to="/login" className="text-primary-600">Sign in</Link>
      </p>
    </div>
  );
}
