import { NextRequest, NextResponse } from 'next/server';
import PocketBase from 'pocketbase';

export async function POST(request: NextRequest) {
  const pb = new PocketBase(process.env.NEXT_PUBLIC_POCKETBASE_URL || 'http://127.0.0.1:8090');
  
  try {
    const token = request.headers.get('Authorization')?.split(' ')?.[1];

    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    pb.authStore.save(token, null);

    // verify and refresh the token
    await pb.collection('users').authRefresh();

  } catch (_) {
    pb.authStore.clear();
    return NextResponse.json({ error: 'Invalid token' }, { status: 401 });
  }

  try {
    const data = await request.json();
    const newRecord = await pb.collection('orders').create(data);
    return NextResponse.json(newRecord);
  } catch (error) {
    console.error('Order creation error:', error);
    return NextResponse.json({ error: 'Failed to create order' }, { status: 500 });
  }
}
