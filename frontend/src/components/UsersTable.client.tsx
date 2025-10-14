'use client';

import React from 'react';
import { buildFileUrl } from '../lib/pocketbase';

type Props = {
  users: Array<Record<string, unknown>> | null;
  loading?: boolean;
  error?: string | null;
};

export default function UsersTable({ users, loading, error }: Props) {
  if (loading) return <div>Loading users…</div>;

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

  return (
    <div className="overflow-x-auto mt-4">
      <table className="min-w-full text-left text-sm">
        <thead>
          <tr className="text-xs text-gray-400 uppercase">
            <th className="px-3 py-2">Avatar</th>
            <th className="px-3 py-2">Name</th>
            <th className="px-3 py-2">Email</th>
            <th className="px-3 py-2">Verified</th>
            <th className="px-3 py-2">ID</th>
          </tr>
        </thead>
        <tbody>
          {users.map((u) => {
            const id = (u.id ?? u._id ?? u.recordId ?? '') as string;
            const name =
              (u.name as string) ||
              (u.fullName as string) ||
              (u.displayName as string) ||
              '';
            const email =
              (u.email as string) || (u.identity as string) || '';
            const verified = !!(u.verified ?? u.isVerified ?? false);
            const profileImage =
              (u.profileImage as string) ||
              (u.avatar as string) ||
              undefined;

            const avatarUrl = profileImage
              ? buildFileUrl(profileImage, 'users', id)
              : null;

            return (
              <tr key={id} className="border-t border-[#2a0808]">
                <td className="px-3 py-3 align-middle">
                  {avatarUrl ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={avatarUrl}
                      alt={name || 'avatar'}
                      className="w-10 h-10 rounded-full object-cover"
                    />
                  ) : (
                    <div className="w-10 h-10 rounded-full bg-[#0b0b0b] flex items-center justify-center text-gray-400 font-bold">
                      RE
                    </div>
                  )}
                </td>
                <td className="px-3 py-3 align-middle text-white">
                  {name}
                </td>
                <td className="px-3 py-3 align-middle text-red-200/80 font-mono">
                  {email}
                </td>
                <td className="px-3 py-3 align-middle">
                  {verified ? (
                    <span className="text-green-400">Yes</span>
                  ) : (
                    <span className="text-yellow-400">No</span>
                  )}
                </td>
                <td className="px-3 py-3 align-middle text-xs text-gray-500 font-mono">
                  {id}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
