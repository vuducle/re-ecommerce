
'use client';

import { Button } from './ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from './ui/dialog';
import { Product } from '../lib/pocketbase';

type Props = {
  open: boolean;
  onClose: () => void;
  onConfirm: () => void;
  product: Product | null;
};

export default function DeleteProductDialog({
  open,
  onClose,
  onConfirm,
  product,
}: Props) {
  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="bg-[#0b0b0b] border-[#2a0808]">
        <DialogHeader>
          <DialogTitle className="text-white">Delete Product</DialogTitle>
          <DialogDescription className="text-gray-400">
            Are you sure you want to delete the product "{product?.name}"? This
            action cannot be undone.
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <Button onClick={onClose} variant="outline">
            Cancel
          </Button>
          <Button
            onClick={onConfirm}
            className="bg-gradient-to-b from-[#8b0f0f] to-[#310000] text-white border border-[#2a0000] shadow-[0_6px_0_rgba(0,0,0,0.65)] hover:from-[#a21a1a] hover:to-[#5a0000] active:translate-y-0.5"
          >
            Delete
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
