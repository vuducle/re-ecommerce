import Header from '../components/Header';
import Hero from '../components/Hero';
import FeaturedProducts from '../components/FeaturedProducts';
import CategoryShowcase from '../components/CategoryShowcase';
import InfoSection from '../components/InfoSection';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'RE-Commerce - Welcome to RE-Commerce',
};

export default async function Home() {
  return (
    <div className="min-h-screen bg-background font-sans text-foreground">
      <Header />

      <main>
        <Hero />
        <FeaturedProducts />
        <CategoryShowcase />
        <InfoSection />
      </main>



    </div>
  );
}
