// src/pages/OnboardingLocation.tsx
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Navigation, MapPin, ArrowRight, Check, AlertCircle, X, Search } from "lucide-react";
import { Geolocation } from "@capacitor/geolocation";
import { Capacitor } from "@capacitor/core";
import { supabase } from "@/lib/supabase";
import { toast } from "sonner";
import MiramoreLogo from "@/components/MiramoreLogo";

declare global {
  interface Window {
    google: any;
  }
}

export default function OnboardingLocation() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [locationPermission, setLocationPermission] = useState<"precise" | "approximate" | null>(null);
  const [address, setAddress] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [manualAddress, setManualAddress] = useState("");
  const [isManualMode, setIsManualMode] = useState(false);
  const [saving, setSaving] = useState(false);

  const saveLocationToDatabase = async (lat: number | null, lng: number | null, addr: string) => {
    const userId = sessionStorage.getItem("user_id");
    if (userId) {
      await supabase
        .from("profiles")
        .update({
          latitude: lat,
          longitude: lng,
          location_address: addr,
          updated_at: new Date().toISOString(),
        })
        .eq("id", userId);
    }
    localStorage.setItem("user_lat", String(lat ?? ""));
    localStorage.setItem("user_lng", String(lng ?? ""));
    localStorage.setItem("user_address", addr);
  };

  const geocodeAddress = async (addressString: string): Promise<{ lat: number; lng: number; formatted: string } | null> => {
    if (!window.google?.maps?.Geocoder) {
      toast.error("Geocoding service not ready. Please use location detection or try again.");
      return null;
    }
    const geocoder = new window.google.maps.Geocoder();
    return new Promise((resolve) => {
      geocoder.geocode({ address: addressString }, (results: any, status: string) => {
        if (status === "OK" && results[0]) {
          const { lat, lng } = results[0].geometry.location;
          resolve({ lat: lat(), lng: lng(), formatted: results[0].formatted_address });
        } else {
          resolve(null);
        }
      });
    });
  };

  const getCurrentLocation = async (type: "precise" | "approximate") => {
    setLoading(true);
    setError(null);

    try {
      if (Capacitor.isNativePlatform()) {
        const permissions = await Geolocation.requestPermissions({
          permissions: type === "precise" ? ["fineLocation", "coarseLocation"] : ["coarseLocation"],
        });
        if (
          (type === "precise" && permissions.location !== "granted") ||
          (type === "approximate" && permissions.coarseLocation !== "granted")
        ) {
          setError("Location permission denied. Please enable it in your phone settings.");
          setLoading(false);
          return;
        }
      }

      const position = await Geolocation.getCurrentPosition({
        enableHighAccuracy: type === "precise",
        timeout: 15000,
      });

      const { latitude, longitude } = position.coords;

      let formattedAddress = "";
      try {
        const response = await fetch(
          `https://maps.googleapis.com/maps/api/geocode/json?latlng=${latitude},${longitude}&key=${import.meta.env.VITE_GOOGLE_MAPS_API_KEY}`
        );
        const data = await response.json();
        if (data.results[0]) {
          formattedAddress = data.results[0].formatted_address;
        } else {
          formattedAddress = `${latitude}, ${longitude}`;
        }
      } catch (geocodeError) {
        formattedAddress = `${latitude}, ${longitude}`;
      }

      setAddress(formattedAddress);
      await saveLocationToDatabase(latitude, longitude, formattedAddress);
      toast.success("Location saved! You'll see nearby vendors.");
    } catch (err: any) {
      console.error("Location error:", err);
      if (err.message?.includes("denied")) {
        setError("Location denied. Please enable it in Settings → Apps → Miramore → Permissions.");
      } else if (err.message?.includes("unavailable")) {
        setError("GPS unavailable. Please turn on location in your phone settings.");
      } else if (err.message?.includes("timeout")) {
        setError("Location timed out. Please try again near a window or open area.");
      } else {
        setError("Unable to detect location. You can enter your address manually or skip for now.");
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (locationPermission) {
      getCurrentLocation(locationPermission);
    }
  }, [locationPermission]);

  const handleManualSubmit = async () => {
    if (!manualAddress.trim()) {
      setError("Please enter a valid address.");
      return;
    }
    setSaving(true);
    setError(null);
    const geocodeResult = await geocodeAddress(manualAddress);
    if (geocodeResult) {
      setAddress(geocodeResult.formatted);
      await saveLocationToDatabase(geocodeResult.lat, geocodeResult.lng, geocodeResult.formatted);
      toast.success("Address saved!");
      setIsManualMode(false);
    } else {
      setError("Could not find that address. Please be more specific (e.g., include street, city).");
    }
    setSaving(false);
  };

  const handleContinue = async () => {
    navigate("/onboarding/notifications");
  };

  const goBack = () => {
    navigate("/onboarding/password");
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="min-h-screen bg-white flex flex-col"
    >
      {/* Back button */}
      <button
        onClick={goBack}
        className="absolute top-5 left-5 p-2 rounded-full bg-gray-100 text-gray-600 hover:bg-gray-200 transition"
        aria-label="Go back"
      >
        <X className="w-5 h-5" />
      </button>

      <div className="pt-12 pb-4 flex justify-center">
        <div className="text-center">
          <MiramoreLogo size="lg" />
          <div className="mt-2">
            <p className="text-xs font-semibold text-brand-red tracking-wide">NIGERIA'S #1 DELIVERY APP</p>
          </div>
        </div>
      </div>

      <div className="text-center mb-6 px-6">
        <h1 className="text-2xl font-bold text-gray-900">Where are you?</h1>
        <p className="text-sm text-gray-500 mt-2">We'll find delicious food and shops near you</p>
      </div>

      <div className="flex-1 px-6 max-w-md mx-auto w-full">
        {!isManualMode ? (
          <div className="space-y-5">
            <div className="bg-gray-50 rounded-xl p-5 border border-gray-100">
              <div className="space-y-3">
                <p className="text-xs font-medium text-gray-500 mb-1">Choose precision</p>
                <button
                  onClick={() => setLocationPermission("precise")}
                  disabled={loading}
                  className={`w-full flex items-center justify-between p-4 rounded-xl border transition-all ${
                    locationPermission === "precise"
                      ? "border-brand-red bg-brand-red/5"
                      : "border-gray-200 bg-white"
                  } ${loading ? "opacity-50 cursor-not-allowed" : ""}`}
                >
                  <div className="flex items-center gap-3">
                    <Navigation className="w-5 h-5 text-brand-red" />
                    <div className="text-left">
                      <p className="text-sm font-semibold">Precise location</p>
                      <p className="text-xs text-gray-500">Best for accurate delivery</p>
                    </div>
                  </div>
                  <div className={`w-5 h-5 rounded-full border-2 ${
                    locationPermission === "precise" ? "border-brand-red bg-brand-red" : "border-gray-300"
                  }`} />
                </button>

                <button
                  onClick={() => setLocationPermission("approximate")}
                  disabled={loading}
                  className={`w-full flex items-center justify-between p-4 rounded-xl border transition-all ${
                    locationPermission === "approximate"
                      ? "border-brand-red bg-brand-red/5"
                      : "border-gray-200 bg-white"
                  } ${loading ? "opacity-50 cursor-not-allowed" : ""}`}
                >
                  <div className="flex items-center gap-3">
                    <MapPin className="w-5 h-5 text-gray-500" />
                    <div className="text-left">
                      <p className="text-sm font-semibold">Approximate location</p>
                      <p className="text-xs text-gray-500">Faster, uses less battery</p>
                    </div>
                  </div>
                  <div className={`w-5 h-5 rounded-full border-2 ${
                    locationPermission === "approximate" ? "border-brand-red bg-brand-red" : "border-gray-300"
                  }`} />
                </button>
              </div>
            </div>

            {loading && (
              <div className="flex flex-col items-center gap-2 py-3">
                <div className="w-6 h-6 border-2 border-brand-red border-t-transparent rounded-full animate-spin" />
                <p className="text-xs text-gray-500">Getting your location...</p>
              </div>
            )}

            {error && (
              <div className="bg-red-50 rounded-xl p-3 border border-red-200 flex items-start gap-2">
                <AlertCircle className="w-4 h-4 text-red-500 mt-0.5 shrink-0" />
                <p className="text-xs text-red-600 flex-1">{error}</p>
              </div>
            )}

            {address && !loading && (
              <div className="bg-green-50 rounded-xl p-3 border border-green-200 flex items-center gap-2">
                <Check className="w-4 h-4 text-green-600 shrink-0" />
                <p className="text-xs text-green-700 flex-1 line-clamp-2">{address}</p>
              </div>
            )}

            <button
              onClick={() => setIsManualMode(true)}
              className="text-center text-sm text-brand-red font-medium py-2 w-full"
            >
              Enter address manually →
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="bg-gray-50 rounded-xl p-4">
              <label className="text-sm font-medium text-gray-700 mb-2 block">Your address</label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="text"
                  value={manualAddress}
                  onChange={(e) => setManualAddress(e.target.value)}
                  placeholder="e.g., 12 Bishop Oluwole Street, Victoria Island, Lagos"
                  className="w-full pl-9 pr-4 py-3 rounded-xl border border-gray-200 text-sm focus:outline-none focus:border-brand-red focus:ring-1 focus:ring-brand-red bg-white"
                />
              </div>
              {error && (
                <p className="text-red-500 text-xs mt-2 flex items-center gap-1">
                  <AlertCircle className="w-3 h-3" /> {error}
                </p>
              )}
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => {
                  setIsManualMode(false);
                  setError(null);
                  setManualAddress("");
                }}
                className="flex-1 py-3 rounded-xl bg-gray-100 text-gray-700 font-medium"
              >
                Back
              </button>
              <button
                onClick={handleManualSubmit}
                disabled={saving || !manualAddress.trim()}
                className="flex-1 py-3 rounded-xl bg-brand-red text-white font-semibold flex items-center justify-center gap-2 disabled:opacity-50"
              >
                {saving ? <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" /> : <Check className="w-4 h-4" />}
                Save address
              </button>
            </div>
          </div>
        )}

        {/* Continue & Skip buttons - always visible */}
        <div className="mt-6 space-y-3">
          <button
            onClick={handleContinue}
            className="w-full py-3 rounded-xl bg-brand-red text-white font-semibold flex items-center justify-center gap-2 active:scale-95 transition-transform shadow-md"
          >
            Continue <ArrowRight className="w-4 h-4" />
          </button>
          <button
            onClick={() => navigate("/onboarding/notifications")}
            className="w-full py-2 text-sm text-gray-400"
          >
            Skip for now
          </button>
        </div>
      </div>

      <div className="h-6" />
    </motion.div>
  );
}