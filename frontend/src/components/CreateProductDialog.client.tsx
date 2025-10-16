import { useState, useEffect, useMemo } from 'react';
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
import { pb, getCategories, Category } from '../lib/pocketbase';
import Image from 'next/image';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from './ui/select';
import { Checkbox } from './ui/checkbox';

type Props = {
  open: boolean;
  onClose: () => void;
  onCreated: (product: Record<string, unknown>) => void;
};

export default function CreateProductDialog({
  open,
  onClose,
  onCreated,
}: Props) {
  const [name, setName] = useState('');
  const [slug, setSlug] = useState('');
  const [description, setDescription] = useState('');
  const [price, setPrice] = useState('');
  const [stock, setStock] = useState('');
  const [categoryId, setCategoryId] = useState('');
  const [images, setImages] = useState<File[]>([]);
  const [isAvailable, setIsAvailable] = useState(true);
  const [isFeatured, setIsFeatured] = useState(false);
  const [categories, setCategories] = useState<Category[]>([]);
  const { showNotification } = useNotification();
  const { token } = useSelector((state: RootState) => state.auth);

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await getCategories();
        setCategories(response.items);
      } catch (error) {
        showNotification('Failed to fetch categories', 'error');
      }
    };

    if (open) {
      fetchCategories();
    }
  }, [open, showNotification]);

  const previewUrls = useMemo(() => {
    if (!images.length) return [];
    return images.map(URL.createObjectURL);
  }, [images]);

  const handleSubmit = async () => {
    if (!token) {
      showNotification(
        'You must be logged in to create a product',
        'error'
      );
      return;
    }

    const formData = new FormData();
    formData.append('name', name);
    formData.append('slug', slug);
    formData.append('description', description);
    formData.append('price', price);
    formData.append('stock', stock);
    formData.append('category', categoryId);
    formData.append('isAvailable', String(isAvailable));
    formData.append('isFeatured', String(isFeatured));
    images.forEach((image) => {
      formData.append('images', image);
    });

    try {
      const res = await pb.post(
        '/api/collections/products/records',
        formData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      const newProduct = res.data;
      showNotification('Product created successfully', 'success');
      onCreated(newProduct);
      onClose();
    } catch (err: unknown) {
      // using import('axios').AxiosError avoids adding a top-level import
      const axiosErr = err as import('axios').AxiosError<{
        message?: string;
      }>;
      const msg =
        axiosErr.response?.data?.message ||
        axiosErr.message ||
        'Failed to create product';
      showNotification(msg, 'error');
    }
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="bg-[#0b0b0b] border-[#2a0808]">
        <DialogHeader>
          <DialogTitle className="text-white">
            Create Product
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
              htmlFor="price"
              className="text-right text-gray-300"
            >
              Price
            </Label>
            <Input
              id="price"
              type="text"
              value={
                price
                  ? new Intl.NumberFormat('vi-VN', {
                      style: 'currency',
                      currency: 'VND',
                      maximumFractionDigits: 0,
                    }).format(Number(price))
                  : ''
              }
              onChange={(e) => {
                // keep only digits in the stored value
                const digits = e.target.value.replace(/\D/g, '');
                setPrice(digits);
              }}
              className="col-span-3 bg-[#0b0b0b] border-gray-800"
            />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label
              htmlFor="stock"
              className="text-right text-gray-300"
            >
              Stock
            </Label>
            <Input
              id="stock"
              type="number"
              value={stock}
              onChange={(e) => setStock(e.target.value)}
              className="col-span-3 bg-[#0b0b0b] border-gray-800"
            />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label
              htmlFor="category"
              className="text-right text-gray-300"
            >
              Category
            </Label>
            <Select onValueChange={setCategoryId} value={categoryId}>
              <SelectTrigger className="col-span-3 bg-[#0b0b0b] border-gray-800">
                <SelectValue placeholder="Select a category" />
              </SelectTrigger>
              <SelectContent className="bg-[#0b0b0b] border-[#2a0808] text-white">
                {categories.map((category) => (
                  <SelectItem key={category.id} value={category.id}>
                    {category.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label
              htmlFor="images"
              className="text-right text-gray-300"
            >
              Images
            </Label>
            <Input
              id="images"
              type="file"
              multiple
              onChange={(e) =>
                setImages(Array.from(e.target.files || []))
              }
              className="col-span-3 bg-[#0b0b0b] border-gray-800"
            />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <div className="col-start-2 col-span-3 flex items-center gap-4">
              <Checkbox
                id="isAvailable"
                checked={isAvailable}
                onCheckedChange={(checked) =>
                  setIsAvailable(Boolean(checked))
                }
              />
              <Label htmlFor="isAvailable" className="text-gray-300">
                Is Available
              </Label>
            </div>
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <div className="col-start-2 col-span-3 flex items-center gap-4">
              <Checkbox
                id="isFeatured"
                checked={isFeatured}
                onCheckedChange={(checked) =>
                  setIsFeatured(Boolean(checked))
                }
              />
              <Label htmlFor="isFeatured" className="text-gray-300">
                Is Featured
              </Label>
            </div>
          </div>
          {previewUrls.length > 0 && (
            <div className="grid grid-cols-4 items-center gap-4">
              <div className="col-start-2 col-span-3 flex flex-wrap gap-2">
                {previewUrls.map((url, index) => (
                  <Image
                    key={index}
                    src={url}
                    alt={`Image preview ${index + 1}`}
                    width={100}
                    height={100}
                    className="rounded-lg object-cover"
                  />
                ))}
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
            Create
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
