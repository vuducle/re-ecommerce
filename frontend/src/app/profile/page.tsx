'use client';

import { useSelector } from 'react-redux';
import type { RootState } from '@/store';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import {
  AppUser,
  getMyOrders,
  Order,
  buildFileUrl,
  Product,
} from '@/lib/pocketbase';
import EditProfileForm from '@/components/EditProfileForm.client';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from '@/components/ui/avatar';

// Assuming the shape of the JSON data
interface OrderItem {
  id: string;
  name: string;
  quantity: number;
  price: number;
  currency?: string;
}

interface ShippingAddress {
  line1: string;
  line2?: string;
  city: string;
  state?: string;
  postal_code: string;
  country: string;
}

export default function ProfilePage() {
  const auth = useSelector((s: RootState) => s.auth);
  const router = useRouter();
  const [user, setUser] = useState<AppUser | null>(null);
  const [orders, setOrders] = useState<Order[]>([]);
  const [loadingOrders, setLoadingOrders] = useState(true);

  useEffect(() => {
    if (!auth.authenticated) {
      router.push('/login');
    } else {
      setUser(auth.user);
      if (auth.token) {
        getMyOrders(auth.token)
          .then((res) => setOrders(res.items))
          .catch((err) => console.error(err))
          .finally(() => setLoadingOrders(false));
      }
    }
  }, [auth, router]);

  useEffect(() => {
    setUser(auth.user);
  }, [auth.user]);

  if (!user) {
    return (
      <div className="flex justify-center items-center h-screen bg-black">
        <div className="text-white text-2xl">Loading...</div>
      </div>
    );
  }

  const profileImageUrl = buildFileUrl(
    user.profileImage,
    'users',
    user.id
  );

  const parseOrderItems = (items: any): OrderItem[] => {
    if (Array.isArray(items)) {
      return items;
    }
    try {
      const parsed = JSON.parse(items);
      return Array.isArray(parsed) ? parsed : [];
    } catch (e) {
      return [];
    }
  };

  const parseShippingAddress = (
    address: any
  ): ShippingAddress | null => {
    if (typeof address === 'object' && address !== null) {
      return address;
    }
    try {
      const parsed = JSON.parse(address);
      return typeof parsed === 'object' && parsed !== null
        ? parsed
        : null;
    } catch (e) {
      return null;
    }
  };

  return (
    <div
      className="min-h-screen bg-cover bg-center"
      style={{ backgroundImage: "url('/img/re4-background.jpg')" }}
    >
      <div className="max-w-6xl mx-auto py-12 px-6 bg-black bg-opacity-75 rounded-lg">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="md:col-span-1">
            <Card className="bg-gray-900 border-red-700 text-white">
              <CardHeader>
                <div className="flex items-center space-x-4">
                  <Avatar className="w-24 h-24 border-2 border-red-700">
                    <AvatarImage
                      src={profileImageUrl}
                      className="object-cover"
                      alt={user.name}
                    />
                    <AvatarFallback>{user.name?.[0]}</AvatarFallback>
                  </Avatar>
                  <div>
                    <CardTitle className="text-2xl font-bold text-red-500">
                      {user.name}
                    </CardTitle>
                    <p className="text-gray-400">{user.email}</p>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <EditProfileForm user={user} />
              </CardContent>
            </Card>
          </div>
          <div className="md:col-span-2">
            <Card className="bg-gray-900 border-red-700 text-white">
              <CardHeader>
                <CardTitle className="text-2xl font-bold text-red-500">
                  My Orders
                </CardTitle>
              </CardHeader>
              <CardContent>
                {loadingOrders ? (
                  <p>Loading orders...</p>
                ) : orders.length > 0 ? (
                  <ul className="space-y-6">
                    {orders.map((order) => {
                      const items = parseOrderItems(order.items);
                      const shippingAddress = parseShippingAddress(
                        order.shippingAddress
                      );
                      return (
                        <li
                          key={order.id}
                          className="border border-gray-700 rounded-lg p-4"
                        >
                          <div className="flex justify-between mb-4">
                            <div>
                              <p className="font-bold text-lg">
                                Order ID: {order.id}
                              </p>
                              <p className="text-gray-400">
                                Status: {order.status}
                              </p>
                            </div>
                            <div className="text-right">
                              <p className="font-bold text-lg">
                                Total:{' '}
                                {new Intl.NumberFormat('vi-VN', {
                                  style: 'currency',
                                  currency: 'VND',
                                }).format(order.totalAmount)}
                              </p>
                              <p className="text-gray-400">
                                Date:{' '}
                                {new Date(
                                  order.orderDate
                                ).toLocaleDateString('vi-VN')}
                              </p>
                            </div>
                          </div>

                          <div>
                            <h4 className="font-bold text-red-500 mb-2">
                              Items
                            </h4>
                            <ul className="space-y-4">
                              {items.map((item) => (
                                <li
                                  key={item.id}
                                  className="flex items-center space-x-4"
                                >
                                  <div>
                                    <p className="font-bold">
                                      {item.name}
                                    </p>
                                    <p className="text-gray-400">
                                      Quantity: {item.quantity}
                                    </p>
                                    <p className="text-gray-400">
                                      Price:{' '}
                                      {new Intl.NumberFormat(
                                        'vi-VN',
                                        {
                                          style: 'currency',
                                          currency: 'VND',
                                        }
                                      ).format(item.price)}
                                    </p>
                                  </div>
                                </li>
                              ))}
                            </ul>
                          </div>

                          {shippingAddress && (
                            <div className="mt-4">
                              <h4 className="font-bold text-red-500 mb-2">
                                Shipping Address
                              </h4>
                              <p>{shippingAddress.line1}</p>
                              {shippingAddress.line2 && (
                                <p>{shippingAddress.line2}</p>
                              )}
                              <p>
                                {shippingAddress.city}
                                {shippingAddress.state &&
                                  `, ${shippingAddress.state}`}{' '}
                                {shippingAddress.postal_code}
                              </p>
                              <p>{shippingAddress.country}</p>
                            </div>
                          )}
                        </li>
                      );
                    })}
                  </ul>
                ) : (
                  <p>You have no orders.</p>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
