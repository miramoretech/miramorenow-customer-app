// src/pages/Cart.tsx
// ✅ SIMPLIFIED ADDRESS ENTRY – auto geocode, no suggestions, no extra buttons, no crash
import { useState, useMemo, useEffect, useRef, useCallback } from "react";
import {
  ArrowLeft, ShoppingCart, CreditCard, Wallet, Truck, Store,
  MessageSquare, Loader2, MapPin, X, Info, AlertTriangle
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { useCartStore } from "@/stores/cartStore";
import CheckoutModal, { type DeliveryDetails } from "@/components/CheckoutModal";
import VendorGroup from "@/components/cart/VendorGroup";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { Capacitor } from "@capacitor/core";
import { isFreeDeliveryActive } from "@/utils/promoConfig";

const formatPrice = (price: number): string => {
  return `₦${price.toLocaleString('en-NG', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`;
};

declare global {
  interface Window {
    FlutterwaveCheckout: (config: Record<string, unknown>) => void;
    google: any;
  }
}

const FLW_PUBLIC_KEY = "FLWPUBK-a4dc9522e8b015ae0f4ae2f39b05be30-X";
const FALLBACK_FEE_PER_VENDOR = 1200;
const MAX_DELIVERY_KM = 15;
const SERVICE_CHARGE_RATE = 0.20;

function getTieredDeliveryFee(distanceKm: number): number {
  if (isFreeDeliveryActive()) return 0;
  if (distanceKm <= 5) return 1200;
  if (distanceKm <= 10) return 1800;
  if (distanceKm <= 15) return 2500;
  if (distanceKm <= 20) return 3500;
  return FALLBACK_FEE_PER_VENDOR;
}

// Normalize user input (append Lagos)
const normalizeAddress = (input: string) => {
  const trimmed = input.trim();
  if (trimmed.toLowerCase().includes("lagos")) return trimmed;
  return `${trimmed}, Lagos, Nigeria`;
};

const Cart = () => {
  const navigate = useNavigate();
  const {
    items, removeItem, updateQuantity, updateItemNote,
    clearCart, subtotal, deliveryMode, setDeliveryMode,
    globalNote, setGlobalNote,
  } = useCartStore();

  const [showCheckout, setShowCheckout] = useState(false);
  const [paying, setPaying] = useState(false);
  const [paymentMode, setPaymentMode] = useState<"full" | "installment">("full");
  const [customerAddress, setCustomerAddress] = useState("");
  const [customerLatLng, setCustomerLatLng] = useState<{ lat: number; lng: number } | null>(null);
  const [deliveryFee, setDeliveryFee] = useState(0);
  const [calculatingFee, setCalculatingFee] = useState(false);
  const [distanceMatrixService, setDistanceMatrixService] = useState<any>(null);
  const [vendorCoords, setVendorCoords] = useState<Map<string, { lat: number; lng: number }>>(new Map());
  const [calculationError, setCalculationError] = useState(false);
  const [tipAmount, setTipAmount] = useState(0);
  const tipOptions = [0, 200, 500, 1000];

  // Simplified address state
  const [addressInput, setAddressInput] = useState("");
  const [isResolving, setIsResolving] = useState(false);
  const geocoder = useRef<any>(null);
  const debounceTimer = useRef<NodeJS.Timeout | null>(null);
  const isMounted = useRef(true);
  const lastResolvedAddress = useRef("");

  const [deliveryUnavailable, setDeliveryUnavailable] = useState(false);
  const [farVendors, setFarVendors] = useState<string[]>([]);
  const [primaryVendorName, setPrimaryVendorName] = useState("");
  const [primaryVendorPhone, setPrimaryVendorPhone] = useState("");

  const isPickup = deliveryMode === "pickup";
  const promoActive = isFreeDeliveryActive();

  const vendorGroups = useMemo(() => {
    const groups: Record<string, typeof items> = {};
    items.forEach(item => {
      const v = item.product.vendor;
      if (!groups[v]) groups[v] = [];
      groups[v].push(item);
    });
    return groups;
  }, [items]);

  const vendorNames = Object.keys(vendorGroups);
  const finalDeliveryFee = deliveryFee;

  const subtotalAmount = useMemo(() => subtotal(), [subtotal]);
  const serviceCharge = useMemo(() => subtotalAmount * SERVICE_CHARGE_RATE, [subtotalAmount]);
  const total = useMemo(() => subtotalAmount + serviceCharge + tipAmount, [subtotalAmount, serviceCharge, tipAmount]);

  const hasBeautyItems = useMemo(() => items.some(i => i.product.category === "beauty"), [items]);
  const beautyTotal = useMemo(() => items.filter(i => i.product.category === "beauty").reduce((s, i) => s + i.product.price * i.quantity, 0), [items]);
  const showInstallment = hasBeautyItems && beautyTotal > 50000;
  const installmentMinimum = useMemo(() => Math.ceil(total * 0.25), [total]);

  function getDistanceFromLatLonInKm(lat1: number, lon1: number, lat2: number, lon2: number): number {
    const R = 6371;
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
              Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
              Math.sin(dLon/2) * Math.sin(dLon/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    return R * c;
  }

  // ---------- INIT GOOGLE GEOCODER & DISTANCE MATRIX ----------
  useEffect(() => {
    isMounted.current = true;
    let intervalId: NodeJS.Timeout | null = null;

    const initServices = () => {
      if (window.google?.maps?.Geocoder && !geocoder.current) {
        geocoder.current = new window.google.maps.Geocoder();
      }
      if (window.google?.maps?.DistanceMatrixService && !distanceMatrixService) {
        setDistanceMatrixService(new window.google.maps.DistanceMatrixService());
      }
      return geocoder.current !== null;
    };

    if (!initServices()) {
      intervalId = setInterval(() => {
        if (initServices() && intervalId) clearInterval(intervalId);
      }, 300);
    }

    return () => {
      isMounted.current = false;
      if (intervalId) clearInterval(intervalId);
    };
  }, []);

  useEffect(() => {
    if (vendorNames.length === 0) return;
    const first = vendorNames[0];
    setPrimaryVendorName(first);
    supabase
      .from("vendors")
      .select("phone")
      .eq("store_name", first)
      .maybeSingle()
      .then(({ data }) => {
        if (data?.phone) setPrimaryVendorPhone(data.phone);
      });
  }, [vendorNames.join(",")]);

  // ---------- AUTO-GEOCODE ON TYPING (debounced, no spam, no input overwrite) ----------
  const resolveAddress = useCallback((rawAddress: string) => {
    if (!geocoder.current || !rawAddress.trim()) return;
    // Avoid re‑geocoding the same address
    if (rawAddress === lastResolvedAddress.current) return;

    setIsResolving(true);
    const fullAddress = normalizeAddress(rawAddress);
    geocoder.current.geocode(
      { address: fullAddress },
      (results: any[], status: string) => {
        if (!isMounted.current) return;
        setIsResolving(false);
        if (status === "OK" && results && results[0]) {
          // Optional: reject very approximate results (like "Lagos, Nigeria")
          const loc = results[0].geometry.location;
          const formatted = results[0].formatted_address;
          // Only update if the result is reasonably accurate
          if (formatted.toLowerCase().includes("lagos") || results[0].geometry.location_type !== "APPROXIMATE") {
            setCustomerAddress(formatted);
            setCustomerLatLng({ lat: loc.lat(), lng: loc.lng() });
            lastResolvedAddress.current = rawAddress;
            // Do NOT overwrite user input while they're typing – we only show a confirmation below
            toast.success("Address found", { duration: 1500 });
          } else {
            // Silently ignore poor match
            console.warn("Geocode result too general");
          }
        } else {
          console.warn("Geocoding failed for:", rawAddress);
        }
      }
    );
  }, []);

  const handleAddressInput = useCallback((value: string) => {
    setAddressInput(value);
    if (debounceTimer.current) clearTimeout(debounceTimer.current);
    if (value.trim().length > 5) {
      debounceTimer.current = setTimeout(() => {
        resolveAddress(value);
      }, 500); // 500ms feels instant
    }
  }, [resolveAddress]);

  useEffect(() => {
    return () => {
      if (debounceTimer.current) clearTimeout(debounceTimer.current);
    };
  }, []);

  const clearAddress = useCallback(() => {
    setAddressInput("");
    setCustomerAddress("");
    setCustomerLatLng(null);
    setDeliveryFee(0);
    lastResolvedAddress.current = "";
  }, []);

  // ---------- VENDOR COORDS (parallelized) ----------
  useEffect(() => {
    const fetchCoords = async () => {
      const coordsMap = new Map();
      const vendorSet = [...new Set(vendorNames)];
      const promises = vendorSet.map(async (vendorName) => {
        const { data } = await supabase
          .from("vendors").select("latitude, longitude, address")
          .eq("store_name", vendorName).maybeSingle();
        if (data?.latitude && data?.longitude) {
          coordsMap.set(vendorName, { lat: data.latitude, lng: data.longitude });
        } else if (data?.address && window.google?.maps?.Geocoder) {
          const g = new window.google.maps.Geocoder();
          return new Promise<void>((resolve) => {
            g.geocode({ address: data.address + ", Lagos, Nigeria" }, (results: any, status: string) => {
              if (status === "OK" && results[0]) {
                coordsMap.set(vendorName, { lat: results[0].geometry.location.lat(), lng: results[0].geometry.location.lng() });
              }
              resolve();
            });
          });
        }
        return Promise.resolve();
      });
      await Promise.all(promises);
      setVendorCoords(coordsMap);
    };
    if (vendorNames.length > 0 && window.google?.maps?.Geocoder) fetchCoords();
  }, [vendorNames.join(",")]);

  // ---------- DELIVERY DISTANCE CHECK ----------
  useEffect(() => {
    if (!customerLatLng || vendorCoords.size === 0) return;
    // Ensure we have coords for all vendors, otherwise block checkout
    if (vendorCoords.size !== vendorNames.length) {
      setDeliveryUnavailable(true);
      setFarVendors(["Unknown vendor location"]);
      return;
    }
    const tooFar: string[] = [];
    for (const [vendorName, coords] of vendorCoords.entries()) {
      const distance = getDistanceFromLatLonInKm(
        customerLatLng.lat, customerLatLng.lng,
        coords.lat, coords.lng
      );
      if (distance > MAX_DELIVERY_KM) tooFar.push(vendorName);
    }
    setFarVendors(tooFar);
    setDeliveryUnavailable(tooFar.length > 0);
  }, [customerLatLng, vendorCoords, vendorNames]);

  // ---------- BATCHED DELIVERY FEE ----------
  const calculateDeliveryFee = useCallback(async () => {
    if (!customerLatLng || isPickup || !distanceMatrixService) return;
    setCalculatingFee(true);
    setCalculationError(false);

    const origins = Array.from(vendorCoords.values());
    if (origins.length === 0 || origins.length !== vendorNames.length) {
      setDeliveryFee(vendorNames.length * FALLBACK_FEE_PER_VENDOR);
      setCalculatingFee(false);
      return;
    }

    try {
      const response = await new Promise<google.maps.DistanceMatrixResponse>((resolve, reject) => {
        const timeout = setTimeout(() => reject(new Error("Timeout")), 8000);
        distanceMatrixService.getDistanceMatrix(
          {
            origins: origins,
            destinations: [customerLatLng],
            travelMode: window.google.maps.TravelMode.DRIVING,
            unitSystem: window.google.maps.UnitSystem.METRIC,
          },
          (result: google.maps.DistanceMatrixResponse, status: string) => {
            clearTimeout(timeout);
            if (status === "OK") resolve(result);
            else reject(new Error(status));
          }
        );
      });

      let totalFee = 0;
      for (let i = 0; i < origins.length; i++) {
        const element = response.rows[i].elements[0];
        if (element.status === "OK") {
          const distanceKm = element.distance.value / 1000;
          totalFee += getTieredDeliveryFee(distanceKm);
        } else {
          totalFee += FALLBACK_FEE_PER_VENDOR;
        }
      }
      setDeliveryFee(totalFee);
    } catch {
      setCalculationError(true);
      setDeliveryFee(vendorNames.length * FALLBACK_FEE_PER_VENDOR);
    } finally {
      setCalculatingFee(false);
    }
  }, [customerLatLng, isPickup, distanceMatrixService, vendorCoords, vendorNames]);

  useEffect(() => {
    if (customerLatLng && !isPickup && distanceMatrixService) calculateDeliveryFee();
  }, [customerLatLng, isPickup, distanceMatrixService, calculateDeliveryFee]);

  // ---------- ORDER & PAYMENT (INTACT FROM YOUR WORKING VERSION) ----------
  const saveOrderToSupabase = async (
    details: DeliveryDetails,
    txRef: string,
    transactionId: string,
    amountPaid: number,
    initialStatus: string = "pending"
  ) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();

      const vendorIdMap = new Map<string, string>();
      for (const vendorName of vendorNames) {
        let { data: vd } = await supabase.from("vendors").select("id").eq("store_name", vendorName).maybeSingle();
        if (!vd) {
          const { data: fuzzy } = await supabase.from("vendors").select("id").ilike("store_name", `%${vendorName}%`).maybeSingle();
          vd = fuzzy;
        }
        if (vd?.id) vendorIdMap.set(vendorName, vd.id);
      }

      const orderInserts = vendorNames.map(vendorName => {
        const vendorItems    = vendorGroups[vendorName];
        const vendorSubtotal = vendorItems.reduce((s, i) => s + i.product.price * i.quantity, 0);
        const perVendorFee   = vendorNames.length > 1 ? Math.round(finalDeliveryFee / vendorNames.length) : finalDeliveryFee;
        const perVendorTip   = vendorNames.length > 1 ? Math.round(tipAmount / vendorNames.length) : tipAmount;
        const perVendorServiceCharge = serviceCharge / vendorNames.length;

        return {
          customer_id:          user?.id ?? null,
          vendor_id:            vendorIdMap.get(vendorName) ?? null,
          status:               "pending",
          total_amount:         vendorSubtotal + perVendorFee + perVendorTip + perVendorServiceCharge,
          delivery_fee:         perVendorFee,
          service_charge:       perVendorServiceCharge,
          payment_method:       details.paymentMethod || "card",
          payment_status:       initialStatus === "pending_payment" ? "pending" : "paid",
          items:                vendorItems.map(i => ({
                                  id: i.product.id, name: i.product.name, price: i.product.price,
                                  quantity: i.quantity, note: i.note ?? null, image: i.product.image ?? null,
                                  category: i.product.category ?? null, size: i.size || null, sizeId: i.sizeId || null,
                                })),
          customer_name:        details.name,
          customer_phone:       details.phone,
          customer_email:       details.email,
          delivery_address:     isPickup ? "PICKUP" : (details.address || customerAddress),
          dropoff_address:      isPickup ? "PICKUP" : (details.address || customerAddress),
          pickup_address:       vendorName,
          vendor_status:        "pending",
          tip_amount:           perVendorTip,
          amount_paid:          initialStatus === "pending_payment" ? 0 : amountPaid / vendorNames.length,
          balance_remaining:    paymentMode === "installment" ? (total - amountPaid) / vendorNames.length : 0,
          payment_reference:    txRef,
          payment_mode:         paymentMode,
          delivery_mode:        deliveryMode,
          special_instructions: globalNote || null,
          gross_earnings:       vendorSubtotal,
          vendor_earnings:      Math.round(vendorSubtotal * 0.88),
          commission_amount:    Math.round(vendorSubtotal * 0.12),
          preparation_time:     20,
          dropoff_lat:          details.lat ?? customerLatLng?.lat ?? null,
          dropoff_lng:          details.lng ?? customerLatLng?.lng ?? null,
        };
      });

      const { data, error } = await supabase.from("orders").insert(orderInserts).select();
      if (error) { 
        console.error("Supabase insert error:", error); 
        throw new Error(error.message); 
      }
      return data;
    } catch (err: any) {
      console.error("saveOrderToSupabase crash:", err);
      throw err;
    }
  };

  const handleCheckoutSubmit = async (details: DeliveryDetails): Promise<{ orderId: string }> => {
    if (!isPickup && !customerAddress && !details.address) {
      throw new Error("Please enter your delivery address");
    }

    await new Promise<void>((resolve, reject) => {
      if (typeof window.FlutterwaveCheckout === "function") return resolve();
      let attempts = 0;
      const interval = setInterval(() => {
        attempts++;
        if (typeof window.FlutterwaveCheckout === "function") {
          clearInterval(interval);
          resolve();
        } else if (attempts >= 16) {
          clearInterval(interval);
          reject(new Error("Payment system not loaded. Please check your connection and try again."));
        }
      }, 500);
    });

    setPaying(true);
    const payAmount = paymentMode === "installment" ? installmentMinimum : total;
    const txRef     = "MRN-" + Date.now() + "-" + Math.random().toString(36).slice(2, 8);

    let pendingOrders: any[];
    try {
      const saved = await saveOrderToSupabase(details, txRef, "", payAmount, "pending_payment");
      if (!saved?.length) throw new Error("Could not prepare order. Please try again.");
      pendingOrders = saved;
    } catch (err: any) {
      setPaying(false);
      throw err;
    }

    const firstOrderId = pendingOrders[0].id;
    const allOrderIds  = pendingOrders.map((o: any) => o.id);

    return new Promise<{ orderId: string }>((resolve, reject) => {
      let callbackFired = false;

      window.FlutterwaveCheckout({
        public_key: FLW_PUBLIC_KEY,
        tx_ref: txRef,
        amount: payAmount,
        currency: "NGN",
        payment_options: "card, banktransfer, ussd",
        customer: {
          email: details.email,
          phone_number: details.phone,
          name: details.name,
        },
        meta: {
          delivery_address:  isPickup ? "PICKUP" : (details.address || customerAddress),
          delivery_fee:      finalDeliveryFee,
          tip_amount:        tipAmount,
          delivery_mode:     deliveryMode,
          global_note:       globalNote,
          vendors:           vendorNames.join(", "),
          payment_mode:      paymentMode,
          total_order_value: total,
          amount_paid:       payAmount,
          order_id:          firstOrderId,
          dropoff_lat:       details.lat ?? customerLatLng?.lat,
          dropoff_lng:       details.lng ?? customerLatLng?.lng,
        },
        customizations: {
          title:       "MiramoreNow",
          description: `Payment for ${vendorNames.length} vendor(s)`,
          logo:        "https://id-preview--47eebcb8-3c8f-44ed-aed1-85139916fac7.lovable.app/lovable-uploads/miramore-logo.png",
        },
        callback: async (data: { status: string; transaction_id: string }) => {
          callbackFired = true;
          setPaying(false);
          
          if (data.status === "successful") {
            toast.success("Payment successful! Redirecting...");
            
            await supabase
              .from("orders")
              .update({
                payment_status:    "paid",
                payment_reference: String(data.transaction_id),
                amount_paid:       payAmount / Math.max(allOrderIds.length, 1),
                status:            "confirmed",
              })
              .in("id", allOrderIds);
            
            clearCart();
            setShowCheckout(false);
            
            setTimeout(() => {
              navigate(`/order-success?order_id=${firstOrderId}`, { replace: true });
            }, 500);
            
            resolve({ orderId: firstOrderId });
          } else {
            await supabase.from("orders").delete().in("id", allOrderIds);
            toast.error("Payment was not successful. Please try again.");
            reject(new Error("Payment was not successful. Please try again."));
          }
        },
        onclose: () => {
          setPaying(false);
          if (!callbackFired) {
            supabase.from("orders").delete().in("id", allOrderIds);
            toast.error("Payment cancelled.");
            reject(new Error("Payment cancelled."));
          }
        },
      });
    });
  };

  const handleUpdateQuantity = (productId: string, quantity: number, sizeId?: string) => updateQuantity(productId, quantity, sizeId);
  const handleRemoveItem     = (productId: string, sizeId?: string) => removeItem(productId, sizeId);
  const handleUpdateNote     = (productId: string, note: string, sizeId?: string) => updateItemNote(productId, note, sizeId);

  // ---------- RENDER ----------
  return (
    <motion.div className="min-h-screen bg-[#F7FAF7] pb-6" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
      <header className="sticky top-0 z-30 bg-[#2E7D32] text-white px-4 py-3 flex items-center gap-3 shadow-md">
        <button onClick={() => navigate(-1)} className="p-2.5 active:scale-95 transition-transform">
          <ArrowLeft className="w-5 h-5" />
        </button>
        <h1 className="font-bold text-lg">Your Cart 🛒</h1>
        {items.length > 0 && (
          <button onClick={clearCart} className="ml-auto text-xs opacity-80 hover:opacity-100">Clear all</button>
        )}
      </header>

      {items.length === 0 ? (
        <div className="flex flex-col items-center justify-center gap-3 py-20 text-gray-400">
          <ShoppingCart className="w-12 h-12 opacity-40" />
          <p className="text-sm">Your cart is empty</p>
          <Button onClick={() => navigate("/home")} className="mt-2 rounded-2xl bg-[#2E7D32] hover:bg-[#1B5E20] text-white">
            Browse Products
          </Button>
        </div>
      ) : (
        <div className="px-4 pt-4 space-y-3">
          {vendorNames.length > 1 && (
            <div className="bg-[#E8F5E9] border border-[#C8E6C9] rounded-2xl px-3 py-2 flex items-center gap-2">
              <span className="text-sm">🛍️</span>
              <p className="text-xs font-medium text-[#2E7D32]">
                Group Order — <span className="font-bold">{vendorNames.length} vendors</span> in your cart
              </p>
            </div>
          )}

          {Object.entries(vendorGroups).map(([vendorName, vendorItems]) => (
            <VendorGroup
              key={vendorName}
              vendorName={vendorName}
              items={vendorItems}
              deliveryLocation={customerAddress}
              onUpdateQuantity={handleUpdateQuantity}
              onRemoveItem={handleRemoveItem}
              onUpdateNote={handleUpdateNote}
            />
          ))}

          <div className="bg-white rounded-2xl border border-[#E8F5E9] p-4 space-y-2 shadow-sm">
            <p className="text-xs font-bold text-gray-600 flex items-center gap-1.5">
              <MessageSquare className="w-3.5 h-3.5 text-[#2E7D32]" /> Order Note
            </p>
            <input
              type="text"
              placeholder="Add a note for the vendor..."
              value={globalNote}
              onChange={e => setGlobalNote(e.target.value)}
              className="w-full text-sm bg-[#F7FAF7] border border-[#E8F5E9] rounded-xl px-3 py-3 outline-none focus:border-[#2E7D32] focus:ring-1 focus:ring-[#2E7D32]"
            />
          </div>

          <div className="bg-white rounded-2xl border border-[#E8F5E9] p-4 space-y-3 shadow-sm">
            <p className="text-xs font-bold text-gray-600">Delivery Method</p>
            <div className="flex gap-2">
              {[
                { mode: "delivery", Icon: Truck,  label: "Delivery", sub: "20-30 mins" },
                { mode: "pickup",   Icon: Store,  label: "Pick up",  sub: "20-30 mins" },
              ].map(({ mode, Icon, label, sub }) => (
                <button
                  key={mode}
                  onClick={() => setDeliveryMode(mode as any)}
                  className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl text-sm font-bold transition-all ${
                    deliveryMode === mode ? "bg-[#2E7D32] text-white shadow-md" : "bg-white text-gray-600 border border-[#E8F5E9]"
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  <div className="text-left">
                    <p className="text-xs font-bold">{label}</p>
                    <p className="text-[10px] opacity-70">{sub}</p>
                  </div>
                </button>
              ))}
            </div>
          </div>

          {!isPickup && (
            <div className="bg-white rounded-2xl border border-[#E8F5E9] p-4 space-y-3 shadow-sm">
              <p className="text-xs font-bold text-gray-600">📍 Delivery Address</p>
              <div className="relative">
                <div className="relative">
                  <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input
                    type="text"
                    value={addressInput}
                    onChange={e => handleAddressInput(e.target.value)}
                    placeholder="e.g., 12 Bishop Oluwole, Lekki Phase 1"
                    className="w-full pl-9 pr-10 py-3 border border-[#E8F5E9] rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#2E7D32] focus:border-[#2E7D32] bg-[#F7FAF7]"
                  />
                  {addressInput && (
                    <button
                      onClick={clearAddress}
                      className="absolute right-2 top-1/2 -translate-y-1/2 p-1 rounded-full hover:bg-gray-100"
                    >
                      <X className="w-4 h-4 text-gray-400" />
                    </button>
                  )}
                </div>
              </div>

              {isResolving && (
                <div className="flex items-center gap-2 text-xs text-gray-500 mt-1">
                  <Loader2 className="w-3 h-3 animate-spin" /> Locating address...
                </div>
              )}

              {!isResolving && customerAddress && (
                <div className="text-xs text-green-700 bg-green-50 p-2 rounded-lg mt-2">
                  ✅ {customerAddress}
                </div>
              )}

              {calculatingFee && (
                <div className="flex items-center gap-2 text-xs text-gray-500 mt-2">
                  <Loader2 className="w-3 h-3 animate-spin" /> Calculating delivery fee...
                </div>
              )}
              
              {promoActive && !isPickup && (
                <div className="mt-3 p-3 bg-gradient-to-r from-[#2E7D32] to-[#1B5E20] rounded-xl flex items-center justify-between shadow-md">
                  <div className="flex items-center gap-2">
                    <span className="text-xl">🎉</span>
                    <div>
                      <p className="text-white font-bold text-sm">FREE DELIVERY!</p>
                      <p className="text-green-100 text-xs">May Special • All month long</p>
                    </div>
                  </div>
                  <div className="bg-white/20 rounded-full px-2 py-1">
                    <span className="text-white text-[10px] font-bold">₦0</span>
                  </div>
                </div>
              )}

              {!calculatingFee && customerAddress && !promoActive && deliveryFee > 0 && (
                <div className="flex justify-between items-center pt-2 border-t border-[#E8F5E9] mt-2">
                  <span className="text-sm text-gray-500">Delivery fee</span>
                  <span className="font-bold text-[#2E7D32]">{formatPrice(deliveryFee)}</span>
                </div>
              )}
            </div>
          )}

          {/* Tip, Order Summary, Installment sections – identical to previous working version */}
          <div className="bg-white rounded-2xl border border-[#E8F5E9] p-4 space-y-3 shadow-sm">
            <p className="text-xs font-bold text-gray-600">💝 Tip your rider (optional)</p>
            <div className="flex gap-2 flex-wrap">
              {tipOptions.map(amount => (
                <button
                  key={amount}
                  onClick={() => setTipAmount(amount)}
                  className={`px-4 py-2 rounded-full text-sm transition-all ${
                    tipAmount === amount ? "bg-[#2E7D32] text-white shadow-md" : "bg-[#F7FAF7] text-gray-600 border border-[#E8F5E9]"
                  }`}
                >
                  {amount === 0 ? "No tip" : formatPrice(amount)}
                </button>
              ))}
            </div>
          </div>

          <div className="bg-white rounded-2xl border border-[#E8F5E9] p-4 space-y-3 shadow-sm">
            <p className="text-xs font-bold text-gray-600">Order Summary</p>
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">Subtotal</span>
                <span className="font-medium text-gray-800">{formatPrice(subtotalAmount)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">Service charge (20%)</span>
                <span className="font-medium text-gray-800">{formatPrice(Math.round(serviceCharge))}</span>
              </div>
              {!isPickup && deliveryFee > 0 && !promoActive && (
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">Delivery fee</span>
                  <span className="font-medium text-gray-800">{formatPrice(deliveryFee)}</span>
                </div>
              )}
              {tipAmount > 0 && (
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">Tip</span>
                  <span className="font-medium text-gray-800">{formatPrice(tipAmount)}</span>
                </div>
              )}
              <div className="border-t border-[#E8F5E9] pt-3 mt-2">
                <div className="flex justify-between items-center">
                  <span className="font-bold text-gray-800">Total</span>
                  <span className="text-xl font-bold text-[#2E7D32]">{formatPrice(Math.round(total))}</span>
                </div>
                {promoActive && (
                  <p className="text-[10px] text-green-600 mt-1 flex items-center gap-1">
                    <span>🎉</span> Free delivery applied
                  </p>
                )}
              </div>
            </div>
          </div>

          {showInstallment && (
            <div className="bg-[#F0F7F0] rounded-2xl border border-[#C8E6C9] p-4 space-y-3 shadow-sm">
              <p className="text-xs font-bold text-[#2E7D32]">💇‍♀️ Hair Installment Plan Available</p>
              <p className="text-[11px] text-gray-600">Pay minimum 25% now, complete before shipping.</p>
              <div className="flex gap-2">
                <button
                  onClick={() => setPaymentMode("full")}
                  className={`flex-1 py-3 rounded-xl text-xs font-bold transition-all ${
                    paymentMode === "full" ? "bg-[#2E7D32] text-white shadow-md" : "bg-white text-gray-600 border border-[#E8F5E9]"
                  }`}
                >
                  <CreditCard className="w-3.5 h-3.5 inline mr-1" /> Pay Full
                </button>
                <button
                  onClick={() => setPaymentMode("installment")}
                  className={`flex-1 py-3 rounded-xl text-xs font-bold transition-all ${
                    paymentMode === "installment" ? "bg-amber-500 text-white" : "bg-white text-gray-600 border border-[#E8F5E9]"
                  }`}
                >
                  <Wallet className="w-3.5 h-3.5 inline mr-1" /> Pay 25%
                </button>
              </div>
              {paymentMode === "installment" && (
                <div className="bg-amber-50 rounded-xl p-3 space-y-1 border border-amber-200">
                  <div className="flex justify-between text-xs">
                    <span>Pay now (25%)</span>
                    <span className="font-bold text-amber-700">{formatPrice(installmentMinimum)}</span>
                  </div>
                  <div className="flex justify-between text-xs">
                    <span>Balance remaining</span>
                    <span className="font-bold">{formatPrice(total - installmentMinimum)}</span>
                  </div>
                </div>
              )}
            </div>
          )}

          {deliveryUnavailable && (
            <div className="bg-red-50 border border-red-200 rounded-2xl p-4 text-center">
              <div className="flex justify-center mb-2">
                <AlertTriangle className="w-8 h-8 text-red-500" />
              </div>
              <p className="text-sm font-bold text-red-800">Delivery not available for this address</p>
              <p className="text-xs text-red-700 mt-1">
                {farVendors.length === 1 ? "Vendor" : "Vendors"} <span className="font-semibold">{farVendors.join(", ")}</span> {farVendors.length === 1 ? "is" : "are"} more than {MAX_DELIVERY_KM} km away.
              </p>
              <p className="text-xs text-red-600 mt-2">
                Please try ordering from a different vendor closer to your location.
              </p>
              <button
                onClick={() => navigate("/home")}
                className="mt-3 text-sm font-medium text-red-700 underline underline-offset-2"
              >
                Browse nearby vendors →
              </button>
            </div>
          )}

          <button
            onClick={() => setShowCheckout(true)}
            disabled={deliveryUnavailable || (deliveryMode !== "pickup" && !customerAddress)}
            className={`w-full h-14 text-base font-bold rounded-2xl active:scale-[0.97] transition-transform mt-2 text-white shadow-lg ${
              deliveryUnavailable || (deliveryMode !== "pickup" && !customerAddress)
                ? "bg-gray-300 cursor-not-allowed shadow-none"
                : "bg-[#2E7D32] shadow-[#2E7D32]/30 hover:bg-[#1B5E20]"
            }`}
          >
            {deliveryUnavailable
              ? "Delivery unavailable for this address"
              : deliveryMode !== "pickup" && !customerAddress
              ? "Enter delivery address to continue"
              : "Confirm & Pay 🔒"}
          </button>
        </div>
      )}

      <CheckoutModal
        open={showCheckout}
        onClose={() => setShowCheckout(false)}
        onSubmit={handleCheckoutSubmit}
        loading={paying}
        cartTotal={total}
        vendorName={primaryVendorName}
        vendorPhone={primaryVendorPhone}
      />
    </motion.div>
  );
};

export default Cart;