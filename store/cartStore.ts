// store/cartStore.ts
import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface CartItem {
  id: string;
  name: string;
  price: number;
  image: string;
  quantity: number;
}

interface CartState {
  items: CartItem[];
  addItem: (item: CartItem) => void;
  removeItem: (id: string) => void;
  clearCart: () => void;
}

export const useCartStore = create<CartState>()(
  persist(
    (set) => ({
      items: [],
      addItem: (item) => set((state) => {
        const existingItem = state.items.find((i) => i.id === item.id);
        if (existingItem) {
          return {
            items: state.items.map((i) =>
              i.id === item.id
                ? { ...i, quantity: i.quantity + item.quantity }
                : i
            ),
          };
        }
        return { items: [...state.items, item] };
      }),
      removeItem: (id) => 
        set((state) => ({
          items: state.items.filter((item) => item.id !== id),
        })),
      clearCart: () => set({ items: [] }),
    }),
    {
      name: 'cart-storage',
      storage: {
        getItem: (name: string) => {
          const value = localStorage.getItem(name);
          return value ? JSON.parse(value) : null;
        },
        setItem: (name: string, value: { state: CartState; version?: number }) => {
          localStorage.setItem(name, JSON.stringify({
            state: value.state,
            version: value.version || 0
          }));
        },
        removeItem: (name: string) => {
          localStorage.removeItem(name);
        },
      },
    }
  )
);