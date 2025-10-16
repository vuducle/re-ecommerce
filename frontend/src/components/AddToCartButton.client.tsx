'use client';

import { useDispatch } from 'react-redux';
import { addItem } from '@/store/slices/cartSlice';
import { Button } from './ui/button';
import { Product } from '@/lib/pocketbase';
import { useNotification } from '@/context/NotificationContext';

type Props = {
  product: Product;
  className?: string;
  children?: React.ReactNode;
};

export default function AddToCartButton({ product, className, children }: Props) {
  const dispatch = useDispatch();
  const { showNotification } = useNotification();

  const handleAddToCart = () => {
    dispatch(addItem(product));
    showNotification(`Added ${product.name} to cart!`, 'success');
  };

  const isEnabled = (process.env.NEXT_PUBLIC_ENABLE_ADD_TO_CART ?? 'false') === 'true';
  const isAvailable = (product.isAvailable ?? true) && (product.stock ?? 1) > 0;

  return (
    <Button
      onClick={handleAddToCart}
      disabled={!isAvailable || !isEnabled}
      className={className}
    >
      {children ?? 'Add to cart'}
    </Button>
  );
}
