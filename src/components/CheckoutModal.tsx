// src/components/CheckoutModal.tsx
import { useState, useEffect, useRef, useCallback } from "react";
import { X, MapPin, Phone, User, Mail, Navigation, ChevronRight, Check, CheckCircle, MessageCircle, Clock, Truck, Star, ArrowRight } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/lib/supabase";

const GOOGLE_MAPS_API_KEY = "AIzaSyAcgWyOPX7Y1qY98BolRvjPqwMuSs6prfY";

export interface DeliveryDetails {
  name: string;
  email: string;
  phone: string;
  address: string;
  city: string;
  lat?: number;
  lng?: number;
  riderNote?: string;
  tip?: number;
  paymentMethod?: string;
}

interface CheckoutModalProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (details: DeliveryDetails) => Promise<{ orderId?: string; error?: string } | void>;
  loading: boolean;
  cartTotal?: number;
  vendorName?: string;
  vendorPhone?: string;
}

type Screen = "order" | "payment" | "success";
type TipAmount = 0 | 100 | 200 | 500;
type PaymentMethod = "card" | "bank_transfer" | "ussd" | "installment";

const BRAND_GREEN = "#10B981";
const BRAND_BG = "#F7FAF7";

// ─── Google Maps loader (unchanged) ───────────────────────────────────────
let mapsLoaded = false;
let mapsLoading = false;
let mapsCallbacks: (() => void)[] = [];

function loadGoogleMaps(cb: () => void) {
  if (window.google && window.google.maps) {
    mapsLoaded = true;
    cb();
    return;
  }
  if (mapsLoaded) {
    cb();
    return;
  }
  const existingScript = document.querySelector('#google-maps-script');
  if (existingScript) {
    if (!mapsCallbacks.includes(cb)) mapsCallbacks.push(cb);
    return;
  }
  if (mapsLoading) {
    if (!mapsCallbacks.includes(cb)) mapsCallbacks.push(cb);
    return;
  }
  mapsCallbacks.push(cb);
  mapsLoading = true;
  (window as any).initGoogleMaps = () => {
    mapsLoaded = true;
    mapsLoading = false;
    const callbacks = [...mapsCallbacks];
    mapsCallbacks = [];
    callbacks.forEach(f => f());
  };
  const s = document.createElement("script");
  s.id = 'google-maps-script';
  s.src = `https://maps.googleapis.com/maps/api/js?key=${GOOGLE_MAPS_API_KEY}&libraries=places,geometry&callback=initGoogleMaps&loading=async`;
  s.async = true;
  s.defer = true;
  s.onerror = () => { mapsLoading = false; mapsCallbacks = []; toast.error("Maps failed to load."); };
  document.head.appendChild(s);
}

const TIPS: TipAmount[] = [0, 100, 200, 500];

const PAYMENT_OPTIONS = [
  { id: "card" as PaymentMethod, icon: "💳", label: "Card payment", sub: "Visa · Mastercard · Verve" },
  { id: "bank_transfer" as PaymentMethod, icon: "🏦", label: "Bank transfer", sub: "Instant · No extra charge" },
  { id: "ussd" as PaymentMethod, icon: "📱", label: "USSD", sub: "Works without internet" },
  { id: "installment" as PaymentMethod, icon: "💸", label: "Pay 25% now", sub: "Beauty installment plan" },
];

const STATUS_STEPS = [
  { key: "confirmed", label: "Order Confirmed", icon: "✅", time: "Just now" },
  { key: "preparing", label: "Chef is Cooking", icon: "👨‍🍳", time: "~10 min" },
  { key: "out_for_delivery", label: "Rider on the Way", icon: "🛵", time: "~15 min" },
  { key: "delivered", label: "Delivered!", icon: "🎉", time: "Enjoy!" },
];

