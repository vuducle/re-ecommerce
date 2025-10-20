'use client';

import React from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { RootState } from '@/store';
import { removeFromWishlist } from '@/store/slices/wishlistSlice';
import { Product } from '@/lib/pocketbase';
import Image from 'next/image';
import Link from 'next/link';
import { Button } from '@/components/ui/button';

const WishlistPageClient = () => {
  const dispatch = useDispatch();
  const wishlistItems = useSelector((state: RootState) => state.wishlist.items);

  const handleRemoveFromWishlist = (productId: string) => {
    dispatch(removeFromWishlist(productId));
  };

  return (
    <main className="scanlines relative max-w-4xl mx-auto py-12 px-6 mt-5 rounded-2xl bg-gradient-to-b from-black/50 via-gray-700/40 to-black/5 backdrop-blur-sm bg-clip-padding border roundness-2xl my-4 border-rose-900/10 shadow-lg ring-1 ring-rose-900/5">
      <div
        className="absolute inset-0 opacity-10 pointer-events-none mix-blend-overlay bg-cover bg-center"
        style={{ backgroundImage: "url('/img/re4-background.jpg')" }}
        aria-hidden="true"
      />
      <h1 className="text-4xl font-extrabold uppercase tracking-tight text-rose-100 drop-shadow-[0_12px_30px_rgba(0,0,0,0.8)] mb-8">
        My Wishlist
      </h1>
      {wishlistItems.length === 0 ? (
        <p className="text-zinc-200/90">Your wishlist is empty.</p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {wishlistItems.map((product: Product) => {
            const imageUrl = (product.images && product.images[0])
              ? (typeof product.images[0] === 'string' && product.images[0].startsWith('http'))
                ? product.images[0]
                : `${process.env.NEXT_PUBLIC_POCKETBASE_URL ?? 'http://127.0.0.1:8090'}/api/files/${product.collectionId}/${product.id}/${encodeURIComponent(String(product.images[0]))}`
              : '/img/logo.png';

            return (
              <div key={product.id} className="bg-black/40 backdrop-blur-sm border border-rose-800/10 rounded-2xl p-5 text-sm text-zinc-200 relative overflow-hidden transition-transform hover:scale-105">
                <Link href={`/product/${product.slug}`}>
                    <Image
                      src={imageUrl}
                      alt={product.name ?? 'Product image'}
                      width={300}
                      height={300}
                      className="rounded-lg object-cover w-full h-48"
                    />
                    <h2 className="text-lg font-orbitron font-semibold text-rose-100 mt-4">{product.name}</h2>
                </Link>
                {product.price !== undefined && (
                  <div className="text-xl text-red-500 mt-2 font-black">
                    {new Intl.NumberFormat('vi-VN', {
                      style: 'currency',
                      currency: 'VND',
                      maximumFractionDigits: 0,
                    }).format(product.price ?? 0)}
                  </div>
                )}
                <Button
                  onClick={() => handleRemoveFromWishlist(product.id)}
                  className="mt-4 w-full inline-flex items-center gap-2 rounded-lg px-4 py-2 bg-transparent text-rose-200 border border-rose-400/10 hover:bg-rose-400/5 transition"
                >
                  Remove
                </Button>
              </div>
            );
          })}
        </div>
      )}
    </main>
  );
};

export default WishlistPageClient;
