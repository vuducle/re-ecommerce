import UpdateCategoryDialog from './UpdateCategoryDialog.client';
import CreateCategoryDialog from './CreateCategoryDialog.client';
import DeleteCategoryDialog from './DeleteCategoryDialog.client';
import React, { useState, useEffect, useMemo } from 'react';
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
import { useNotification } from '../context/NotificationContext';
import { useSelector } from 'react-redux';
import { RootState } from '../store';
import { isAxiosError } from 'axios';

type Props = {
  categories: Array<Record<string, unknown>> | null;
  loading?: boolean;
  error?: string | null;
  onCategoryUpdated?: () => void;
};

type MappedCategory = {
  id: string;
  name: string;
  slug: string;
  imageUrl?: string | null;
  description?: string;
  created?: string;
  updated?: string;
  [key: string]: unknown;
};

export default function CategoriesTable({
  categories,
  loading,
  error,
  onCategoryUpdated,
}: Props) {
  const [lightboxOpen, setLightboxOpen] = useState<boolean>(false);
  const [lightboxIndex, setLightboxIndex] = useState<number>(0);
  const [createOpen, setCreateOpen] = useState<boolean>(false);
  const [updateOpen, setUpdateOpen] = useState<boolean>(false);
  const [deleteOpen, setDeleteOpen] = useState<boolean>(false);
  const [selectedCategory, setSelectedCategory] =
    useState<MappedCategory | null>(null);
  const { showNotification } = useNotification();
  const { token } = useSelector((state: RootState) => state.auth);

  const mappedCategories: MappedCategory[] = (categories ?? []).map(
    (c) => {
      const id = (c.id ?? c._id ?? c.recordId ?? '') as string;
      const name = (c.name as string) || '';
      const slug = (c.slug as string) || '';
      const image = (c.image as string) || undefined;
      const description = (c.description as string) || '';

      const createdRaw =
        (c.created as string) ||
        (c.createdAt as string) ||
        (c.created_at as string) ||
        '';
      const updatedRaw =
        (c.updated as string) ||
        (c.updatedAt as string) ||
        (c.updated_at as string) ||
        '';

      const created =
        createdRaw && !isNaN(Date.parse(createdRaw))
          ? new Date(createdRaw).toLocaleString()
          : '';
      const updated =
        updatedRaw && !isNaN(Date.parse(updatedRaw))
          ? new Date(updatedRaw).toLocaleString()
          : '';

      const imageUrl = image
        ? buildFileUrl(image, 'categories', id)
        : null;

      return {
        id,
        name,
        slug,
        imageUrl,
        description,
        created,
        updated,
      } as MappedCategory;
    }
  );

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

  const filteredCategories = useMemo(() => {
    const q = (debouncedQuery ?? '').toLowerCase();
    if (!q) return mappedCategories;
    return mappedCategories.filter((c) => {
      const name = (c.name ?? '') as string;
      const slug = (c.slug ?? '') as string;
      return (
        name.toLowerCase().includes(q) ||
        slug.toLowerCase().includes(q)
      );
    });
  }, [mappedCategories, debouncedQuery]);

  const totalFiltered = filteredCategories.length;
  const totalPages = Math.max(1, Math.ceil(totalFiltered / pageSize));

  // Ensure current page is within bounds when pageSize or total changes
  useEffect(() => {
    if (page > totalPages) setPage(totalPages);
    if (page < 1) setPage(1);
  }, [page, pageSize, totalPages]);

  const end = Math.min(start + pageSize, totalFiltered);
  const pagedCategoriesAll = filteredCategories.slice(start, end);

  const handleDeleteCategory = async () => {
    if (!selectedCategory || !token) {
      showNotification(
        'You must be logged in to delete a category',
        'error'
      );
      return;
    }

    try {
      await pb.delete(
        `/api/collections/categories/records/${selectedCategory.id}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      showNotification('Category deleted successfully', 'success');
      onCategoryUpdated?.();
      setDeleteOpen(false);
    } catch (err) {
      let msg = 'Failed to delete category';
      if (isAxiosError(err) && err.response?.data?.message) {
        msg = err.response.data.message;
      } else if (err instanceof Error) {
        msg = err.message;
      }
      showNotification(msg, 'error');
    }
  };

  if (loading) return <Loading text="Loading categories…" />;

  if (error)
    return (
      <div className="text-sm text-yellow-300 bg-yellow-900/20 p-2 rounded border border-yellow-700">
        Error loading categories: {error}
      </div>
    );

  const handlePageSizeChange = (value: number) => {
    setPageSize(value);
    setPage(1);
  };

  const total = totalFiltered;
  const startDisplay = total === 0 ? 0 : start + 1;

  return (
    <Card className="bg-transparent border-none">
      <CardHeader>
        <div className="flex items-center justify-between gap-3 flex-wrap">
          <div className="flex items-center flex-wrap gap-2">
            <Button
              onClick={() => setCreateOpen(true)}
              className="bg-gradient-to-b from-rose-700 to-rose-900 text-white"
            >
              Create Category
            </Button>
          </div>
          {mappedCategories.length > 0 && (
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
                  placeholder="Search name, slug"
                  value={query}
                  onChange={(e) => {
                    setQuery(e.target.value);
                    setPage(1);
                  }}
                  className="bg-[#0b0b0b] text-sm text-gray-200 border border-gray-800 rounded px-2 py-1 w-full sm:w-64"
                />
              </div>
            </div>
          )}

          {mappedCategories.length > 0 && (
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
          )}
        </div>
      </CardHeader>
      <CardContent className="p-0">
        {pagedCategoriesAll.length === 0 ? (
          <div className="text-sm text-gray-300 text-center py-8">
            No categories found.
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-4">
            {pagedCategoriesAll.map((c) => (
              <Card
                key={c.id}
                className="bg-[#0b0b0b] border border-[#2a0808] rounded-lg p-2 sm:p-4 flex flex-col gap-4"
              >
                <CardHeader className="p-0">
                  <div className="flex-shrink-0">
                    {c.imageUrl ? (
                      <button
                        type="button"
                        onClick={() => {
                          setLightboxIndex(0);
                          setLightboxOpen(true);
                        }}
                        className="rounded-lg overflow-hidden w-full h-48 relative"
                      >
                        <Image
                          src={c.imageUrl}
                          alt={c.name || 'Category Image'}
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
                <CardContent className="p-4">
                  <CardTitle className="text-lg font-bold text-white truncate">
                    {c.name || '—'}
                  </CardTitle>
                  <p className="text-sm text-gray-500 mt-2 flex-grow">
                    {c.description}
                  </p>
                </CardContent>
                <CardFooter className="flex gap-2">
                  <Button
                    aria-label={`Update ${c.name}`}
                    onClick={() => {
                      setSelectedCategory(c);
                      setUpdateOpen(true);
                    }}
                    className="px-2 py-1 sm:px-3 sm:py-2 rounded-lg text-sm font-semibold uppercase tracking-wider text-white bg-gradient-to-b from-[#6f0f0f] to-[#2b0404] border border-[#3a0000] shadow-[0_6px_0_rgba(0,0,0,0.6)] hover:from-[#8b1515] hover:to-[#3b0505] active:translate-y-0.5"
                  >
                    Update
                  </Button>

                  <Button
                    aria-label={`Delete ${c.name}`}
                    onClick={() => {
                      setSelectedCategory(c);
                      setDeleteOpen(true);
                    }}
                    className="px-2 py-1 sm:px-3 sm:py-2 rounded-lg text-sm font-semibold uppercase tracking-wider text-white bg-gradient-to-b from-[#8b0f0f] to-[#310000] border border-[#2a0000] shadow-[0_6px_0_rgba(0,0,0,0.65)] hover:from-[#a21a1a] hover:to-[#5a0000] active:translate-y-0.5"
                  >
                    Delete
                  </Button>
                </CardFooter>
              </Card>
            ))}
          </div>
        )}
      </CardContent>
      <Lightbox
        open={lightboxOpen}
        close={() => setLightboxOpen(false)}
        index={lightboxIndex}
        slides={pagedCategoriesAll.flatMap((c) =>
          c.imageUrl ? [{ src: c.imageUrl }] : []
        )}
      />
      <CreateCategoryDialog
        open={createOpen}
        onClose={() => setCreateOpen(false)}
        onCreated={(newCategory) => {
          onCategoryUpdated?.();
        }}
      />
      <UpdateCategoryDialog
        open={updateOpen}
        onClose={() => setUpdateOpen(false)}
        category={selectedCategory}
        onUpdated={() => {
          onCategoryUpdated?.();
        }}
      />
      <DeleteCategoryDialog
        open={deleteOpen}
        onClose={() => setDeleteOpen(false)}
        onConfirm={handleDeleteCategory}
        category={selectedCategory}
      />
    </Card>
  );
}
