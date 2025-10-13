'use client';
import { useEffect, useState } from 'react';
import {
  getCategories,
  type Category,
  type PBList,
} from '../lib/pocketbase';

export function useCategories() {
  const [data, setData] = useState<Category[] | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    let mounted = true;
    setLoading(true);
    getCategories()
      .then((res: PBList<Category>) => {
        if (!mounted) return;
        setData(res.items ?? null);
        setError(null);
      })
      .catch((err) => {
        if (!mounted) return;
        setError(err as Error);
      })
      .finally(() => {
        if (!mounted) return;
        setLoading(false);
      });

    return () => {
      mounted = false;
    };
  }, []);

  return { data, loading, error } as const;
}
