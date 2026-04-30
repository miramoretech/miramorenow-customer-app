import type { VendorInfo } from "./products";
import chillsthrillzLogo from "@/assets/products/chillsthrillz-logo.png";
import effaLogo from "@/assets/products/effa-logo.jpg";
import kolLogo from "@/assets/products/cravings-kol-logo.png";
import amalaOrikiLogo from "@/assets/products/amala-oriki-logo.png";
import mrGoodGrillLogo from "@/assets/products/mr-good-grill-logo.png";

export const vendors: VendorInfo[] = [
  {
    id: "v-amala-oriki",
    name: "Amala Oriki",
    logo: amalaOrikiLogo,
    category: "food",
    subtitle: "...food that tells a story · African Cuisine",
    location: "Lekki, Lagos",
    deliveryTime: "30-45 min",
    rating: 4.9,
    popular: true,
    openTime: "09:00",
    closeTime: "23:00",
  },
  {
    id: "v-mr-good-grill",
    name: "Mr. Good Grill Resto",
    logo: mrGoodGrillLogo,
    category: "food",
    subtitle: "Premium Grills · Street Luxury · Fish Platters",
    location: "Lekki, Lagos",
    deliveryTime: "35-50 min",
    rating: 4.8,
    popular: true,
    openTime: "11:00",
    closeTime: "23:00",
  },
  {
    id: "v-chillsthrillz",
    name: "Yoghurt_Arcade",
    logo: chillsthrillzLogo,
    category: "food",
    subtitle: "Premium Parfaits & Greek Yoghurt",
    location: "Ikeja, Lagos",
    deliveryTime: "25-35 min",
    rating: 4.8,
    popular: true,
    openTime: "09:00",
    closeTime: "17:00",
  },
  {
    id: "v-kol",
    name: "Cravings by K.O.L",
    logo: kolLogo,
    category: "food",
    subtitle: "Food & Events · Shawarma · BBQ",
    location: "Ajah, Lagos",
    deliveryTime: "30-45 min",
    rating: 4.7,
    popular: true,
    openTime: "16:00",
    closeTime: "02:00",
  },
  {
    id: "v-effa",
    name: "Hair & Locs_by_Effa",
    logo: effaLogo,
    category: "beauty",
    subtitle: "Premium hair units & styling",
    location: "Lekki, Lagos",
    deliveryTime: "1-3 days",
    rating: 4.9,
    popular: true,
    openTime: "09:00",
    closeTime: "23:00",
  },
];

export const getVendorByName = (name: string) => vendors.find((v) => v.name === name);
export const getVendorsByCategory = (cat: "food" | "beauty") => vendors.filter((v) => v.category === cat);

export const isVendorOpen = (vendor: VendorInfo): boolean => {
  if (!vendor.openTime || !vendor.closeTime) return true;
  const now = new Date();
  const nigeriaTime = new Date(now.toLocaleString("en-US", { timeZone: "Africa/Lagos" }));
  const [openH, openM] = vendor.openTime.split(":").map(Number);
  const [closeH, closeM] = vendor.closeTime.split(":").map(Number);
  const currentMinutes = nigeriaTime.getHours() * 60 + nigeriaTime.getMinutes();
  const openMinutes = openH * 60 + openM;
  const closeMinutes = closeH * 60 + closeM;
  if (closeMinutes < openMinutes) {
    return currentMinutes >= openMinutes || currentMinutes < closeMinutes;
  }
  return currentMinutes >= openMinutes && currentMinutes < closeMinutes;
};
