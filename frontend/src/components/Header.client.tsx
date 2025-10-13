'use client';

import Link from 'next/link';
import Image from 'next/image';
import { useState, useRef, useEffect } from 'react';
import { Menu, X, ShoppingCart } from 'lucide-react';
import { Button } from './ui/button';
import { cn } from '../lib/utils';
import { usePathname } from 'next/navigation';
import type { Category } from '../lib/pocketbase';

type Props = {
  categories: Category[];
};

const DEFAULT_NAV = [
  { label: 'Home', href: '/' },
  { label: 'Shop', href: '/shop' },
  { label: 'Inventory', href: '/inventory' },
  { label: 'About', href: '/about' },
];

export default function HeaderClient({ categories }: Props) {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();
  const panelRef = useRef<HTMLDivElement | null>(null);
  const closeButtonRef = useRef<HTMLButtonElement | null>(null);
  const lastActiveRef = useRef<HTMLElement | null>(null);

  // lock body scroll when mobile menu is open
  useEffect(() => {
    if (open) document.body.style.overflow = 'hidden';
    else document.body.style.overflow = '';
  }, [open]);

  // focus trap & escape
  useEffect(() => {
    if (!open) {
      lastActiveRef.current?.focus?.();
      return;
    }
    lastActiveRef.current = document.activeElement as HTMLElement;
    setTimeout(() => closeButtonRef.current?.focus(), 50);

    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setOpen(false);
      if (e.key === 'Tab') {
        const panel = panelRef.current;
        if (!panel) return;
        const focusable = panel.querySelectorAll<HTMLElement>(
          'a[href], button:not([disabled]), [tabindex]:not([tabindex="-1"])'
        );
        if (focusable.length === 0) return;
        const first = focusable[0];
        const last = focusable[focusable.length - 1];
        if (e.shiftKey && document.activeElement === first) {
          e.preventDefault();
          last.focus();
        } else if (!e.shiftKey && document.activeElement === last) {
          e.preventDefault();
          first.focus();
        }
      }
    };

    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [open]);

  return (
    <header className="bg-[#070707]/95 backdrop-blur-sm border-b border-white/6">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          <div className="flex items-center gap-3">
            <Image
              src="/vercel.svg"
              alt="RE"
              width={40}
              height={40}
            />
            <Link
              href="/"
              className="font-orbitron text-lg tracking-widest text-[#ffdede]"
            >
              RESIDENT E-COMMERCE
            </Link>
          </div>

          <nav className="hidden md:flex items-center gap-6">
            {DEFAULT_NAV.map((item) => {
              const active = pathname === item.href;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    'relative text-sm font-semibold transition-colors',
                    active
                      ? 'text-white'
                      : 'text-gray-300 hover:text-white'
                  )}
                >
                  <span>{item.label}</span>
                </Link>
              );
            })}

            {/* categories inline */}
            <div className="flex items-center gap-3">
              {categories.map((c) => (
                <Link
                  key={c.id}
                  href={`/category/${c.slug}`}
                  className="text-sm text-gray-300 hover:text-white"
                >
                  {c.name}
                </Link>
              ))}
            </div>

            <Button variant="destructive">S.T.A.R.S.</Button>
            <button className="ml-2 p-2 rounded-md text-gray-300 hover:text-white hover:bg-white/3">
              <ShoppingCart size={18} />
            </button>
          </nav>

          <div className="md:hidden">
            <button
              aria-label={open ? 'Close menu' : 'Open menu'}
              onClick={() => setOpen((v) => !v)}
              className="p-2 rounded-md text-gray-200 hover:bg-white/3"
            >
              {open ? <X size={20} /> : <Menu size={20} />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile dialog */}
      <div className={cn('md:hidden')}>
        <div
          role="dialog"
          aria-modal="true"
          aria-hidden={!open}
          className={cn(
            'fixed inset-0 z-50 flex items-center justify-center',
            open ? 'pointer-events-auto' : 'pointer-events-none'
          )}
        >
          <div
            onClick={() => setOpen(false)}
            className={cn(
              'absolute inset-0 bg-black/50 backdrop-blur-sm transition-opacity duration-300',
              open ? 'opacity-100' : 'opacity-0'
            )}
          />

          <div
            ref={panelRef}
            className={cn(
              'relative w-full max-w-sm mx-4 rounded-lg bg-gradient-to-b from-[#0b0b0b] to-[#141414] border border-white/6 overflow-hidden shadow-xl transform transition-all duration-300',
              open
                ? 'scale-100 opacity-100 translate-y-0'
                : 'scale-95 opacity-0 translate-y-4'
            )}
          >
            <div className="flex items-center justify-between px-4 py-3 border-b border-white/6">
              <div className="flex items-center gap-3">
                <Image
                  src="/vercel.svg"
                  alt="RE"
                  width={28}
                  height={28}
                />
                <span className="font-orbitron text-sm text-[#ffdede]">
                  Menu
                </span>
              </div>
              <div className="flex items-center gap-2">
                <button
                  ref={closeButtonRef}
                  onClick={() => setOpen(false)}
                  aria-label="Close menu"
                  className="p-2 rounded-md text-gray-200 hover:bg-white/3"
                >
                  <X size={18} />
                </button>
              </div>
            </div>

            <div className="px-4 py-4 space-y-3">
              {DEFAULT_NAV.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setOpen(false)}
                  className="block text-lg font-semibold text-gray-200 py-3 px-2 rounded hover:bg-white/3"
                >
                  {item.label}
                </Link>
              ))}

              <div className="pt-2">
                <div className="space-y-2">
                  {categories.map((c) => (
                    <Link
                      key={c.id}
                      href={`/category/${c.slug}`}
                      onClick={() => setOpen(false)}
                      className="block text-lg text-gray-200 py-2 px-2 rounded hover:bg-white/3"
                    >
                      {c.name}
                    </Link>
                  ))}
                </div>
              </div>

              <div className="pt-2">
                <Button variant="destructive" className="w-full">
                  S.T.A.R.S.
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}
