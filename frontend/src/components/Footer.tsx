import Link from 'next/link';

export default function Footer() {
  return (
    <footer className="mx-auto mt-20 w-full max-w-7xl px-6 py-10 text-sm text-muted-foreground">
      <div className="flex flex-col items-center justify-between gap-4 sm:flex-row">
        <div>
          © {new Date().getFullYear()} RE — Remake. All rights reserved. A fan-project.
        </div>
        <div className="flex gap-4">
          <Link className="hover:underline" href="/terms">
            Terms
          </Link>
          <Link className="hover:underline" href="/privacy">
            Privacy
          </Link>
        </div>
      </div>
    </footer>
  );
}