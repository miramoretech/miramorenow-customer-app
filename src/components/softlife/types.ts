import type { Product } from "@/components/ProductCard";

export interface GiftRecipient {
  name: string;
  phone: string;
  relationship: string;
  occasion: string;
}

export interface GiftCartItem {
  product: Product;
  quantity: number;
}

export type SoftLifeStep = "form" | "menu" | "voice" | "payment" | "success";
export type PaymentMode = "full" | "assist";
