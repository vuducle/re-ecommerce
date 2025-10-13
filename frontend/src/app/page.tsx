import Header from '../components/Header';
import Hero from '../components/Hero';

export default async function Home() {
  return (
    <div className="min-h-screen bg-background font-sans text-foreground">
      <Header />

      <main>
        <Hero />
        {/* future: featured products, collections, testimonials */}
      </main>

      <footer className="mx-auto mt-20 w-full max-w-7xl px-6 py-10 text-sm text-muted-foreground">
        <div className="flex flex-col items-center justify-between gap-4 sm:flex-row">
          <div>
            © {new Date().getFullYear()} RE — Remake. All rights
            reserved.
          </div>
          <div className="flex gap-4">
            <a className="hover:underline" href="#">
              Terms
            </a>
            <a className="hover:underline" href="#">
              Privacy
            </a>
          </div>
        </div>
      </footer>
    </div>
  );
}
