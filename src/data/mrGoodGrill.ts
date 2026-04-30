import type { Product } from "@/components/ProductCard";
import spicyCatfishImg from "@/assets/products/spicy-grilled-catfish.png";
import pepperedCroakerImg from "@/assets/products/peppered-croaker-fish.png";
import bigGrillCatfishImg from "@/assets/products/big-grill-catfish.png";

export const VENDOR_NAME = "Mr. Good Grill Resto";

export const softLifeDescriptionsMGG: Record<string, string> = {
  "mgg-catfish-deluxe": "Hot, smoky and fully loaded grilled catfish, served with creamy coleslaw, crispy chips, fresh cucumber and rich pepper sauce. A full premium grill experience in one plate.",
  "mgg-croaker-platter": "Well-spiced croaker fish grilled to perfection, plated with sweet fried plantain, fresh cucumber, creamy coleslaw and signature pepper sauce. Rich, bold and satisfying.",
  "mgg-catfish-combo": "Juicy grilled catfish served hot with crispy chips, sweet plantain and flavorful sauce. A perfect balance of smoky, sweet and spicy.",
};

export const mrGoodGrillProducts: Product[] = [
  {
    id: "mgg-catfish-deluxe",
    name: "🔥 Spicy Grilled Catfish Deluxe",
    description: "Grilled catfish with coleslaw, chips, cucumber & pepper sauce",
    price: 22500,
    image: spicyCatfishImg,
    vendor: VENDOR_NAME,
    category: "food",
  },
  {
    id: "mgg-croaker-platter",
    name: "🐟 Peppered Grilled Croaker Fish Platter",
    description: "Grilled croaker with plantain, cucumber, coleslaw & pepper sauce",
    price: 25000,
    image: pepperedCroakerImg,
    vendor: VENDOR_NAME,
    category: "food",
  },
  {
    id: "mgg-catfish-combo",
    name: "🍗 Big Grill Catfish with Plantain & Chips",
    description: "Grilled catfish with crispy chips, sweet plantain & sauce",
    price: 15000,
    image: bigGrillCatfishImg,
    vendor: VENDOR_NAME,
    category: "food",
  },
];
