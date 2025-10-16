import type { Metadata } from 'next';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import Image from 'next/image';
import Link from 'next/link';
import { Button } from '@/components/ui/button';

export const metadata: Metadata = {
  title: 'About The Merchant',
};

export default function AboutPage() {
  return (
    <div className="max-w-5xl mx-auto p-8 bg-[#0a0a0a] border border-[#2a0808] shadow-[0_0_40px_rgba(200,16,30,0.15)] rounded-lg mt-10 mb-10">
      <div className="grid md:grid-cols-3 gap-8 items-start">
        <div className="md:col-span-2 space-y-8">
          <div>
            <h1 className="text-4xl font-extrabold tracking-wider text-white drop-shadow-[0_0_5px_rgba(200,16,30,0.5)] mb-4">
              About This Humble Merchant
            </h1>
            <p className="text-lg text-gray-300 leading-relaxed">
              &quot;Welcome, stranger! Surprised to see a shop in a place like this? Heh heh, where there&apos;s conflict, there&apos;s currency. And I&apos;m always open for business.&quot;
            </p>
          </div>

          <Card className="bg-[#0b0b0b] border border-[#2a0808]">
            <CardHeader>
              <CardTitle className="text-2xl font-bold text-white">My Philosophy</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 text-gray-300">
              <p>&quot;I&apos;m a simple man. I see a need, I provide a service. You need to survive, I need to make a livin&apos;. It&apos;s a perfect arrangement, eh? I don&apos;t ask questions, and I don&apos;t judge. Your pesetas are as good as anyone else&apos;s.&quot;</p>
              <p>&quot;Whether you&apos;re a government agent on a secret mission or just a tourist who took a very wrong turn, I&apos;ve got the goods to see you through. From a trusty handgun to a... more explosive solution, my inventory is second to none.&quot;</p>
            </CardContent>
          </Card>

          <Card className="bg-[#0b0b0b] border border-[#2a0808]">
            <CardHeader>
              <CardTitle className="text-2xl font-bold text-white">A Note From The Creator</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 text-gray-300">
              <p>This website is a non-profit, fan-made tribute to the incredible world of Resident Evil 4 and its iconic merchant, created by Capcom. It is an educational project to practice web development skills with Next.js, React, and PocketBase.</p>
              <p>No real items are for sale, and no real money is involved. It&apos;s all just for fun. Thank you for visiting, stranger!</p>
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6">
          <Card className="bg-[#0b0b0b] border border-[#2a0808] p-4">
            <div className="relative aspect-1 rounded-lg overflow-hidden">
              <Image
                src="/img/merchant.png"
                alt="The Merchant"
                fill
                className="object-contain"
              />
            </div>
          </Card>
          <Card className="bg-[#0b0b0b] border border-[#2a0808] p-6 text-center">
            <p className="text-gray-300 mb-4">&quot;Got a selection of good things on sale, stranger.&quot;</p>
            <Link href="/">
                <Button variant="destructive" className="w-full">
                    Browse Wares
                </Button>
            </Link>
          </Card>
        </div>
      </div>
    </div>
  );
}