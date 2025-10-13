import React from 'react';
import Image from 'next/image';
import {
  getCategoryBySlug,
  getProductsByCategory,
  Product,
} from '@/lib/pocketbase';
import Link from 'next/link';

const PB_URL =
  process.env.NEXT_PUBLIC_POCKETBASE_URL ?? 'http://127.0.0.1:8090';

function formatVND(amount?: number | null) {
  if (amount == null) return '';
  return new Intl.NumberFormat('vi-VN', {
    style: 'currency',
    currency: 'VND',
    maximumFractionDigits: 0,
  }).format(amount);
}

type Props = {
  params: { slug: string };
};

export default async function CategoryPage({ params }: Props) {
  const { slug } = params;
  const category = await getCategoryBySlug(slug);

  if (!category) {
    return (
      <main className="max-w-5xl mx-auto py-20 px-4">
        <h1 className="text-3xl font-bold">Category not found</h1>
        <p className="mt-4">
          No category with slug {slug} was found.
        </p>
      </main>
    );
  }

  const products = await getProductsByCategory(category.id, {
    perPage: 100,
  });
  return (
    <main className="w-full py-12">
      <div className="max-w-5xl mx-auto px-4 mb-8">
        <header>
          <h1 className="text-4xl font-extrabold tracking-tight">
            {category.name}
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            {category?.slug}
          </p>
        </header>
      </div>

      <section className="w-full">
        <div className="max-w-5xl mx-auto px-4 mb-8">
          <h2 className="text-2xl font-semibold mb-4">Products</h2>
          {products.items.length === 0 ? (
            <p className="text-muted-foreground">
              No products found for this category.
            </p>
          ) : (
            <ul className="grid grid-cols-1 sm:grid-cols-1 gap-4 w-full">
              {products.items.map((p: Product) => {
                const image =
                  (p.images && p.images.length > 0 && p.images[0]) ||
                  null;
                const imageUrl = image
                  ? image.startsWith('http')
                    ? image
                    : `${PB_URL}/api/files/${
                        (p.collectionId as string) ?? 'products'
                      }/${p.id}/${encodeURIComponent(
                        image as string
                      )}`
                  : null;

                return (
                  <li key={p.id} className="relative">
                    <div className="bg-gradient-to-br from-zinc-950 via-zinc-900 to-zinc-800 text-white shadow-lg border border-zinc-800 rounded-lg overflow-hidden">
                      <div className="flex flex-col sm:flex-row items-start gap-4 p-5">
                        {/* Image column */}
                        <div className="shrink-0 w-full sm:w-40">
                          <div className="h-36 w-full relative rounded-md bg-muted overflow-hidden">
                            {imageUrl ? (
                              <Image
                                src={imageUrl}
                                alt={String(
                                  p.name ?? p.title ?? 'Product image'
                                )}
                                fill
                                className="object-cover"
                              />
                            ) : (
                              <div className="h-full w-full bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center text-sm text-muted-foreground">
                                No image
                              </div>
                            )}
                          </div>
                        </div>

                        {/* Details column */}
                        <div className="flex-1 min-w-0">
                          <h3 className="text-2xl font-extrabold leading-tight tracking-tight">
                            {p.title ?? p.name ?? 'Untitled'}
                          </h3>

                          {p.description && (
                            <p className="mt-2 text-sm text-zinc-300 line-clamp-3">
                              {p.description}
                            </p>
                          )}

                          <div className="mt-4 grid grid-cols-2 gap-2 text-sm text-zinc-300">
                            <div className="flex items-center gap-2">
                              <span className="h-2 w-2 rounded-full bg-emerald-400" />
                              <div>
                                <div className="text-zinc-100 font-medium">
                                  Availability
                                </div>
                                <div className="text-zinc-300 text-xs">
                                  {typeof p.stock === 'number'
                                    ? `${p.stock} in stock`
                                    : 'Unknown'}
                                </div>
                              </div>
                            </div>

                            <div className="flex items-center gap-2">
                              <span className="h-2 w-2 rounded-full bg-rose-500" />
                              <div>
                                <div className="text-zinc-100 font-medium">
                                  Art.-Nr.
                                </div>
                                <div className="text-zinc-300 text-xs">
                                  {p.id}
                                </div>
                              </div>
                            </div>

                            {p.updated && (
                              <div className="flex items-center gap-2">
                                <span className="h-2 w-2 rounded-full bg-orange-400" />
                                <div>
                                  <div className="text-zinc-100 font-medium">
                                    Updated
                                  </div>
                                  <div className="text-zinc-300 text-xs">
                                    {new Date(
                                      p.updated
                                    ).toLocaleDateString()}
                                  </div>
                                </div>
                              </div>
                            )}

                            <div className="flex items-center gap-2">
                              <span className="h-2 w-2 rounded-full bg-sky-400" />
                              <div>
                                <div className="text-zinc-100 font-medium">
                                  Category
                                </div>
                                <div className="text-zinc-300 text-xs">
                                  {category.name}
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>

                        {/* Price & CTA column */}
                        <div className="w-full sm:w-56 flex-shrink-0 flex flex-col items-start sm:items-end justify-between gap-3">
                          <div className="text-right">
                            {p.price !== undefined && (
                              <div className="text-3xl font-extrabold text-rose-500 drop-shadow-[0_8px_24px_rgba(220,38,38,0.18)]">
                                {formatVND(p.price)}
                              </div>
                            )}
                            <div className="text-xs text-zinc-400 mt-1">
                              incl. VAT
                            </div>
                          </div>

                          <div className="w-full sm:w-auto mt-2 sm:mt-0 flex flex-col gap-2">
                            <button
                              type="button"
                              disabled={
                                !(
                                  (process.env
                                    .NEXT_PUBLIC_ENABLE_ADD_TO_CART ??
                                    'false') === 'true'
                                ) ||
                                (typeof p.stock === 'number' &&
                                  p.stock <= 0)
                              }
                              className={`inline-flex w-full items-center justify-center gap-2 rounded-md px-4 py-3 font-semibold text-sm text-white transition-transform transform ${
                                (process.env
                                  .NEXT_PUBLIC_ENABLE_ADD_TO_CART ??
                                  'false') === 'true' &&
                                (typeof p.stock !== 'number' ||
                                  p.stock > 0)
                                  ? 'bg-rose-600 hover:bg-rose-700 active:scale-95 shadow-[0_8px_32px_rgba(220,38,38,0.18)]'
                                  : 'bg-zinc-700/40 cursor-not-allowed'
                              }`}
                            >
                              Add to cart
                            </button>

                            <Link
                              href={`/product/${p.slug ?? p.id}`}
                              className="inline-flex w-full items-center justify-center gap-2 rounded-md border border-zinc-700 px-4 py-2 text-sm text-zinc-200 hover:underline"
                            >
                              View details
                            </Link>
                          </div>

                          <div className="mt-2 text-sm text-emerald-400">
                            Online • Available now
                          </div>
                        </div>
                      </div>
                    </div>
                  </li>
                );
              })}
            </ul>
          )}
        </div>
      </section>
    </main>
  );
}
