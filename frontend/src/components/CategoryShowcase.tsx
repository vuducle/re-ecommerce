import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Gem, Shield, Crosshair, HeartPulse, KeyRound, Briefcase } from 'lucide-react';

const categories = [
  {
    icon: <Crosshair className="size-8 text-red-400" />,
    title: "Guns, big guns!",
    description: "A fine selection of boomsticks. For when you need to make a point, loudly. Heh heh.",
    href: "/category/weapons"
  },
  {
    icon: <HeartPulse className="size-8 text-green-400" />,
    title: "Herbs & Sprays",
    description: "A little green, a little red... mix 'em up and you'll be right as rain. Or use a spray if you're in a hurry.",
    href: "/category/healing"
  },
  {
    icon: <Briefcase className="size-8 text-yellow-400" />,
    title: "Upgrades & Attachments",
    description: "Make your toys even better. More power, faster reloads... you name it, I can do it. For a price.",
    href: "/category/upgrades"
  },
  {
    icon: <KeyRound className="size-8 text-blue-400" />,
    title: "Key Items & Oddities",
    description: "Got a strange-lookin' key? A puzzle you can't solve? I might just have what you need, stranger.",
    href: "/category/key-items"
  },
  {
    icon: <Shield className="size-8 text-gray-400" />,
    title: "Body Armor",
    description: "It won't make you invincible, but it'll save your skin more times than you can count. A wise investment.",
    href: "/category/armor"
  },
  {
    icon: <Gem className="size-8 text-purple-400" />,
    title: "Treasures",
    description: "Got somethin' shiny? I'll take it off your hands for a good price. I'm a man of refined tastes, you see.",
    href: "/category/treasures"
  }
];

export default function CategoryShowcase() {
  return (
    <section className="w-full py-12 bg-black/20">
      <div className="mx-auto max-w-7xl px-6">
        <div className="text-center mb-12">
          <h2 className="text-4xl font-extrabold text-white font-serif tracking-wider">What're Ya Buyin'?</h2>
          <p className="mt-4 text-lg text-gray-400 max-w-2xl mx-auto">
            Got a bit of everything. Take a look, stranger. No harm in just lookin'. Heh heh.
          </p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {categories.map((category) => (
            <div key={category.title} className="group block">
              <Card className="bg-[#0b0b0b] border border-[#2a0808] rounded-lg p-6 h-full transition-all duration-300 hover:border-red-500 hover:shadow-lg hover:shadow-red-900/50 hover:-translate-y-1">
                <CardHeader className="flex flex-row items-center gap-4 p-0">
                  <div className="bg-red-900/20 p-3 rounded-lg">
                    {category.icon}
                  </div>
                  <CardTitle className="text-xl font-bold text-white">{category.title}</CardTitle>
                </CardHeader>
                <CardContent className="p-0 mt-4">
                  <p className="text-gray-400">{category.description}</p>
                </CardContent>
              </Card>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}