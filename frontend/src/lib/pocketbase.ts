import axios from 'axios';

export const PB_URL =
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

export type AuthResponse = {
  token?: string;
  record?: Record<string, unknown> | null;
  user?: Record<string, unknown> | null; // alternative shape
};

// The app's normalized user type used across the frontend (matches authSlice User)
export type AppUser = {
  id: string;
  email: string;
  isAdmin?: boolean;
  name: string;
  profileImage?: string;
  verified?: boolean;
  lastKnownLocation?: string;
  [key: string]: unknown;
};

export async function authWithPassword(
  email: string,
  password: string
): Promise<{
  user: AppUser | null;
  token: string | null;
}> {
  try {
    // PocketBase REST endpoint for password auth is /api/collections/users/auth-with-password
    const res = await pb.post(
      '/api/collections/users/auth-with-password',
      {
        identity: email,
        password,
      }
    );

    const data = res.data as AuthResponse;
    const token = data.token ?? null;
    const raw = (data.record ?? data.user ?? null) as Record<
      string,
      unknown
    > | null;

    if (!raw) return { user: null, token };

    // normalize helper
    const asString = (v: unknown) =>
      typeof v === 'string' ? v : v == null ? '' : String(v);

    const mapped: AppUser = {
      id: asString(
        raw.id ?? raw._id ?? raw.recordId ?? raw._rid ?? ''
      ),
      email: asString(
        raw.email ?? raw.identity ?? raw.username ?? ''
      ),
      name: asString(
        raw.name ?? raw.fullName ?? raw.displayName ?? ''
      ),
      profileImage:
        (typeof raw.profileImage === 'string' && raw.profileImage) ||
        (typeof raw.avatar === 'string' && raw.avatar) ||
        undefined,
      verified: !!(raw.verified ?? raw.isVerified ?? false),
      lastKnownLocation:
        (typeof raw.lastKnownLocation === 'string' &&
          raw.lastKnownLocation) ||
        (typeof raw.location === 'string' && raw.location) ||
        undefined,
      isAdmin: !!(
        raw.isAdmin ||
        raw.admin ||
        (Array.isArray(raw.roles) &&
          (raw.roles as unknown[]).includes('admin'))
      ),
    };

    return { user: mapped, token };
  } catch (err: unknown) {
    // normalize error
    // try to read axios response shape
    const maybeErr = err as { response?: { data?: unknown } };
    if (maybeErr.response?.data) {
      const data = maybeErr.response.data as
        | { message?: string }
        | unknown;
      const msg =
        data &&
        typeof data === 'object' &&
        'message' in (data as object)
          ? (data as { message?: string }).message
          : JSON.stringify(data);
      throw new Error(msg);
    }
    throw err;
  }
}

export async function logout() {
  try {
    await pb.post('/api/auth/logout');
  } catch {
    // ignore
  }
}

export function buildFileUrl(
  filename?: string,
  collection = 'users',
  recordId?: string
) {
  if (!filename || !recordId) return undefined;
  return `${PB_URL}/api/files/${collection}/${recordId}/${encodeURIComponent(
    filename
  )}`;
}
