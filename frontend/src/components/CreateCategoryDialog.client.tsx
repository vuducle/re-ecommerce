import { useState, useMemo } from 'react';
import { Button } from './ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from './ui/dialog';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Textarea } from './ui/textarea';
import { useNotification } from '../context/NotificationContext';
import { useSelector } from 'react-redux';
import { RootState } from '../store';
import { pb } from '../lib/pocketbase';
import Image from 'next/image';

type Props = {
  open: boolean;
  onClose: () => void;
  onCreated: (category: Record<string, unknown>) => void;
};

export default function CreateCategoryDialog({ open, onClose, onCreated }: Props) {
  const [name, setName] = useState('');
  const [slug, setSlug] = useState('');
  const [description, setDescription] = useState('');
  const [image, setImage] = useState<File | null>(null);
  const { showNotification } = useNotification();
  const { token } = useSelector((state: RootState) => state.auth);

  const previewUrl = useMemo(() => {
    if (!image) return null;
    return URL.createObjectURL(image);
  }, [image]);

  const handleSubmit = async () => {
    if (!token) {
      showNotification('You must be logged in to create a category', 'error');
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
      const res = await pb.post('/api/collections/categories/records', formData, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      const newCategory = res.data;
      showNotification('Category created successfully', 'success');
      onCreated(newCategory);
      onClose();
    } catch (err: any) {
      const msg = err.response?.data?.message || err.message || 'Failed to create category';
      showNotification(msg, 'error');
    }
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="bg-[#0b0b0b] border-[#2a0808]">
        <DialogHeader>
          <DialogTitle className="text-white">Create Category</DialogTitle>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="name" className="text-right text-gray-300">
              Name
            </Label>
            <Input id="name" value={name} onChange={(e) => setName(e.target.value)} className="col-span-3 bg-[#0b0b0b] border-gray-800" />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="slug" className="text-right text-gray-300">
              Slug
            </Label>
            <Input id="slug" value={slug} onChange={(e) => setSlug(e.target.value)} className="col-span-3 bg-[#0b0b0b] border-gray-800" />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="description" className="text-right text-gray-300">
              Description
            </Label>
            <Textarea id="description" value={description} onChange={(e) => setDescription(e.target.value)} className="col-span-3 bg-[#0b0b0b] border-gray-800" />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="image" className="text-right text-gray-300">
              Image
            </Label>
            <Input id="image" type="file" onChange={(e) => setImage(e.target.files?.[0] || null)} className="col-span-3 bg-[#0b0b0b] border-gray-800" />
          </div>
          {previewUrl && (
            <div className="grid grid-cols-4 items-center gap-4">
              <div className="col-start-2 col-span-3">
                <Image src={previewUrl} alt="Image preview" width={100} height={100} className="rounded-lg object-cover" />
              </div>
            </div>
          )}
        </div>
        <DialogFooter>
          <Button onClick={onClose} variant="outline">Cancel</Button>
          <Button onClick={handleSubmit} className="bg-gradient-to-b from-rose-700 to-rose-900 text-white">Create</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}