'use client';

import { useState, useEffect, useRef } from 'react';
import { useDebounce } from 'use-debounce';
import { Input } from '@/components/ui/input';
import Link from 'next/link';
import Image from 'next/image';
import { buildFileUrl } from '@/lib/pocketbase';

interface Product {
  id: string;
  name: string;
  slug: string;
  price: number;
  thumbnail: string;
}

export default function SearchBar() {
  const [searchTerm, setSearchTerm] = useState('');
  const [debouncedSearchTerm] = useDebounce(searchTerm, 300);
  const [results, setResults] = useState<Product[]>([]);
  const [loading, setLoading] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const wrapperRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const q = debouncedSearchTerm.trim();
    if (!q) {
      setResults([]);
      return;
    }

    const controller = new AbortController();
    const run = async () => {
      try {
        setLoading(true);
        const res = await fetch(
          `/api/products/search?query=${encodeURIComponent(q)}`,
          { signal: controller.signal }
        );
        if (!res.ok) throw new Error('Search failed');
        const data = await res.json();
        setResults(Array.isArray(data) ? data : []);
      } catch (err) {
        if ((err as any)?.name !== 'AbortError') {
          // swallow errors for UX; optionally add a toast
          setResults([]);
        }
      } finally {
        setLoading(false);
      }
    };
    run();
    return () => controller.abort();
  }, [debouncedSearchTerm]);

  // Close on outside click
  useEffect(() => {
    const onDown = (e: MouseEvent) => {
      if (!wrapperRef.current) return;
      if (!wrapperRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setIsOpen(false);
    };
    document.addEventListener('mousedown', onDown);
    document.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('mousedown', onDown);
      document.removeEventListener('keydown', onKey);
    };
  }, []);

  return (
    <div
      ref={wrapperRef}
      className="relative w-full max-w-xs"
      role="combobox"
      aria-expanded={isOpen}
      aria-haspopup="listbox"
      aria-controls="search-results"
    >
      <Input
        type="search"
        placeholder="Search for products..."
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
        onFocus={() => setIsOpen(true)}
        className="w-full pr-10"
        aria-autocomplete="list"
        aria-controls="search-results"
      />
      {loading && (
        <div className="absolute right-3 top-1/2 -translate-y-1/2 text-xs">
          Loading...
        </div>
      )}
      {isOpen && (
        <div
          id="search-results"
          className="absolute top-full left-0 z-10 mt-2 w-full rounded-md border bg-background shadow-lg max-h-80 overflow-auto"
          role="listbox"
        >
          {results.length > 0 ? (
            <ul>
              {results.map((p: any) => {
                const thumb =
                  Array.isArray(p.images) && p.images.length
                    ? buildFileUrl(p.images[0], 'products', p.id)
                    : undefined;
                const price =
                  typeof p.price === 'number' ? p.price : 0;
                const formatted = new Intl.NumberFormat('vi-VN', {
                  style: 'currency',
                  currency: 'VND',
                }).format(price);
                return (
                  <li key={p.id} role="option" aria-selected={false}>
                    <Link
                      href={`/product/${p.slug}`}
                      className="flex items-center gap-3 px-3 py-2 hover:bg-muted"
                      onClick={() => setIsOpen(false)}
                    >
                      <div className="w-10 h-10 rounded overflow-hidden bg-zinc-800 flex-shrink-0">
                        {thumb ? (
                          <Image
                            src={thumb}
                            alt={p.name || 'Product'}
                            width={40}
                            height={40}
                            className="object-cover w-10 h-10"
                            unoptimized
                          />
                        ) : (
                          <div className="w-10 h-10 flex items-center justify-center text-[10px] text-zinc-400">
                            NO IMG
                          </div>
                        )}
                      </div>
                      <div className="min-w-0">
                        <div className="text-sm text-white truncate">
                          {p.name}
                        </div>
                        <div className="text-xs text-yellow-400">
                          {formatted}
                        </div>
                      </div>
                    </Link>
                  </li>
                );
              })}
            </ul>
          ) : (
            <div className="px-4 py-3 text-sm text-muted-foreground">
              {searchTerm.trim()
                ? 'No results found.'
                : 'Type to search products'}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
