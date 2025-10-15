import UpdateUserDialog from './UpdateUserDialog.client';
import { useNotification } from '../context/NotificationContext';
import React, { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { RootState } from '../store';
import Image from 'next/image';
import { buildFileUrl } from '../lib/pocketbase';
import Loading from './ui/Loading';
import CreateUserDialog from './CreateUserDialog.client';
import { Button } from './ui/button';

type Props = {
  users: Array<Record<string, unknown>> | null;
  loading?: boolean;
  error?: string | null;
  onUserUpdated?: () => void;
};

type MappedUser = {
  id: string;
  name: string;
  email: string;
  verified: boolean;
  isAdmin: boolean;
  avatarUrl?: string | null;
  lastKnownLocation?: string;
  created?: string;
  updated?: string;
  [key: string]: unknown;
};

export default function UsersTable({
  users,
  loading,
  error,
  onUserUpdated,
}: Props) {
  const { showNotification } = useNotification();
  const [userToDelete, setUserToDelete] = useState<MappedUser | null>(
    null
  );
  const [userToUpdate, setUserToUpdate] = useState<MappedUser | null>(
    null
  );

  const { user, token } = useSelector(
    (state: RootState) => state.auth
  );

  const handleDeleteUser = async () => {
    if (!userToDelete || !token || !user) return;

    try {
      const res = await fetch('/api/admin/users', {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          authorization: `Bearer ${token}`,
          'x-user-id': user.id,
        },
        body: JSON.stringify({ id: userToDelete.id }),
      });

      if (res.ok) {
        setLocalAdded((prev) =>
          prev.filter((u) => u.id !== userToDelete.id)
        );
        // Also mark this id as removed so users coming from props are hidden immediately
        setRemovedIds((prev) => {
          const next = new Set(prev);
          next.add(userToDelete.id);
          return next;
        });
        showNotification('User deleted successfully', 'success');
      } else {
        const data = await res.json();
        showNotification(
          data.error || 'Failed to delete user',
          'error'
        );
      }
    } catch {
      showNotification(
        'An error occurred while deleting the user',
        'error'
      );
    }

    setUserToDelete(null);
  };

  const mappedUsers: MappedUser[] = (users ?? []).map((u) => {
    const id = (u.id ?? u._id ?? u.recordId ?? '') as string;
    const name =
      (u.name as string) ||
      (u.fullName as string) ||
      (u.displayName as string) ||
      '';
    const email = (u.email as string) || (u.identity as string) || '';
    const verified = !!(u.verified ?? u.isVerified ?? false);
    const record = u as Record<string, unknown>;
    const isAdmin = !!(
      record.isAdmin ??
      record.admin ??
      record['is_admin'] ??
      false
    );
    const profileImage =
      (u.profileImage as string) || (u.avatar as string) || undefined;

    const createdRaw =
      (u.created as string) ||
      (u.createdAt as string) ||
      (u.created_at as string) ||
      '';
    const updatedRaw =
      (u.updated as string) ||
      (u.updatedAt as string) ||
      (u.updated_at as string) ||
      '';

    const created =
      createdRaw && !isNaN(Date.parse(createdRaw))
        ? new Date(createdRaw).toLocaleString()
        : '';
    const updated =
      updatedRaw && !isNaN(Date.parse(updatedRaw))
        ? new Date(updatedRaw).toLocaleString()
        : '';

    const avatarUrl = profileImage
      ? buildFileUrl(profileImage, 'users', id)
      : null;
    const lastKnownLocation =
      (u.lastKnownLocation as string) || (u.location as string) || '';

    return {
      id,
      name,
      email,
      verified,
      isAdmin,
      avatarUrl,
      lastKnownLocation,
      created,
      updated,
    } as MappedUser;
  });

  // Pagination
  const [pageSize, setPageSize] = useState<number>(10);
  const [page, setPage] = useState<number>(1);

  const start = (page - 1) * pageSize;

  // dialog state
  const [createOpen, setCreateOpen] = useState(false);
  const [localAdded, setLocalAdded] = useState<MappedUser[]>([]);
  // Track removed user ids to hide them from the combined list (covers users from props)
  const [removedIds, setRemovedIds] = useState<Set<string>>(
    new Set()
  );

  const allUsers = React.useMemo(
    () =>
      [...localAdded, ...mappedUsers].filter(
        (u) => !removedIds.has(u.id)
      ),
    [localAdded, mappedUsers, removedIds]
  );

  // search state
  const [query, setQuery] = useState<string>('');
  const [debouncedQuery, setDebouncedQuery] = useState<string>(query);

  useEffect(() => {
    const t = setTimeout(() => setDebouncedQuery(query.trim()), 300);
    return () => clearTimeout(t);
  }, [query]);

  const filteredUsers = React.useMemo(() => {
    const q = (debouncedQuery ?? '').toLowerCase();
    if (!q) return allUsers;
    return allUsers.filter((u) => {
      const name = (u.name ?? '') as string;
      const email = (u.email ?? '') as string;
      const loc = (u.lastKnownLocation ?? '') as string;
      return (
        name.toLowerCase().includes(q) ||
        email.toLowerCase().includes(q) ||
        loc.toLowerCase().includes(q)
      );
    });
  }, [allUsers, debouncedQuery]);

  const totalFiltered = filteredUsers.length;
  const totalPages = Math.max(1, Math.ceil(totalFiltered / pageSize));

  // Ensure current page is within bounds when pageSize or total changes
  useEffect(() => {
    if (page > totalPages) setPage(totalPages);
    if (page < 1) setPage(1);
  }, [page, pageSize, totalPages]);

  const end = Math.min(start + pageSize, totalFiltered);
  const pagedUsersAll = filteredUsers.slice(start, end);

  // Lightbox state
  const [lightboxUrl, setLightboxUrl] = useState<string | null>(null);
  const [lightboxAlt, setLightboxAlt] = useState<string | null>(null);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setLightboxUrl(null);
    };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, []);

  if (loading) return <Loading text="Loading users…" />;

  if (error)
    return (
      <div className="text-sm text-yellow-300 bg-yellow-900/20 p-2 rounded border border-yellow-700">
        Error loading users: {error}
      </div>
    );

  if (!users || users.length === 0)
    return (
      <div className="text-sm text-gray-300">No users found.</div>
    );

  const handlePageSizeChange = (value: number) => {
    setPageSize(value);
    setPage(1);
  };

  const total = totalFiltered;
  const startDisplay = total === 0 ? 0 : start + 1;

  return (
    <>
      <div className="mb-4 julia-nguyen">
        <button
          onClick={() => setCreateOpen(true)}
          aria-label="Create user"
          className="inline-flex items-center gap-3 rounded-md bg-gradient-to-b from-rose-700 to-rose-900 px-3 py-1 text-sm font-semibold text-white shadow-md ring-1 ring-rose-900/40 hover:from-rose-600 hover:to-rose-800 focus:outline-none focus:ring-2 focus:ring-rose-500/50"
        >
          <span className="flex items-center justify-center w-6 h-6 bg-black bg-opacity-40 rounded-sm border border-rose-900/60">
            +
          </span>
          <span className="uppercase tracking-wider drop-shadow-sm">
            Create user
          </span>
        </button>
      </div>
      <div className="flex items-center justify-between gap-3 flex-wrap">
        <div className="flex items-center flex-wrap gap-2">
          <label className="text-xs text-gray-400">Show</label>
          <select
            value={pageSize}
            onChange={(e) =>
              handlePageSizeChange(Number(e.target.value))
            }
            className="bg-[#0b0b0b] text-sm text-gray-200 border border-gray-800 rounded px-2 py-1"
          >
            <option value={10}>10</option>
            <option value={20}>20</option>
            <option value={50}>50</option>
          </select>
          <span className="text-xs text-gray-400">per page</span>
          <div className="ml-3">
            <input
              type="search"
              placeholder="Search name, email, location"
              value={query}
              onChange={(e) => {
                setQuery(e.target.value);
                setPage(1);
              }}
              className="bg-[#0b0b0b] text-sm text-gray-200 border border-gray-800 rounded px-2 py-1 w-64"
            />
          </div>
        </div>

        <div className="flex items-center gap-2 text-xs text-gray-300">
          <button
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            disabled={page <= 1}
            className={`px-2 py-1 rounded ${
              page <= 1
                ? 'opacity-50 cursor-not-allowed'
                : 'bg-gray-800 hover:bg-gray-700'
            }`}
          >
            Prev
          </button>
          <span className="font-mono">
            {startDisplay}-{end} of {total}
          </span>
          <button
            onClick={() =>
              setPage((p) => Math.min(totalPages, p + 1))
            }
            disabled={page >= totalPages}
            className={`px-2 py-1 rounded ${
              page >= totalPages
                ? 'opacity-50 cursor-not-allowed'
                : 'bg-gray-800 hover:bg-gray-700'
            }`}
          >
            Next
          </button>
        </div>
      </div>

      <CreateUserDialog
        open={createOpen}
        onClose={() => setCreateOpen(false)}
        onCreated={(user) => {
          const asString = (v: unknown) =>
            typeof v === 'string' ? v : v == null ? '' : String(v);
          const mapped: MappedUser = {
            id: asString(
              user.id ?? user._id ?? user.recordId ?? user['id']
            ),
            email: asString(user.email ?? user.identity ?? ''),
            name: asString(
              user.name ?? user.fullName ?? user.displayName ?? ''
            ),
            verified: !!(user.verified ?? user.isVerified ?? false),
            isAdmin: !!(user.isAdmin ?? user.admin ?? false),
            avatarUrl: (user as Record<string, unknown>)
              .profileImage as string | undefined,
            lastKnownLocation: asString(
              user.lastKnownLocation ?? user.location ?? ''
            ),
            created: asString(user.created ?? ''),
            updated: asString(user.updated ?? ''),
          };
          setLocalAdded((s) => [mapped, ...s]);
          setCreateOpen(false);
        }}
      />

      <UpdateUserDialog
        open={!!userToUpdate}
        onClose={() => setUserToUpdate(null)}
        user={userToUpdate}
        token={token}
        currentUserId={user?.id || null}
        onUpdated={(updatedUser) => {
          onUserUpdated?.();
          setUserToUpdate(null);
        }}
      />

      {/* Mobile: stacked cards */}
      <div className="space-y-3 mt-4 md:hidden">
        {pagedUsersAll.map((mu) => (
          <div
            key={mu.id}
            className="bg-[#0b0b0b] border border-[#2a0808] rounded p-3 flex gap-3 items-start"
          >
            <div className="flex-shrink-0">
              {mu.avatarUrl ? (
                <button
                  type="button"
                  onClick={() => {
                    setLightboxUrl(mu.avatarUrl ?? null);
                    setLightboxAlt(mu.name ?? 'avatar');
                  }}
                  className="rounded-full overflow-hidden"
                >
                  <Image
                    src={mu.avatarUrl}
                    alt={mu.name || 'Avatar - Julia Nguyen ist UwU'}
                    width={48}
                    height={48}
                    className="rounded-full object-cover"
                    unoptimized
                  />
                </button>
              ) : (
                <div className="w-12 h-12 rounded-full bg-[#0b0b0b] flex items-center justify-center text-gray-400 font-bold">
                  RE
                </div>
              )}
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between gap-2">
                <div className="text-sm font-medium text-white truncate">
                  {mu.name || '—'}
                </div>
                <div className="text-xs text-gray-400 font-mono truncate">
                  {mu.id}
                </div>
              </div>
              <div className="text-xs text-red-200/80 font-mono truncate">
                {mu.email}
              </div>
              <div className="mt-2 flex items-center gap-2 flex-wrap">
                <span
                  className={`text-xs px-2 py-1 rounded ${
                    mu.verified
                      ? 'bg-green-900 text-green-300'
                      : 'bg-yellow-900 text-yellow-300'
                  }`}
                >
                  {mu.verified ? 'Verified' : 'Unverified'}
                </span>
                <span
                  className={`text-xs px-2 py-1 rounded ${
                    mu.isAdmin
                      ? 'bg-green-900 text-green-300'
                      : 'bg-gray-800 text-gray-400'
                  }`}
                >
                  {mu.isAdmin ? 'Admin' : 'User'}
                </span>
                {mu.lastKnownLocation ? (
                  <span className="text-xs px-2 py-1 rounded bg-gray-800 text-gray-300">
                    {mu.lastKnownLocation}
                  </span>
                ) : null}
              </div>
              <div className="mt-2 text-xs text-gray-400 flex gap-3 flex-wrap">
                {mu.created ? (
                  <span>Created: {mu.created}</span>
                ) : null}
                {mu.updated ? (
                  <span>Updated: {mu.updated}</span>
                ) : null}
              </div>
              <div className="mt-2 flex gap-2">
                <Button
                  onClick={() => setUserToUpdate(mu)}
                  aria-label={`Update ${mu.name}`}
                  className="px-3 py-2 rounded-lg text-sm font-semibold uppercase tracking-wider text-white bg-gradient-to-b from-[#6f0f0f] to-[#2b0404] border border-[#3a0000] shadow-[0_6px_0_rgba(0,0,0,0.6)] hover:from-[#8b1515] hover:to-[#3b0505] active:translate-y-0.5"
                >
                  Update
                </Button>

                <Button
                  onClick={() => setUserToDelete(mu)}
                  aria-label={`Delete ${mu.name}`}
                  className="px-3 py-2 rounded-lg text-sm font-semibold uppercase tracking-wider text-white bg-gradient-to-b from-[#8b0f0f] to-[#310000] border border-[#2a0000] shadow-[0_6px_0_rgba(0,0,0,0.65)] hover:from-[#a21a1a] hover:to-[#5a0000] active:translate-y-0.5"
                >
                  Delete
                </Button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Desktop / large: table */}
      <div className="overflow-x-auto mt-4 hidden md:block">
        <table className="min-w-full text-left text-sm">
          <thead>
            <tr className="text-xs text-gray-400 uppercase">
              <th className="px-3 py-2">Avatar</th>
              <th className="px-3 py-2">Name</th>
              <th className="px-3 py-2">Email</th>
              <th className="px-3 py-2">Verified</th>
              <th className="px-3 py-2">Admin</th>
              <th className="px-3 py-2">Last Known Location</th>
              <th className="px-3 py-2">Created</th>
              <th className="px-3 py-2">Updated</th>
              <th className="px-3 py-2">ID</th>
              <th className="px-3 py-2">Actions</th>
            </tr>
          </thead>
          <tbody>
            {pagedUsersAll.map((mu) => (
              <tr key={mu.id} className="border-t border-[#2a0808]">
                <td className="px-3 py-3 align-middle">
                  {mu.avatarUrl ? (
                    <button
                      type="button"
                      onClick={() => {
                        setLightboxUrl(mu.avatarUrl ?? null);
                        setLightboxAlt(mu.name ?? 'avatar');
                      }}
                      className="rounded-full overflow-hidden cursor-pointer"
                    >
                      <Image
                        src={mu.avatarUrl}
                        alt={mu.name || 'avatar'}
                        width={40}
                        height={40}
                        className="rounded-full h-12 w-12 object-cover"
                        unoptimized
                      />
                    </button>
                  ) : (
                    <div className="w-10 h-10 rounded-full bg-[#0b0b0b] flex items-center justify-center text-gray-400 font-bold">
                      RE
                    </div>
                  )}
                </td>
                <td className="px-3 py-3 align-middle text-white">
                  {mu.name}
                </td>
                <td className="px-3 py-3 align-middle text-red-200/80 font-mono">
                  {mu.email}
                </td>
                <td className="px-3 py-3 align-middle">
                  {mu.verified ? (
                    <span className="text-green-400">Yes</span>
                  ) : (
                    <span className="text-yellow-400">No</span>
                  )}
                </td>
                <td className="px-3 py-3 align-middle">
                  {mu.isAdmin ? (
                    <span className="text-green-300 font-medium">
                      Yes
                    </span>
                  ) : (
                    <span className="text-gray-500">No</span>
                  )}
                </td>
                <td className="px-3 py-3 align-middle text-xs text-gray-400 font-mono">
                  {mu.lastKnownLocation}
                </td>
                <td className="px-3 py-3 align-middle text-xs text-gray-400 font-mono">
                  {mu.created}
                </td>
                <td className="px-3 py-3 align-middle text-xs text-gray-400 font-mono">
                  {mu.updated}
                </td>
                <td className="px-3 py-3 align-middle text-xs text-gray-500 font-mono">
                  {mu.id}
                </td>
                <td className="px-3 py-3 align-middle flex gap-2">
                  <Button
                    onClick={() => setUserToUpdate(mu)}
                    aria-label={`Update ${mu.name}`}
                    className="px-3 py-2 rounded-lg text-sm font-semibold uppercase tracking-wider text-white bg-gradient-to-b from-[#6f0f0f] to-[#2b0404] border border-[#3a0000] shadow-[0_6px_0_rgba(0,0,0,0.6)] hover:from-[#8b1515] hover:to-[#3b0505] active:translate-y-0.5"
                  >
                    Update
                  </Button>

                  <Button
                    onClick={() => setUserToDelete(mu)}
                    aria-label={`Delete ${mu.name}`}
                    className="px-3 py-2 rounded-lg text-sm font-semibold uppercase tracking-wider text-white bg-gradient-to-b from-[#8b0f0f] to-[#310000] border border-[#2a0000] shadow-[0_6px_0_rgba(0,0,0,0.65)] hover:from-[#a21a1a] hover:to-[#5a0000] active:translate-y-0.5"
                  >
                    Delete
                  </Button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {lightboxUrl && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/80"
          onClick={() => setLightboxUrl(null)}
        >
          <button
            type="button"
            aria-label="Close"
            className="absolute top-4 right-4 text-white text-2xl"
            onClick={() => setLightboxUrl(null)}
          >
            ×
          </button>
          <div
            className="relative w-full max-w-3xl h-[80vh]"
            onClick={(e) => e.stopPropagation()}
          >
            <Image
              src={lightboxUrl}
              alt={lightboxAlt || 'Lightbox Image'}
              fill
              className="object-contain"
              unoptimized
            />
          </div>
        </div>
      )}

      {userToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80">
          <div className="bg-[#0b0b0b] border border-[#2a0808] rounded-lg p-6">
            <h3 className="text-lg font-semibold text-white">
              Delete User
            </h3>
            <p className="mt-2 text-sm text-gray-300">
              Are you sure you want to delete the user{' '}
              {userToDelete.name}?
            </p>
            <div className="mt-4 flex justify-end gap-2">
              <button
                onClick={() => setUserToDelete(null)}
                aria-label="Cancel delete"
                className="inline-flex items-center px-4 py-2 rounded-md text-sm font-medium text-gray-300 bg-[#0b0b0b] border border-[#2a2a2a] hover:bg-[#141414] focus:outline-none focus:ring-2 focus:ring-rose-500/30 transition"
              >
                Cancel
              </button>
              <button
                onClick={handleDeleteUser}
                aria-label="Confirm delete"
                className="inline-flex items-center px-4 py-2 rounded-md text-sm font-semibold text-white bg-gradient-to-b from-[#8b0f0f] to-[#3b0000] border border-[#2a0000] shadow-[0_6px_0_rgba(0,0,0,0.6)] hover:from-[#a21a1a] hover:to-[#5a0000] active:translate-y-0.5 focus:outline-none focus:ring-2 focus:ring-red-600/40 transition"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
