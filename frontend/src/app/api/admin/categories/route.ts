import { NextRequest, NextResponse } from 'next/server';
import PocketBase from 'pocketbase';

export async function GET(_request: NextRequest) {
  try {
    const pb = new PocketBase(process.env.NEXT_PUBLIC_POCKETBASE_URL || 'http://127.0.0.1:8090');
    const records = await pb.collection('categories').getFullList({
      sort: '-created',
    });
    return NextResponse.json(records);
  } catch (_error) {
    return NextResponse.json({ error: 'Failed to fetch categories' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const pb = new PocketBase(process.env.NEXT_PUBLIC_POCKETBASE_URL || 'http://127.0.0.1:8090');
    const token = request.headers.get('Authorization')?.split(' ')?.[1];

    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    pb.authStore.save(token, null);
    await pb.authStore.isValid;
    const user = pb.authStore.model;

    if (!user || !user.isAdmin) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const formData = await request.formData();
    const newRecord = await pb.collection('categories').create(formData);

    return NextResponse.json(newRecord);
  } catch (_error) {
    return NextResponse.json({ error: 'Failed to create category' }, { status: 500 });
  }
}
