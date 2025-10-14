'use client';

import React, { useState, useEffect } from 'react';
import { buildFileUrl } from '../lib/pocketbase';
import Loading from './ui/Loading';

type Props = {
  users: Array<Record<string, unknown>> | null;
  loading?: boolean;
  error?: string | null;
};

export default function UsersTable({ users, loading, error }: Props) {
  // normalize users early so hooks are always called in the same order
  const mappedUsers = (users ?? []).map((u) => {
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
    };
  });

  // Pagination state
  const [pageSize, setPageSize] = useState<number>(10);
  const [page, setPage] = useState<number>(1);

  const total = mappedUsers.length;
  const totalPages = Math.max(1, Math.ceil(total / pageSize));

  // Ensure current page is within bounds when pageSize or total changes
  useEffect(() => {
    if (page > totalPages) setPage(totalPages);
    if (page < 1) setPage(1);
  }, [page, pageSize, totalPages]);

  const start = (page - 1) * pageSize;
  const end = Math.min(start + pageSize, total);
  const pagedUsers = mappedUsers.slice(start, end);

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
  // pagination controls will be rendered above the list/table
  const handlePageSizeChange = (value: number) => {
    setPageSize(value);
    setPage(1);
  };

  const startDisplay = total === 0 ? 0 : start + 1;

  return (
    <>
      <div className="flex items-center justify-between gap-3 mt-3 flex-wrap">
        <div className="flex items-center gap-2">
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

      {/* Mobile: stacked cards */}
      <div className="space-y-3 mt-4 md:hidden">
        {pagedUsers.map((mu) => (
          <div
            key={mu.id}
            className="bg-[#0b0b0b] border border-[#2a0808] rounded p-3 flex gap-3 items-start"
          >
            <div className="flex-shrink-0">
              {mu.avatarUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={mu.avatarUrl}
                  alt={mu.name || 'avatar'}
                  className="w-12 h-12 rounded-full object-cover"
                />
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
            </tr>
          </thead>
          <tbody>
            {pagedUsers.map((mu) => (
              <tr key={mu.id} className="border-t border-[#2a0808]">
                <td className="px-3 py-3 align-middle">
                  {mu.avatarUrl ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={mu.avatarUrl}
                      alt={mu.name || 'avatar'}
                      className="w-10 h-10 rounded-full object-cover"
                    />
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
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  );
}
