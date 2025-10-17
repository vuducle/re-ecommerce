import { NextRequest, NextResponse } from 'next/server';
import PocketBase from 'pocketbase';
import { PB_URL } from '@/lib/pocketbase';

export async function PATCH(req: NextRequest) {
  try {
    const token = req.headers.get('Authorization');
    if (!token) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    const pb = new PocketBase(PB_URL);
    pb.authStore.save(token, null);

    if (!pb.authStore.isValid) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    const userId = pb.authStore.model?.id;
    if (!userId) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    const formData = await req.formData();
    const name = formData.get('name') as string;
    const lastKnownLocation = formData.get('lastKnownLocation') as string;
    const profileImage = formData.get('profileImage') as File | null;

    const dataToUpdate: { name?: string; lastKnownLocation?: string; profileImage?: File } = {};
    if (name) dataToUpdate.name = name;
    if (lastKnownLocation) dataToUpdate.lastKnownLocation = lastKnownLocation;
    if (profileImage) dataToUpdate.profileImage = profileImage;

    if (Object.keys(dataToUpdate).length === 0) {
      return NextResponse.json({ message: 'No fields to update' }, { status: 400 });
    }

    const updatedUser = await pb.collection('users').update(userId, dataToUpdate);

    return NextResponse.json(updatedUser);
  } catch (error) {
    console.error('Error updating user:', error);
    return NextResponse.json({ message: 'Internal Server Error' }, { status: 500 });
  }
}
