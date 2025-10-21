'use client';

import { useState } from 'react';
import { useSelector } from 'react-redux';
import { RootState } from '@/store';
import { Button } from '@/components/ui/button';
import { useNotification } from '@/context/NotificationContext';
import { useRouter } from 'next/navigation';
import pb from '@/lib/pocketbase';
import Link from 'next/link';

export default function CheckoutPage() {
  const router = useRouter();
  const { showNotification } = useNotification();
  const {
    items: cartItems,
    authenticated,
    token,
    user,
  } = useSelector((state: RootState) => ({
    items: state.cart.items,
    authenticated: state.auth.authenticated,
    token: state.auth.token,
    user: state.auth.user,
  }));

  const [loading, setLoading] = useState(false);

  const items = Object.values(cartItems).map((item) => ({
    name: item.product.name,
    quantity: item.quantity,
    price: item.product.price,
  }));

  const totalAmount = items.reduce((total, item) => {
    return total + (item.price ?? 0) * item.quantity;
  }, 0);

  const handleStripeCheckout = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!authenticated || !user) {
      showNotification(
        'You must be logged in to place an order, stranger.',
        'error'
      );
      router.push('/login');
      return;
    }
    setLoading(true);

    try {
      console.log('Sending checkout request with items:', items);
      console.log('Token:', token ? 'Present' : 'Missing');

      const res = await pb.post(
        '/create-checkout-session',
        { items },
        {
          headers: {
            Authorization: token,
            'Content-Type': 'application/json',
          },
        }
      );

      console.log('Checkout response:', res.data);

      const { url } = res.data;
      if (url) {
        window.location.href = url; // Use direct navigation for Stripe
      } else {
        showNotification('Could not get checkout URL.', 'error');
      }
    } catch (err: any) {
      console.error('Checkout error:', err);
      console.error('Error response:', err.response?.data);

      const message =
        err.response?.data?.message ||
        err.response?.data?.error ||
        (err instanceof Error
          ? err.message
          : 'Something went wrong... Could not start checkout.');

      showNotification(message, 'error');
    } finally {
      setLoading(false);
    }
  };

  if (Object.keys(cartItems).length === 0) {
    return (
      <div className="max-w-5xl mx-auto p-8 text-center">
        <h1 className="text-3xl font-bold text-white mb-4">
          Your Attache Case is Empty
        </h1>
        <p className="text-gray-300 mb-8">
          {'"'}'Nothin&apos; to checkout, stranger. Go buy
          somethin&apos;!{'"'}
        </p>
        <Link href="/" passHref>
          <Button variant="destructive">Browse Wares</Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-8">
      <h1 className="text-4xl font-extrabold text-white mb-8">
        Checkout
      </h1>
      <div>
        <h2 className="text-2xl font-bold text-white mb-4">
          Order Summary
        </h2>
        <div className="space-y-2 mb-4">
          {Object.values(cartItems).map((item) => (
            <div
              key={item.product.id}
              className="flex justify-between text-gray-300"
            >
              <span>
                {item.product.name} x {item.quantity}
              </span>
              <span>
                {new Intl.NumberFormat('vi-VN', {
                  style: 'currency',
                  currency: 'VND',
                }).format((item.product.price ?? 0) * item.quantity)}
              </span>
            </div>
          ))}
        </div>
        <div className="border-t border-gray-700 pt-4 flex justify-between items-center">
          <span className="text-xl font-bold text-white">Total</span>
          <span className="text-xl font-bold text-yellow-400">
            {new Intl.NumberFormat('vi-VN', {
              style: 'currency',
              currency: 'VND',
            }).format(totalAmount)}
          </span>
        </div>
        <Button
          onClick={handleStripeCheckout}
          disabled={loading}
          size="lg"
          className="w-full mt-6 px-8 py-4 rounded-lg text-lg font-semibold uppercase tracking-wider text-white bg-gradient-to-b from-green-700 to-green-900 border border-green-900/80 shadow-[0_6px_0_rgba(0,0,0,0.6)] hover:from-green-600 hover:to-green-800 active:translate-y-0.5"
        >
          {loading
            ? 'Redirecting to payment...'
            : 'Proceed to Payment'}
        </Button>
      </div>
    </div>
  );
}
