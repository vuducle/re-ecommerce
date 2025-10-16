import type { Metadata } from 'next';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import Image from 'next/image';

export const metadata: Metadata = {
  title: 'Privacy Policy',
};

export default function PrivacyPage() {
  return (
    <div className="max-w-4xl mx-auto p-8 bg-[#0a0a0a] border border-[#2a0808] shadow-[0_0_40px_rgba(200,16,30,0.15)] rounded-lg mt-10 mb-10">
      <div className="flex flex-col md:flex-row items-center gap-8 mb-12">
        <div className="w-full">
          <h1 className="text-4xl font-extrabold tracking-wider text-white drop-shadow-[0_0_5px_rgba(200,16,30,0.5)] mb-4">
            Privacy Policy, Stranger
          </h1>
          <p className="text-lg text-gray-300 leading-relaxed">
            "A smart stranger values their privacy. So do I. Here's what you need to know about my... data collection practices. Heh heh."
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
            <CardTitle className="text-2xl font-bold text-white">A Humble Fan Project</CardTitle>
          </CardHeader>
          <CardContent>
            <p>First things first, stranger. This whole establishment? It's a fan-made project, a tribute to the fine folks at Capcom and the world of Resident Evil. It's not for real profit, just a bit of fun. None of the items are real, and no real currency is exchanged. It's all for the love of the game. Don't go tellin' the big corporations on me, eh? Heh heh.</p>
          </CardContent>
        </Card>

        <Card className="bg-[#0b0b0b] border border-[#2a0808]">
          <CardHeader>
            <CardTitle className="text-2xl font-bold text-white">1. What Information I "Collect"</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p>I only need to know what's necessary for business. Your name, your email... maybe your last known location, in case you drop something valuable. I'm not interested in your life story, stranger. Just what you're carryin' in that attache case of yours.</p>
            <p>Any data you provide is just for the purpose of this "shop" - creating an account, "buying" and "selling" goods. Nothing more.</p>
          </CardContent>
        </Card>

        <Card className="bg-[#0b0b0b] border border-[#2a0808]">
          <CardHeader>
            <CardTitle className="text-2xl font-bold text-white">2. How I Use Your Information</CardTitle>
          </CardHeader>
          <CardContent>
            <p>To keep track of your inventory, of course! And to make sure the right stranger gets the right gear. It's all about providing a personalized service. Can't have you running around with the wrong caliber of ammo, can we? That'd be bad for business. And for your health.</p>
          </CardContent>
        </Card>

        <Card className="bg-[#0b0b0b] border border-[#2a0808]">
          <CardHeader>
            <CardTitle className="text-2xl font-bold text-white">3. A Merchant Never Tells</CardTitle>
          </CardHeader>
          <CardContent>
            <p>Your secrets are safe with me, stranger. I don't share my client list with anyone. Not the coppers, not the Umbrella Corporation, not even that fella in the fancy suit. A merchant's discretion is his bond.</p>
          </CardContent>
        </Card>

        <Card className="bg-[#0b0b0b] border border-[#2a0808]">
          <CardHeader>
            <CardTitle className="text-2xl font-bold text-white">4. Security</CardTitle>
          </CardHeader>
          <CardContent>
            <p>I keep your information as safe as I keep my own treasures. Locked up tight. This website uses modern security practices, but remember, stranger, no place is entirely safe in this world. Keep your wits about you.</p>
          </CardContent>
        </Card>
        
        <Card className="bg-[#0b0b0b] border border-[#2a0808]">
          <CardHeader>
            <CardTitle className="text-2xl font-bold text-white">5. Got Questions?</CardTitle>
          </CardHeader>
          <CardContent>
            <p>If you've got concerns, find me. I'm always around. You know where to look. Now... what're ya buyin'?</p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}