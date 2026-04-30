// Lagos zone-based delivery pricing – no external API needed

export type Zone = "mainland" | "island" | "extended" | "greater_lagos" | "unknown";

const ISLAND_KEYWORDS = [
  "lekki", "ajah", "chevron", "victoria island", "vi", "ikoyi",
  "sangotedo", "badore", "epe", "ikota", "vgc", "agungi",
  "osapa", "jakande", "ilasan", "oniru", "banana island",
  "abraham adesanya", "badore", "lekki phase 1", "lekki phase 2",
  "ibeju-lekki", "ibeju lekki", "awoyaya", "lakowe", "eleko",
];

const MAINLAND_KEYWORDS = [
  "ikeja", "ogba", "ojodu", "agege", "maryland", "yaba", "surulere",
  "mushin", "oshodi", "ketu", "ogudu", "gbagada", "magodo", "berger",
  "ojota", "ilupeju", "palmgrove", "bariga", "somolu", "anthony",
  "opebi", "allen", "oregun", "alausa", "isheri",
  "apapa", "ajegunle", "festac", "satellite town", "ojo", "alaba", "okokomaiko",
  "alimosho", "egbeda", "idimu", "ikotun", "abule egba",
];

const EXTENDED_KEYWORDS = [
  "ikorodu", "igbogbo", "agric", "epe",
];

const GREATER_LAGOS_KEYWORDS = [
  "sango ota", "sango", "ota", "ijoko", "ewekoro", "ibafo", "mowe", "arepo", "magboro",
];

// Near zones relative to vendor locations
const IKEJA_NEAR = ["ikeja", "ogba", "ojodu", "agege", "alausa", "opebi", "allen", "oregun"];
const AJAH_NEAR = ["ajah", "sangotedo", "badore", "ikota", "vgc", "abraham adesanya"];
const AJAH_MID = ["lekki", "chevron", "agungi", "osapa", "jakande", "ilasan", "lekki phase 1", "lekki phase 2"];
const AJAH_FAR = ["victoria island", "vi", "ikoyi", "oniru", "banana island"];

export const LAGOS_AREAS = [
  // Lagos Island / High-Income
  "Victoria Island", "Ikoyi", "Lekki Phase 1", "Lekki Phase 2", "Oniru",
  "Chevron", "Ajah", "Sangotedo", "Abraham Adesanya", "Badore",
  "Osapa London", "Agungi",
  // Mainland Core
  "Ikeja", "Maryland", "Ojodu", "Berger", "Yaba", "Surulere",
  "Mushin", "Oshodi", "Somolu", "Bariga",
  "Ogba", "Ketu", "Ogudu", "Gbagada", "Magodo",
  "Ojota", "Ilupeju", "Palmgrove", "Anthony",
  "Opebi", "Allen", "Oregun", "Alausa", "Isheri",
  // High-Density / Commercial
  "Apapa", "Ajegunle", "Festac", "Satellite Town", "Ojo", "Alaba", "Okokomaiko",
  // Extended Lagos
  "Ikorodu", "Igbogbo", "Agric", "Epe",
  "Alimosho", "Egbeda", "Idimu", "Ikotun", "Agege", "Abule Egba",
  // Fast-Growing Corridors
  "Ibeju-Lekki", "Awoyaya", "Lakowe", "Eleko",
  // Greater Lagos (Ogun Axis)
  "Sango Ota", "Ota", "Ijoko", "Ewekoro", "Ibafo", "Mowe", "Arepo", "Magboro",
  // Others
  "Ikota", "VGC", "Jakande", "Ilasan", "Banana Island",
];

export function detectZone(location: string): Zone {
  const loc = location.toLowerCase().trim();
  if (GREATER_LAGOS_KEYWORDS.some((k) => loc.includes(k))) return "greater_lagos";
  if (EXTENDED_KEYWORDS.some((k) => loc.includes(k))) return "extended";
  if (ISLAND_KEYWORDS.some((k) => loc.includes(k))) return "island";
  if (MAINLAND_KEYWORDS.some((k) => loc.includes(k))) return "mainland";
  return "unknown";
}

function matchesAny(loc: string, keywords: string[]) {
  return keywords.some((k) => loc.includes(k));
}

// Vendor location: "Yoghurt_Arcade" → Ikeja (Mainland)
// Vendor location: "Cravings by K.O.L" → Ajah (Island)
export function getVendorZone(vendorName: string): Zone {
  if (vendorName.includes("K.O.L") || vendorName.includes("Cravings")) return "island";
  if (vendorName.includes("Yoghurt_Arcade") || vendorName.includes("Chillsthrillz")) return "mainland";
  if (vendorName.includes("Effa")) return "island";
  if (vendorName.includes("Mr. Good Grill")) return "island";
  if (vendorName.includes("Amala Oriki")) return "island";
  return "mainland";
}

const DELIVERY_SURCHARGE = 1000;

export function calculateDeliveryFee(
  userLocation: string,
  vendorName: string,
): { fee: number; zone: Zone; vendorZone: Zone } {
  const loc = userLocation.toLowerCase().trim();
  const userZone = detectZone(userLocation);
  const vendorZone = getVendorZone(vendorName);

  // Greater Lagos / Extended always pay more
  if (userZone === "greater_lagos") {
    return { fee: 6000 + DELIVERY_SURCHARGE, zone: userZone, vendorZone };
  }
  if (userZone === "extended") {
    return { fee: 4500 + DELIVERY_SURCHARGE, zone: userZone, vendorZone };
  }

  // Parfait vendor – Ikeja (Mainland)
  if (vendorZone === "mainland") {
    if (userZone === "island") return { fee: 5000 + DELIVERY_SURCHARGE, zone: userZone, vendorZone };
    if (matchesAny(loc, IKEJA_NEAR)) return { fee: 1500 + DELIVERY_SURCHARGE, zone: userZone, vendorZone };
    if (userZone === "mainland") return { fee: 2000 + DELIVERY_SURCHARGE, zone: userZone, vendorZone };
    return { fee: 2500 + DELIVERY_SURCHARGE, zone: "unknown", vendorZone };
  }

  // Island-based vendors
  if (vendorZone === "island") {
    if (userZone === "mainland") return { fee: 5000 + DELIVERY_SURCHARGE, zone: userZone, vendorZone };
    if (matchesAny(loc, AJAH_NEAR)) return { fee: 1500 + DELIVERY_SURCHARGE, zone: userZone, vendorZone };
    if (matchesAny(loc, AJAH_MID)) return { fee: 2000 + DELIVERY_SURCHARGE, zone: userZone, vendorZone };
    if (matchesAny(loc, AJAH_FAR)) return { fee: 2500 + DELIVERY_SURCHARGE, zone: userZone, vendorZone };
    if (loc.includes("epe")) return { fee: 3500 + DELIVERY_SURCHARGE, zone: userZone, vendorZone };
    if (userZone === "island") return { fee: 2000 + DELIVERY_SURCHARGE, zone: userZone, vendorZone };
    return { fee: 2500 + DELIVERY_SURCHARGE, zone: "unknown", vendorZone };
  }

  return { fee: 2500 + DELIVERY_SURCHARGE, zone: userZone, vendorZone };
}

// Get best delivery fee across all vendors in cart
export function calculateCartDeliveryFee(
  userLocation: string,
  vendorNames: string[],
): number {
  if (!userLocation || vendorNames.length === 0) return 2500 + DELIVERY_SURCHARGE;
  const uniqueVendors = [...new Set(vendorNames)];
  return Math.max(...uniqueVendors.map((v) => calculateDeliveryFee(userLocation, v).fee));
}