function LiveTracker({ status }: { status: string }) {
  const currentIdx = STATUS_STEPS.findIndex(s => s.key === status);
  return (
    <div className="space-y-0">
      {STATUS_STEPS.map((step, idx) => {
        const done = idx <= currentIdx;
        const current = idx === currentIdx;
        return (
          <div key={step.key} className="flex items-start gap-3">
            <div className="flex flex-col items-center">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm flex-shrink-0 transition-all duration-500 ${done ? "bg-[#10B981]" : "bg-gray-100"}`}>
                {done ? <span style={{ fontSize: 14 }}>{step.icon}</span> : <span className="w-2 h-2 rounded-full bg-gray-300 block" />}
              </div>
              {idx < STATUS_STEPS.length - 1 && (
                <div className={`w-0.5 h-6 mt-0.5 transition-colors duration-700 ${idx < currentIdx ? "bg-[#10B981]" : "bg-gray-200"}`} />
              )}
            </div>
            <div className="pb-4 flex-1">
              <p className={`text-sm font-semibold ${done ? "text-gray-900" : "text-gray-400"}`}>{step.label}</p>
              <p className="text-[10px] text-gray-400">{step.time}</p>
              {current && (
                <div className="mt-1 flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#10B981] animate-pulse block" />
                  <span className="text-[10px] text-[#10B981] font-semibold">In progress</span>
                </div>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}

function SuccessMap({ vendorLat, vendorLng, customerLat, customerLng }: {
  vendorLat?: number; vendorLng?: number;
  customerLat?: number; customerLng?: number;
}) {
  const mapDivRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<any>(null);
  const [mapsApiLoaded, setMapsApiLoaded] = useState(false);

  useEffect(() => {
    loadGoogleMaps(() => setMapsApiLoaded(true));
  }, []);

  useEffect(() => {
    if (!mapsApiLoaded || mapRef.current || !window.google) return;
    const vLat = vendorLat ?? 6.6018;
    const vLng = vendorLng ?? 3.3515;
    const cLat = customerLat ?? 6.5244;
    const cLng = customerLng ?? 3.3792;
    const timeout = setTimeout(() => {
      if (!mapDivRef.current) return;
      const map = new window.google.maps.Map(mapDivRef.current, {
        center: { lat: vLat, lng: vLng },
        zoom: 13,
        disableDefaultUI: true,
        zoomControl: true,
        styles: [{ featureType: "poi", stylers: [{ visibility: "off" }] }, { featureType: "transit", stylers: [{ visibility: "off" }] }],
      });
      new window.google.maps.Marker({ position: { lat: vLat, lng: vLng }, map, icon: { path: window.google.maps.SymbolPath.CIRCLE, scale: 10, fillColor: "#10B981", fillOpacity: 1, strokeColor: "#fff", strokeWeight: 2 } });
      new window.google.maps.Marker({ position: { lat: cLat, lng: cLng }, map, icon: { path: window.google.maps.SymbolPath.CIRCLE, scale: 10, fillColor: "#FBBF24", fillOpacity: 1, strokeColor: "#fff", strokeWeight: 2 } });
      new window.google.maps.Polyline({ path: [{ lat: vLat, lng: vLng }, { lat: cLat, lng: cLng }], geodesic: true, strokeColor: "#10B981", strokeOpacity: 0.6, strokeWeight: 3, map });
      const bounds = new window.google.maps.LatLngBounds();
      bounds.extend({ lat: vLat, lng: vLng });
      bounds.extend({ lat: cLat, lng: cLng });
      map.fitBounds(bounds, 50);
      mapRef.current = map;
    }, 100);
    return () => clearTimeout(timeout);
  }, [mapsApiLoaded, vendorLat, vendorLng, customerLat, customerLng]);

  return <div ref={mapDivRef} className="w-full h-full bg-gray-100" />;
}

const CheckoutModal = ({
  open, onClose, onSubmit, loading,
  cartTotal = 0, vendorName = "", vendorPhone = "",
}: CheckoutModalProps) => {
  const navigate = useNavigate();
  const [screen, setScreen] = useState<Screen>("order");
  const [tip, setTip] = useState<TipAmount>(0);
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>("card");
  const [riderNote, setRiderNote] = useState("");
  const [gpsLoading, setGpsLoading] = useState(false);
  const [pinLat, setPinLat] = useState<number | null>(null);
  const [pinLng, setPinLng] = useState<number | null>(null);
  const [resolvedAddress, setResolvedAddress] = useState("");
  const [addressInput, setAddressInput] = useState("");
  const [suggestions, setSuggestions] = useState<any[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [addressLoading, setAddressLoading] = useState(false);
  const [orderId, setOrderId] = useState<string | null>(null);
  const [orderStatus, setOrderStatus] = useState("confirmed");
  const [processingPayment, setProcessingPayment] = useState(false);
  const [mapsApiLoaded, setMapsApiLoaded] = useState(false);
  const [mapInstance, setMapInstance] = useState<any>(null);
  const [marker, setMarker] = useState<any>(null);
  const mapDivRef = useRef<HTMLDivElement>(null);

  const [details, setDetails] = useState<DeliveryDetails>({
    name: localStorage.getItem("mirimore_checkout_name") || "",
    email: localStorage.getItem("mirimore_user_email") || "",
    phone: localStorage.getItem("mirimore_checkout_phone") || "",
    address: "",
    city: "Lagos",
  });

  const geocoder = useRef<any>(null);
  const acService = useRef<any>(null);

  // Load maps and services
  useEffect(() => {
    loadGoogleMaps(() => {
      setMapsApiLoaded(true);
      if (window.google) {
        geocoder.current = new window.google.maps.Geocoder();
        acService.current = new window.google.maps.places.AutocompleteService();
      }
    });
  }, []);

  // Initialize map when needed (only in "order" screen and after open)
  useEffect(() => {
    if (!open || screen !== "order" || !mapsApiLoaded || !mapDivRef.current) return;
    if (mapInstance) return; // already created
    const lat = pinLat ?? 6.6018;
    const lng = pinLng ?? 3.3515;
    const map = new window.google.maps.Map(mapDivRef.current, {
      center: { lat, lng },
      zoom: 16,
      disableDefaultUI: true,
      zoomControl: true,
      styles: [{ featureType: "poi", stylers: [{ visibility: "off" }] }, { featureType: "transit", stylers: [{ visibility: "off" }] }],
    });
    const m = new window.google.maps.Marker({
      position: { lat, lng },
      map,
      draggable: true,
      icon: { path: window.google.maps.SymbolPath.CIRCLE, scale: 12, fillColor: BRAND_GREEN, fillOpacity: 1, strokeColor: "#fff", strokeWeight: 3 },
    });
    m.addListener("dragend", () => {
      const pos = m.getPosition();
      const newLat = pos.lat();
      const newLng = pos.lng();
      setPinLat(newLat);
      setPinLng(newLng);
      reverseGeocode(newLat, newLng);
    });
    map.addListener("click", (e: any) => {
      m.setPosition(e.latLng);
      const newLat = e.latLng.lat();
      const newLng = e.latLng.lng();
      setPinLat(newLat);
      setPinLng(newLng);
      reverseGeocode(newLat, newLng);
    });
    setMapInstance(map);
    setMarker(m);
  }, [open, screen, mapsApiLoaded, pinLat, pinLng]);

  // Update map center and marker when pinLat/pinLng change externally
  useEffect(() => {
    if (mapInstance && marker && pinLat && pinLng) {
      const pos = new window.google.maps.LatLng(pinLat, pinLng);
      mapInstance.setCenter(pos);
      marker.setPosition(pos);
    }
  }, [pinLat, pinLng, mapInstance, marker]);

  const reverseGeocode = useCallback((lat: number, lng: number) => {
    if (!geocoder.current) return;
    geocoder.current.geocode({ location: { lat, lng } }, (results: any[], status: string) => {
      if (status === "OK" && results[0]) {
        const addr = results[0].formatted_address.replace(", Nigeria", "").replace(/^\d+,\s*/, "");
        setResolvedAddress(addr);
        setAddressInput(addr);
        setDetails(d => ({ ...d, address: addr, lat, lng }));
        localStorage.setItem("mirimore_last_address", addr);
        localStorage.setItem("mirimore_last_lat", String(lat));
        localStorage.setItem("mirimore_last_lng", String(lng));
      }
    });
  }, []);

  // Reset when modal closes
  useEffect(() => {
    if (!open) {
      setTimeout(() => {
        setScreen("order");
        setSuggestions([]);
        setShowSuggestions(false);
        setOrderId(null);
        setProcessingPayment(false);
        // Destroy map instance to avoid memory leaks
        if (mapInstance) {
          // optional: remove listeners
          setMapInstance(null);
          setMarker(null);
        }
      }, 400);
    }
  }, [open]);

  // Restore saved address from localStorage
  useEffect(() => {
    if (!open || !mapsApiLoaded) return;
    const lastAddr = localStorage.getItem("mirimore_last_address");
    const lastLat = localStorage.getItem("mirimore_last_lat");
    const lastLng = localStorage.getItem("mirimore_last_lng");
    if (lastAddr && lastLat && lastLng) {
      setResolvedAddress(lastAddr);
      setAddressInput(lastAddr);
      setDetails(d => ({ ...d, address: lastAddr, lat: +lastLat, lng: +lastLng }));
      setPinLat(+lastLat);
      setPinLng(+lastLng);
    } else {
      // Optionally get GPS on first launch
      // getGPS(); // uncomment if you want auto-location on open
    }
  }, [open, mapsApiLoaded]);

  // Handle address input and suggestions
  useEffect(() => {
    const timer = setTimeout(() => {
      if (!addressInput || addressInput === resolvedAddress || !acService.current) return;
      if (addressInput.length < 3) {
        setSuggestions([]);
        setShowSuggestions(false);
        return;
      }
      setAddressLoading(true);
      acService.current.getPlacePredictions(
        { input: addressInput, componentRestrictions: { country: "ng" }, types: ["address"] },
        (predictions: any[], status: string) => {
          setAddressLoading(false);
          if (status === "OK" && predictions?.length) {
            setSuggestions(predictions);
            setShowSuggestions(true);
          } else {
            setSuggestions([]);
            setShowSuggestions(false);
          }
        }
      );
    }, 450);
    return () => clearTimeout(timer);
  }, [addressInput, resolvedAddress]);

  const handleSelectSuggestion = (suggestion: any) => {
    setAddressInput(suggestion.description);
    setShowSuggestions(false);
    setSuggestions([]);
    if (geocoder.current) {
      geocoder.current.geocode({ placeId: suggestion.place_id }, (results: any[], status: string) => {
        if (status === "OK" && results[0]) {
          const loc = results[0].geometry.location;
          const lat = loc.lat();
          const lng = loc.lng();
          const addr = results[0].formatted_address.replace(", Nigeria", "").replace(/^\d+,\s*/, "");
          setResolvedAddress(addr);
          setPinLat(lat);
          setPinLng(lng);
          setDetails(d => ({ ...d, address: addr, lat, lng }));
          localStorage.setItem("mirimore_last_address", addr);
          localStorage.setItem("mirimore_last_lat", String(lat));
          localStorage.setItem("mirimore_last_lng", String(lng));
          toast.success("Address set!");
        }
      });
    }
  };

  const getGPS = useCallback(() => {
    setGpsLoading(true);
    toast.info("Getting your location…");
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const lat = pos.coords.latitude;
        const lng = pos.coords.longitude;
        if (geocoder.current) {
          geocoder.current.geocode({ location: { lat, lng } }, (results: any[], status: string) => {
            if (status === "OK" && results[0]) {
              const addr = results[0].formatted_address.replace(", Nigeria", "").replace(/^\d+,\s*/, "");
              setResolvedAddress(addr);
              setAddressInput(addr);
              setPinLat(lat);
              setPinLng(lng);
              setDetails(d => ({ ...d, address: addr, lat, lng }));
              localStorage.setItem("mirimore_last_address", addr);
              localStorage.setItem("mirimore_last_lat", String(lat));
              localStorage.setItem("mirimore_last_lng", String(lng));
              toast.success("Location detected!");
            } else {
              toast.error("Could not get address from location");
            }
            setGpsLoading(false);
          });
        } else {
          setGpsLoading(false);
          toast.error("Maps not ready, try again in a moment");
        }
      },
      (err) => {
        setGpsLoading(false);
        const msgs: Record<number, string> = { 1: "Please enable location permissions.", 2: "Location info unavailable.", 3: "Location request timed out." };
        toast.error("Could not get location. " + (msgs[err.code] || ""));
      },
      { enableHighAccuracy: true, timeout: 12000 }
    );
  }, []);

  const hasValidAddress = resolvedAddress?.trim() || details.address?.trim() || addressInput?.trim();
  const isValid = details.name.trim() && details.phone.trim() && hasValidAddress;

  const handlePay = async () => {
    if (!isValid) {
      toast.error("Please fill in all required fields (Name, Phone, and Address)");
      return;
    }
    setProcessingPayment(true);
    localStorage.setItem("mirimore_checkout_name", details.name);
    localStorage.setItem("mirimore_checkout_phone", details.phone);
    try {
      const result = await onSubmit({
        ...details,
        address: resolvedAddress || details.address || addressInput,
        tip,
        riderNote,
        paymentMethod,
        lat: pinLat ?? undefined,
        lng: pinLng ?? undefined,
      });
      const newOrderId = (result as any)?.orderId;
      if (newOrderId) setOrderId(newOrderId);
      setProcessingPayment(false);
      setScreen("success");
    } catch (err: any) {
      setProcessingPayment(false);
      toast.error(err?.message || "Payment failed. Please try again.");
    }
  };

  if (!open) return null;

  return (
    <AnimatePresence>
      <motion.div className="fixed inset-0 z-50 flex items-end justify-center" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
        <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={screen === "success" ? undefined : onClose} />
        <motion.div className="relative bg-white w-full max-w-md rounded-t-3xl shadow-2xl flex flex-col overflow-hidden" style={{ height: "92vh" }} initial={{ y: "100%" }} animate={{ y: 0 }} exit={{ y: "100%" }} transition={{ type: "spring", damping: 28, stiffness: 300 }}>
          <AnimatePresence mode="wait">
            {screen === "success" && (
              <motion.div key="success" initial={{ opacity: 0, y: 40 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} transition={{ duration: 0.4 }} className="flex flex-col h-full overflow-y-auto">
                <div className="bg-gradient-to-r from-[#10B981] to-[#059669] px-5 pt-8 pb-6 text-center flex-shrink-0">
                  <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: "spring", damping: 12, delay: 0.1 }} className="w-20 h-20 bg-white rounded-full flex items-center justify-center mx-auto mb-3 shadow-xl">
                    <CheckCircle className="w-10 h-10 text-[#10B981]" />
                  </motion.div>
                  <h2 className="text-2xl font-black text-white">Order Placed! 🎉</h2>
                  <p className="text-white/80 text-sm mt-1">Payment received. Your food is being prepared.</p>
                  {orderId && <div className="mt-2 inline-block bg-white/20 rounded-full px-3 py-1"><span className="text-white text-xs font-mono">#{orderId.slice(-8).toUpperCase()}</span></div>}
                </div>
                <div className="flex-shrink-0 h-44 bg-gray-100"><SuccessMap customerLat={pinLat ?? undefined} customerLng={pinLng ?? undefined} /></div>
                <div className="px-4 py-4 space-y-4 flex-1">
                  <div className="flex items-center justify-between bg-[#F0FDF4] border border-[#D1FAE5] rounded-2xl px-4 py-3">
                    <div className="flex items-center gap-2"><span className="text-xl">🛵</span><div><p className="text-xs font-bold text-[#10B981]">Estimated delivery</p><p className="text-xs text-[#059669]">Lagos traffic considered</p></div></div>
                    <div className="text-right"><p className="text-lg font-black text-[#10B981]">25–35</p><p className="text-[10px] text-[#059669] font-medium">minutes</p></div>
                  </div>
                  <div className="bg-white border border-gray-100 rounded-2xl p-4 shadow-sm"><p className="text-xs font-bold text-gray-500 uppercase tracking-wide mb-3">Live status</p><LiveTracker status={orderStatus} /></div>
                  {vendorName && (
                    <div className="bg-gray-50 rounded-2xl p-4 border border-gray-100">
                      <p className="text-xs font-bold text-gray-500 uppercase tracking-wide mb-2">Vendor</p>
                      <div className="flex items-center justify-between"><span className="text-sm font-semibold text-gray-800">{vendorName}</span>{vendorPhone && (<div className="flex gap-2"><a href={`tel:${vendorPhone}`} className="w-9 h-9 rounded-full bg-[#F0FDF4] flex items-center justify-center"><Phone className="w-4 h-4 text-[#10B981]" /></a><a href={`https://wa.me/${vendorPhone.replace(/\D/g, "")}`} target="_blank" rel="noopener noreferrer" className="w-9 h-9 rounded-full bg-[#F0FDF4] flex items-center justify-center"><MessageCircle className="w-4 h-4 text-[#10B981]" /></a></div>)}</div>
                    </div>
                  )}
                  <div className="flex gap-3 pb-4">
                    <button onClick={() => { onClose(); if (orderId) navigate(`/order-success?order_id=${orderId}`); }} className="flex-1 py-3 rounded-2xl bg-[#10B981] text-white font-bold text-sm flex items-center justify-center gap-2"><CheckCircle className="w-4 h-4" /> Track order</button>
                    <button onClick={onClose} className="flex-1 py-3 rounded-2xl bg-gray-100 text-gray-700 font-bold text-sm">Back to home</button>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {screen !== "success" && (
            <>
              <div className="flex items-center justify-between px-5 pt-5 pb-3 border-b border-gray-100 flex-shrink-0">
                <div className="flex items-center gap-3">
                  {screen === "payment" && (
                    <button onClick={() => setScreen("order")} className="p-1.5 rounded-full hover:bg-gray-100 active:scale-95">
                      <ChevronRight className="w-5 h-5 rotate-180 text-gray-400" />
                    </button>
                  )}
                  <h2 className="text-lg font-bold text-gray-900">{screen === "order" ? "Checkout" : "Payment method"}</h2>
                </div>
                <button onClick={onClose} className="p-2 rounded-full hover:bg-gray-100 active:scale-95"><X className="w-5 h-5 text-gray-500" /></button>
              </div>
              <div className="flex items-center gap-2 px-5 pt-3 pb-1 flex-shrink-0">
                {(["order", "payment"] as Screen[]).map((s, i) => (
                  <div key={s} className={`h-1 flex-1 rounded-full transition-all duration-300 ${screen === s ? "bg-[#10B981]" : screen === "payment" && i === 0 ? "bg-[#10B981]/40" : "bg-gray-200"}`} />
                ))}
              </div>

              {screen === "order" && (
                <div className="flex-1 overflow-y-auto px-5 pb-6 pt-3 space-y-5">
                  {/* Vendor name (if provided) */}
                  {vendorName && (
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-1">
                        <span className="text-lg">🏪</span>
                        <span className="font-semibold text-gray-800">{vendorName}</span>
                      </div>
                    </div>
                  )}

                  {/* Address search with map preview */}
                  <div>
                    <p className="text-xs font-bold text-gray-500 uppercase tracking-wide mb-2">📍 Choose delivery location</p>
                    <div className="relative">
                      <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#10B981] pointer-events-none" />
                      <input
                        type="text"
                        placeholder="Search apartments, streets, places"
                        value={addressInput}
                        onChange={e => {
                          setAddressInput(e.target.value);
                          if (!e.target.value) {
                            setResolvedAddress("");
                            setSuggestions([]);
                            setShowSuggestions(false);
                          }
                        }}
                        className="w-full h-12 pl-9 pr-20 rounded-xl border border-gray-200 bg-gray-50 text-sm outline-none focus:border-[#10B981] focus:ring-1 focus:ring-[#10B981] transition-colors"
                      />
                      <button
                        onClick={getGPS}
                        disabled={gpsLoading}
                        className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-1 text-xs text-[#10B981] font-bold px-2 py-1.5 rounded-lg hover:bg-[#F0FDF4] active:scale-95 transition-all"
                      >
                        {gpsLoading ? (
                          <div className="w-3 h-3 rounded-full border border-[#10B981] border-t-transparent animate-spin" />
                        ) : (
                          <Navigation className="w-3 h-3" />
                        )}
                        <span>{gpsLoading ? "…" : "GPS"}</span>
                      </button>
                    </div>

                    {/* Map preview (160px tall) */}
                    <div className="mt-2 rounded-xl overflow-hidden border border-gray-200" style={{ height: 160 }}>
                      <div ref={mapDivRef} className="w-full h-full bg-gray-100" />
                    </div>

                    {showSuggestions && suggestions.length > 0 && (
                      <div className="mt-1 bg-white border border-gray-200 rounded-xl shadow-lg max-h-48 overflow-y-auto z-10 relative">
                        {suggestions.map(s => (
                          <button
                            key={s.place_id}
                            onClick={() => handleSelectSuggestion(s)}
                            className="w-full px-4 py-2.5 text-left flex items-start gap-2 border-b border-gray-100 last:border-0 hover:bg-gray-50 transition-colors"
                          >
                            <MapPin className="w-3 h-3 text-gray-400 mt-0.5 flex-shrink-0" />
                            <p className="text-xs text-gray-800">{s.description}</p>
                          </button>
                        ))}
                      </div>
                    )}

                    {addressLoading && (
                      <p className="text-[10px] text-gray-400 mt-1 flex items-center gap-1">
                        <span className="w-2 h-2 rounded-full border border-[#10B981] border-t-transparent animate-spin inline-block" />
                        Loading suggestions…
                      </p>
                    )}

                    {resolvedAddress && !showSuggestions && (
                      <p className="text-xs text-[#10B981] font-semibold mt-1.5 px-1 flex items-center gap-1">
                        <Check className="w-3 h-3" /> {resolvedAddress}
                      </p>
                    )}
                  </div>

                  {/* Contact details */}
                  <div>
                    <p className="text-xs font-bold text-gray-500 uppercase tracking-wide mb-2">👤 Contact details</p>
                    <div className="space-y-3">
                      {[
                        { key: "name", type: "text", icon: <User className="w-3 h-3" />, label: "Full name", placeholder: "Your full name" },
                        { key: "phone", type: "tel", icon: <Phone className="w-3 h-3" />, label: "Phone number", placeholder: "08012345678" },
                        { key: "email", type: "email", icon: <Mail className="w-3 h-3" />, label: "Email (receipt)", placeholder: "you@example.com" },
                      ].map(f => (
                        <div key={f.key} className="space-y-1">
                          <Label className="text-xs text-gray-500 flex items-center gap-1">{f.icon} {f.label}</Label>
                          <Input
                            type={f.type}
                            placeholder={f.placeholder}
                            value={(details as any)[f.key]}
                            onChange={e => setDetails(d => ({ ...d, [f.key]: e.target.value }))}
                            className="h-11 rounded-xl"
                          />
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Note for rider & Tip */}
                  <div>
                    <p className="text-xs font-bold text-gray-500 uppercase tracking-wide mb-2">🗒️ Note for rider (optional)</p>
                    <Input
                      placeholder="e.g. Call when arrived, gate code 1234…"
                      value={riderNote}
                      onChange={e => setRiderNote(e.target.value)}
                      className="h-11 rounded-xl"
                    />
                  </div>

                  <div>
                    <p className="text-xs font-bold text-gray-500 uppercase tracking-wide mb-1">🙏 Tip your rider</p>
                    <p className="text-[10px] text-gray-400 mb-2">100% goes to your rider. They appreciate it!</p>
                    <div className="flex gap-2">
                      {TIPS.map(t => (
                        <button
                          key={t}
                          onClick={() => setTip(t)}
                          className={`flex-1 py-2.5 rounded-xl text-xs font-bold border transition-all active:scale-95 ${
                            tip === t
                              ? "bg-[#10B981] text-white border-[#10B981] shadow-md"
                              : "bg-white text-gray-600 border-gray-200 hover:border-[#10B981]/40"
                          }`}
                        >
                          {t === 0 ? "None" : `₦${t}`}
                        </button>
                      ))}
                    </div>
                  </div>

                  <button
                    onClick={() => setScreen("payment")}
                    disabled={!isValid}
                    className="w-full h-14 rounded-2xl font-bold text-base text-white flex items-center justify-center gap-2 bg-[#10B981] shadow-lg shadow-[#10B981]/30 active:scale-[0.97] transition-transform disabled:opacity-40 disabled:cursor-not-allowed"
                  >
                    Choose payment method <ChevronRight className="w-5 h-5" />
                  </button>

                  {!hasValidAddress && (
                    <p className="text-xs text-amber-600 text-center">⚠️ Please enter your delivery address above to continue</p>
                  )}
                </div>
              )}

              {screen === "payment" && (
                <div className="flex-1 overflow-y-auto px-5 pb-6 pt-3 space-y-4">
                  <p className="text-xs font-bold text-gray-500 uppercase tracking-wide">Select how to pay</p>
                  {PAYMENT_OPTIONS.map(opt => (
                    <button
                      key={opt.id}
                      onClick={() => setPaymentMethod(opt.id)}
                      className={`w-full flex items-center gap-3 p-4 rounded-2xl border transition-all active:scale-[0.98] text-left ${
                        paymentMethod === opt.id ? "border-[#10B981] bg-[#F0FDF4] shadow-sm" : "border-gray-200 bg-white hover:border-[#10B981]/30"
                      }`}
                    >
                      <div className="w-10 h-10 rounded-xl bg-gray-100 flex items-center justify-center text-lg flex-shrink-0">{opt.icon}</div>
                      <div className="flex-1">
                        <p className="text-sm font-bold text-gray-900">{opt.label}</p>
                        <p className="text-[11px] text-gray-500">{opt.sub}</p>
                      </div>
                      <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center flex-shrink-0 transition-all ${
                        paymentMethod === opt.id ? "border-[#10B981] bg-[#10B981]" : "border-gray-300"
                      }`}>
                        {paymentMethod === opt.id && <Check className="w-3 h-3 text-white" />}
                      </div>
                    </button>
                  ))}
                  <div className="bg-gray-50 rounded-2xl p-4 space-y-2 border border-gray-100">
                    <p className="text-xs font-bold text-gray-500 uppercase tracking-wide">Order summary</p>
                    {[
                      ["Delivery to", resolvedAddress || details.address || addressInput],
                      cartTotal ? ["Subtotal", `₦${cartTotal.toLocaleString()}`] : null,
                      tip > 0 ? ["Rider tip", `₦${tip.toLocaleString()}`] : null,
                      riderNote ? ["Note", riderNote] : null,
                    ].filter(Boolean).map(([label, val]) => (
                      <div key={label as string} className="flex justify-between text-sm">
                        <span className="text-gray-500">{label}</span>
                        <span className="font-medium text-gray-900 text-right max-w-[55%] truncate">{val}</span>
                      </div>
                    ))}
                  </div>
                  <div className="flex items-center gap-2 bg-gray-50 rounded-xl px-3 py-2.5 border border-gray-100">
                    <span className="text-base">🔒</span>
                    <p className="text-[11px] text-gray-500">Secured by Flutterwave · 256-bit SSL · Card details never stored</p>
                  </div>
                  <button
                    onClick={handlePay}
                    disabled={processingPayment || loading}
                    className="w-full h-14 rounded-2xl font-bold text-base text-white flex items-center justify-center gap-2 bg-[#10B981] shadow-lg shadow-[#10B981]/30 active:scale-[0.97] transition-transform disabled:opacity-60"
                  >
                    {processingPayment || loading ? (
                      <><div className="w-5 h-5 rounded-full border-2 border-white border-t-transparent animate-spin" /> Processing…</>
                    ) : (
                      "Pay to order 🚀"
                    )}
                  </button>
                </div>
              )}
            </>
          )}
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

export default CheckoutModal;