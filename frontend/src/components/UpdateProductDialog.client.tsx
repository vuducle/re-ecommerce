'use client';

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
import {
  pb,
  getCategories,
  Category,
  Product,
} from '../lib/pocketbase';
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
  onUpdated: (product: Record<string, unknown>) => void;
  product: (Product & { categoryId?: string }) | null;
};

export default function UpdateProductDialog({
  open,
  onClose,
  onUpdated,
  product,
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
  const [previewUrls, setPreviewUrls] = useState<string[]>([]);

  const { showNotification } = useNotification();
  const { token } = useSelector((state: RootState) => state.auth);

  useEffect(() => {
    if (product) {
      setName(product.name || '');
      setSlug(product.slug || '');
      setDescription(product.description || '');
      setPrice(String(product.price || ''));
      setStock(String(product.stock || ''));
      setCategoryId(product.categoryId || '');
      setIsAvailable(product.isAvailable || false);
      setIsFeatured(product.isFeatured || false);
      setPreviewUrls(product.images || []);
    }
  }, [product]);

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

  const handleImageChange = (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const files = Array.from(e.target.files || []);
    setImages(files);
    const newPreviewUrls = files.map(URL.createObjectURL);
    setPreviewUrls(newPreviewUrls);
  };

  const handleSubmit = async () => {
    if (!product || !token) {
      showNotification(
        'You must be logged in to update a product',
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
      const res = await pb.patch(
        `/api/collections/products/records/${product.id}`,
        formData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      const updatedProduct = res.data;
      showNotification('Product updated successfully', 'success');
      onUpdated(updatedProduct);
      onClose();
    } catch (err: any) {
      const msg =
        err.response?.data?.message ||
        err.message ||
        'Failed to update product';
      showNotification(msg, 'error');
    }
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="bg-[#0b0b0b] border-[#2a0808]">
        <DialogHeader>
          <DialogTitle className="text-white">
            Update Product
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
              type="number"
              value={price}
              onChange={(e) => setPrice(e.target.value)}
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
              onChange={handleImageChange}
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
            Update
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
