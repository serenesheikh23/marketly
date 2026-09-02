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

  const set = (key: string) => (e: React.ChangeEvent<HTMLInputElement>) =>
    setForm((p) => ({ ...p, [key]: e.target.value }));

  return (
    <PageTransition className="min-h-screen flex">
      {/* ── Left panel: brand / art ─────────────────────────── */}
      <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden">
        <HeroArt variant="orbs" className="absolute inset-0 w-full h-full" />
        <div className="relative z-10 flex flex-col justify-between p-12 w-full">
          <Logo size="md" />
          <div className="space-y-6">
            <p className="eyebrow">Join marketly</p>
            <h1 className="text-h1 text-ink-900 leading-tight text-balance">
              Start trading<br />
              <span className="text-accent-400">today.</span>
            </h1>
            <ul className="space-y-3">
              {[
                'Instant auto-delivery products',
                'Manual & custom services',
                'VIP tiers with withdrawal limits',
              ].map((f) => (
                <li key={f} className="flex items-center gap-3 text-body text-ink-600">
                  <span className="inline-flex w-5 h-5 rounded-full bg-accent-500/15 border border-accent-500/25 flex items-center justify-center flex-shrink-0">
                    <svg width="10" height="10" viewBox="0 0 10 10" fill="none">
                      <path d="M2 5l2.5 2.5L8 3" stroke="#10B981" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  </span>
                  {f}
                </li>
              ))}
            </ul>
          </div>
          <p className="text-micro text-ink-500">
            &copy; {new Date().getFullYear()} marketly. All rights reserved.
          </p>
        </div>
      </div>

      {/* ── Right panel: form ─────────────────────────────────── */}
      <div className="flex-1 flex items-center justify-center px-6 py-12 lg:px-16">
        <div className="w-full max-w-md">
          <div className="lg:hidden mb-10 flex justify-center">
            <Logo size="lg" />
          </div>

          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1, duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
          >
            <h2 className="text-h2 text-ink-900 mb-2">Create account</h2>
            <p className="text-body text-ink-600 mb-8">
              Already have one?{' '}
              <Link to="/login" className="text-accent-400 hover:text-accent-300 transition-colors">
                Sign in
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
            {[
              { key: 'name', label: 'Full name', type: 'text', placeholder: 'John Doe' },
              { key: 'email', label: 'Email address', type: 'email', placeholder: 'you@example.com' },
              { key: 'password', label: 'Password', type: 'password', placeholder: 'Min. 10 characters · letters, numbers, symbol' },
              { key: 'password_confirmation', label: 'Confirm password', type: 'password', placeholder: 'Repeat password' },
            ].map(({ key, label, type, placeholder }) => (
              <div key={key}>
                <label htmlFor={key} className="label">{label}</label>
                <input
                  id={key}
                  type={type}
                  required
                  minLength={key.includes('password') ? 10 : undefined}
                  autoComplete={key === 'password_confirmation' ? 'new-password' : key}
                  className="input"
                  placeholder={placeholder}
                  value={(form as any)[key]}
                  onChange={set(key)}
                  aria-describedby={key === 'password' ? 'password-hint' : undefined}
                />
                {key === 'password' && (
                  <p id="password-hint" className="text-micro text-ink-500 mt-1.5">
                    At least 10 characters with letters, numbers, and a symbol.
                  </p>
                )}
              </div>
            ))}

            <Button
              type="submit"
              variant="accent"
              size="lg"
              loading={loading}
              className="w-full mt-2"
            >
              Create account
            </Button>

            <p className="text-micro text-ink-500 text-center">
              By creating an account you agree to our{' '}
              <span className="text-ink-600">Terms of Service</span>.
            </p>
          </motion.form>
        </div>
      </div>
    </PageTransition>
  );
}
