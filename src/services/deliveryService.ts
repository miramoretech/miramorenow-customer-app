// src/services/deliveryService.ts

interface AddressSuggestion {
  placeId: string;
  description: string;
  mainText: string;
  secondaryText: string;
}

interface AddressDetails {
  formattedAddress: string;
  street: string;
  city: string;
  state: string;
  postalCode: string;
  country: string;
  latitude: number;
  longitude: number;
  placeId: string;
}

// Lagos delivery zones and fees
const DELIVERY_ZONES = [
  { name: "Ikeja", fee: 1500, minOrder: 0, coordinates: { lat: 6.6018, lng: 3.3515 } },
  { name: "Lekki", fee: 2000, minOrder: 0, coordinates: { lat: 6.4765, lng: 3.9815 } },
  { name: "Victoria Island", fee: 2500, minOrder: 0, coordinates: { lat: 6.4294, lng: 3.4214 } },
  { name: "Ajah", fee: 2500, minOrder: 0, coordinates: { lat: 6.4733, lng: 3.5569 } },
  { name: "Yaba", fee: 1500, minOrder: 0, coordinates: { lat: 6.4986, lng: 3.3932 } },
  { name: "GRA", fee: 1500, minOrder: 0, coordinates: { lat: 6.5867, lng: 3.3681 } },
  { name: "Surulere", fee: 1500, minOrder: 0, coordinates: { lat: 6.5049, lng: 3.3514 } },
  { name: "Maryland", fee: 1500, minOrder: 0, coordinates: { lat: 6.5884, lng: 3.3588 } },
];

// Check if promo is active (FREEMEAL promo)
const isPromoActive = () => {
  const promoActive = localStorage.getItem("promo_free_meal_active");
  // Check if promo is still valid (you can set expiry date)
  const promoExpiry = localStorage.getItem("promo_expiry");
  if (promoExpiry && new Date(promoExpiry) < new Date()) {
    localStorage.removeItem("promo_free_meal_active");
    return false;
  }
  return promoActive === "true";
};

// Calculate delivery fee based on address
export const calculateDeliveryFee = async (
  addressDetails: AddressDetails | null,
  subtotal: number = 0
): Promise<{ fee: number; isFree: boolean; zone: string | null }> => {
  // Check if promo is active
  if (isPromoActive()) {
    return { fee: 0, isFree: true, zone: null };
  }

  if (!addressDetails) {
    return { fee: 1500, isFree: false, zone: null };
  }

  // Find matching delivery zone
  let matchedZone = null;
  let fee = 1500; // default fee

  // Simple matching based on city/area name
  const addressLower = addressDetails.formattedAddress.toLowerCase();
  for (const zone of DELIVERY_ZONES) {
    if (addressLower.includes(zone.name.toLowerCase())) {
      matchedZone = zone.name;
      fee = zone.fee;
      break;
    }
  }

  // Free delivery for orders above ₦10,000 (optional)
  if (subtotal > 10000 && !isPromoActive()) {
    fee = 0;
    return { fee: 0, isFree: true, zone: matchedZone };
  }

  return { fee, isFree: fee === 0, zone: matchedZone };
};

// Format address for display
export const formatAddress = (addressDetails: AddressDetails | null): string => {
  if (!addressDetails) return "No address selected";
  return addressDetails.formattedAddress;
};

// Save address to localStorage for persistence
export const saveDeliveryAddress = (address: AddressDetails | null) => {
  if (address) {
    localStorage.setItem("delivery_address", JSON.stringify(address));
  } else {
    localStorage.removeItem("delivery_address");
  }
};

// Load saved address from localStorage
export const loadSavedAddress = (): AddressDetails | null => {
  const saved = localStorage.getItem("delivery_address");
  if (saved) {
    try {
      return JSON.parse(saved);
    } catch {
      return null;
    }
  }
  return null;
};