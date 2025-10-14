'use client';

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import pb from '../lib/pocketbase';
import { Button } from './ui/button';
import Loading from './ui/Loading';


type Props = {
  open: boolean;
  onClose: () => void;
  onCreated?: (user: Record<string, unknown>) => void;
};

export default function CreateUserDialog({
  open,
  onClose,
  onCreated,
}: Props) {
  const [email, setEmail] = useState<string>('');
  const [name, setName] = useState<string>('');
  const [password, setPassword] = useState<string>('');
  const [passwordConfirm, setPasswordConfirm] = useState<string>('');
  const [lastKnownLocation, setLastKnownLocation] =
    useState<string>('');
  const [profileImage, setProfileImage] = useState<File | null>(null);
  const [isAdmin, setIsAdmin] = useState<boolean>(false);

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

  useEffect(() => {
    if (!profileImage) {
      setPreviewUrl(null);
      return;
    }
    const url = URL.createObjectURL(profileImage);
    setPreviewUrl(url);
    return () => URL.revokeObjectURL(url);
  }, [profileImage]);

  function validateEmail(value: string) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
  }

  function checkPasswordStrength(pw: string) {
    if (pw.length < 8)
      return 'Password must be at least 8 characters';
    if (!/[0-9]/.test(pw) || !/[A-Za-z]/.test(pw))
      return 'Password should include letters and numbers';
    return null;
  }

  const onFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files && e.target.files[0];
    setFileError(null);
    if (!f) {
      setProfileImage(null);
      return;
    }
    if (!f.type.startsWith('image/')) {
      setFileError('Only image files are allowed');
      setProfileImage(null);
      return;
    }
    const MAX = 5 * 1024 * 1024;
    if (f.size > MAX) {
      setFileError('Image is too large (max 5 MB)');
      setProfileImage(null);
      return;
    }
    setProfileImage(f);
  };

  const reset = () => {
    setEmail('');
    setName('');
    setPassword('');
    setPasswordConfirm('');
    setLastKnownLocation('');
    setProfileImage(null);
    setError(null);
    setEmailError(null);
    setPasswordError(null);
    setPasswordConfirmError(null);
    setFileError(null);
    setIsAdmin(false);
  };

  useEffect(() => {
    if (!open) reset();
  }, [open]);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const emOk = validateEmail(email);
      const pwErr = checkPasswordStrength(password);
      setEmailError(emOk ? null : 'Please enter a valid email');
      setPasswordError(pwErr);
      if (!passwordConfirm)
        setPasswordConfirmError('Please confirm your password');
      else if (passwordConfirm !== password)
        setPasswordConfirmError('Passwords do not match');
      else setPasswordConfirmError(null);

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
      form.append('isAdmin', String(isAdmin));
      if (lastKnownLocation)
        form.append('lastKnownLocation', lastKnownLocation);
      if (profileImage)
        form.append('profileImage', profileImage, profileImage.name);

      const res = await pb.post(
        '/api/collections/users/records',
        form
      );
      if (!(res.status === 200 || res.status === 201))
        throw new Error(`create user failed: ${res.status}`);

      const created = res.data;
      onCreated?.(created);
      onClose();
    } catch (err: unknown) {
      const maybe = err as {
        response?: { data?: unknown };
        message?: string;
      };
      if (maybe.response?.data) {
        const data = maybe.response.data as unknown;
        // try to extract field errors from common PocketBase response
        if (data && typeof data === 'object') {
          // if errors map exists
          const dd = data as Record<string, unknown>;
          if (dd.data && typeof dd.data === 'object') {
            const fieldErrors = dd.data as Record<string, unknown>;
            // map known fields
            if (fieldErrors.email)
              setEmailError(String(fieldErrors.email));
            if (fieldErrors.password)
              setPasswordError(String(fieldErrors.password));
            if (fieldErrors.profileImage)
              setFileError(String(fieldErrors.profileImage));
            setError(JSON.stringify(fieldErrors));
          } else {
            const maybeMsg =
              dd['message'] ?? dd['error'] ?? dd['detail'];
            if (maybeMsg) setError(String(maybeMsg));
            else setError(JSON.stringify(dd));
          }
        }
      } else setError(maybe.message ?? String(err));
    } finally {
      setLoading(false);
    }
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center">
      <div
        onClick={onClose}
        className={`absolute inset-0 bg-black/60`}
      />
      <div className="relative w-full max-w-lg mx-4 rounded-lg bg-gradient-to-b from-[#0b0b0b] to-[#141414] border border-white/6 overflow-hidden shadow-xl z-[10000]">
        <div className="flex items-center justify-between px-4 py-3 border-b border-white/6">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-[#ffdede]/10 flex items-center justify-center text-[#ffdede] font-orbitron text-sm">
              RE
            </div>
            <span className="font-orbitron text-sm text-[#ffdede]">
              Create user
            </span>
          </div>
          <div>
            <button
              onClick={onClose}
              className="p-2 rounded-md text-gray-200 hover:bg-white/3"
            >
              Close
            </button>
          </div>
        </div>

        <div className="p-4">
          {loading ? <Loading text="Creating user…" /> : null}
          {error && (
            <div className="text-sm text-yellow-300 mb-2">
              {error}
            </div>
          )}
          <form onSubmit={onSubmit} className="space-y-4">
            <div>
              <label className="block text-sm text-gray-300">
                Email
              </label>
              <input
                className="mt-2 w-full rounded-lg bg-[#0b0b0b] text-white border border-white/6 px-3 py-2"
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
                className="mt-2 w-full rounded-lg bg-[#0b0b0b] text-white border border-white/6 px-3 py-2"
                value={name}
                onChange={(e) => setName(e.target.value)}
                type="text"
                placeholder="Name"
              />
            </div>

            <div>
              <label className="block text-sm text-gray-300">
                Password
              </label>
              <input
                className="mt-2 w-full rounded-lg bg-[#0b0b0b] text-white border border-white/6 px-3 py-2"
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
                className="mt-2 w-full rounded-lg bg-[#0b0b0b] text-white border border-white/6 px-3 py-2"
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
                className="mt-2 w-full rounded-lg bg-[#0b0b0b] text-white border border-white/6 px-3 py-2"
                value={lastKnownLocation}
                onChange={(e) => setLastKnownLocation(e.target.value)}
                type="text"
                placeholder="City, Country"
              />
            </div>

            <div className="flex items-center gap-3">
              <input
                id="isAdmin"
                type="checkbox"
                checked={isAdmin}
                onChange={(e) => setIsAdmin(e.target.checked)}
                className="accent-rose-500"
              />
              <label
                htmlFor="isAdmin"
                className="text-sm text-gray-300"
              >
                Admin user
              </label>
            </div>

            <div>
              <label className="block text-sm text-gray-300 mb-2">
                Profile image
              </label>
              <div className="flex items-center gap-4">
                <div>
                  {previewUrl ? (
                    // next/image with unoptimized for blob URLs
                    <Image
                      src={previewUrl}
                      alt="preview"
                      width={80}
                      height={80}
                      className="rounded-full object-cover"
                      unoptimized
                    />
                  ) : (
                    <div className="w-20 h-20 rounded-full bg-[#0b0b0b] flex items-center justify-center text-gray-400 font-bold">
                      RE
                    </div>
                  )}
                </div>
                <div className="flex-1">
                  <input
                    id="cu_profileImage"
                    type="file"
                    accept="image/*"
                    onChange={onFileChange}
                    className="hidden"
                  />
                  <label
                    htmlFor="cu_profileImage"
                    className="inline-flex items-center gap-2 px-4 py-2 rounded-lg border border-dashed border-white/8 bg-[#0b0b0b] text-sm text-gray-300 cursor-pointer hover:border-white/20"
                  >
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

            <div className="flex gap-2">
              <Button
                type="submit"
                variant="destructive"
                className="flex-1"
                disabled={
                  loading ||
                  !!emailError ||
                  !!passwordError ||
                  !!fileError
                }
              >
                {loading ? 'Creating…' : 'Create user'}
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={onClose}
              >
                Cancel
              </Button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
