'use client';

import React from 'react';
import { useSelector } from 'react-redux';
import type { RootState } from '../store';
import { useRouter } from 'next/navigation';
// Button component not used in this file currently
import { Card, CardHeader, CardTitle, CardContent } from './ui/card';
// clearAuth imported but not used in this view; keep for future use
import pb, { buildFileUrl } from '../lib/pocketbase';
import UsersTable from './UsersTable.client';
import {
  FaUsers,
  FaBox,
  FaTags,
  FaShoppingCart,
} from 'react-icons/fa';

export default function DashboardClient() {
  const auth = useSelector((s: RootState) => s.auth);
  const router = useRouter();
  // dispatch not used currently
  const [tab, setTab] = React.useState<
    'users' | 'products' | 'categories' | 'orders'
  >('users');

  const [message, setMessage] = React.useState<string | null>(null);
  const [users, setUsers] = React.useState<Array<
    Record<string, unknown>
  > | null>(null);
  const [loadingUsers, setLoadingUsers] = React.useState(false);
  const [usersError, setUsersError] = React.useState<string | null>(
    null
  );

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

  React.useEffect(() => {
    // fetch users when the users tab is active
    if (tab !== 'users') return;

    let mounted = true;
    const fetchUsers = async () => {
      setLoadingUsers(true);
      setUsersError(null);
      try {
        // NOTE: PocketBase view rule may restrict listing users to only the
        // authenticated user's own record (e.g. `id = @request.auth.id`).
        // The request below will still be attempted — the backend decides
        // what to return based on its rules.
        if (auth.user?.isAdmin) {
          // Call internal server API which uses admin credentials.
          const apiRes = await fetch('/api/admin/users', {
            headers: {
              Authorization: auth.token ? `Bearer ${auth.token}` : '',
              'x-user-id': auth.user.id,
            },
          });
          if (!apiRes.ok) {
            const txt = await apiRes.text();
            throw new Error(`admin api: ${apiRes.status} ${txt}`);
          }
          const json = await apiRes.json();
          if (!mounted) return;
          setUsers(
            (json.items ?? json) as Array<Record<string, unknown>>
          );
        } else {
          const config: Record<string, unknown> = {
            params: { perPage: 50 },
          };
          if ((auth.token ?? null) != null) {
            config['headers'] = {
              Authorization: `Bearer ${auth.token}`,
            } as Record<string, string>;
          }

          const res = await pb.get(
            '/api/collections/users/records',
            config
          );
          if (!mounted) return;
          // pb returns { items: [], totalItems, page, perPage }
          const data = res.data as {
            items?: Array<Record<string, unknown>>;
          };
          setUsers(data.items ?? []);
        }
      } catch (err: unknown) {
        const maybeErr = err as { response?: { data?: unknown } };
        if (maybeErr.response?.data) {
          setUsersError(JSON.stringify(maybeErr.response.data));
        } else {
          setUsersError(String(err));
        }
      } finally {
        if (mounted) setLoadingUsers(false);
      }
    };

    fetchUsers();

    return () => {
      mounted = false;
    };
  }, [tab, auth.token, auth.user?.id, auth.user?.isAdmin]);

  if (!auth.user) return null;

  const avatar = buildFileUrl(
    auth.user.profileImage,
    'users',
    auth.user.id
  );

  return (
    <div className="max-w-7xl mx-auto p-8 bg-[#0a0a0a] border border-[#2a0808] shadow-[0_0_40px_rgba(200,16,30,0.15)] rounded-lg mt-10 mb-10">
      {/* subtle outer vignette */}
      <div className="flex items-center gap-6 mb-8 pb-6 border-b border-[#2a0808]">
        <div className="w-24 h-24 rounded-full bg-gradient-to-br from-[#0b0b0b] to-[#181818] overflow-hidden ring-4 ring-[#c8102e]/60 shadow-lg">
          {avatar ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={avatar}
              alt="avatar"
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-gray-500 font-bold text-3xl">
              RE
            </div>
          )}
        </div>
        <div>
          <h1 className="text-3xl font-extrabold tracking-wider text-white drop-shadow-[0_0_5px_rgba(200,16,30,0.5)]">
            {auth.user.name}
          </h1>
          <div className="text-md text-red-400/90 font-mono mt-1">
            {auth.user.email}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        <div className="p-5 rounded-lg border border-[#4b1212] bg-gradient-to-b from-[#0b0b0b] to-[#0f0f0f] shadow-[0_8px_24px_rgba(200,16,30,0.08)]">
          <div className="text-sm text-red-200/70 uppercase tracking-wider font-semibold">
            Status
          </div>
          <div className="mt-2 text-white font-medium text-lg flex items-center gap-2">
            {auth.user.verified ? (
              <span className="text-green-500">
                &#10003; Verified
              </span>
            ) : (
              <span className="text-yellow-500">
                &#x2716; Unverified
              </span>
            )}
          </div>
        </div>

        <div className="p-5 rounded-lg border border-[#3a1010] bg-gradient-to-b from-[#0b0b0b] to-[#0f0f0f] shadow-[0_8px_24px_rgba(200,16,30,0.06)]">
          <div className="text-sm text-red-200/70 uppercase tracking-wider font-semibold">
            Last known location
          </div>
          <div className="mt-2 text-white font-medium text-lg">
            {auth.user.lastKnownLocation ?? 'Unknown'}
          </div>
        </div>
      </div>

      <div className="flex justify-end mb-8"></div>
      <div className="mt-8">
        <div className="flex gap-4 flex-wrap mb-8 border-b border-[#2a0808] pb-4">
          <TabButton
            active={tab === 'users'}
            onClick={() => {
              setTab('users');
              setMessage(null);
            }}
            Icon={FaUsers}
          >
            Users
          </TabButton>
          <TabButton
            active={tab === 'products'}
            onClick={() => {
              setTab('products');
              setMessage(null);
            }}
            Icon={FaBox}
          >
            Products
          </TabButton>
          <TabButton
            active={tab === 'categories'}
            onClick={() => {
              setTab('categories');
              setMessage(null);
            }}
            Icon={FaTags}
          >
            Categories
          </TabButton>
          <TabButton
            active={tab === 'orders'}
            onClick={() => {
              setTab('orders');
              setMessage(null);
            }}
            Icon={FaShoppingCart}
          >
            Orders
          </TabButton>
        </div>

        {message && (
          <div className="mb-6 text-sm text-red-400 bg-red-900/20 p-3 rounded border border-red-700">
            {message}
          </div>
        )}

        <div>
          {tab === 'users' && (
            <Card className="p-6 bg-gradient-to-b from-[#080808] to-[#0b0b0b] border border-[#3a0f0f] shadow-[0_14px_40px_rgba(200,16,30,0.12)]">
              <CardHeader className="pb-4">
                <CardTitle className="text-white text-2xl font-bold flex items-center gap-3">
                  <FaUsers className="text-red-500" /> Users
                </CardTitle>
              </CardHeader>
              <CardContent className="p-0">
                {/* extracted users table component */}
                <UsersTable
                  users={users}
                  loading={loadingUsers}
                  error={usersError}
                />
              </CardContent>
            </Card>
          )}

          {tab === 'products' && (
            <Card className="p-6 bg-gradient-to-b from-[#080808] to-[#0b0b0b] border border-[#3a0f0f] shadow-[0_14px_40px_rgba(200,16,30,0.12)]">
              <CardHeader className="pb-4">
                <CardTitle className="text-white text-2xl font-bold flex items-center gap-3">
                  <FaBox className="text-red-500" /> Products
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-base text-red-200/70">
                  Placeholder — add product creation form here later.
                </div>
              </CardContent>
            </Card>
          )}

          {tab === 'categories' && (
            <Card className="p-6 bg-gradient-to-b from-[#080808] to-[#0b0b0b] border border-[#3a0f0f] shadow-[0_14px_40px_rgba(200,16,30,0.12)]">
              <CardHeader className="pb-4">
                <CardTitle className="text-white text-2xl font-bold flex items-center gap-3">
                  <FaTags className="text-red-500" /> Categories
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-base text-red-200/70">
                  Placeholder — add category creation form here later.
                </div>
              </CardContent>
            </Card>
          )}
          {tab === 'orders' && (
            <Card className="p-6 bg-gradient-to-b from-[#080808] to-[#0b0b0b] border border-[#3a0f0f] shadow-[0_14px_40px_rgba(200,16,30,0.12)]">
              <CardHeader className="pb-4">
                <CardTitle className="text-white text-2xl font-bold flex items-center gap-3">
                  <FaShoppingCart className="text-red-500" /> Orders
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-base text-red-200/70">
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
  Icon,
}: {
  children: React.ReactNode;
  active?: boolean;
  onClick?: () => void;
  Icon?: React.ElementType;
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
      {Icon && <Icon className="text-lg" />}
      {children}
    </button>
  );
}
// Form components will be implemented later. Placeholders displayed above.
