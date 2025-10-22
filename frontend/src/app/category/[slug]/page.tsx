import React from 'react';
import Image from 'next/image';
import type { Metadata } from 'next';
import {
  getCategoryBySlug,
  getProductsByCategory,
  Product,
  getCategories,
} from '@/lib/pocketbase';

export async function generateStaticParams() {
  const { items } = await getCategories();
  console.log('Categories fetched for generateStaticParams:', items); // Add this line
  return items.map((category) => ({
    slug: category.slug,
  }));
}

export async function generateMetadata({
  params,
}: Props): Promise<Metadata> {
  const category = await getCategoryBySlug(params.slug);
  return {
    title: category?.name || 'Category',
  };
}

import Link from 'next/link';
import { Button } from '@/components/ui/button';
import AddToCartButton from '@/components/AddToCartButton.client';

import Pagination from '@/components/Pagination.client';
import FilterDropdown from '@/components/FilterDropdown.client';

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

function wordToUpperCase(str: string) {
  return str.toUpperCase();
}

type Props = {
  params: { slug: string };
  searchParams: { [key: string]: string | string[] | undefined };
};

export default async function CategoryPage({ params, searchParams }: Props) {
  const { slug } = params;
  const category = await getCategoryBySlug(slug);
  const sort = searchParams.sort as string;
  const page = searchParams.page ? parseInt(searchParams.page as string) : 1;
  const perPage = searchParams.perPage ? parseInt(searchParams.perPage as string) : 5;

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

  // --- new: compute category image URL ---
  const categoryImage =
    (category.image &&
      typeof category.image === 'string' &&
      category.image) ||
    null;
  const categoryImageUrl = categoryImage
    ? categoryImage.startsWith('http')
      ? categoryImage
      : `${PB_URL}/api/files/${
          (category.collectionId as string) ?? 'categories'
        }/${category.id}/${encodeURIComponent(categoryImage)}`
    : null;
  // --- end new ---

  const products = await getProductsByCategory(category.id, {
    perPage: perPage,
    sort: sort,
    page: page,
  });
  return (
    <main className="w-full py-12">
      <div className="max-w-5xl mx-auto px-4 mb-8">
        {/* New hero header: shadcn-ish, RE4 remake inspired */}
        <header className="relative rounded-lg overflow-hidden ring-1 ring-white/6 shadow-2xl bg-gradient-to-br from-neutral-900 via-zinc-900 to-black">
          <div className="relative h-52 sm:h-64 md:h-72 lg:h-80 scanlines">
            {categoryImageUrl ? (
              <>
                <Image
                  src={categoryImageUrl}
                  alt={String(category.name ?? 'Category image')}
                  fill
                  className="object-cover brightness-90 contrast-105"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/30 to-transparent" />
                <div className="absolute inset-0 bg-[linear-gradient(90deg,rgba(30,30,30,0.6)_0%,rgba(0,0,0,0.2)_30%,rgba(0,0,0,0.0)_100%)]" />
              </>
            ) : (
              <div className="h-full w-full bg-gradient-to-br from-zinc-800 via-zinc-900 to-black flex items-center justify-center">
                <div className="text-sm text-zinc-300">
                  No image available
                </div>
              </div>
            )}
          </div>

          <div className="relative px-6 pb-6 pt-4 sm:pt-6">
            <div className="max-w-5xl mx-auto flex flex-col sm:flex-row items-start sm:items-end gap-4">
              <div className="flex-1">
                <div className="flex items-center gap-3">
                  <span className="inline-flex items-center rounded-full bg-amber-600/10 px-2 py-1 text-xs font-medium text-amber-300 ring-1 ring-amber-700/20">
                    CATEGORY
                  </span>
                  <span className="text-xs text-zinc-400">
                    {category?.slug}
                  </span>
                </div>

                <h1 className="mt-3 text-3xl sm:text-4xl font-extrabold tracking-tight uppercase text-amber-100 drop-shadow-[0_8px_24px_rgba(0,0,0,0.7)] leading-tight">
                  {category.name}
                </h1>

                {category.description && (
                  <p className="mt-2 max-w-2xl text-sm text-zinc-300/90 line-clamp-3">
                    {category.description}
                  </p>
                )}
              </div>

              <div className="w-full sm:w-auto flex-shrink-0">
                <div className="flex gap-2 items-center">
                  <Button
                    asChild
                    className="inline-flex items-center rounded-md px-4 py-2 text-sm font-semibold text-white shadow-2xl
                               bg-gradient-to-b from-rose-800 via-rose-700 to-rose-600 hover:from-rose-700 hover:to-rose-500
                               ring-1 ring-rose-900/30 active:scale-95"
                  >
                    <Link
                      href={`/category/`}
                      aria-label={`Browse ${category.name}`}
                    >
                      Browse
                    </Link>
                  </Button>

                  <Button
                    asChild
                    variant="outline"
                    className="inline-flex items-center rounded-md px-4 py-2 text-sm text-zinc-200 border-zinc-700 hover:bg-zinc-800/40"
                  >
                    <a href="#products">View products</a>
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </header>
      </div>

      <section id="products" className="w-full">
        <div className="max-w-5xl mx-auto px-4 mb-8">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-2xl font-semibold">Products</h2>
            <FilterDropdown />
          </div>
          {products.items.length === 0 ? (
            <>
              <div className="flex justify-center items-center flex-col gap-4 text-zinc-400 bg-[#0a0a0a] border border-[#2a0808] shadow-[0_0_40px_rgba(200,16,30,0.15)] rounded-lg p-10">
                <Image
                  src="/img/leon-gif.gif"
                  alt="No products"
                  sizes="(max-width: 768px) 100vw, 33vw"
                  width={200}
                  height={200}
                  className="rounded-lg h-30 object-contain"
                />
                <p>No products found for this category.</p>
              </div>
            </>
          ) : (
            <>
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
                      <div className="bg-gradient-to-br from-[#060606] via-zinc-900 to-[#111111] text-white shadow-2xl border border-rose-900/10 rounded-lg overflow-hidden">
                        <div className="flex flex-col sm:flex-row items-start gap-4 p-5">
                          {/* Image column */}
                          <div className="shrink-0 w-full sm:w-40 ">
                            <div className="h-36 w-full relative rounded-md bg-muted overflow-hidden scanlines">
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
                            <h3 className="text-2xl font-extrabold leading-tight text-white tracking-tight uppercase">
                              {p.title ?? p.name ?? 'Untitled'}
                            </h3>

                            {p.description && (
                              <p className="mt-2 text-sm text-zinc-300 line-clamp-3">
                                {p.description}
                              </p>
                            )}

                            <div className="mt-4 grid grid-cols-2 gap-2 text-sm text-zinc-300">
                              <div className="flex items-center gap-2">
                                <span
                                  className={`h-2 w-2 rounded-full ${
                                    p.isAvailable
                                      ? 'bg-emerald-400'
                                      : 'bg-zinc-500'
                                  }`}
                                />
                                <div>
                                  <div className="text-zinc-100 font-medium">
                                    Availability
                                  </div>
                                  <div className="text-zinc-300 text-xs">
                                    {p.isAvailable === true
                                      ? p.stock
                                      : typeof p.stock === 'number'
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
                                    {wordToUpperCase(p.id)}
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
                                <div className="text-3xl font-extrabold text-rose-500 drop-shadow-[0_10px_30px_rgba(220,38,38,0.22)]">
                                  {formatVND(p.price)}
                                </div>
                              )}
                              <div className="text-xs text-zinc-400 mt-1">
                                incl. VAT
                              </div>
                            </div>

                            <div className="w-full sm:w-auto mt-2 sm:mt-0 flex flex-col gap-2">
                              <AddToCartButton
                                product={p}
                                className={`inline-flex w-full items-center justify-center gap-2 rounded-md px-4 py-3 font-semibold text-sm text-white transition-transform transform ${
                                  (process.env
                                    .NEXT_PUBLIC_ENABLE_ADD_TO_CART ??
                                    'false') === 'true' &&
                                  (typeof p.stock !== 'number' ||
                                    p.stock > 0)
                                    ? 'bg-gradient-to-b from-rose-700 to-rose-600 hover:from-rose-600 hover:to-rose-500 active:scale-95 shadow-[inset_0_2px_0_rgba(255,255,255,0.03),0_16px_40px_rgba(220,38,38,0.15)] border border-rose-800'
                                    : 'bg-zinc-700/40 cursor-not-allowed'
                                }`}
                              >
                                Add to cart
                              </AddToCartButton>

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
              <Pagination
                totalItems={products.totalItems}
                perPage={perPage}
                page={page}
              />
            </>
          )}
        </div>
      </section>
    </main>
  );
}
