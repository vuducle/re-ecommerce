'use client';

import { useSelector, useDispatch } from 'react-redux';
import { RootState } from '@/store';
import { removeItem, updateQuantity } from '@/store/slices/cartSlice';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { buildFileUrl } from '@/lib/pocketbase';
import Link from 'next/link';
import { Trash2 } from 'lucide-react';

export default function InventoryPage() {
  const dispatch = useDispatch();
  const { items } = useSelector((state: RootState) => state.cart);
  const cartItems = Object.values(items);

  const totalAmount = cartItems.reduce((total, item) => {
    return total + (item.product.price ?? 0) * item.quantity;
  }, 0);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND',
    }).format(amount);
  };

  return (
    <div className="max-w-5xl mx-auto p-4 sm:p-8">
      <h1 className="text-3xl sm:text-4xl font-extrabold tracking-wider text-white drop-shadow-[0_0_5px_rgba(200,16,30,0.5)] mb-8">
        Your Attache Case
      </h1>

      {cartItems.length === 0 ? (
        <div className="text-center py-20 bg-[#0a0a0a] border border-[#2a0808] rounded-lg">
          <Image
            src="/img/leon-gif.gif"
            alt="Empty Case"
            width={200}
            height={200}
            className="mx-auto rounded-lg"
            unoptimized
          />
          <p className="mt-4 text-xl text-gray-300">
            "Case is empty, stranger. What're ya buyin'?"
          </p>
          <Link href="/" passHref>
            <Button variant="destructive" className="mt-6">
              Browse Wares
            </Button>
          </Link>
        </div>
      ) : (
        <div className="space-y-4">
          {cartItems.map(({ product, quantity }) => (
            <div
              key={product.id}
              className="flex flex-col sm:flex-row items-center gap-4 p-4 bg-[#0b0b0b] border border-[#2a0808] rounded-lg"
            >
              <div className="relative w-24 h-24 sm:w-32 sm:h-32 flex-shrink-0 rounded-md overflow-hidden bg-zinc-800">
                {(() => {
                  const imageUrl =
                    product.images && product.images.length > 0
                      ? buildFileUrl(
                          product.images[0],
                          'products',
                          product.id
                        )
                      : undefined;

                  if (imageUrl) {
                    return (
                      <Image
                        src={imageUrl}
                        alt={product.name || 'Product Image'}
                        fill
                        className="object-cover"
                        unoptimized
                      />
                    );
                  }

                  return (
                    <div className="w-full h-full flex items-center justify-center text-gray-400 font-bold">
                      RE
                    </div>
                  );
                })()}
              </div>
              <div className="flex-1 text-center sm:text-left">
                <h2 className="text-xl font-bold text-white">
                  {product.name}
                </h2>
                <p className="text-sm text-gray-400 line-clamp-2">
                  {product.description}
                </p>
                <div className="text-lg font-bold text-yellow-400 mt-1">
                  {formatCurrency(product.price ?? 0)}
                </div>
              </div>
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-2">
                  <label
                    htmlFor={`quantity-${product.id}`}
                    className="text-sm text-gray-300"
                  >
                    Qty:
                  </label>
                  <Input
                    id={`quantity-${product.id}`}
                    type="number"
                    min="1"
                    value={quantity}
                    onChange={(e) =>
                      dispatch(
                        updateQuantity({
                          id: product.id,
                          quantity: parseInt(e.target.value, 10) || 1,
                        })
                      )
                    }
                    className="w-20 bg-[#0b0b0b] border-gray-800"
                  />
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => dispatch(removeItem(product.id))}
                >
                  <Trash2 className="size-5 text-red-500" />
                </Button>
              </div>
            </div>
          ))}

          <div className="mt-8 pt-4 border-t border-[#2a0808] flex flex-col sm:flex-row justify-between items-center gap-4">
            <h2 className="text-2xl font-bold text-white">
              Total:{' '}
              <span className="text-yellow-400">
                {formatCurrency(totalAmount)}
              </span>
            </h2>
            <Link href="/checkout" passHref>
              <Button
                size="lg"
                className="px-8 py-4 rounded-lg text-lg font-semibold uppercase tracking-wider text-white bg-gradient-to-b from-green-700 to-green-900 border border-green-900/80 shadow-[0_6px_0_rgba(0,0,0,0.6)] hover:from-green-600 hover:to-green-800 active:translate-y-0.5"
              >
                Check Out, Stranger
              </Button>
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}
