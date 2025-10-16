import Image from 'next/image';
import { Button } from './ui/button';
import Link from 'next/link';

export default function InfoSection() {
  return (
    <section className="w-full py-20">
      <div className="mx-auto max-w-7xl px-6">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          <div className="relative aspect-video lg:aspect-square rounded-xl overflow-hidden shadow-2xl shadow-red-900/20 border-2 border-red-900/30">
            <Image
              src="/img/cat.jpg"
              alt="The Merchant's wisdom"
              fill
              className="object-cover object-right"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent" />
          </div>
          <div className="space-y-6">
            <h2 className="text-4xl font-extrabold text-white font-serif tracking-wider">
              A Stranger's Guide to Survival
            </h2>
            <div className="space-y-4 text-gray-300 text-lg">
              <p>
                "The world's gone mad, stranger. But that's no reason
                to lose your head... permanently. A smart buyer knows
                when to invest. A little extra firepower, a sturdier
                vest... these things make the difference between
                walking away and gettin' carried away."
              </p>
              <p>
                "Don't be shy now. Everything's for sale. And if you
                find any treasures... well, I'm your man. We can do
                business anywhere. Heh heh heh."
              </p>
            </div>
            <div className="flex gap-4">
              <Link href="/inventory">
                <Button
                  size="lg"
                  className="px-6 py-3 rounded-lg text-base font-semibold uppercase tracking-wider text-white bg-gradient-to-b from-blue-700 to-blue-900 border border-blue-900/80 shadow-[0_6px_0_rgba(0,0,0,0.6)] hover:from-blue-600 hover:to-blue-800 active:translate-y-0.5"
                >
                  Tune-up Your Gear
                </Button>
              </Link>
              <Link href="/about">
                <Button
                  size="lg"
                  variant="outline"
                  className="px-6 py-3 rounded-lg text-base font-semibold uppercase tracking-wider"
                >
                  Learn More
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
