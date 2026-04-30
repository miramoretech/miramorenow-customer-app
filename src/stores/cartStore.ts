import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { Product } from "@/components/ProductCard";

export interface CartItem {
  product: Product;
  quantity: number;
  note: string;
  size?: string;      // ✅ Added: size name (e.g., "1kg", "Large")
  sizeId?: string;    // ✅ Added: variation ID for unique identification
  addons?: {          // ✅ Added: for proteins, packaging etc.
    proteins?: any[];
    packaging?: any;
  };
}

interface CartState {
  items: CartItem[];
  deliveryMode: "delivery" | "pickup";
  globalNote: string;
  addItem: (product: Product, quantity?: number, size?: string, sizeId?: string, addons?: any) => void;
  removeItem: (productId: string, sizeId?: string) => void;
  updateQuantity: (productId: string, quantity: number, sizeId?: string) => void;
  updateItemNote: (productId: string, note: string, sizeId?: string) => void;
  setDeliveryMode: (mode: "delivery" | "pickup") => void;
  setGlobalNote: (note: string) => void;
  clearCart: () => void;
  totalItems: () => number;
  subtotal: () => number;
}

export const useCartStore = create<CartState>()(
  persist(
    (set, get) => ({
      items: [],
      deliveryMode: "delivery",
      globalNote: "",
      
      addItem: (product, quantity = 1, size = "", sizeId = "", addons = {}) =>
        set((state) => {
          // Check if item with same product ID AND same size ID already exists
          const existingIndex = state.items.findIndex(
            (i) => i.product.id === product.id && i.sizeId === sizeId
          );
          
          if (existingIndex !== -1) {
            // Update quantity of existing item
            const updatedItems = [...state.items];
            updatedItems[existingIndex].quantity += quantity;
            return { items: updatedItems };
          }
          
          // Add new item
          return {
            items: [...state.items, { 
              product, 
              quantity, 
              note: "", 
              size, 
              sizeId,
              addons 
            }],
          };
        }),
        
      removeItem: (productId, sizeId) =>
        set((state) => ({
          items: state.items.filter(
            (i) => !(i.product.id === productId && i.sizeId === sizeId)
          ),
        })),
        
      updateQuantity: (productId, quantity, sizeId) =>
        set((state) => ({
          items: quantity <= 0
            ? state.items.filter((i) => !(i.product.id === productId && i.sizeId === sizeId))
            : state.items.map((i) =>
                i.product.id === productId && i.sizeId === sizeId 
                  ? { ...i, quantity } 
                  : i
              ),
        })),
        
      updateItemNote: (productId, note, sizeId) =>
        set((state) => ({
          items: state.items.map((i) =>
            i.product.id === productId && i.sizeId === sizeId 
              ? { ...i, note } 
              : i
          ),
        })),
        
      setDeliveryMode: (mode) => set({ deliveryMode: mode }),
      setGlobalNote: (note) => set({ globalNote: note }),
      clearCart: () => set({ items: [], globalNote: "" }),
      
      totalItems: () => get().items.reduce((sum, i) => sum + i.quantity, 0),
      
      subtotal: () => get().items.reduce((sum, i) => sum + i.product.price * i.quantity, 0),
    }),
    { name: "miramore-cart" }
  )
);