'use client';

import { useLayoutEffect } from 'react';

export type Theme = 'dark' | 'light';

export function useTheme() {
  // Force dark mode always for an RE-like aesthetic. No toggle.
  useLayoutEffect(() => {
    try {
      document.documentElement.classList.add('dark');
      document.documentElement.setAttribute('data-theme', 'dark');
    } catch {
      // ignore
    }
  }, []);

  // Return a stable API but disable toggling
  return { theme: 'dark' as Theme, toggle: () => {} } as const;
}
