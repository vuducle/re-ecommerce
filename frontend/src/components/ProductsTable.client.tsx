import UpdateProductDialog from './UpdateProductDialog.client';
import DeleteProductDialog from './DeleteProductDialog.client';
import { useNotification } from '../context/NotificationContext';
import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import { buildFileUrl, pb } from '../lib/pocketbase';
import Loading from '../components/ui/Loading';
import { Button } from '../components/ui/button';
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from '../components/ui/card';
import Lightbox from 'yet-another-react-lightbox';
import 'yet-another-react-lightbox/styles.css';
import CreateProductDialog from './CreateProductDialog.client';
import { useSelector } from 'react-redux';
import { RootState } from '../store';
import { isAxiosError } from 'axios';

type Props = {
  products: Array<Record<string, unknown>> | null;
  loading?: boolean;
  error?: string | null;
  onProductUpdated?: () => void;
};

type MappedProduct = {
  id: string;
  name: string;
  description: string;
  price: number;
  imageUrl?: string | null;
  images?: string[];
  created: string;
  updated?: string;
  category?: string;
  categoryId?: string;
  isFeatured?: boolean;
  isAvailable?: boolean;
  stock?: number;
  slug?: string;
  [key: string]: unknown;
};

export default function ProductsTable({
  products,
  loading,
  error,
  onProductUpdated,
}: Props) {
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [lightboxIndex, setLightboxIndex] = useState(0);
  const [createOpen, setCreateOpen] = useState(false);
  const [updateOpen, setUpdateOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] =
    useState<MappedProduct | null>(null);
  const { showNotification } = useNotification();
  const { token } = useSelector((state: RootState) => state.auth);

  const mappedProducts: MappedProduct[] = (products ?? []).map(
    (p) => {
      const id = (p.id ?? p._id ?? p.recordId ?? '') as string;
      const name = (p.name as string) || '';
      const description = (p.description as string) || '';
      const price = (p.price as number) || 0;
      const images = (p.images as string[]) || [];
      const expanded = p.expand as
        | Record<string, unknown>
        | undefined;
      const categoryId = (p.category as string) || '';
      let categoryName = '';
      if (
        expanded &&
        typeof expanded === 'object' &&
        'category' in expanded
      ) {
        const cat = expanded.category as unknown;
        if (
          cat &&
          typeof cat === 'object' &&
          'name' in (cat as Record<string, unknown>)
        ) {
          const name = (cat as Record<string, unknown>).name;
          if (typeof name === 'string') categoryName = name;
        }
      }
      if (!categoryName) {
        categoryName = categoryId;
      }
      const isFeatured = (p.isFeatured as boolean) || false;
      const isAvailable = (p.isAvailable as boolean) || false;
      const stock = (p.stock as number) || 0;
      const slug = (p.slug as string) || '';

      const createdRaw =
        (p.created as string) ||
        (p.createdAt as string) ||
        (p.created_at as string) ||
        '';
      const updatedRaw =
        (p.updated as string) ||
        (p.updatedAt as string) ||
        (p.updated_at as string) ||
        '';

      const created =
        createdRaw && !isNaN(Date.parse(createdRaw))
          ? new Date(createdRaw).toLocaleString()
          : '';
      const updated =
        updatedRaw && !isNaN(Date.parse(updatedRaw))
          ? new Date(updatedRaw).toLocaleString()
          : '';

      const imageUrls = images.map((image) =>
        buildFileUrl(image, 'products', id)
      );

      return {
        id,
        name,
        description,
        price,
        imageUrl: imageUrls[0] || null,
        images: imageUrls,
        created,
        updated,
        category: categoryName,
        categoryId,
        isFeatured,
        isAvailable,
        stock,
        slug,
      } as MappedProduct;
    }
  );

  // Pagination
  const [pageSize, setPageSize] = useState<number>(10);
  const [page, setPage] = useState<number>(1);

  const start = (page - 1) * pageSize;

  const [removedIds, setRemovedIds] = useState<Set<string>>(
    new Set()
  );

  const allProducts = React.useMemo(
    () => [...mappedProducts].filter((p) => !removedIds.has(p.id)),
    [mappedProducts, removedIds]
  );

  // search state
  const [query, setQuery] = useState<string>('');
  const [debouncedQuery, setDebouncedQuery] = useState<string>(query);

  useEffect(() => {
    const t = setTimeout(() => setDebouncedQuery(query.trim()), 300);
    return () => clearTimeout(t);
  }, [query]);

  const filteredProducts = React.useMemo(() => {
    const q = (debouncedQuery ?? '').toLowerCase();
    if (!q) return allProducts;
    return allProducts.filter((p) => {
      const name = (p.name ?? '') as string;
      const description = (p.description ?? '') as string;
      return (
        name.toLowerCase().includes(q) ||
        description.toLowerCase().includes(q)
      );
    });
  }, [allProducts, debouncedQuery]);

  const totalFiltered = filteredProducts.length;
  const totalPages = Math.max(1, Math.ceil(totalFiltered / pageSize));

  // Ensure current page is within bounds when pageSize or total changes
  useEffect(() => {
    if (page > totalPages) setPage(totalPages);
    if (page < 1) setPage(1);
  }, [page, pageSize, totalPages]);

  const end = Math.min(start + pageSize, totalFiltered);
  const pagedProductsAll = filteredProducts.slice(start, end);

  const handleDeleteProduct = async () => {
    if (!selectedProduct || !token) {
      showNotification(
        'You must be logged in to delete a product',
        'error'
      );
      return;
    }

    try {
      await pb.delete(
        `/api/collections/products/records/${selectedProduct.id}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      showNotification('Product deleted successfully', 'success');
      onProductUpdated?.();
      setDeleteOpen(false);
    } catch (err) {
      let msg = 'Failed to delete product';
      if (isAxiosError(err) && err.response?.data?.message) {
        msg = err.response.data.message;
      } else if (err instanceof Error) {
        msg = err.message;
      }
      showNotification(msg, 'error');
    }
  };

  if (loading) return <Loading text="Loading products…" />;

  if (error)
    return (
      <div className="text-sm text-yellow-300 bg-yellow-900/20 p-2 rounded border border-yellow-700">
        Error loading products: {error}
      </div>
    );

  if (!products || products.length === 0)
    return (
      <div className="text-sm text-gray-300">No products found.</div>
    );

  const handlePageSizeChange = (value: number) => {
    setPageSize(value);
    setPage(1);
  };

  const total = totalFiltered;
  const startDisplay = total === 0 ? 0 : start + 1;

  const formatCurrency = (amount: number | undefined | null) => {
    if (typeof amount !== 'number') {
      return '';
    }
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND',
    }).format(amount);
  };

  return (
    <Card className="bg-transparent border-none">
      <CardHeader>
        <div className="flex items-center justify-between gap-3 flex-wrap">
          <div className="flex items-center flex-wrap gap-2">
            <Button
              onClick={() => setCreateOpen(true)}
              className="bg-gradient-to-b from-rose-700 to-rose-900 text-white"
            >
              Create Product
            </Button>
          </div>
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
                placeholder="Search name, description"
                value={query}
                onChange={(e) => {
                  setQuery(e.target.value);
                  setPage(1);
                }}
                className="bg-[#0b0b0b] text-sm text-gray-200 border border-gray-800 rounded px-2 py-1 w-full sm:w-64"
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
      </CardHeader>
      <CardContent className="p-0">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-4">
          {pagedProductsAll.map((p) => (
            <Card
              key={p.id}
              className="bg-[#0b0b0b] border border-[#2a0808] rounded-lg p-2 sm:p-4 flex flex-col gap-4"
            >
              <CardHeader className="p-0">
                <div className="flex-shrink-0">
                  {p.imageUrl ? (
                    <button
                      type="button"
                      onClick={() => {
                        setLightboxIndex(0);
                        setLightboxOpen(true);
                      }}
                      className="rounded-lg overflow-hidden w-full h-48 relative"
                    >
                      <Image
                        src={p.imageUrl}
                        alt={p.name || 'Product Image'}
                        layout="fill"
                        className="object-cover"
                        unoptimized
                      />
                    </button>
                  ) : (
                    <div className="w-full h-48 rounded-lg bg-[#0b0b0b] flex items-center justify-center text-gray-400 font-bold">
                      RE
                    </div>
                  )}
                </div>
              </CardHeader>
              <CardContent className="p-0">
                <div className="flex items-center justify-between gap-2">
                  <CardTitle className="text-lg font-bold text-white truncate">
                    {p.name || '—'}
                  </CardTitle>
                  <div className="text-sm text-gray-400 font-mono truncate">
                    {formatCurrency(p.price)}
                  </div>
                </div>
                <div className="flex">
                  <div className="text-sm p-2 bg-red-400 text-black mt-1">
                    Category: {p.category}
                  </div>
                </div>
                <p className="text-sm text-gray-500 mt-2 flex-grow">
                  {p.description}
                </p>
              </CardContent>
              <CardFooter className="p-4 flex flex-col gap-4">
                <div className="flex items-center gap-2 flex-wrap">
                  <span
                    className={`text-xs px-2 py-1 rounded ${
                      p.isFeatured
                        ? 'bg-green-900 text-green-300'
                        : 'bg-gray-800 text-gray-400'
                    }`}
                  >
                    {p.isFeatured ? 'Featured' : 'Not Featured'}
                  </span>
                  <span
                    className={`text-xs px-2 py-1 rounded ${
                      p.isAvailable
                        ? 'bg-green-900 text-green-300'
                        : 'bg-yellow-900 text-yellow-300'
                    }`}
                  >
                    {p.isAvailable ? 'Available' : 'Unavailable'}
                  </span>
                  <span className="text-xs px-2 py-1 rounded bg-gray-800 text-gray-300">
                    Stock: {p.stock}
                  </span>
                </div>
                <div className="flex gap-2">
                  <Button
                    aria-label={`Update ${p.name}`}
                    onClick={() => {
                      setSelectedProduct(p);
                      setUpdateOpen(true);
                    }}
                    className="px-2 py-1 sm:px-3 sm:py-2 rounded-lg text-sm font-semibold uppercase tracking-wider text-white bg-gradient-to-b from-[#6f0f0f] to-[#2b0404] border border-[#3a0000] shadow-[0_6px_0_rgba(0,0,0,0.6)] hover:from-[#8b1515] hover:to-[#3b0505] active:translate-y-0.5"
                  >
                    Update
                  </Button>

                  <Button
                    aria-label={`Delete ${p.name}`}
                    onClick={() => {
                      setSelectedProduct(p);
                      setDeleteOpen(true);
                    }}
                    className="px-2 py-1 sm:px-3 sm:py-2 rounded-lg text-sm font-semibold uppercase tracking-wider text-white bg-gradient-to-b from-[#8b0f0f] to-[#310000] border border-[#2a0000] shadow-[0_6px_0_rgba(0,0,0,0.65)] hover:from-[#a21a1a] hover:to-[#5a0000] active:translate-y-0.5"
                  >
                    Delete
                  </Button>
                </div>
              </CardFooter>
            </Card>
          ))}
        </div>
      </CardContent>
      <Lightbox
        open={lightboxOpen}
        close={() => setLightboxOpen(false)}
        index={lightboxIndex}
        slides={pagedProductsAll.flatMap(
          (p) => p.images?.map((img) => ({ src: img })) || []
        )}
      />
      <CreateProductDialog
        open={createOpen}
        onClose={() => setCreateOpen(false)}
        onCreated={() => {
          onProductUpdated?.();
        }}
      />
      <UpdateProductDialog
        open={updateOpen}
        onClose={() => setUpdateOpen(false)}
        product={selectedProduct}
        onUpdated={() => {
          onProductUpdated?.();
        }}
      />
      <DeleteProductDialog
        open={deleteOpen}
        onClose={() => setDeleteOpen(false)}
        onConfirm={handleDeleteProduct}
        product={selectedProduct}
      />
    </Card>
  );
}
