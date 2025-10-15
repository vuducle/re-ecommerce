import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import pb from '../lib/pocketbase';
import { Button } from './ui/button';
import Loading from './ui/Loading';
import { useNotification } from '../context/NotificationContext';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from './ui/dialog';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Checkbox } from './ui/checkbox';

type User = {
  id: string;
  name: string;
  email: string;
  verified: boolean;
  isAdmin: boolean;
  avatarUrl?: string | null;
  lastKnownLocation?: string;
  [key: string]: unknown;
};

type Props = {
  open: boolean;
  onClose: () => void;
  onUpdated?: (user: Record<string, unknown>) => void;
  user: User | null;
  token: string | null;
  currentUserId: string | null;
};

export default function UpdateUserDialog({
  open,
  onClose,
  onUpdated,
  user,
  token,
  currentUserId,
}: Props) {
  const [email, setEmail] = useState<string>('');
  const [name, setName] = useState<string>('');
  const [password, setPassword] = useState<string>('');
  const [passwordConfirm, setPasswordConfirm] = useState<string>('');
  const [lastKnownLocation, setLastKnownLocation] =
    useState<string>('');
  const [profileImage, setProfileImage] = useState<File | null>(null);
  const [isAdmin, setIsAdmin] = useState<boolean>(false);

  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [fileError, setFileError] = useState<string | null>(null);
  const [passwordError, setPasswordError] = useState<string | null>(
    null
  );
  const [passwordConfirmError, setPasswordConfirmError] = useState<
    string | null
  >(null);
  const [emailError, setEmailError] = useState<string | null>(null);

  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const { showNotification } = useNotification();

  useEffect(() => {
    if (user) {
      setEmail(user.email);
      setName(user.name);
      setLastKnownLocation(user.lastKnownLocation || '');
      setIsAdmin(user.isAdmin);
      setPreviewUrl(user.avatarUrl || null);
    }
  }, [user]);

  useEffect(() => {
    if (!profileImage) {
      setPreviewUrl(user?.avatarUrl || null);
      return;
    }
    const url = URL.createObjectURL(profileImage);
    setPreviewUrl(url);
    return () => URL.revokeObjectURL(url);
  }, [profileImage, user]);

  function validateEmail(value: string) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
  }

  function checkPasswordStrength(pw: string) {
    if (pw.length > 0 && pw.length < 8)
      return 'Password must be at least 8 characters';
    if (pw.length > 0 && (!/[0-9]/.test(pw) || !/[A-Za-z]/.test(pw)))
      return 'Password should include letters and numbers';
    return null;
  }

  const onFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files && e.target.files[0];
    setFileError(null);
    if (!f) {
      setProfileImage(null);
      return;
    }
    if (!f.type.startsWith('image/')) {
      setFileError('Only image files are allowed');
      setProfileImage(null);
      return;
    }
    const MAX = 5 * 1024 * 1024;
    if (f.size > MAX) {
      setFileError('Image is too large (max 5 MB)');
      setProfileImage(null);
      return;
    }
    setProfileImage(f);
  };

  const reset = () => {
    setEmail('');
    setName('');
    setPassword('');
    setPasswordConfirm('');
    setLastKnownLocation('');
    setProfileImage(null);
    setError(null);
    setEmailError(null);
    setPasswordError(null);
    setPasswordConfirmError(null);
    setFileError(null);
    setIsAdmin(false);
  };

  useEffect(() => {
    if (!open) reset();
  }, [open]);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    setError(null);
    setLoading(true);
    try {
      const emOk = validateEmail(email);
      const pwErr = checkPasswordStrength(password);
      setEmailError(emOk ? null : 'Please enter a valid email');
      setPasswordError(pwErr);
      if (password && !passwordConfirm)
        setPasswordConfirmError('Please confirm your password');
      else if (password && passwordConfirm !== password)
        setPasswordConfirmError('Passwords do not match');
      else setPasswordConfirmError(null);

      if (!emOk || pwErr) {
        setLoading(false);
        return;
      }
      if (
        passwordConfirmError ||
        (password && passwordConfirm !== password)
      ) {
        setLoading(false);
        return;
      }

      let res;
      if (profileImage) {
        const formData = new FormData();
        formData.append('id', user.id);
        formData.append('name', name);
        formData.append('email', email);
        formData.append('isAdmin', String(isAdmin));
        formData.append('lastKnownLocation', lastKnownLocation);
        if (password) {
          formData.append('password', password);
          formData.append('passwordConfirm', passwordConfirm);
        }
        formData.append('profileImage', profileImage, profileImage.name);

        res = await fetch('/api/admin/users', {
          method: 'PUT',
          headers: {
            Authorization: `Bearer ${token}`,
            'x-user-id': currentUserId || '',
          },
          body: formData,
        });
      } else {
        const data: Record<string, unknown> = {
          id: user.id,
          name,
          email,
          isAdmin,
          lastKnownLocation,
        };

        if (password) {
          data.password = password;
          data.passwordConfirm = passwordConfirm;
        }

        res = await fetch('/api/admin/users', {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
            'x-user-id': currentUserId || '',
          },
          body: JSON.stringify(data),
        });
      }

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.error || 'Failed to update user');
      }

      const updated = await res.json();
      showNotification('User updated successfully', 'success');
      onUpdated?.(updated);
      onClose();
    } catch (err: unknown) {
      const maybe = err as {
        response?: { data?: unknown };
        message?: string;
      };
      if (maybe.response?.data) {
        const data = maybe.response.data as unknown;
        if (data && typeof data === 'object') {
          const dd = data as Record<string, unknown>;
          if (dd.data && typeof dd.data === 'object') {
            const fieldErrors = dd.data as Record<string, unknown>;
            if (fieldErrors.email)
              setEmailError(String(fieldErrors.email));
            if (fieldErrors.password)
              setPasswordError(String(fieldErrors.password));
            if (fieldErrors.profileImage)
              setFileError(String(fieldErrors.profileImage));
            setError(JSON.stringify(fieldErrors));
          } else {
            const maybeMsg =
              dd['message'] ?? dd['error'] ?? dd['detail'];
            if (maybeMsg) setError(String(maybeMsg));
            else setError(JSON.stringify(dd));
          }
        }
      } else setError(maybe.message ?? String(err));
      showNotification(maybe.message ?? String(err), 'error');
    } finally {
      setLoading(false);
    }
  };

  if (!open) return null;

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="bg-[#0b0b0b] border-[#2a0808]">
        <DialogHeader>
          <DialogTitle className="text-white">Update User</DialogTitle>
          <DialogDescription>
            Make changes to the user profile here. Click save when you're done.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={onSubmit} className="space-y-4">
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="name" className="text-right text-gray-300">
                Name
              </Label>
              <Input id="name" value={name} onChange={(e) => setName(e.target.value)} className="col-span-3 bg-[#0b0b0b] border-gray-800" />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="email" className="text-right text-gray-300">
                Email
              </Label>
              <Input id="email" value={email} onChange={(e) => setEmail(e.target.value)} className="col-span-3 bg-[#0b0b0b] border-gray-800" />
              {emailError && (
                <div className="col-start-2 col-span-3 text-xs text-yellow-300 mt-1">
                  {emailError}
                </div>
              )}
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="password" className="text-right text-gray-300">
                Password
              </Label>
              <Input id="password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} className="col-span-3 bg-[#0b0b0b] border-gray-800" />
              {passwordError ? (
                <div className="col-start-2 col-span-3 text-xs text-yellow-300 mt-1">
                  {passwordError}
                </div>
              ) : (
                <div className="col-start-2 col-span-3 text-xs text-gray-500 mt-1">
                  Password must be 8+ chars and include letters & numbers.
                </div>
              )}
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="passwordConfirm" className="text-right text-gray-300">
                Confirm Password
              </Label>
              <Input id="passwordConfirm" type="password" value={passwordConfirm} onChange={(e) => setPasswordConfirm(e.target.value)} className="col-span-3 bg-[#0b0b0b] border-gray-800" />
              {passwordConfirmError && (
                <div className="col-start-2 col-span-3 text-xs text-yellow-300 mt-1">
                  {passwordConfirmError}
                </div>
              )}
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="lastKnownLocation" className="text-right text-gray-300">
                Last Known Location
              </Label>
              <Input id="lastKnownLocation" value={lastKnownLocation} onChange={(e) => setLastKnownLocation(e.target.value)} className="col-span-3 bg-[#0b0b0b] border-gray-800" />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <div className="col-start-2 col-span-3 flex items-center gap-2">
                <Checkbox id="isAdminUpdate" checked={isAdmin} onCheckedChange={(val) => setIsAdmin(Boolean(val))} />
                <Label htmlFor="isAdminUpdate" className="text-gray-300">Admin</Label>
              </div>
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="profileImage" className="text-right text-gray-300">
                Profile Image
              </Label>
              <div className="col-span-3 flex items-center gap-4">
                {previewUrl ? (
                  <Image src={previewUrl} alt="preview" width={80} height={80} className="rounded-full object-cover" unoptimized />
                ) : (
                  <div className="w-20 h-20 rounded-full bg-[#0b0b0b] flex items-center justify-center text-gray-400 font-bold">RE</div>
                )}
                <Input id="profileImage" type="file" onChange={onFileChange} className="bg-[#0b0b0b] border-gray-800" />
              </div>
              {fileError && (
                <div className="col-start-2 col-span-3 text-xs text-yellow-300 mt-1">
                  {fileError}
                </div>
              )}
            </div>
          </div>
          {error && (
            <div className="text-sm text-yellow-300 mb-2">
              {error}
            </div>
          )}
          <DialogFooter>
            <Button type="button" onClick={onClose} variant="outline">Cancel</Button>
            <Button type="submit" className="bg-gradient-to-b from-rose-700 to-rose-900 text-white">Update User</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
