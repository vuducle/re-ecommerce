'use client';

import { useState, useEffect } from 'react';
import { Button } from './ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from './ui/dialog';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Textarea } from './ui/textarea';
import { useNotification } from '../context/NotificationContext';
import { useSelector } from 'react-redux';
import { RootState } from '../store';
import Image from 'next/image';
import { pb } from '../lib/pocketbase';
import { isAxiosError } from 'axios';

type Category = {
  id: string;
  name: string;
  slug: string;
  imageUrl?: string | null;
  description?: string;
};

type Props = {
  open: boolean;
  onClose: () => void;
  onUpdated: (category: Record<string, unknown>) => void;
  category: Category | null;
};

export default function UpdateCategoryDialog({
  open,
  onClose,
  onUpdated,
  category,
}: Props) {
  const [name, setName] = useState<string>('');
  const [slug, setSlug] = useState<string>('');
  const [description, setDescription] = useState<string>('');
  const [image, setImage] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const { showNotification } = useNotification();
  const { token } = useSelector((state: RootState) => state.auth);

  useEffect(() => {
    if (category) {
      setName(category.name);
      setSlug(category.slug);
      setDescription(category.description || '');
      setPreviewUrl(category.imageUrl || null);
    }
  }, [category]);

  const handleImageChange = (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = e.target.files?.[0];
    if (file) {
      setImage(file);
      setPreviewUrl(URL.createObjectURL(file));
    } else {
      setImage(null);
      setPreviewUrl(category?.imageUrl || null);
    }
  };

  const handleSubmit = async () => {
    if (!category || !token) {
      showNotification(
        'You must be logged in to update a category',
        'error'
      );
      return;
    }

    const formData = new FormData();
    formData.append('name', name);
    formData.append('slug', slug);
    formData.append('description', description);
    if (image) {
      formData.append('image', image);
    }

    try {
      const res = await pb.patch(
        `/api/collections/categories/records/${category.id}`,
        formData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      const updatedCategory = res.data;
      showNotification('Category updated successfully', 'success');
      onUpdated(updatedCategory);
      onClose();
    } catch (err) {
      let msg = 'Failed to update category';
      if (isAxiosError(err) && err.response?.data?.message) {
        msg = err.response.data.message;
      } else if (err instanceof Error) {
        msg = err.message;
      }
      showNotification(msg, 'error');
    }
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="bg-[#0b0b0b] border-[#2a0808]">
        <DialogHeader>
          <DialogTitle className="text-white">
            Update Category
          </DialogTitle>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-4 items-center gap-4">
            <Label
              htmlFor="name"
              className="text-right text-gray-300"
            >
              Name
            </Label>
            <Input
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="col-span-3 bg-[#0b0b0b] border-gray-800"
            />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label
              htmlFor="slug"
              className="text-right text-gray-300"
            >
              Slug
            </Label>
            <Input
              id="slug"
              value={slug}
              onChange={(e) => setSlug(e.target.value)}
              className="col-span-3 bg-[#0b0b0b] border-gray-800"
            />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label
              htmlFor="description"
              className="text-right text-gray-300"
            >
              Description
            </Label>
            <Textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="col-span-3 bg-[#0b0b0b] border-gray-800"
            />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label
              htmlFor="image"
              className="text-right text-gray-300"
            >
              Image
            </Label>
            <Input
              id="image"
              type="file"
              onChange={handleImageChange}
              className="col-span-3 bg-[#0b0b0b] border-gray-800"
            />
          </div>
          {previewUrl && (
            <div className="grid grid-cols-4 items-center gap-4">
              <div className="col-start-2 col-span-3">
                <Image
                  src={previewUrl}
                  alt="Image preview"
                  width={100}
                  height={100}
                  className="rounded-lg object-cover"
                />
              </div>
            </div>
          )}
        </div>
        <DialogFooter>
          <Button onClick={onClose} variant="outline">
            Cancel
          </Button>
          <Button
            onClick={handleSubmit}
            className="bg-gradient-to-b from-rose-700 to-rose-900 text-white"
          >
            Update
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
