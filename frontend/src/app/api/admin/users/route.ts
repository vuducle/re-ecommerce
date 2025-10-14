import { NextResponse } from 'next/server';
import PocketBase from 'pocketbase';

const PB_URL =
  process.env.NEXT_PUBLIC_POCKETBASE_URL || 'http://127.0.0.1:8090';

async function validateRequesterIsAdmin(
  clientToken: string,
  userId: string
) {
  // Validate the incoming user's token by fetching their user record.
  const res = await fetch(
    `${PB_URL}/api/collections/users/records/${encodeURIComponent(
      userId
    )}`,
    {
      headers: {
        Accept: 'application/json',
        Authorization: `Bearer ${clientToken}`,
      },
    }
  );

  if (!res.ok) return false;
  const data = await res.json();
  // pocketbase returns the record directly for a single id fetch
  const isAdmin = !!(data?.isAdmin ?? data?.record?.isAdmin ?? false);
  return isAdmin;
}

export async function GET(req: Request) {
  try {
    const authHeader = req.headers.get('authorization');
    const userId = req.headers.get('x-user-id');

    if (!authHeader || !userId) {
      return NextResponse.json(
        { error: 'Missing authorization or user id' },
        { status: 401 }
      );
    }

    // authHeader may be in the form 'Bearer <token>' or just the token.
    // Normalize to the raw token value that PocketBase expects.
    let clientToken = authHeader;
    if (clientToken.toLowerCase().startsWith('bearer ')) {
      clientToken = clientToken.slice(7);
    }

    const isAdmin = await validateRequesterIsAdmin(
      clientToken,
      userId
    );
    if (!isAdmin) {
      return NextResponse.json(
        { error: 'Forbidden' },
        { status: 403 }
      );
    }

    const adminEmail = process.env.PB_ADMIN_EMAIL;
    const adminPassword = process.env.PB_ADMIN_PASSWORD;

    if (!adminEmail || !adminPassword) {
      return NextResponse.json(
        {
          error:
            'Server admin credentials not configured (PB_ADMIN_EMAIL / PB_ADMIN_PASSWORD)',
        },
        { status: 500 }
      );
    }

    // Use PocketBase JS SDK on the server to authenticate as admin and fetch users.
    const pb = new PocketBase(PB_URL);
    try {
      await pb.admins.authWithPassword(adminEmail, adminPassword);
    } catch (e) {
      // bubble a clear error
      return NextResponse.json(
        { error: 'Admin login failed', details: String(e) },
        { status: 502 }
      );
    }

    // getList returns { items, totalItems, page, perPage }
    const usersList = await pb.collection('users').getList(1, 200);
    return NextResponse.json(usersList);
  } catch (err: unknown) {
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}

export const runtime = 'nodejs';
