import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { authApi } from '@/api/client';
import { useAppDispatch, setUser } from '@/store';
import toast from 'react-hot-toast';
import HeroArt from '@/components/HeroArt';
import Logo from '@/components/Logo';
import Button from '@/components/Button';
import PageTransition from '@/components/PageTransition';

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
      const isAdmin = roles.some(
        (r: { name: string }) => r.name === 'admin' || r.name === 'moderator',
      );
      navigate(isAdmin ? '/admin' : '/dashboard');
    } catch (err: any) {
      toast.error(err.response?.data?.message ?? 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <PageTransition className="min-h-screen flex">
      {/* ── Left panel: brand / art ─────────────────────────── */}
      <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden">
        <HeroArt variant="aurora" className="absolute inset-0 w-full h-full" />
        <div className="relative z-10 flex flex-col justify-between p-12 w-full">
          <Logo size="md" />
          <div className="space-y-6">
            <p className="eyebrow">Digital Marketplace</p>
            <h1 className="text-h1 text-ink-900 leading-tight text-balance">
              Buy, sell &amp; trade<br />
              <span className="text-accent-400">instantly.</span>
            </h1>
            <p className="text-body text-ink-600 max-w-sm">
              Thousands of digital products, auto-delivery, and manual services — all in one place.
            </p>
          </div>
          <p className="text-micro text-ink-500">
            &copy; {new Date().getFullYear()} marketly. All rights reserved.
          </p>
        </div>
      </div>

      {/* ── Right panel: form ─────────────────────────────────── */}
      <div className="flex-1 flex items-center justify-center px-6 py-12 lg:px-16">
        <div className="w-full max-w-md">
          {/* Mobile logo */}
          <div className="lg:hidden mb-10 flex justify-center">
            <Logo size="lg" />
          </div>

          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1, duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
          >
            <h2 className="text-h2 text-ink-900 mb-2">Sign in</h2>
            <p className="text-body text-ink-600 mb-8">
              New to marketly?{' '}
              <Link to="/register" className="text-accent-400 hover:text-accent-300 transition-colors">
                Create an account
              </Link>
            </p>
          </motion.div>

          <motion.form
            onSubmit={handleSubmit}
            className="space-y-5"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.18, duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
          >
            <div>
              <label htmlFor="email" className="label">Email address</label>
              <input
                id="email"
                type="email"
                required
                autoComplete="email"
                className="input"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
            <div>
              <label htmlFor="password" className="label">Password</label>
              <input
                id="password"
                type="password"
                required
                autoComplete="current-password"
                className="input"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>
            <Button
              type="submit"
              variant="accent"
              size="lg"
              loading={loading}
              className="w-full mt-2"
            >
              Sign in
            </Button>
          </motion.form>

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4, duration: 0.4 }}
            className="mt-8 p-4 bg-ink-100 border border-ink-200 rounded-xl"
          >
            <p className="text-micro text-ink-500 uppercase tracking-wide mb-2">Demo accounts</p>
            <p className="text-micro text-ink-600 mb-1">Password for all: <code className="text-accent-400">password</code></p>
            <div className="space-y-0.5 mt-2">
              {[
                'admin@demo.test — full admin',
                'mod@demo.test — moderator',
                'user@demo.test — regular user',
              ].map((d) => (
                <p key={d} className="text-micro text-ink-500">{d}</p>
              ))}
            </div>
          </motion.div>
        </div>
      </div>
    </PageTransition>
  );
}
