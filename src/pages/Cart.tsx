// src/pages/Cart.tsx
import { useState, useMemo, useEffect, useRef } from "react";
import {
  ArrowLeft, ShoppingCart, CreditCard, Wallet, Truck, Store,
  MessageSquare, Loader2, MapPin, Navigation, X, Info
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { useCartStore } from "@/stores/cartStore";
import CheckoutModal, { type DeliveryDetails } from "@/components/CheckoutModal";
import VendorGroup from "@/components/cart/VendorGroup";
import OrderSummary from "@/components/cart/OrderSummary";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { Capacitor } from "@capacitor/core";
import { isFreeDeliveryActive } from "@/utils/promoConfig";

// ✅ Helper to format price with comma and proper Naira symbol
const formatPrice = (price: number): string => {
  return `₦${price.toLocaleString('en-NG', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`;
};

declare global {
  interface Window {
    FlutterwaveCheckout: (config: Record<string, unknown>) => void;
    google: any;
    initGoogleMaps: () => void;
  }
}

const FLW_PUBLIC_KEY = "FLWPUBK-a4dc9522e8b015ae0f4ae2f39b05be30-X";
const FALLBACK_FEE_PER_VENDOR = 1200;
const MAX_DELIVERY_KM = 20;

// Service charge rate (30% of subtotal)
const SERVICE_CHARGE_RATE = 0.30;

// Tiered delivery fee function with PROMO OVERRIDE
function getTieredDeliveryFee(distanceKm: number): number {
  if (isFreeDeliveryActive()) {
    return 0;
  }
  if (distanceKm <= 5) return 1200;
  if (distanceKm <= 10) return 1800;
  if (distanceKm <= 15) return 2500;
  if (distanceKm <= 20) return 3500;
  return FALLBACK_FEE_PER_VENDOR;
}

const Cart = () => {
  const navigate = useNavigate();
  const {
    items, removeItem, updateQuantity, updateItemNote,
    clearCart, subtotal, deliveryMode, setDeliveryMode,
    globalNote, setGlobalNote,
  } = useCartStore();

  const [showCheckout,   setShowCheckout]   = useState(false);
  const [paying,         setPaying]         = useState(false);
  const [paymentMode,    setPaymentMode]    = useState<"full" | "installment">("full");
  const [customerAddress, setCustomerAddress] = useState("");
  const [customerLatLng,  setCustomerLatLng]  = useState<{ lat: number; lng: number } | null>(null);
  const [deliveryFee,     setDeliveryFee]     = useState(0);
  const [calculatingFee,  setCalculatingFee]  = useState(false);
  const [distanceMatrixService, setDistanceMatrixService] = useState<any>(null);
  const [googleMapsLoaded, setGoogleMapsLoaded] = useState(false);
  const [vendorCoords, setVendorCoords] = useState<Map<string, { lat: number; lng: number }>>(new Map());
  const [calculationError, setCalculationError] = useState(false);
  const [tipAmount, setTipAmount] = useState(0);
  const tipOptions = [0, 200, 500, 1000];

  const [addressInput,       setAddressInput]       = useState("");
  const [addressSuggestions, setAddressSuggestions] = useState<any[]>([]);
  const [showSuggestions,    setShowSuggestions]    = useState(false);
  const [isLoadingAddress,   setIsLoadingAddress]   = useState(false);
  const autocompleteService = useRef<any>(null);
  const geocoder            = useRef<any>(null);

  const [deliveryUnavailable, setDeliveryUnavailable] = useState(false);
  const [farVendors, setFarVendors] = useState<string[]>([]);
  const [primaryVendorName,  setPrimaryVendorName]  = useState("");
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
  
  const serviceCharge = subtotal() * SERVICE_CHARGE_RATE;
  const total = subtotal() + serviceCharge + tipAmount;

  const hasBeautyItems    = items.some(i => i.product.category === "beauty");
  const beautyTotal       = items.filter(i => i.product.category === "beauty").reduce((s, i) => s + i.product.price * i.quantity, 0);
  const showInstallment   = hasBeautyItems && beautyTotal > 50000;
  const installmentMinimum = Math.ceil(total * 0.25);

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

  useEffect(() => {
    const initServices = () => {
      if (!window.google?.maps) return;
      setDistanceMatrixService(new window.google.maps.DistanceMatrixService());
      setGoogleMapsLoaded(true);
      if (window.google.maps.places) {
        autocompleteService.current = new window.google.maps.places.AutocompleteService();
        geocoder.current = new window.google.maps.Geocoder();
      }
    };
    if (window.google?.maps?.places) {
      initServices();
      return;
    }
    window.addEventListener("google-maps-loaded", initServices);
    const poll = setInterval(() => {
      if (window.google?.maps?.places) {
        clearInterval(poll);
        initServices();
      }
    }, 300);
    const timeout = setTimeout(() => clearInterval(poll), 10000);
    return () => {
      window.removeEventListener("google-maps-loaded", initServices);
      clearInterval(poll);
      clearTimeout(timeout);
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

  const fetchAddressSuggestions = (input: string) => {
    if (!input.trim() || input.length < 3 || !autocompleteService.current) {
      setAddressSuggestions([]); setShowSuggestions(false); return;
    }
    setIsLoadingAddress(true);
    autocompleteService.current.getPlacePredictions(
      { input, componentRestrictions: { country: "ng" }, types: ["address"] },
      (predictions: any[], status: string) => {
        setIsLoadingAddress(false);
        if (status === "OK" && predictions) { setAddressSuggestions(predictions); setShowSuggestions(true); }
        else { setAddressSuggestions([]); setShowSuggestions(false); }
      }
    );
  };

  useEffect(() => {
    const t = setTimeout(() => {
      if (addressInput && addressInput !== customerAddress) fetchAddressSuggestions(addressInput);
    }, 500);
    return () => clearTimeout(t);
  }, [addressInput]);

  const handleSelectAddress = (suggestion: any) => {
    setAddressInput(suggestion.description);
    setShowSuggestions(false); setAddressSuggestions([]);
    if (geocoder.current) {
      geocoder.current.geocode({ placeId: suggestion.place_id }, (results: any[], status: string) => {
        if (status === "OK" && results[0]) {
          const loc = results[0].geometry.location;
          setCustomerAddress(suggestion.description);
          setCustomerLatLng({ lat: loc.lat(), lng: loc.lng() });
          toast.success("Address selected! Calculating delivery fee…");
        } else {
          setCustomerAddress(suggestion.description);
        }
      });
    } else {
      setCustomerAddress(suggestion.description);
    }
  };

  const geocodeAddress = async (address: string) => {
    if (!geocoder.current) return;
    setIsLoadingAddress(true);
    geocoder.current.geocode({ address: address + ", Lagos, Nigeria" }, (results: any[], status: string) => {
      setIsLoadingAddress(false);
      if (status === "OK" && results[0]) {
        const loc = results[0].geometry.location;
        setCustomerAddress(address);
        setCustomerLatLng({ lat: loc.lat(), lng: loc.lng() });
        setAddressInput(address);
        toast.success("Address set! Calculating delivery fee...");
      } else {
        toast.error("Could not find that address. Try selecting from suggestions.");
      }
    });
  };

  const getCurrentLocation = async () => {
    setIsLoadingAddress(true);
    try {
      let latitude: number, longitude: number;
      if (Capacitor.isNativePlatform()) {
        const { Geolocation } = await import("@capacitor/geolocation");
        await Geolocation.requestPermissions({ permissions: ["fineLocation", "coarseLocation"] });
        const position = await Geolocation.getCurrentPosition({ enableHighAccuracy: true, timeout: 15000 });
        latitude = position.coords.latitude;
        longitude = position.coords.longitude;
      } else {
        const position = await new Promise<GeolocationPosition>((resolve, reject) =>
          navigator.geolocation.getCurrentPosition(resolve, reject, { enableHighAccuracy: true })
        );
        latitude = position.coords.latitude;
        longitude = position.coords.longitude;
      }
      if (geocoder.current) {
        geocoder.current.geocode(
          { location: { lat: latitude, lng: longitude } },
          (results: any[], status: string) => {
            setIsLoadingAddress(false);
            if (status === "OK" && results[0]) {
              const addr = results[0].formatted_address;
              setAddressInput(addr);
              setCustomerAddress(addr);
              setCustomerLatLng({ lat: latitude, lng: longitude });
              toast.success("Location detected! Calculating delivery fee…");
            } else {
              toast.error("Could not get address from location");
            }
          }
        );
      } else {
        setIsLoadingAddress(false);
        toast.error("Address service not ready. Try again in a moment.");
      }
    } catch (err: any) {
      setIsLoadingAddress(false);
      if (err.message?.includes("denied")) {
        toast.error("Location denied. Enable it in Settings → Apps → Miramore → Permissions.");
      } else {
        toast.error("Unable to get location. Enter address manually.");
      }
    }
  };

  const clearAddress = () => {
    setAddressInput(""); setCustomerAddress(""); setCustomerLatLng(null);
    setDeliveryFee(0); setAddressSuggestions([]); setShowSuggestions(false);
  };

  useEffect(() => {
    const fetchCoords = async () => {
      const coordsMap = new Map();
      for (const vendorName of [...new Set(vendorNames)]) {
        const { data } = await supabase
          .from("vendors").select("latitude, longitude, address")
          .eq("store_name", vendorName).maybeSingle();
        if (data?.latitude && data?.longitude) {
          coordsMap.set(vendorName, { lat: data.latitude, lng: data.longitude });
        } else if (data?.address && window.google?.maps?.Geocoder) {
          const g = new window.google.maps.Geocoder();
          await new Promise<void>(resolve => {
            g.geocode({ address: data.address + ", Lagos, Nigeria" }, (results: any, status: string) => {
              if (status === "OK" && results[0]) {
                coordsMap.set(vendorName, { lat: results[0].geometry.location.lat(), lng: results[0].geometry.location.lng() });
              }
              resolve();
            });
          });
        }
      }
      setVendorCoords(coordsMap);
    };
    if (vendorNames.length > 0 && googleMapsLoaded) fetchCoords();
  }, [vendorNames.join(","), googleMapsLoaded]);

  // ✅ LAUNCH MODE: Remove far-location blocker – always allow orders
  useEffect(() => {
    if (!customerLatLng || vendorCoords.size === 0) return;
    const tooFar: string[] = [];
    for (const [vendorName, coords] of vendorCoords.entries()) {
      const distance = getDistanceFromLatLonInKm(
        customerLatLng.lat, customerLatLng.lng,
        coords.lat, coords.lng
      );
      if (distance > MAX_DELIVERY_KM) {
        tooFar.push(vendorName);
      }
    }
    setFarVendors(tooFar);
    // 🚀 LAUNCH OVERRIDE: Never block orders, even if vendors are far
    setDeliveryUnavailable(false);
  }, [customerLatLng, vendorCoords]);

  const calculateDeliveryFee = async () => {
    if (!customerLatLng || isPickup || !distanceMatrixService) return;
    setCalculatingFee(true);
    setCalculationError(false);

    const origins = Array.from(vendorCoords.values());
    if (origins.length === 0) {
      setDeliveryFee(vendorNames.length * FALLBACK_FEE_PER_VENDOR);
      setCalculatingFee(false);
      return;
    }

    try {
      const fees = await Promise.all(origins.map(origin =>
        new Promise<number>(resolve => {
          const timeout = setTimeout(() => resolve(FALLBACK_FEE_PER_VENDOR), 8000);
          distanceMatrixService.getDistanceMatrix(
            {
              origins: [origin],
              destinations: [customerLatLng],
              travelMode: window.google.maps.TravelMode.DRIVING,
              unitSystem: window.google.maps.UnitSystem.METRIC,
            },
            (response: any, status: string) => {
              clearTimeout(timeout);
              if (status === "OK" && response.rows[0].elements[0].status === "OK") {
                const distanceInMeters = response.rows[0].elements[0].distance.value;
                const distanceInKm = distanceInMeters / 1000;
                const fee = getTieredDeliveryFee(distanceInKm);
                resolve(fee);
              } else {
                resolve(FALLBACK_FEE_PER_VENDOR);
              }
            }
          );
        })
      ));
      const totalFee = fees.reduce((s, f) => s + f, 0);
      setDeliveryFee(totalFee);
    } catch {
      setCalculationError(true);
      setDeliveryFee(vendorNames.length * FALLBACK_FEE_PER_VENDOR);
    } finally {
      setCalculatingFee(false);
    }
  };

  useEffect(() => {
    if (customerLatLng && !isPickup && distanceMatrixService) calculateDeliveryFee();
    else if (customerAddress && !customerLatLng && !isPickup) { setDeliveryFee(500); setCalculatingFee(false); }
  }, [customerLatLng, customerAddress, isPickup, distanceMatrixService]);

  // ✅ SAVE ORDER TO SUPABASE (with service_charge column)
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

  // ✅ HANDLE CHECKOUT WITH PROPER NAVIGATION TO ORDER SUCCESS
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
            
            // Update orders to paid status
            await supabase
              .from("orders")
              .update({
                payment_status:    "paid",
                payment_reference: String(data.transaction_id),
                amount_paid:       payAmount / Math.max(allOrderIds.length, 1),
                status:            "confirmed",
              })
              .in("id", allOrderIds);
            
            // Clear cart
            clearCart();
            
            // Close Checkout Modal
            setShowCheckout(false);
            
            // Navigate to Order Success page with the order ID
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

  return (
    <motion.div className="min-h-screen bg-[#F7FAF7] pb-6" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
      {/* Header - Brand Green */}
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
                    onChange={e => {
                      setAddressInput(e.target.value);
                      if (e.target.value.length >= 3) fetchAddressSuggestions(e.target.value);
                      else { setAddressSuggestions([]); setShowSuggestions(false); }
                    }}
                    onBlur={() => {
                      if (addressSuggestions.length > 0 && !customerAddress) {
                        handleSelectAddress(addressSuggestions[0]);
                      } else if (addressInput && !customerAddress) {
                        geocodeAddress(addressInput);
                      }
                    }}
                    onKeyDown={e => {
                      if (e.key === 'Enter' && addressInput && !customerAddress) {
                        e.preventDefault();
                        if (addressSuggestions.length > 0) handleSelectAddress(addressSuggestions[0]);
                        else geocodeAddress(addressInput);
                      }
                    }}
                    placeholder="Enter your delivery address in Lagos"
                    className="w-full pl-9 pr-20 py-3 border border-[#E8F5E9] rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#2E7D32] focus:border-[#2E7D32] bg-[#F7FAF7]"
                  />
                  <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-1">
                    <button
                      onClick={getCurrentLocation}
                      className="p-1.5 rounded-full hover:bg-gray-100 transition-colors"
                      title="Use current location"
                    >
                      <Navigation className="w-4 h-4 text-gray-500" />
                    </button>
                    {addressInput && (
                      <button
                        onClick={clearAddress}
                        className="p-1.5 rounded-full hover:bg-gray-100"
                      >
                        <X className="w-4 h-4 text-gray-400" />
                      </button>
                    )}
                  </div>
                </div>

                {showSuggestions && addressSuggestions.length > 0 && (
                  <div className="absolute z-50 w-full mt-1 bg-white border border-[#E8F5E9] rounded-xl shadow-lg max-h-60 overflow-y-auto">
                    {addressSuggestions.map(s => (
                      <button
                        key={s.place_id}
                        onClick={() => handleSelectAddress(s)}
                        className="w-full px-4 py-3 text-left hover:bg-[#F7FAF7] flex items-start gap-3 border-b border-[#E8F5E9] last:border-0 transition-colors"
                      >
                        <MapPin className="w-4 h-4 text-gray-400 mt-0.5 flex-shrink-0" />
                        <div className="flex-1">
                          <p className="text-sm text-gray-800">{s.description}</p>
                          <p className="text-xs text-gray-400 mt-0.5">Tap to select</p>
                        </div>
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {isLoadingAddress && (
                <div className="flex items-center gap-2 text-xs text-gray-500">
                  <Loader2 className="w-3 h-3 animate-spin" /> Loading suggestions…
                </div>
              )}
              {calculatingFee && (
                <div className="flex items-center gap-2 text-xs text-gray-500">
                  <Loader2 className="w-3 h-3 animate-spin" /> Calculating delivery fee…
                </div>
              )}
              
              {/* 🎉 PROMO BANNER - FREE DELIVERY */}
              {promoActive && !isPickup && (
                <div className="mt-3 p-3 bg-gradient-to-r from-[#2E7D32] to-[#1B5E20] rounded-xl flex items-center justify-between shadow-md">
                  <div className="flex items-center gap-2">
                    <span className="text-xl">🎉</span>
                    <div>
                      <p className="text-white font-bold text-sm">FREE DELIVERY!</p>
                      <p className="text-green-100 text-xs">Launch offer • 14 days only</p>
                    </div>
                  </div>
                  <div className="bg-white/20 rounded-full px-2 py-1">
                    <span className="text-white text-[10px] font-bold">₦0</span>
                  </div>
                </div>
              )}

              {!calculatingFee && customerAddress && (
                <div className="flex justify-between items-center pt-2 border-t border-[#E8F5E9]">
                  <span className="text-sm text-gray-500">Delivery fee</span>
                  <div className="text-right">
                    {promoActive && deliveryFee === 0 ? (
                      <>
                        <span className="text-xs text-gray-400 line-through decoration-red-500 mr-2">
                          {formatPrice(1200)}
                        </span>
                        <span className="font-bold text-[#2E7D32]">FREE (₦0)</span>
                      </>
                    ) : (
                      <span className="font-bold text-[#2E7D32]">{formatPrice(deliveryFee)}</span>
                    )}
                  </div>
                </div>
              )}
              {!customerAddress && !isLoadingAddress && (
                <p className="text-xs text-amber-600">⚠️ Enter your delivery address to see delivery fee</p>
              )}
            </div>
          )}

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

          {/* Order Summary with 30% Service Charge */}
          <div className="bg-white rounded-2xl border border-[#E8F5E9] p-4 space-y-3 shadow-sm">
            <p className="text-xs font-bold text-gray-600">Order Summary</p>
            
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">Subtotal</span>
                <span className="font-medium text-gray-800">{formatPrice(subtotal())}</span>
              </div>
              
              <div className="flex justify-between items-start text-sm">
                <div className="flex items-center gap-1.5">
                  <span className="text-gray-500">Service charge (30%)</span>
                  <div className="group relative">
                    <Info className="w-3.5 h-3.5 text-gray-400 cursor-help" />
                    <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-52 p-2 bg-gray-800 text-white text-[10px] rounded-lg opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-10">
                      30% service fee covers platform maintenance, 24/7 customer support, and secure payment processing.
                    </div>
                  </div>
                </div>
                <span className="font-medium text-gray-800">{formatPrice(Math.round(serviceCharge))}</span>
              </div>
              
              {!isPickup && (
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">Delivery fee</span>
                  {promoActive ? (
                    <div className="text-right">
                      <span className="text-xs text-gray-400 line-through decoration-red-500 mr-2">
                        {formatPrice(Math.round(deliveryFee || 1200))}
                      </span>
                      <span className="font-bold text-[#2E7D32]">FREE</span>
                    </div>
                  ) : (
                    <span className="font-medium text-gray-800">{formatPrice(deliveryFee)}</span>
                  )}
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
                    <span>🎉</span> You saved {formatPrice(Math.round(deliveryFee || 1200))} on delivery!
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

          {/* 🚀 LAUNCH MODE: Show informational message but DO NOT block order */}
          {farVendors.length > 0 && (
            <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4 text-center">
              <div className="text-2xl mb-1">💛</div>
              <p className="text-sm font-semibold text-amber-800">Your order includes vendors slightly farther away.</p>
              <p className="text-xs text-amber-700 mt-1">
                {farVendors.join(", ")} {farVendors.length === 1 ? "is" : "are"} more than {MAX_DELIVERY_KM} km from your address.
              </p>
              <p className="text-xs text-amber-600 mt-2">
                We'll still deliver to you – it's our launch week! 🚀 Thank you for your support.
              </p>
            </div>
          )}

          <button
            onClick={() => setShowCheckout(true)}
            className="w-full h-14 text-base font-bold rounded-2xl active:scale-[0.97] transition-transform mt-2 text-white bg-[#2E7D32] shadow-lg shadow-[#2E7D32]/30 hover:bg-[#1B5E20]"
          >
            Confirm & Pay 🔒
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