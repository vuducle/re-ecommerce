import React from 'react';
import { getProductBySlug, getProducts } from '@/lib/pocketbase';
import ProductGallery from '@/components/ProductGallery.client';
import WishlistButton from '@/components/WishlistButton.client';
import AddToCartButton from '@/components/AddToCartButton.client';
import type { Metadata } from 'next';

export async function generateStaticParams() {
  const { items } = await getProducts();
  return items.map((product) => ({
    slug: product.slug,
  }));
}

type Props = { params: { slug: string } };

export async function generateMetadata({
  params,
}: Props): Promise<Metadata> {
  const product = await getProductBySlug(params.slug);
  return {
    title: product?.name || 'Product',
  };
}

export default async function ProductPage({ params }: Props) {
  const { slug } = params;
  const product = await getProductBySlug(slug);

  if (!product) {
    return (
      <main className="max-w-4xl mx-auto py-20 px-4">
        <h1 className="text-3xl font-bold">Product not found</h1>
        <p className="mt-4">No product with slug {slug} was found.</p>
      </main>
    );
  }

  // build image urls: product.images may contain full URLs or filenames
  const images: string[] = (product.images ?? []).map((img) =>
    typeof img === 'string' && img.startsWith('http')
      ? img
      : // use collection 'products' or product.collectionId if present
        `${
          process.env.NEXT_PUBLIC_POCKETBASE_URL ??
          'http://127.0.0.1:8090'
        }/api/files/${
          (product.collectionId as string) ?? 'products'
        }/${product.id}/${encodeURIComponent(String(img))}`
  );

  return (
    <main className="max-w-5xl mx-auto py-12 px-6 mt-5 rounded-2xl bg-gradient-to-b from-black/50 via-gray-700/40 to-black/5 backdrop-blur-sm bg-clip-padding border roundness-2xl my-4 border-rose-900/10 shadow-lg ring-1 ring-rose-900/5">
      <div className="relative">
        <div
          className="absolute inset-0 opacity-50 pointer-events-none mix-blend-overlay bg-size-[40%] bg-no-repeat bg-bottom-left"
          style={{ backgroundImage: "url('/img/RE4R_Matilda.webp')" }}
          aria-hidden="true"
        />

        <div
          className="absolute inset-0 opacity-100 pointer-events-none mix-blend-overlay bg-size-[30%] bg-no-repeat bg-bottom-right"
          style={{
            backgroundImage: "url('/img/merchant.png')",
          }}
          aria-hidden="true"
        />

        <div className="relative z-10 grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="md:col-span-2">
            <ProductGallery
              images={images}
              alt={String(product.name ?? product.title ?? 'Product')}
            />
          </div>

          <div className="md:col-span-1">
            <h1 className="text-4xl font-extrabold uppercase tracking-tight text-rose-100 drop-shadow-[0_12px_30px_rgba(0,0,0,0.8)]">
              {product.title ?? product.name}
            </h1>

            {product.price !== undefined && (
              <div className="text-3xl text-red-500 mt-3 font-black drop-shadow-[0_12px_30px_rgba(120,40,10,0.25)]">
                {new Intl.NumberFormat('vi-VN', {
                  style: 'currency',
                  currency: 'VND',
                  maximumFractionDigits: 0,
                }).format(product.price ?? 0)}
              </div>
            )}

            {product.description && (
              <div className="mt-4 text-sm text-zinc-200/90 leading-relaxed">
                {product.description}
              </div>
            )}

            <div className="mt-6 flex items-center gap-4">
              <AddToCartButton
                product={product}
                className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-b from-[#6b0b0b] to-[#3e0606] px-6 py-3 text-white font-semibold shadow-lg border border-rose-900/30 hover:scale-[1.01] transition-transform"
              >
                Add to cart
              </AddToCartButton>
              <WishlistButton product={product} />
            </div>
            <div className="mt-6 bg-black/40 backdrop-blur-sm border border-rose-800/10 rounded-2xl p-5 text-sm text-zinc-200 relative overflow-hidden">
              <div className="absolute left-0 top-0 h-0.5 w-full bg-gradient-to-r from-rose-600 via-rose-400 to-rose-600 opacity-80" />
              <h4 className="font-semibold text-rose-200 mb-3">
                Product details
              </h4>
              <div className="grid grid-cols-2 gap-y-3 gap-x-6 text-zinc-300">
                <div className="text-rose-200">ID</div>
                <div className="truncate text-rose-50">
                  {product.id}
                </div>

                <div className="text-rose-200">Slug</div>
                <div className="truncate">{product.slug ?? '-'}</div>

                <div className="text-rose-200">Stock</div>
                <div className="text-rose-50">
                  {typeof product.stock === 'number'
                    ? product.stock
                    : '—'}
                </div>

                <div className="text-rose-200">Availability</div>
                <div
                  className={`${
                    product.isAvailable
                      ? 'text-emerald-400'
                      : 'text-rose-400'
                  }`}
                >
                  {product.isAvailable === true
                    ? 'Available'
                    : 'Not available'}
                </div>

                <div className="text-rose-200">Created</div>
                <div>
                  {product.created
                    ? new Date(product.created).toLocaleString()
                    : '-'}
                </div>

                <div className="text-rose-200">Updated</div>
                <div>
                  {product.updated
                    ? new Date(product.updated).toLocaleString()
                    : '-'}
                </div>

                <div className="text-rose-200">Category</div>
                <div>
                  {product.category ??
                    (Array.isArray(product.categories)
                      ? (product.categories as string[]).join(', ')
                      : '-')}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
