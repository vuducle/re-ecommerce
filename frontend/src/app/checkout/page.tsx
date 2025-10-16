'use client';

import { useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { RootState } from '@/store';
import { clearCart } from '@/store/slices/cartSlice';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useNotification } from '@/context/NotificationContext';
import { useRouter } from 'next/navigation';
import pb from '@/lib/pocketbase';

import Link from 'next/link';

export default function CheckoutPage() {
  const dispatch = useDispatch();
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

  const [shippingAddress, setShippingAddress] = useState({
    fullName: '',
    street: '',
    city: '',
    country: '',
    zip: '',
  });
  const [loading, setLoading] = useState(false);

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const { name, value } = e.target;
    setShippingAddress((prev) => ({ ...prev, [name]: value }));
  };

  const items = Object.values(cartItems).map((item) => ({
    id: item.product.id,
    name: item.product.name,
    quantity: item.quantity,
    price: item.product.price,
  }));

  const totalAmount = items.reduce((total, item) => {
    return total + (item.price ?? 0) * item.quantity;
  }, 0);

  const handlePlaceOrder = async (e: React.FormEvent) => {
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

    const orderData = {
      user: user.id,
      items: items,
      shippingAddress: shippingAddress,
      total: totalAmount,
      status: 'pending',
    };

    try {
      // Use pb.post to call PocketBase directly
      await pb.post('/api/collections/orders/records', orderData, {
        headers: {
          Authorization: `Bearer ${token}`, // The user's token
        },
      });

      showNotification(
        'Order placed successfully! Thank you, stranger.',
        'success'
      );
      dispatch(clearCart());
      router.push('/checkout/success');
    } catch (err) {
      const message =
        err instanceof Error
          ? err.message
          : 'Something went wrong... Could not place order.';
      // Try to get a more specific message from PocketBase/axios error
      const axiosError = err as any;
      const pbErrorData = axiosError?.response?.data?.data;
      let detailedMessage = message;

      if (pbErrorData) {
        const fieldErrors = Object.keys(pbErrorData)
          .map((key) => `${key}: ${pbErrorData[key].message}`)
          .join('\n');
        detailedMessage = fieldErrors || message;
      }

      showNotification(detailedMessage, 'error');
      console.error(err);
    }
  };

  if (Object.keys(cartItems).length === 0) {
    return (
      <div className="max-w-5xl mx-auto p-8 text-center">
        <h1 className="text-3xl font-bold text-white mb-4">
          Your Attache Case is Empty
        </h1>
        <p className="text-gray-300 mb-8">
          {'"'}Nothin&apos; to checkout, stranger. Go buy
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
      <form
        onSubmit={handlePlaceOrder}
        className="grid md:grid-cols-2 gap-12"
      >
        <div>
          <h2 className="text-2xl font-bold text-white mb-4">
            Shipping Address
          </h2>
          <div className="space-y-4">
            <div>
              <Label htmlFor="fullName" className="text-gray-300">
                Full Name
              </Label>
              <Input
                id="fullName"
                name="fullName"
                required
                onChange={handleInputChange}
                className="bg-[#0b0b0b] border-gray-800"
              />
            </div>
            <div>
              <Label htmlFor="street" className="text-gray-300">
                Street Address
              </Label>
              <Input
                id="street"
                name="street"
                required
                onChange={handleInputChange}
                className="bg-[#0b0b0b] border-gray-800"
              />
            </div>
            <div className="flex gap-4">
              <div className="flex-1">
                <Label htmlFor="city" className="text-gray-300">
                  City
                </Label>
                <Input
                  id="city"
                  name="city"
                  required
                  onChange={handleInputChange}
                  className="bg-[#0b0b0b] border-gray-800"
                />
              </div>
              <div className="w-1/3">
                <Label htmlFor="zip" className="text-gray-300">
                  ZIP Code
                </Label>
                <Input
                  id="zip"
                  name="zip"
                  required
                  onChange={handleInputChange}
                  className="bg-[#0b0b0b] border-gray-800"
                />
              </div>
            </div>
            <div>
              <Label htmlFor="country" className="text-gray-300">
                Country
              </Label>
              <Input
                id="country"
                name="country"
                required
                onChange={handleInputChange}
                className="bg-[#0b0b0b] border-gray-800"
              />
            </div>
          </div>
        </div>
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
                  }).format(
                    (item.product.price ?? 0) * item.quantity
                  )}
                </span>
              </div>
            ))}
          </div>
          <div className="border-t border-gray-700 pt-4 flex justify-between items-center">
            <span className="text-xl font-bold text-white">
              Total
            </span>
            <span className="text-xl font-bold text-yellow-400">
              {new Intl.NumberFormat('vi-VN', {
                style: 'currency',
                currency: 'VND',
              }).format(totalAmount)}
            </span>
          </div>
          <Button
            type="submit"
            disabled={loading}
            size="lg"
            className="w-full mt-6 px-8 py-4 rounded-lg text-lg font-semibold uppercase tracking-wider text-white bg-gradient-to-b from-green-700 to-green-900 border border-green-900/80 shadow-[0_6px_0_rgba(0,0,0,0.6)] hover:from-green-600 hover:to-green-800 active:translate-y-0.5"
          >
            {loading ? 'Placing Order...' : 'Place Order, Stranger'}
          </Button>
        </div>
      </form>
    </div>
  );
}
