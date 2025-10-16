
'use client';

import { useState, useEffect } from 'react';
import { getFeaturedProducts, Product, buildFileUrl } from '../lib/pocketbase';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from './ui/card';
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from './ui/carousel';
import Image from 'next/image';
import { Button } from './ui/button';
import Link from 'next/link';

export default function FeaturedProducts() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const response = await getFeaturedProducts();
        setProducts(response.items);
      } catch (error) {
        console.error('Failed to fetch featured products', error);
      }
      setLoading(false);
    };

    fetchProducts();
  }, []);

  const formatCurrency = (amount: number | undefined | null) => {
    if (typeof amount !== 'number') {
      return '';
    }
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND',
    }).format(amount);
  };

  if (loading) {
    return <div>Loading...</div>;
  }

  if (products.length === 0) {
    return (
      <div className="w-full max-w-6xl mx-auto py-12 flex flex-col items-center justify-center">
        <Image src="/img/leon-gif.gif" alt="No featured products" width={400} height={300} unoptimized />
        <p className="text-white text-2xl mt-4">No featured products available, stranger.</p>
      </div>
    );
  }

  return (
    <div className="w-full max-w-6xl mx-auto py-12">
      <div className="flex flex-col sm:flex-row items-center justify-center gap-8 mb-8">
        <Image src="/img/merchant.png" alt="Merchant" width={150} height={150} className="rounded-full border-4 border-yellow-400" />
        <div>
          <h2 className="text-3xl font-bold text-center text-white font-serif">Got a selection of good things on sale, stranger.</h2>
          <p className="text-lg text-center text-gray-400 mt-2">Heh heh heh... Thank you!</p>
        </div>
      </div>
      <Carousel
        opts={{
          align: 'start',
          loop: true,
        }}
        className="w-full"
      >
        <CarouselContent className="items-stretch">
          {products.map((p) => (
            <CarouselItem key={p.id} className="md:basis-1/2 lg:basis-1/3">
              <div className="p-1 h-full">
                <Card className="bg-[#0b0b0b] border border-[#2a0808] rounded-lg p-2 sm:p-4 flex flex-col gap-4 h-full transition-all duration-300 hover:scale-105 hover:shadow-lg hover:shadow-red-900/50">
                  <CardHeader className="p-0">
                    <div className="flex-shrink-0">
                      {(() => {
                        const imageUrl = p.images && p.images.length > 0
                          ? buildFileUrl(p.images[0], 'products', p.id)
                          : undefined;

                        if (imageUrl) {
                          return (
                            <div className="rounded-lg overflow-hidden w-full h-48 relative">
                              <Image
                                src={imageUrl}
                                alt={p.name || 'Product Image'}
                                layout="fill"
                                className="object-cover"
                                unoptimized
                              />
                            </div>
                          );
                        }

                        return (
                          <div className="w-full h-48 rounded-lg bg-[#0b0b0b] flex items-center justify-center text-gray-400 font-bold">
                            RE
                          </div>
                        );
                      })()}
                    </div>
                  </CardHeader>
                  <CardContent className="p-4 flex-grow">
                    <div className="flex items-center justify-between gap-2">
                      <CardTitle className="text-lg font-bold text-white truncate">
                        {p.name || '—'}
                      </CardTitle>
                      <div className="text-lg font-bold text-yellow-400 font-mono truncate">
                        {formatCurrency(p.price)}
                      </div>
                    </div>
                    {p.expand?.category && (
                      <div className="text-sm p-1 bg-red-400 text-black mt-1 inline-block">
                        {p.expand.category.name}
                      </div>
                    )}
                    <p className="text-sm text-gray-500 mt-2 flex-grow">
                      {p.description}
                    </p>
                  </CardContent>
                  <CardFooter className="p-4 flex justify-center">
                    <Link href={`/product/${p.slug}`} passHref>
                      <Button
                        aria-label={`View ${p.name}`}
                        className="px-3 py-2 rounded-lg text-sm font-semibold uppercase tracking-wider text-white bg-gradient-to-b from-[#6f0f0f] to-[#2b0404] border border-[#3a0000] shadow-[0_6px_0_rgba(0,0,0,0.6)] hover:from-[#8b1515] hover:to-[#3b0505] active:translate-y-0.5"
                      >
                        View Details
                      </Button>
                    </Link>
                  </CardFooter>
                </Card>
              </div>
            </CarouselItem>
          ))}
        </CarouselContent>
        <CarouselPrevious className="text-white bg-transparent border-red-500" />
        <CarouselNext className="text-white bg-transparent border-red-500" />
      </Carousel>
    </div>
  );
}
