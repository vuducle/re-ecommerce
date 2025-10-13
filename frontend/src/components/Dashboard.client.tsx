'use client';

import React from 'react';
import { useSelector, useDispatch } from 'react-redux';
import type { RootState, AppDispatch } from '../store';
import { useRouter } from 'next/navigation';
import { Button } from './ui/button';
import { Card, CardHeader, CardTitle, CardContent } from './ui/card';
import { clearAuth } from '../store/slices/authSlice';
import { logout as pbLogout, buildFileUrl } from '../lib/pocketbase';

export default function DashboardClient() {
  const auth = useSelector((s: RootState) => s.auth);
  const router = useRouter();
  const dispatch = useDispatch<AppDispatch>();
  const [tab, setTab] = React.useState<
    'users' | 'products' | 'categories' | 'orders'
  >('users');

  const [message, setMessage] = React.useState<string | null>(null);

  React.useEffect(() => {
    if (!auth.authenticated) {
      router.push('/login');
      return;
    }
    if (!auth.user?.isAdmin) {
      router.push('/');
    }
  }, [auth, router]);

  // admin data (categories/orders) will be fetched when forms are implemented later

  if (!auth.user) return null;

  const avatar = buildFileUrl(
    auth.user.profileImage,
    'users',
    auth.user.id
  );

  return (
    <div className="max-w-4xl mx-auto p-6">
      {/* subtle outer vignette */}
      <div className="flex items-center gap-4">
        <div className="w-20 h-20 rounded-full bg-gradient-to-br from-[#0b0b0b] to-[#181818] overflow-hidden ring-2 ring-[#c8102e]/40">
          {avatar ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={avatar}
              alt="avatar"
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-gray-400 font-bold">
              RE
            </div>
          )}
        </div>
        <div>
          <h1 className="text-2xl font-extrabold tracking-wide text-white">
            {auth.user.name}
          </h1>
          <div className="text-sm text-red-300/80">
            {auth.user.email}
          </div>
        </div>
      </div>

      <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div className="p-4 rounded-lg border border-[#4b1212] bg-gradient-to-b from-[#0b0b0b] to-[#0f0f0f] shadow-[0_8px_24px_rgba(200,16,30,0.06)]">
          <div className="text-sm text-red-200/60 uppercase tracking-wider">
            Verified
          </div>
          <div className="mt-1 text-white font-medium">
            {auth.user.verified ? 'Yes' : 'No'}
          </div>
        </div>

        <div className="p-4 rounded-lg border border-[#3a1010] bg-gradient-to-b from-[#0b0b0b] to-[#0f0f0f] shadow-[0_8px_24px_rgba(200,16,30,0.04)]">
          <div className="text-sm text-red-200/60 uppercase tracking-wider">
            Last known location
          </div>
          <div className="mt-1 text-white font-medium">
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
          className="bg-gradient-to-r from-[#7f0b10] to-[#c8102e] text-white hover:from-[#c8102e] hover:to-[#7f0b10] shadow-[0_10px_30px_rgba(200,16,30,0.12)] border border-[#7f0b10]"
        >
          Logout
        </Button>
      </div>
      <div className="mt-8">
        <div className="flex gap-3 flex-wrap mb-6">
          <TabButton
            active={tab === 'users'}
            onClick={() => {
              setTab('users');
              setMessage(null);
            }}
          >
            Users
          </TabButton>
          <TabButton
            active={tab === 'products'}
            onClick={() => {
              setTab('products');
              setMessage(null);
            }}
          >
            Products
          </TabButton>
          <TabButton
            active={tab === 'categories'}
            onClick={() => {
              setTab('categories');
              setMessage(null);
            }}
          >
            Categories
          </TabButton>
          <TabButton
            active={tab === 'orders'}
            onClick={() => {
              setTab('orders');
              setMessage(null);
            }}
          >
            Orders
          </TabButton>
        </div>

        {message && (
          <div className="mb-4 text-sm text-red-300">{message}</div>
        )}

        <div>
          {tab === 'users' && (
            <Card className="p-6 bg-gradient-to-b from-[#080808] to-[#0b0b0b] border border-[#3a0f0f] shadow-[0_14px_40px_rgba(200,16,30,0.08)]">
              <CardHeader>
                <CardTitle className="text-white">Users</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-sm text-red-200/60">
                  Placeholder — add user creation form here later.
                </div>
              </CardContent>
            </Card>
          )}

          {tab === 'products' && (
            <Card className="p-6 bg-gradient-to-b from-[#080808] to-[#0b0b0b] border border-[#3a0f0f] shadow-[0_14px_40px_rgba(200,16,30,0.08)]">
              <CardHeader>
                <CardTitle className="text-white">Products</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-sm text-red-200/60">
                  Placeholder — add product creation form here later.
                </div>
              </CardContent>
            </Card>
          )}

          {tab === 'categories' && (
            <Card className="p-6 bg-gradient-to-b from-[#080808] to-[#0b0b0b] border border-[#3a0f0f] shadow-[0_14px_40px_rgba(200,16,30,0.08)]">
              <CardHeader>
                <CardTitle className="text-white">
                  Categories
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-sm text-red-200/60">
                  Placeholder — add category creation form here later.
                </div>
              </CardContent>
            </Card>
          )}
          {tab === 'orders' && (
            <Card className="p-6 bg-gradient-to-b from-[#080808] to-[#0b0b0b] border border-[#3a0f0f] shadow-[0_14px_40px_rgba(200,16,30,0.08)]">
              <CardHeader>
                <CardTitle className="text-white">Orders</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-sm text-red-200/60">
                  Placeholder — add order management features here
                  later.
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}

function TabButton({
  children,
  active,
  onClick,
}: {
  children: React.ReactNode;
  active?: boolean;
  onClick?: () => void;
}) {
  const base =
    'inline-flex items-center justify-center gap-2 rounded-md transition-all select-none';
  const size =
    'px-4 py-2 text-sm font-semibold tracking-wider uppercase';
  const activeCls =
    'bg-[#2a0808] text-red-100 border-b-2 border-[#c8102e] shadow-[0_8px_30px_rgba(200,16,30,0.08)]';
  const inactiveCls =
    'bg-[#0b0b0b] text-gray-300 hover:bg-[#111111] hover:text-red-200';

  return (
    <button
      onClick={onClick}
      className={`${base} ${size} ${
        active ? activeCls : inactiveCls
      } focus:outline-none focus-visible:ring-2 focus-visible:ring-[#c8102e]/30`}
    >
      {children}
    </button>
  );
}
// Form components will be implemented later. Placeholders displayed above.
