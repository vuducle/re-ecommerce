'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useDispatch } from 'react-redux';
import type { AppDispatch } from '../store';
import pb, { authWithPassword } from '../lib/pocketbase';
import { setAuth } from '../store/slices/authSlice';
import { Button } from './ui/button';
import { FaCloudUploadAlt } from 'react-icons/fa';


export default function RegisterForm() {
  const router = useRouter();
  const dispatch = useDispatch<AppDispatch>();

  const [email, setEmail] = useState<string>('');
  const [name, setName] = useState<string>('');
  const [password, setPassword] = useState<string>('');
  const [passwordConfirm, setPasswordConfirm] = useState<string>('');
  const [lastKnownLocation, setLastKnownLocation] =
    useState<string>('');
  const [profileImage, setProfileImage] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [fileError, setFileError] = useState<string | null>(null);
  const [passwordError, setPasswordError] = useState<string | null>(
    null
  );
  const [passwordConfirmError, setPasswordConfirmError] = useState<
    string | null
  >(null);
  const [emailError, setEmailError] = useState<string | null>(null);

  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const onFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files && e.target.files[0];
    setFileError(null);
    if (!f) {
      setProfileImage(null);
      return;
    }

    // validate type
    if (!f.type.startsWith('image/')) {
      setFileError('Only image files are allowed');
      setProfileImage(null);
      return;
    }

    // validate size (max 5MB)
    const MAX = 5 * 1024 * 1024;
    if (f.size > MAX) {
      setFileError('Image is too large (max 5 MB)');
      setProfileImage(null);
      return;
    }

    setProfileImage(f);
  };

  // generate preview URL and clean up
  React.useEffect(() => {
    if (!profileImage) {
      setPreviewUrl(null);
      return;
    }
    const url = URL.createObjectURL(profileImage);
    setPreviewUrl(url);
    return () => URL.revokeObjectURL(url);
  }, [profileImage]);

  function validateEmail(value: string) {
    // simple email regex
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
  }

  function checkPasswordStrength(pw: string) {
    if (pw.length < 8)
      return 'Password must be at least 8 characters';
    // require number and letter
    if (!/[0-9]/.test(pw) || !/[A-Za-z]/.test(pw))
      return 'Password should include letters and numbers';
    return null;
  }

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      // client-side validation
      const emOk = validateEmail(email);
      const pwErr = checkPasswordStrength(password);
      setEmailError(emOk ? null : 'Please enter a valid email');
      setPasswordError(pwErr);
      // password confirmation
      if (!passwordConfirm) {
        setPasswordConfirmError('Please confirm your password');
      } else if (passwordConfirm !== password) {
        setPasswordConfirmError('Passwords do not match');
      } else {
        setPasswordConfirmError(null);
      }

      if (!emOk || pwErr) {
        setLoading(false);
        return;
      }

      if (passwordConfirmError || passwordConfirm !== password) {
        setLoading(false);
        return;
      }

      const form = new FormData();
      form.append('email', email);
      form.append('password', password);
      form.append('passwordConfirm', passwordConfirm);
      form.append('name', name);
      if (lastKnownLocation)
        form.append('lastKnownLocation', lastKnownLocation);
      if (profileImage)
        form.append('profileImage', profileImage, profileImage.name);

      // create user record in PocketBase
      const res = await pb.post(
        '/api/collections/users/records',
        form
      );
      if (res.status !== 200 && res.status !== 201) {
        throw new Error(`create user failed: ${res.status}`);
      }

      // login the new user
      const auth = await authWithPassword(email, password);
      if (!auth.user)
        throw new Error('Registration succeeded but login failed');

      // update redux state
      dispatch(
        setAuth({ user: auth.user, token: auth.token ?? undefined })
      );

      // navigate to dashboard
      router.push('/profile');
    } catch (err: unknown) {
      const maybe = err as {
        response?: { data?: unknown };
        message?: string;
      };
      if (maybe.response?.data)
        setError(JSON.stringify(maybe.response.data));
      else setError(maybe.message ?? String(err));
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
              Create an account
            </h2>
            <p className="text-sm text-gray-300">
              Sign up to join RESIDENT E-COMMERCE
            </p>
          </div>
        </div>

        <form onSubmit={onSubmit} className="space-y-4">
          {error && (
            <div className="text-sm text-yellow-300">{error}</div>
          )}

          <div>
            <label className="block text-sm text-gray-300">
              Email
            </label>
            <input
              className="mt-2 w-full rounded-lg bg-[#0b0b0b] text-white border border-white/6 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-red-500/40"
              value={email}
              onChange={(e) => {
                setEmail(e.target.value);
                setEmailError(null);
              }}
              type="email"
              placeholder="you@domain.com"
              required
            />
            {emailError && (
              <div className="text-xs text-yellow-300 mt-1">
                {emailError}
              </div>
            )}
          </div>

          <div>
            <label className="block text-sm text-gray-300">
              Name
            </label>
            <input
              className="mt-2 w-full rounded-lg bg-[#0b0b0b] text-white border border-white/6 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-red-500/40"
              value={name}
              onChange={(e) => setName(e.target.value)}
              type="text"
              placeholder="Your name"
            />
          </div>

          <div>
            <label className="block text-sm text-gray-300">
              Password
            </label>
            <input
              className="mt-2 w-full rounded-lg bg-[#0b0b0b] text-white border border-white/6 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-red-500/40"
              value={password}
              onChange={(e) => {
                setPassword(e.target.value);
                setPasswordError(null);
              }}
              type="password"
              placeholder="••••••••"
              required
            />
            {passwordError ? (
              <div className="text-xs text-yellow-300 mt-1">
                {passwordError}
              </div>
            ) : (
              <div className="text-xs text-gray-500 mt-1">
                Password must be 8+ chars and include letters &
                numbers.
              </div>
            )}
          </div>

          <div>
            <label className="block text-sm text-gray-300">
              Confirm password
            </label>
            <input
              className="mt-2 w-full rounded-lg bg-[#0b0b0b] text-white border border-white/6 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-red-500/40"
              value={passwordConfirm}
              onChange={(e) => {
                setPasswordConfirm(e.target.value);
                setPasswordConfirmError(null);
              }}
              type="password"
              placeholder="Confirm password"
              required
            />
            {passwordConfirmError && (
              <div className="text-xs text-yellow-300 mt-1">
                {passwordConfirmError}
              </div>
            )}
          </div>

          <div>
            <label className="block text-sm text-gray-300">
              Last known location
            </label>
            <input
              className="mt-2 w-full rounded-lg bg-[#0b0b0b] text-white border border-white/6 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-red-500/40"
              value={lastKnownLocation}
              onChange={(e) => setLastKnownLocation(e.target.value)}
              type="text"
              placeholder="City, Country"
            />
          </div>

          <div>
            <label className="block text-sm text-gray-300 mb-2">
              Profile image
            </label>
            <div className="flex items-center gap-4">
              <div>
                {previewUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={previewUrl}
                    alt="preview"
                    className="w-20 h-20 rounded-full object-cover"
                  />
                ) : (
                  <div className="w-20 h-20 rounded-full bg-[#0b0b0b] flex items-center justify-center text-gray-400 font-bold">
                    RE
                  </div>
                )}
              </div>

              <div className="flex-1">
                <input
                  id="profileImage"
                  type="file"
                  accept="image/*"
                  onChange={onFileChange}
                  className="hidden"
                />
                <label
                  htmlFor="profileImage"
                  className="inline-flex items-center gap-2 px-4 py-2 rounded-lg border border-dashed border-white/8 bg-[#0b0b0b] text-sm text-gray-300 cursor-pointer hover:border-white/20"
                >
                  <FaCloudUploadAlt className="text-gray-400" />
                  <span>
                    {profileImage
                      ? profileImage.name
                      : 'Upload an image'}
                  </span>
                </label>
                {fileError && (
                  <div className="text-xs text-yellow-300 mt-2">
                    {fileError}
                  </div>
                )}
                <div className="text-xs text-gray-500 mt-2">
                  Max 2 MB. Square images look best.
                </div>
              </div>
            </div>
          </div>

          <div>
            <Button
              type="submit"
              variant="destructive"
              className="w-full"
              disabled={
                loading ||
                !!emailError ||
                !!passwordError ||
                !!fileError
              }
            >
              {loading ? 'Creating…' : 'Create account'}
            </Button>
          </div>
        </form>

        {/* ToastContainer is provided globally by ToastProvider in layout */}
        <div className="mt-5 text-center text-sm text-gray-400">
          <span>Already have an account?</span>
          <a
            href="/login"
            className="ml-2 text-red-400 hover:underline"
          >
            Sign in
          </a>
        </div>
      </div>
    </div>
  );
}
