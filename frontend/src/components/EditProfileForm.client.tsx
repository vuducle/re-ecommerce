'use client';

import { useState, useRef } from 'react';
import { AppUser } from '@/lib/pocketbase';
import { useNotification } from '@/context/NotificationContext';
import { Button } from './ui/button';
import { useSelector, useDispatch } from 'react-redux';
import { RootState, AppDispatch } from '@/store';
import { setAuth } from '@/store/slices/authSlice';
import { Input } from './ui/input';
import { Label } from './ui/label';

interface EditProfileFormProps {
  user: AppUser;
}

export default function EditProfileForm({ user }: EditProfileFormProps) {
  const [name, setName] = useState(user.name);
  const [lastKnownLocation, setLastKnownLocation] = useState(
    user.lastKnownLocation || ''
  );
  const [profileImage, setProfileImage] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const { showNotification } = useNotification();
  const auth = useSelector((s: RootState) => s.auth);
  const dispatch = useDispatch<AppDispatch>();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    const formData = new FormData();
    formData.append('name', name);
    formData.append('lastKnownLocation', lastKnownLocation);
    if (profileImage) {
      formData.append('profileImage', profileImage);
    }

    try {
      const res = await fetch('/api/user/update', {
        method: 'PATCH',
        headers: {
          Authorization: `${auth.token}`,
        },
        body: formData,
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.message || 'Failed to update profile');
      }

      const updatedUser = await res.json();

      // Update user in redux store
      if (updatedUser && auth.token) {
        const userToUpdate: AppUser = {
          id: updatedUser.id || auth.user?.id,
          email: updatedUser.email || auth.user?.email,
          name: updatedUser.name || auth.user?.name,
          profileImage: updatedUser.profileImage || auth.user?.profileImage,
          verified: updatedUser.verified || auth.user?.verified,
          lastKnownLocation: updatedUser.lastKnownLocation || auth.user?.lastKnownLocation,
          isAdmin: updatedUser.isAdmin || auth.user?.isAdmin,
        };
        dispatch(setAuth({ user: userToUpdate, token: auth.token }));
      }

      showNotification('Profile updated successfully', 'success');
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
      setProfileImage(null);
    } catch (error: any) {
      showNotification(error.message, 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <Label htmlFor="name" className="text-gray-300">
          Name
        </Label>
        <Input
          id="name"
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="mt-1 bg-gray-800 border-gray-600 text-white"
        />
      </div>
      <div>
        <Label htmlFor="location" className="text-gray-300">
          Location
        </Label>
        <Input
          id="location"
          type="text"
          value={lastKnownLocation}
          onChange={(e) => setLastKnownLocation(e.target.value)}
          className="mt-1 bg-gray-800 border-gray-600 text-white"
        />
      </div>
      <div>
        <Label htmlFor="profileImage" className="text-gray-300">
          Profile Image
        </Label>
        <Input
          id="profileImage"
          type="file"
          ref={fileInputRef}
          onChange={(e) =>
            setProfileImage(e.target.files ? e.target.files[0] : null)
          }
          className="mt-1 bg-gray-800 border-gray-600 text-white file:text-white"
        />
      </div>
      <Button type="submit" disabled={loading} className="bg-red-700 hover:bg-red-800">
        {loading ? 'Saving...' : 'Save Changes'}
      </Button>
    </form>
  );
}
