'use client';

import { useEffect } from 'react';
import { useDispatch } from 'react-redux';
import { clearCart } from '@/store/slices/cartSlice';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import Image from 'next/image';

export default function OrderSuccessPage() {
  const dispatch = useDispatch();

  useEffect(() => {
    // Clear the cart after successful order
    dispatch(clearCart());
  }, [dispatch]);

  return (
    <div className="max-w-2xl mx-auto text-center py-20">
      <Image
        src="/img/merchant.png"
        alt="Thank you"
        width={200}
        height={200}
        className="mx-auto rounded-full border-4 border-yellow-400 mb-8"
      />
      <h1 className="text-4xl font-extrabold text-white mb-4">
        "Heh heh heh... Thank you!"
      </h1>
      <p className="text-lg text-gray-300 mb-8">
        Your order has been placed. I'll have it ready for you at the
        next save point, stranger.
      </p>
      <div className="flex gap-4 justify-center">
        <Link href="/" passHref>
          <Button variant="destructive">Back to Shop</Button>
        </Link>
        <Link href="/profile" passHref>
          <Button variant="outline">View Orders</Button>
        </Link>
      </div>
    </div>
  );
}
