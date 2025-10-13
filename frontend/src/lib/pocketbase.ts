import axios from 'axios';

const PB_URL =
  process.env.NEXT_PUBLIC_POCKETBASE_URL || 'http://127.0.0.1:8090';

export const pb = axios.create({
  baseURL: PB_URL,
  headers: {
    Accept: 'application/json',
  },
});

export type Category = {
  id: string;
  name: string;
  slug: string;
  created: string;
  updated?: string;
};

export type PBList<T> = {
  items: T[];
  totalItems: number;
  page: number;
  perPage: number;
};

export async function getCategories(opts?: {
  perPage?: number;
}): Promise<PBList<Category>> {
  const params: Record<string, unknown> = {
    perPage: opts?.perPage ?? 50,
  };
  const res = await pb.get('/api/collections/categories/records', {
    params,
  });
  // PocketBase returns { items: [], totalItems, page, perPage }
  return res.data as PBList<Category>;
}

export async function getCategoryBySlug(slug: string) {
  const params = { filter: `slug="${slug}"`, perPage: 1 };
  const res = await pb.get('/api/collections/categories/records', {
    params,
  });
  const data = res.data as PBList<Category>;
  return data.items[0] ?? null;
}

export type Product = {
  id: string;
  title?: string;
  name?: string;
  slug?: string;
  price?: number;
  stock?: number;
  description?: string;
  images?: string[]; // assuming images are stored as array of URLs
  category?: string; // assuming single category reference
  categories?: string[]; // assuming multiple categories reference
  created: string;
  updated?: string;
  [key: string]: unknown;
};

export async function getProductsByCategory(
  categoryId: string,
  opts?: { perPage?: number }
) {
  // try common relational field `category` referencing the category id
  const perPage = opts?.perPage ?? 50;
  const tryFilters = [
    `category = "${categoryId}"`,
    `categories = "${categoryId}"`,
  ];

  for (const filter of tryFilters) {
    const params = { filter, perPage };
    const res = await pb.get('/api/collections/products/records', {
      params,
    });
    const data = res.data as PBList<Product>;
    if (data.items && data.items.length > 0) return data;
  }

  // fallback: return empty list
  return {
    items: [],
    totalItems: 0,
    page: 1,
    perPage,
  } as PBList<Product>;
}

export default pb;
