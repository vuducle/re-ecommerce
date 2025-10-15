import Image from 'next/image';
import { Button } from './ui/button';
import {
  Card,
  CardContent,
  CardTitle,
  CardDescription,
  CardFooter,
} from './ui/card';
import Link from 'next/link';

export default function Hero() {
  return (
    <section className="w-full bg-gradient-to-b from-background/60 via-transparent to-transparent">
      <div className="mx-auto max-w-7xl px-6 py-20 lg:py-32">
        <div className="grid gap-12 lg:grid-cols-2 items-center">
          <div className="space-y-6">
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold leading-tight re-hero-title">
              Resident E-Commerce
            </h1>

            <p className="max-w-xl text-lg text-muted-foreground">
              Welcome, stranger. The streets are... unfriendly
              tonight. Leon's running low on bullets, bandages, and
              the sort of oddities that keep you breathing between
              encounters. Stock up on ammo, remedies, and a few
              "special" trinkets — prices fair, discretion guaranteed.
            </p>

            <div className="flex gap-3 items-center flex-wrap">
              <Button size="lg">Load up</Button>

              <Link href="/category/survival">
                <Button variant="destructive">Survival</Button>
              </Link>
            </div>

            <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-3">
              <Card className="col-span-2 sm:col-span-1">
                <CardContent>
                  <CardTitle>Ammo & Mags</CardTitle>
                  <CardDescription>
                    Pistols, shotguns, and specialty rounds. Keep Leon
                    firing until the horror takes a break.
                  </CardDescription>
                </CardContent>
              </Card>

              <Card className="col-span-2 sm:col-span-2">
                <CardContent>
                  <CardTitle>Herbs & Remedies</CardTitle>
                  <CardDescription>
                    Green, red, mixed — heal fast, improvise smarter.
                    Bandages, tonics, and homemade fixes for messy
                    situations.
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
                alt="Merchant's showcase"
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
