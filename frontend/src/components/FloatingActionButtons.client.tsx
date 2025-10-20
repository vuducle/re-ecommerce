'use client';

import React from 'react';
import { useMobileMenu } from '@/context/MobileMenuContext';
import { Button } from './ui/button';
import { Menu, ShoppingCart } from 'lucide-react';
import Link from 'next/link';

const FloatingActionButtons = () => {
  const { toggleMenu } = useMobileMenu();

  return (
    <div className="fixed bottom-20 right-4 z-50 flex flex-col gap-2 md:hidden">
      <Button
        onClick={toggleMenu}
        aria-label="Open menu"
        className="rounded-full h-14 w-14 bg-gradient-to-b from-[#1b0a0a] to-[#0b0606] border border-rose-800 text-rose-100 shadow-lg"
      >
        <Menu size={24} />
      </Button>
      <Link href="/checkout">
        <Button
          aria-label="Open cart"
          className="rounded-full h-14 w-14 bg-gradient-to-b from-[#1b0a0a] to-[#0b0606] border border-rose-800 text-rose-100 shadow-lg"
        >
          <ShoppingCart size={24} />
        </Button>
      </Link>
    </div>
  );
};

export default FloatingActionButtons;
