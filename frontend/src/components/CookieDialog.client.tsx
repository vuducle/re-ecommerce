'use client';

import { useState, useEffect } from 'react';
import { Button } from './ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from './ui/dialog';
import { Cookie } from 'lucide-react';
import Link from 'next/link';

const COOKIE_CONSENT_KEY =
  're-commerce-cookie-consent-julia-nguyen-uwu-mei-is-crazy';

export default function CookieDialog() {
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    // Check localStorage only on the client side
    const consent = localStorage.getItem(COOKIE_CONSENT_KEY);
    if (consent !== 'true') {
      setIsOpen(true);
    }
  }, []);

  const handleAccept = () => {
    localStorage.setItem(COOKIE_CONSENT_KEY, 'true');
    setIsOpen(false);
  };

  return (
    <Dialog open={isOpen}>
      <DialogContent
        className="bg-[#0b0b0b] border-[#2a0808] shadow-2xl shadow-red-900/20"
        showCloseButton={false}
      >
        <DialogHeader>
          <DialogTitle className="text-2xl font-extrabold text-white font-serif tracking-wider flex items-center gap-3">
            <Cookie className="size-7 text-yellow-400" />A Word on
            "Cookies," Stranger
          </DialogTitle>
          <DialogDescription className="text-gray-300 pt-2">
            "Heh heh... even in this crazy world, there are rules.
            This site uses 'cookies'—or maybe they're Las Plagas, who
            knows?—to remember you. It's just for keeping track of
            your inventory and making your shopping experience
            smoother. No funny business."
          </DialogDescription>
        </DialogHeader>
        <div className="text-sm text-gray-400">
          <p>
            By clicking accept, you agree to let me use these...
            'enhancements'. You can read the fine print in my{' '}
            <Link
              href="/privacy"
              className="underline hover:text-white"
            >
              Privacy Policy
            </Link>
            .
          </p>
        </div>
        <DialogFooter>
          <Button
            onClick={handleAccept}
            className="w-full sm:w-auto px-8 py-4 rounded-lg text-lg font-semibold uppercase tracking-wider text-white bg-gradient-to-b from-red-700 to-red-900 border border-red-900/80 shadow-[0_6px_0_rgba(0,0,0,0.6)] hover:from-red-600 hover:to-red-800 active:translate-y-0.5"
          >
            I Understand, Stranger
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
