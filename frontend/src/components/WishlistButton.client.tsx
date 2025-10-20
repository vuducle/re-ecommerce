'use client';

import React from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Product } from '@/lib/pocketbase';
import { addToWishlist, removeFromWishlist } from '@/store/slices/wishlistSlice';
import { RootState } from '@/store';
import { Button } from '@/components/ui/button';

interface WishlistButtonProps {
  product: Product;
  className?: string;
}

const WishlistButton: React.FC<WishlistButtonProps> = ({ product, className }) => {
  const dispatch = useDispatch();
  const wishlistItems = useSelector((state: RootState) => state.wishlist.items);

  const isInWishlist = wishlistItems.some((item) => item.id === product.id);

  const handleWishlistToggle = () => {
    if (isInWishlist) {
      dispatch(removeFromWishlist(product.id));
    } else {
      dispatch(addToWishlist(product));
    }
  };

  return (
    <Button
      onClick={handleWishlistToggle}
      className={className || 'inline-flex items-center gap-2 rounded-lg px-4 py-2 bg-transparent text-rose-200 border border-rose-400/10 hover:bg-rose-400/5 transition'}
    >
      {isInWishlist ? 'Remove from Wishlist' : 'Add to Wishlist'}
    </Button>
  );
};

export default WishlistButton;
