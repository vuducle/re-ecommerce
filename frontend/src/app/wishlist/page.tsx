import React from 'react';
import WishlistPageClient from '@/components/WishlistPage.client';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'My Wishlist',
};

export default function WishlistPage() {
  return <WishlistPageClient />;
}
