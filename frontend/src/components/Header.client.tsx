'use client';

import Link from 'next/link';
import Image from 'next/image';
import { useState, useRef, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import type { RootState, AppDispatch } from '../store';
import { clearAuth } from '../store/slices/authSlice';
import { logout as pbLogout, buildFileUrl } from '../lib/pocketbase';
import { ChevronDown } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { Menu, X } from 'lucide-react';
import { Button } from './ui/button';
import { cn } from '../lib/utils';
import { usePathname } from 'next/navigation';
import type { Category } from '../lib/pocketbase';

type Props = {
  categories: Category[];
};

const DEFAULT_NAV = [
  { label: 'Home', href: '/' },
  { label: 'About', href: '/about' },
  { label: 'Inventory', href: '/inventory' },
];

export default function HeaderClient({ categories }: Props) {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();
  const panelRef = useRef<HTMLDivElement | null>(null);
  const closeButtonRef = useRef<HTMLButtonElement | null>(null);
  const lastActiveRef = useRef<HTMLElement | null>(null);
  const auth = useSelector((s: RootState) => s.auth);
  const dispatch = useDispatch<AppDispatch>();
  const router = useRouter();
  // theme is forced to dark globally
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const userMenuRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const onDocClick = (e: MouseEvent) => {
      if (!userMenuRef.current) return;
      if (
        userMenuOpen &&
        !userMenuRef.current.contains(e.target as Node)
      ) {
        setUserMenuOpen(false);
      }
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setUserMenuOpen(false);
    };
    document.addEventListener('click', onDocClick);
    document.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('click', onDocClick);
      document.removeEventListener('keydown', onKey);
    };
  }, [userMenuOpen]);

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
    <header className="bg-transparent z-20">
      {/* thin accent stripe like the RE UI */}
      <div className="h-1 w-full bg-gradient-to-r via-rose-500 " />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-[#070607] flex items-center justify-center overflow-hidden ring-1 ring-rose-600/30 shadow-[0_6px_18px_rgba(220,38,38,0.12)]">
              <Image
                src="/vercel.svg"
                alt="RE"
                width={32}
                height={32}
              />
            </div>
            <Link
              href="/"
              className="font-orbitron text-lg tracking-widest text-[#ffdede] uppercase"
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
                    'text-sm font-bold uppercase tracking-widest transition-colors inline-flex flex-col items-center',
                    active
                      ? 'text-white'
                      : 'text-gray-300 hover:text-white'
                  )}
                >
                  <span className="select-none">{item.label}</span>
                  {/* active indicator: thicker metallic red bar */}
                  <span
                    className={cn(
                      'mt-1 h-1 rounded-full bg-gradient-to-r from-rose-500 to-amber-300 transition-all',
                      active
                        ? 'w-8 opacity-100 shadow-[0_6px_18px_rgba(220,38,38,0.14)]'
                        : 'w-0 opacity-0'
                    )}
                  />
                </Link>
              );
            })}

            {/* categories inline */}
            <div className="flex items-center gap-3">
              {categories.map((c) => {
                const activeCat = pathname?.startsWith(
                  `/category/${c.slug}`
                );
                return (
                  <Link
                    key={c.id}
                    href={`/category/${c.slug}`}
                    className={cn(
                      'text-sm transition-colors inline-flex flex-col items-center',
                      activeCat
                        ? 'text-white'
                        : 'text-gray-300 hover:text-white'
                    )}
                  >
                    <span>{c.name}</span>
                    <span
                      className={cn(
                        'mt-1 h-1 rounded-full bg-red-500 transition-all',
                        activeCat
                          ? 'w-6 opacity-100'
                          : 'w-0 opacity-0'
                      )}
                    />
                  </Link>
                );
              })}
            </div>

            <div>
              {!auth.authenticated ? (
                <>
                  <Link href="/login">
                    <Button
                      variant="destructive"
                      className="mr-2 !bg-gradient-to-b from-rose-700 to-rose-600 !border-rose-800 text-white shadow-[inset_0_2px_0_rgba(255,255,255,0.03),0_12px_30px_rgba(220,38,38,0.12)]"
                    >
                      Login
                    </Button>
                  </Link>
                  <Link href="/register">
                    <Button className="!bg-zinc-800 text-zinc-100 border border-zinc-700">
                      Register
                    </Button>
                  </Link>
                </>
              ) : (
                <div className="relative" ref={userMenuRef}>
                  <button
                    type="button"
                    className="flex items-center gap-2 px-3 py-1 rounded hover:bg-white/3"
                    onClick={() => setUserMenuOpen((v) => !v)}
                    aria-expanded={userMenuOpen}
                    aria-haspopup="menu"
                  >
                    <div className="w-8 h-8 rounded-full overflow-hidden bg-[#0b0b0b]">
                      {auth.user?.profileImage ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img
                          src={buildFileUrl(
                            auth.user.profileImage,
                            'users',
                            auth.user.id
                          )}
                          alt={auth.user?.name ?? 'avatar'}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-gray-400">
                          RE
                        </div>
                      )}
                    </div>
                    <span className="text-sm text-gray-400">
                      {auth.user?.name}
                    </span>
                    <ChevronDown
                      size={14}
                      className="text-gray-300"
                    />
                  </button>

                  {userMenuOpen && (
                    <div className="absolute right-0 mt-2 w-48 bg-gradient-to-b from-[#070607] to-[#0b0b0b] ring-1 ring-rose-800/20 rounded shadow-lg z-50 border border-rose-900/10">
                      <div className="py-2">
                        <button
                          onClick={() => {
                            setUserMenuOpen(false);
                            router.push('/profile');
                          }}
                          className="w-full text-left px-4 py-2 text-sm text-gray-200 hover:bg-white/3"
                        >
                          Profile
                        </button>

                        {auth.user?.isAdmin && (
                          <button
                            onClick={() => {
                              setUserMenuOpen(false);
                              router.push('/dashboard');
                            }}
                            className="w-full text-left px-4 py-2 text-sm text-gray-200 hover:bg-white/3"
                          >
                            Dashboard
                          </button>
                        )}

                        <button
                          onClick={async () => {
                            setUserMenuOpen(false);
                            try {
                              await pbLogout();
                            } finally {
                              dispatch(clearAuth());
                              router.push('/');
                            }
                          }}
                          className="w-full text-left px-4 py-2 text-sm text-gray-200 hover:bg-white/3"
                        >
                          Logout
                        </button>

                        <div className="border-t border-rose-900/10 mt-2" />
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
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
            'fixed inset-0 z-[9999] flex items-center justify-center',
            open ? 'pointer-events-auto' : 'pointer-events-none'
          )}
        >
          <div
            onClick={() => setOpen(false)}
            className={cn(
              // solid backdrop (not transparent) to avoid underlying bleed-through
              'absolute inset-0 bg-[#0b0b0b] backdrop-blur-sm transition-opacity duration-300',
              open ? 'opacity-100' : 'opacity-0'
            )}
          />

          <div
            ref={panelRef}
            className={cn(
              'relative w-full max-w-sm mx-4 rounded-lg bg-gradient-to-b from-[#0b0b0b] to-[#141414] border border-white/6 overflow-hidden shadow-xl transform transition-all duration-300 z-[10000]',
              open
                ? 'scale-100 opacity-100 translate-y-60'
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
              {/* theme toggle removed for dark-only RE aesthetic */}
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

              {/* <div className="pt-2">
                <Button variant="destructive" className="w-full">
                  S.T.A.R.S.
                </Button>
              </div> */}
              <div>
                {!auth.authenticated ? (
                  <>
                    <Link href="/login">
                      <Button variant="destructive" className="mr-2">
                        Login
                      </Button>
                    </Link>
                    <Link href="/register">
                      <Button variant="destructive">Register</Button>
                    </Link>
                  </>
                ) : (
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full overflow-hidden bg-[#0b0b0b]">
                      {auth.user?.profileImage ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img
                          src={buildFileUrl(
                            auth.user.profileImage,
                            'users',
                            auth.user.id
                          )}
                          alt={auth.user?.name ?? 'avatar'}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-gray-400">
                          RE
                        </div>
                      )}
                    </div>
                    <div className="flex-1">
                      <div className="text-sm text-gray-100">
                        {auth.user?.name}
                      </div>
                      <div className="text-xs text-gray-400">
                        {auth.user?.email}
                      </div>
                    </div>
                    {auth.user?.isAdmin && (
                      <Link href="/dashboard">
                        <Button
                          variant="destructive"
                          className="ml-2"
                        >
                          Dashboard
                        </Button>
                      </Link>
                    )}
                    <Button
                      variant="destructive"
                      onClick={async () => {
                        try {
                          await pbLogout();
                        } finally {
                          dispatch(clearAuth());
                          router.push('/');
                        }
                      }}
                      className="ml-2"
                    >
                      Logout
                    </Button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}
