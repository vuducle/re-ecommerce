import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const raw = (searchParams.get('query') || '').trim();

  // Return empty array for empty query to simplify client logic
  if (!raw) {
    return NextResponse.json([]);
  }

  // Use the same env var as the rest of the app; default for local dev
  const PB_URL =
    process.env.NEXT_PUBLIC_POCKETBASE_URL || 'http://127.0.0.1:8090';

  // Escape single quotes for PocketBase filter string
  const safe = raw.replace(/'/g, "\\'");
  // Search common fields
  const filter = `name ~ '${safe}' || slug ~ '${safe}' || description ~ '${safe}'`;

  const url = `${PB_URL}/api/collections/products/records?perPage=20&page=1&filter=${encodeURIComponent(
    filter
  )}`;

  try {
    const res = await fetch(url, {
      // Public collections don't require auth; adjust headers if needed
      headers: { Accept: 'application/json' },
      cache: 'no-store',
    });

    const data = await res.json();
    if (!res.ok) {
      return NextResponse.json(
        { message: 'Error fetching products', error: data },
        { status: res.status }
      );
    }

    // PocketBase list response shape: { page, perPage, totalItems, items }
    return NextResponse.json(data.items ?? []);
  } catch (error) {
    return NextResponse.json(
      { message: 'Error fetching products', error: String(error) },
      { status: 500 }
    );
  }
}
