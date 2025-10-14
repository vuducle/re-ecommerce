'use client';

import { useState } from 'react';
import { useDispatch } from 'react-redux';
import { setAuth } from '../store/slices/authSlice';
import { authWithPassword, AppUser } from '../lib/pocketbase';
import { useRouter } from 'next/navigation';
import type { AppDispatch } from '../store';
import { Button } from './ui/button';
import { useNotification } from '../context/NotificationContext';

export default function LoginForm() {
  const dispatch = useDispatch<AppDispatch>();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  // const [remember, setRemember] = useState(true);
  const router = useRouter();
  const { showNotification } = useNotification();

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const { user, token } = await authWithPassword(email, password);

      if (user) {
        // user is already normalized to AppUser by authWithPassword
        dispatch(
          setAuth({
            user: user as AppUser,
            token: token ?? undefined,
          })
        );
        // redirect based on role
        if ((user as AppUser).isAdmin) {
          router.push('/dashboard');
        } else {
          router.push('/');
        }
        showNotification('Signed in successfully', 'success');
      } else {
        // fallback: mock login for dev if no API
        if (
          email === 'admin@example.com' &&
          password === 'password'
        ) {
          dispatch(
            setAuth({
              user: { id: '1', email, name: 'Admin', isAdmin: true },
              token: 'dev-token',
            })
          );
        } else if (
          email === 'user@example.com' &&
          password === 'password'
        ) {
          dispatch(
            setAuth({
              user: { id: '2', email, name: 'User' },
              token: 'dev-token',
            })
          );
        } else {
          throw new Error('Invalid credentials');
        }
      }
    } catch (err: unknown) {
      const msg =
        typeof err === 'object' && err !== null && 'message' in err
          ? (err as { message?: string }).message
          : String(err);
      setError(msg || 'Login failed');
      showNotification(msg || 'Login failed', 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full max-w-md mx-auto">
      <div className="bg-gradient-to-b from-[#070707] to-[#0f0f0f] border border-white/6 rounded-2xl p-6 shadow-2xl">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-12 h-12 rounded-full bg-[#ffdede]/10 flex items-center justify-center text-[#ffdede] font-orbitron text-lg">
            RE
          </div>
          <div>
            <h2 className="text-lg font-orbitron text-white">
              Welcome back
            </h2>
            <p className="text-sm text-gray-300">
              Sign in to continue to RESIDENT E-COMMERCE
            </p>
          </div>
        </div>

        <form onSubmit={onSubmit} className="space-y-4">
          <div>
            <label className="block text-sm text-gray-300">
              Email
            </label>
            <input
              className="mt-2 w-full rounded-lg bg-[#0b0b0b] text-white border border-white/6 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-red-500/40"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              type="email"
              placeholder="you@domain.com"
              required
            />
          </div>

          <div>
            <label className="block text-sm text-gray-300">
              Password
            </label>
            <input
              className="mt-2 w-full rounded-lg bg-[#0b0b0b] text-white border border-white/6 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-red-500/40"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              type="password"
              placeholder="••••••••"
              required
            />
          </div>

          {error && (
            <div className="text-sm text-red-400">{error}</div>
          )}

          <div>
            <Button
              type="submit"
              variant="destructive"
              className="w-full"
            >
              {loading ? 'Signing in…' : 'Sign in'}
            </Button>
          </div>
        </form>

        {/* ToastContainer is provided globally by ToastProvider in layout */}
        <div className="mt-5 text-center text-sm text-gray-400">
          <span>Don’t have an account?</span>
          <a
            href="/register"
            className="ml-2 text-red-400 hover:underline"
          >
            Create one
          </a>
        </div>

        <div className="mt-4 text-xs text-gray-500">
          <div className="italic">Dev quick logins:</div>
          <div className="mt-1">
            admin@example.com / password (admin)
          </div>
          <div>user@example.com / password</div>
        </div>
      </div>
    </div>
  );
}
