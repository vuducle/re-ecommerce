import { NextResponse } from 'next/server';
import PocketBase from 'pocketbase';

const PB_URL =
  process.env.NEXT_PUBLIC_POCKETBASE_URL || 'http://127.0.0.1:8090';

async function validateRequesterIsAdmin(
  clientToken: string,
  userId: string
) {
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

    const pb = new PocketBase(PB_URL);
    try {
      await pb.admins.authWithPassword(adminEmail, adminPassword);
    } catch (e) {
      return NextResponse.json(
        { error: 'Admin login failed', details: String(e) },
        { status: 502 }
      );
    }

    const ordersList = await pb.collection('orders').getList(1, 200, {
      expand: 'user'
    });
    return NextResponse.json(ordersList);
  } catch (err: unknown) {
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}

export async function PUT(req: Request) {
  try {
    const authHeader = req.headers.get('authorization');
    const userId = req.headers.get('x-user-id');

    if (!authHeader || !userId) {
      return NextResponse.json(
        { error: 'Missing authorization or user id' },
        { status: 401 }
      );
    }

    let clientToken = authHeader;
    if (clientToken.toLowerCase().startsWith('bearer ')) {
      clientToken = clientToken.slice(7);
    }

    const isAdmin = await validateRequesterIsAdmin(
      clientToken,
      userId
    );
    if (!isAdmin) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
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

    const pb = new PocketBase(PB_URL);
    try {
      await pb.admins.authWithPassword(adminEmail, adminPassword);
    } catch (e) {
      return NextResponse.json(
        { error: 'Admin login failed', details: String(e) },
        { status: 502 }
      );
    }

    const { id, status } = await req.json();

    if (!id || !status) {
      return NextResponse.json({ error: 'Missing order id or status' }, { status: 400 });
    }

    const updatedOrder = await pb.collection('orders').update(id, { status });

    return NextResponse.json(updatedOrder);
  } catch (err: unknown) {
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}

export async function DELETE(req: Request) {
  try {
    const authHeader = req.headers.get('authorization');
    const userId = req.headers.get('x-user-id');

    if (!authHeader || !userId) {
      return NextResponse.json(
        { error: 'Missing authorization or user id' },
        { status: 401 }
      );
    }

    let clientToken = authHeader;
    if (clientToken.toLowerCase().startsWith('bearer ')) {
      clientToken = clientToken.slice(7);
    }

    const isAdmin = await validateRequesterIsAdmin(
      clientToken,
      userId
    );
    if (!isAdmin) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
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

    const pb = new PocketBase(PB_URL);
    try {
      await pb.admins.authWithPassword(adminEmail, adminPassword);
    } catch (e) {
      return NextResponse.json(
        { error: 'Admin login failed', details: String(e) },
        { status: 502 }
      );
    }

    const { id } = await req.json();

    if (!id) {
      return NextResponse.json({ error: 'Missing order id to delete' }, { status: 400 });
    }

    await pb.collection('orders').delete(id);

    return NextResponse.json({ success: true });
  } catch (err: unknown) {
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}

export const runtime = 'nodejs';
