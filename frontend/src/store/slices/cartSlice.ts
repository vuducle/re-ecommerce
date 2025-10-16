import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { Product } from '@/lib/pocketbase';

export interface CartItem {
  product: Product;
  quantity: number;
}

export interface CartState {
  items: Record<string, CartItem>;
}

const initialState: CartState = {
  items: {},
};

const cartSlice = createSlice({
  name: 'cart',
  initialState,
  reducers: {
    addItem: (state, action: PayloadAction<Product>) => {
      const product = action.payload;
      const existingItem = state.items[product.id];
      if (existingItem) {
        existingItem.quantity++;
      } else {
        state.items[product.id] = { product, quantity: 1 };
      }
    },
    removeItem: (state, action: PayloadAction<string>) => {
      const productId = action.payload;
      delete state.items[productId];
    },
    updateQuantity: (state, action: PayloadAction<{ id: string; quantity: number }>) => {
      const { id, quantity } = action.payload;
      const item = state.items[id];
      if (item) {
        if (quantity <= 0) {
          delete state.items[id];
        } else {
          item.quantity = quantity;
        }
      }
    },
    clearCart: (state) => {
      state.items = {};
    },
  },
});

export const { addItem, removeItem, updateQuantity, clearCart } = cartSlice.actions;
export default cartSlice.reducer;
