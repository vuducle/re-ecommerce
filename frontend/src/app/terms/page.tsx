import type { Metadata } from 'next';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import Image from 'next/image';

export const metadata: Metadata = {
  title: 'Terms of Service',
};

export default function TermsPage() {
  return (
    <div className="max-w-4xl mx-auto p-8 bg-[#0a0a0a] border border-[#2a0808] shadow-[0_0_40px_rgba(200,16,30,0.15)] rounded-lg mt-10 mb-10">
      <div className="flex flex-col md:flex-row items-center gap-8 mb-12">
        <div className="w-full">
          <h1 className="text-4xl font-extrabold tracking-wider text-white drop-shadow-[0_0_5px_rgba(200,16,30,0.5)] mb-4">
            Terms of Service, Stranger
          </h1>
          <p className="text-lg text-gray-300 leading-relaxed">
            "A good merchant is an honest merchant. Read the fine print, heh heh. It pays to be careful in these times."
          </p>
        </div>
        <div className="w-full md:w-1/3 flex justify-center">
          <Image
            src="/img/merchant.png"
            alt="The Merchant"
            width={150}
            height={150}
            className="rounded-full border-4 border-yellow-400"
          />
        </div>
      </div>

      <div className="space-y-8 text-gray-300">
        <Card className="bg-[#0b0b0b] border border-[#2a0808]">
          <CardHeader>
            <CardTitle className="text-2xl font-bold text-white">1. Welcome, Stranger!</CardTitle>
          </CardHeader>
          <CardContent>
            <p>These are the rules of my humble shop. By buyin', sellin', or just browsin', you agree to these terms. If you don't like 'em, well, the road's a dangerous place. Your choice, stranger. Heh heh.</p>
          </CardContent>
        </Card>

        <Card className="bg-[#0b0b0b] border border-[#2a0808]">
          <CardHeader>
            <CardTitle className="text-2xl font-bold text-white">2. What're Ya Sellin'?</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p>If you've got treasures, I've got cash. Spinels, gems, strange-lookin' statues... I'll take 'em. But they gotta be the real deal. No fakes. I've got a good eye for this stuff.</p>
            <p>As for what I'm sellin'... everything you see is top-notch. Might be a little used, might have a scratch or two, but it'll get the job done when a Ganado's breathin' down your neck. Guaranteed.</p>
          </CardContent>
        </Card>

        <Card className="bg-[#0b0b0b] border border-[#2a0808]">
          <CardHeader>
            <CardTitle className="text-2xl font-bold text-white">3. No Funny Business</CardTitle>
          </CardHeader>
          <CardContent>
            <p>Don't try pullin' a fast one on me, stranger. No counterfeit cash, no rigged goods, and certainly no pointin' that peashooter of yours in my direction. We're all professionals here. Let's keep it that way.</p>
          </CardContent>
        </Card>

        <Card className="bg-[#0b0b0b] border border-[#2a0808]">
          <CardHeader>
            <CardTitle className="text-2xl font-bold text-white">4. All Sales Are Final</CardTitle>
          </CardHeader>
          <CardContent>
            <p>Once you buy it, it's yours. No refunds, no exchanges. Make sure you want that rocket launcher *before* you hand over the pesetas. A moment of hesitation can be costly out there... and in here. Heh heh heh.</p>
          </CardContent>
        </Card>

        <Card className="bg-[#0b0b0b] border border-[#2a0808]">
          <CardHeader>
            <CardTitle className="text-2xl font-bold text-white">5. Limitation of Liability</CardTitle>
          </CardHeader>
          <CardContent>
            <p>My gear's good, but I'm not responsible for what you do with it. If you blow yourself up, get eaten by a giant fish, or get chased by a fella with a chainsaw... that's on you, stranger. I'm just a humble merchant, makin' a livin'.</p>
          </CardContent>
        </Card>
        
        <Card className="bg-[#0b0b0b] border border-[#2a0808]">
          <CardHeader>
            <CardTitle className="text-2xl font-bold text-white">6. Changes to Terms</CardTitle>
          </CardHeader>
          <CardContent>
            <p>The market's always changin', and so are the rules. I might update these terms now and then. I'll let you know. Or maybe I won't. It pays to stay sharp, stranger. Heh heh.</p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}