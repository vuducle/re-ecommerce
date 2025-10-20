'use client';

import React, { useState, useEffect } from 'react';
import Loading from './ui/Loading';

type Props = {
  orders: Array<Record<string, unknown>> | null;
  loading?: boolean;
  error?: string | null;
};

type MappedOrder = {
  id: string;
  user: string;
  total: number;
  items: any[];
  status: string;
  shippingAddress: any;
  created: string;
  [key: string]: unknown;
};

export default function OrdersTable({
  orders,
  loading,
  error,
}: Props) {

  const mappedOrders: MappedOrder[] = (orders ?? []).map((o) => {
    const id = (o.id ?? o._id ?? o.recordId ?? '') as string;
    const user = (o.expand?.user as any)?.name || (o.user as string) || '';
    const total = (o.total as number) || 0;
    const items = (o.items as any[]) || [];
    const status = (o.status as string) || 'pending';
    const shippingAddress = (o.shippingAddress as any) || {};
    const createdRaw =
      (o.created as string) ||
      (o.createdAt as string) ||
      (o.created_at as string) ||
      '';

    const created =
      createdRaw && !isNaN(Date.parse(createdRaw))
        ? new Date(createdRaw).toLocaleString()
        : '';

    return {
      id,
      user,
      total,
      items,
      status,
      shippingAddress,
      created,
    } as MappedOrder;
  });

  // Pagination
  const [pageSize, setPageSize] = useState<number>(10);
  const [page, setPage] = useState<number>(1);

  const start = (page - 1) * pageSize;

  // search state
  const [query, setQuery] = useState<string>('');
  const [debouncedQuery, setDebouncedQuery] = useState<string>(query);

  useEffect(() => {
    const t = setTimeout(() => setDebouncedQuery(query.trim()), 300);
    return () => clearTimeout(t);
  }, [query]);

  const filteredOrders = React.useMemo(() => {
    const q = (debouncedQuery ?? '').toLowerCase();
    if (!q) return mappedOrders;
    return mappedOrders.filter((o) => {
      const user = (o.user ?? '') as string;
      const id = (o.id ?? '') as string;
      return (
        user.toLowerCase().includes(q) ||
        id.toLowerCase().includes(q)
      );
    });
  }, [mappedOrders, debouncedQuery]);

  const totalFiltered = filteredOrders.length;
  const totalPages = Math.max(1, Math.ceil(totalFiltered / pageSize));

  // Ensure current page is within bounds when pageSize or total changes
  useEffect(() => {
    if (page > totalPages) setPage(totalPages);
    if (page < 1) setPage(1);
  }, [page, pageSize, totalPages]);

  const end = Math.min(start + pageSize, totalFiltered);
  const pagedOrders = filteredOrders.slice(start, end);

  if (loading) return <Loading text="Loading orders…" />;

  if (error)
    return (
      <div className="text-sm text-yellow-300 bg-yellow-900/20 p-2 rounded border border-yellow-700">
        Error loading orders: {error}
      </div>
    );

  if (!orders || orders.length === 0)
    return (
      <div className="text-sm text-gray-300">No orders found.</div>
    );

  const handlePageSizeChange = (value: number) => {
    setPageSize(value);
    setPage(1);
  };

  const total = totalFiltered;
  const startDisplay = total === 0 ? 0 : start + 1;

  return (
    <>
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
              placeholder="Search by user or order ID"
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

      {/* Desktop / large: table */}
      <div className="overflow-x-auto mt-4 hidden md:block">
        <table className="min-w-full text-left text-sm">
          <thead>
            <tr className="text-xs text-gray-400 uppercase">
              <th className="px-3 py-2">Order ID</th>
              <th className="px-3 py-2">User</th>
              <th className="px-3 py-2">Total</th>
              <th className="px-3 py-2">Status</th>
              <th className="px-3 py-2">Items</th>
              <th className="px-3 py-2">Shipping Address</th>
              <th className="px-3 py-2">Date</th>
            </tr>
          </thead>
          <tbody>
            {pagedOrders.map((o) => (
              <tr key={o.id} className="border-t border-[#2a0808]">
                <td className="px-3 py-3 align-middle text-xs text-gray-500 font-mono">
                  {o.id}
                </td>
                <td className="px-3 py-3 align-middle text-white">
                  {o.user}
                </td>
                <td className="px-3 py-3 align-middle text-yellow-400 font-mono">
                  {new Intl.NumberFormat('vi-VN', {
                    style: 'currency',
                    currency: 'VND',
                  }).format(o.total)}
                </td>
                <td className="px-3 py-3 align-middle">
                  <span
                    className={`text-xs px-2 py-1 rounded ${
                      o.status === 'paid'
                        ? 'bg-green-900 text-green-300'
                        : 'bg-yellow-900 text-yellow-300'
                    }`}
                  >
                    {o.status}
                  </span>
                </td>
                <td className="px-3 py-3 align-middle text-xs text-gray-400">
                  {o.items.length}
                </td>
                <td className="px-3 py-3 align-middle text-xs text-gray-400">
                  {`${o.shippingAddress.street}, ${o.shippingAddress.city}, ${o.shippingAddress.zip}`}
                </td>
                <td className="px-3 py-3 align-middle text-xs text-gray-400 font-mono">
                  {o.created}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  );
}
