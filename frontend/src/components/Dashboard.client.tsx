'use client';

import React from 'react';
import { useSelector, useDispatch } from 'react-redux';
import type { RootState, AppDispatch } from '../store';
import { useRouter } from 'next/navigation';
import { Button } from './ui/button';
import { clearAuth } from '../store/slices/authSlice';
import { logout as pbLogout, buildFileUrl } from '../lib/pocketbase';

export default function DashboardClient() {
  const auth = useSelector((s: RootState) => s.auth);
  const router = useRouter();
  const dispatch = useDispatch<AppDispatch>();

  React.useEffect(() => {
    if (!auth.authenticated) {
      router.push('/login');
      return;
    }
    if (!auth.user?.isAdmin) {
      router.push('/');
    }
  }, [auth, router]);

  if (!auth.user) return null;

  const avatar = buildFileUrl(
    auth.user.profileImage,
    'users',
    auth.user.id
  );

  return (
    <div className="max-w-3xl mx-auto p-6">
      <div className="flex items-center gap-4">
        <div className="w-20 h-20 rounded-full bg-[#0b0b0b] overflow-hidden">
          {avatar ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={avatar}
              alt="avatar"
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-gray-400">
              RE
            </div>
          )}
        </div>
        <div>
          <h1 className="text-2xl font-semibold">{auth.user.name}</h1>
          <div className="text-sm text-gray-300">
            {auth.user.email}
          </div>
        </div>
      </div>

      <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div className="p-4 bg-[#0b0b0b] rounded-lg border border-white/6">
          <div className="text-sm text-gray-400">Verified</div>
          <div className="mt-1 text-white">
            {auth.user.verified ? 'Yes' : 'No'}
          </div>
        </div>

        <div className="p-4 bg-[#0b0b0b] rounded-lg border border-white/6">
          <div className="text-sm text-gray-400">
            Last known location
          </div>
          <div className="mt-1 text-white">
            {auth.user.lastKnownLocation ?? 'Unknown'}
          </div>
        </div>
      </div>

      <div className="mt-6 flex gap-2">
        <Button
          onClick={async () => {
            try {
              await pbLogout();
            } finally {
              dispatch(clearAuth());
              router.push('/');
            }
          }}
        >
          Logout
        </Button>
      </div>
    </div>
  );
}
