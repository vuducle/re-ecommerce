'use client';
import React, { useState } from 'react';
import Image from 'next/image';
import Lightbox from 'yet-another-react-lightbox';
import 'yet-another-react-lightbox/styles.css';

type Props = {
  images: string[];
  alt?: string;
};

export default function ProductGallery({ images, alt }: Props) {
  const [active, setActive] = useState<number>(0);
  const [isOpen, setIsOpen] = useState<boolean>(false);
  const imgs = images ?? [];

  if (!imgs || imgs.length === 0) {
    return (
      <div className="w-full h-80 bg-gradient-to-br from-[#070607] to-[#161212] flex items-center justify-center text-sm text-amber-300/80">
        No images
      </div>
    );
  }

  return (
    <div className="w-full">
      <div
        className="relative w-full h-80 bg-gradient-to-b from-[#070505] via-[#0b0606] to-[#121212] overflow-hidden rounded-xl ring-1 ring-black/40 shadow-2xl cursor-zoom-in backdrop-blur-[1px] transition-all"
        onClick={() => setIsOpen(true)}
        role="button"
        aria-label="Open image lightbox"
        tabIndex={0}
        onKeyDown={(e) => {
          if (e.key === 'Enter') setIsOpen(true);
        }}
      >
        <Image
          src={imgs[active]}
          alt={alt ?? 'Product image'}
          fill
          className="object-contain drop-shadow-[0_18px_40px_rgba(150,20,20,0.45)] transition-transform duration-300"
        />
      </div>

      {imgs.length > 1 && (
        <div className="mt-3 flex gap-3 overflow-x-auto items-center">
          {imgs.map((src, idx) => (
            <button
              key={idx}
              onClick={() => setActive(idx)}
              aria-label={`Show image ${idx + 1}`}
              className={`flex-shrink-0 rounded-lg overflow-hidden transform transition-all duration-200 ${
                idx === active
                  ? 'scale-105 ring-2 ring-rose-500/70 shadow-[0_8px_30px_rgba(160,20,20,0.18)]'
                  : 'hover:scale-105'
              }`}
              style={{ width: 84, height: 84 }}
            >
              <div className="relative w-full h-full bg-zinc-900/30 ring-1 ring-black/30">
                <Image
                  src={src}
                  alt={alt ?? `thumb-${idx}`}
                  fill
                  className="object-cover"
                />
                {idx === active && (
                  <div className="absolute inset-0 pointer-events-none bg-gradient-to-t from-black/20 via-transparent to-transparent" />
                )}
              </div>
            </button>
          ))}
        </div>
      )}

      <Lightbox
        open={isOpen}
        index={active}
        close={() => setIsOpen(false)}
        slides={imgs.map((s) => ({ src: s }))}
        on={{
          view: ({ index }) => setActive(index ?? 0),
        }}
      />
    </div>
  );
}
