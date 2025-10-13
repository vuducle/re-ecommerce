import Image from 'next/image';
import { Button } from './ui/button';
import {
  Card,
  CardContent,
  CardTitle,
  CardDescription,
  CardFooter,
} from './ui/card';

export default function Hero() {
  return (
    <section className="w-full bg-gradient-to-b from-background/60 via-transparent to-transparent">
      <div className="mx-auto max-w-7xl px-6 py-20 lg:py-32">
        <div className="grid gap-12 lg:grid-cols-2 items-center">
          <div className="space-y-6">
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold leading-tight re-hero-title">
              RE — E‑commerce Remake
            </h1>

            <p className="max-w-xl text-lg text-muted-foreground">
              A clean, modern storefront inspired by RE. Fast,
              accessible and built with composable UI primitives.
              Beautiful product pages, simple checkout flows and
              handcrafted details.
            </p>

            <div className="flex gap-3 items-center flex-wrap">
              <Button size="lg">Shop now</Button>
              <Button variant="outline" size="lg">
                Browse collections
              </Button>
            </div>

            <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-3">
              <Card className="col-span-2 sm:col-span-1">
                <CardContent>
                  <CardTitle>Free shipping</CardTitle>
                  <CardDescription>
                    On orders over $50 — fast, tracked delivery.
                  </CardDescription>
                </CardContent>
              </Card>

              <Card className="col-span-2 sm:col-span-2">
                <CardContent>
                  <CardTitle>Sustainably sourced</CardTitle>
                  <CardDescription>
                    Products with thoughtful materials and packaging.
                  </CardDescription>
                </CardContent>
                <CardFooter />
              </Card>
            </div>
          </div>

          <div className="relative order-first lg:order-last rounded-xl overflow-hidden shadow-lg">
            <div className="relative aspect-[4/3] w-full bg-gradient-to-tr from-neutral-100 to-neutral-50 dark:from-neutral-800 dark:to-neutral-700">
              <Image
                src="/img/cat.jpg"
                alt="Featured product"
                fill
                className="object-cover object-right"
                sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                priority
              />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
