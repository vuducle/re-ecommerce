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
    <section className="w-full">
      <div className="mx-auto max-w-7xl px-6 py-20 lg:py-32">
        <div className="grid gap-12 lg:grid-cols-2 items-center">
          <div className="space-y-6">
            <div className="decorative-title-container animate-fade-in-up">
              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold leading-tight re-hero-title">
                Resident E-Commerce
              </h1>
            </div>

            <p className="max-w-xl text-lg text-muted-foreground animate-fade-in-up" style={{ animationDelay: '0.2s' }}>
              Welcome, stranger. The streets are... unfriendly
              tonight. Leon's running low on bullets, bandages, and
              the sort of oddities that keep you breathing between
              encounters. Stock up on ammo, remedies, and a few
              "special" trinkets — prices fair, discretion guaranteed.
            </p>

            <div className="flex gap-3 items-center flex-wrap">
              <Button
                size="lg"
                className="px-4 py-3 rounded-lg text-base font-semibold uppercase tracking-wider text-white bg-gradient-to-b from-[#6f0f0f] to-[#2b0404] border border-[#3a0000] shadow-[0_6px_0_rgba(0,0,0,0.6)] hover:from-[#8b1515] hover:to-[#3b0505] active:translate-y-0.5"
              >
                Load up
              </Button>

              <Link href="/category/survival">
                <Button
                  variant="destructive"
                  size="lg"
                  className="px-4 py-3 rounded-lg text-base font-semibold uppercase tracking-wider"
                >
                  Survival
                </Button>
              </Link>
            </div>

            <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-3">
              <Card className="col-span-2 sm:col-span-1 bg-card border-destructive/50">
                <CardContent>
                  <CardTitle>Ammo & Mags</CardTitle>
                  <CardDescription>
                    Pistols, shotguns, and specialty rounds. Keep Leon
                    firing until the horror takes a break.
                  </CardDescription>
                </CardContent>
              </Card>

              <Card className="col-span-2 sm:col-span-2 bg-card border-destructive/50">
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
                src="/img/leon-gif.gif"
                alt="Merchant's showcase"
                fill
                className="object-cover object-right"
                sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                priority
                unoptimized
              />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
