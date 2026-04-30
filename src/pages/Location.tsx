import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { MapPin, Mail, Loader2, Navigation, CheckCircle, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";

declare global {
  interface Window {
    google: any;
    initGoogleMaps: () => void;
  }
}

const GOOGLE_MAPS_API_KEY = import.meta.env.VITE_GOOGLE_MAPS_API_KEY;

// Load Google Maps script
let mapsLoaded = false;
let mapsLoading = false;
const mapsCallbacks: (() => void)[] = [];

function loadGoogleMaps(callback: () => void) {
  if (mapsLoaded) { callback(); return; }
  mapsCallbacks.push(callback);
  if (mapsLoading) return;
  mapsLoading = true;
  
  window.initGoogleMaps = () => {
    mapsLoaded = true;
    mapsCallbacks.forEach(cb => cb());
    mapsCallbacks.length = 0;
  };
  
  const script = document.createElement("script");
  script.src = `https://maps.googleapis.com/maps/api/js?key=${GOOGLE_MAPS_API_KEY}&libraries=places&callback=initGoogleMaps`;
  script.async = true;
  script.defer = true;
  document.head.appendChild(script);
}

const Location = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [emailError, setEmailError] = useState("");
  const [loading, setLoading] = useState(false);
  const [detectedAddress, setDetectedAddress] = useState("");
  const [isDetecting, setIsDetecting] = useState(false);
  const [mapsReady, setMapsReady] = useState(false);
  const geocoder = useRef<any>(null);

  // Load Google Maps
  useEffect(() => {
    loadGoogleMaps(() => {
      if (window.google && window.google.maps) {
        geocoder.current = new window.google.maps.Geocoder();
        setMapsReady(true);
      }
    });
  }, []);

  const validateEmail = (val: string) => {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(val);
  };

  // Reverse geocode coordinates to get address
  const reverseGeocode = (lat: number, lng: number): Promise<string> => {
    return new Promise((resolve) => {
      if (!geocoder.current) {
        resolve("");
        return;
      }
      
      geocoder.current.geocode(
        { location: { lat, lng } },
        (results: any[], status: string) => {
          if (status === "OK" && results[0]) {
            const addr = results[0].formatted_address
              .replace(", Nigeria", "")
              .replace(/^\d+,\s*/, "");
            resolve(addr);
          } else {
            resolve("");
          }
        }
      );
    });
  };

  const detectLocation = () => {
    setIsDetecting(true);
    
    if (!navigator.geolocation) {
      toast.error("Geolocation is not supported by your browser");
      setIsDetecting(false);
      return;
    }

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { latitude, longitude } = position.coords;
        
        // Save coordinates
        localStorage.setItem("mirimore_user_lat", String(latitude));
        localStorage.setItem("mirimore_user_lng", String(longitude));
        
        // Try to get address from coordinates
        if (mapsReady && geocoder.current) {
          const address = await reverseGeocode(latitude, longitude);
          if (address) {
            setDetectedAddress(address);
            localStorage.setItem("mirimore_user_address", address);
            toast.success(`📍 Located you at: ${address.substring(0, 50)}...`);
          } else {
            toast.success("Location detected! We'll find nearby vendors for you.");
          }
        } else {
          toast.success("Location detected! We'll find nearby vendors for you.");
        }
        
        setIsDetecting(false);
      },
      (error) => {
        setIsDetecting(false);
        console.error("Geolocation error:", error);
        
        let errorMessage = "Could not get your location. ";
        switch(error.code) {
          case error.PERMISSION_DENIED:
            errorMessage += "Please enable location permissions.";
            break;
          case error.POSITION_UNAVAILABLE:
            errorMessage += "Location information is unavailable.";
            break;
          case error.TIMEOUT:
            errorMessage += "Location request timed out.";
            break;
        }
        toast.error(errorMessage);
      },
      { enableHighAccuracy: true, timeout: 10000 }
    );
  };

  const startRealtimeTracking = () => {
    if ("geolocation" in navigator) {
      navigator.geolocation.watchPosition(
        (position) => {
          localStorage.setItem("mirimore_user_lat", String(position.coords.latitude));
          localStorage.setItem("mirimore_user_lng", String(position.coords.longitude));
        },
        () => {
          // Silent fail - already handled
        },
        { enableHighAccuracy: true, maximumAge: 10000, timeout: 10000 }
      );
    }
  };

  const handleContinue = async () => {
    if (!email.trim()) {
      setEmailError("Abeg enter your email first 😊");
      return;
    }
    if (!validateEmail(email.trim())) {
      setEmailError("Oga/Madam, that email no look correct 😅");
      return;
    }

    setEmailError("");
    setLoading(true);

    // Save email locally
    localStorage.setItem("mirimore_user_email", email.trim());
    localStorage.setItem("mirimore_onboarding_complete", "true");

    // Request GPS and start real-time tracking
    if ("geolocation" in navigator) {
      navigator.geolocation.getCurrentPosition(
        async (position) => {
          const lat = position.coords.latitude;
          const lng = position.coords.longitude;
          
          localStorage.setItem("mirimore_user_lat", String(lat));
          localStorage.setItem("mirimore_user_lng", String(lng));
          
          // Get address from coordinates if maps is ready
          if (mapsReady && geocoder.current) {
            const address = await reverseGeocode(lat, lng);
            if (address) {
              localStorage.setItem("mirimore_user_address", address);
            }
          }
          
          startRealtimeTracking();
          setLoading(false);
          navigate("/home");
        },
        () => {
          toast.info("No wahala! You can still browse, but we can't show you nearby vendors. 📍");
          startRealtimeTracking();
          setLoading(false);
          navigate("/home");
        },
        { enableHighAccuracy: true, timeout: 10000 }
      );
    } else {
      setLoading(false);
      navigate("/home");
    }
  };

  return (
    <div
      className="fixed inset-0 flex flex-col items-center justify-between px-6 py-10 overflow-y-auto"
      style={{ background: "linear-gradient(160deg, #F9F6F0 0%, #EDFAF5 100%)" }}
    >
      {/* Top Animated Map Illustration */}
      <div className="w-full flex flex-col items-center pt-6 pb-2">
        <div
          className="relative w-52 h-52 rounded-full flex items-center justify-center mb-6"
          style={{
            background: "radial-gradient(circle, #e0fdf4 60%, #a7f3d0 100%)",
            boxShadow: "0 0 0 12px #d1fae533, 0 0 0 24px #a7f3d011",
            animation: "pulse-glow 2.5s ease-in-out infinite",
          }}
        >
          {/* Fake animated map pins */}
          <svg viewBox="0 0 200 200" className="w-44 h-44 absolute" xmlns="http://www.w3.org/2000/svg">
            <line x1="40" y1="100" x2="160" y2="100" stroke="#d1d5db" strokeWidth="3" />
            <line x1="100" y1="40" x2="100" y2="160" stroke="#d1d5db" strokeWidth="3" />
            <line x1="40" y1="60" x2="160" y2="140" stroke="#e5e7eb" strokeWidth="2" />
            <line x1="40" y1="140" x2="160" y2="60" stroke="#e5e7eb" strokeWidth="2" />
            <circle cx="70" cy="65" r="10" fill="#14b8a6" opacity="0.9" className="animate-bounce" />
            <polygon points="70,75 64,65 76,65" fill="#14b8a6" opacity="0.9" />
            <circle cx="140" cy="80" r="10" fill="#14b8a6" opacity="0.85" />
            <polygon points="140,90 134,80 146,80" fill="#14b8a6" opacity="0.85" />
            <circle cx="110" cy="140" r="10" fill="#14b8a6" opacity="0.8" />
            <polygon points="110,150 104,140 116,140" fill="#14b8a6" opacity="0.8" />
            <circle cx="55" cy="130" r="9" fill="#ef4444" opacity="0.85" />
            <polygon points="55,139 49,130 61,130" fill="#ef4444" opacity="0.85" />
            <circle cx="150" cy="130" r="9" fill="#ef4444" opacity="0.8" />
            <polygon points="150,139 144,130 156,130" fill="#ef4444" opacity="0.8" />
            <circle cx="100" cy="100" r="8" fill="#3b82f6" opacity="1" />
            <circle cx="100" cy="100" r="14" fill="#3b82f699" />
          </svg>
        </div>

        <h1
          className="text-4xl font-extrabold italic text-center leading-tight mb-1"
          style={{ color: "#0d9488", fontFamily: "Georgia, serif" }}
        >
          Oya, Where You Dey? 📍
        </h1>

        <h2 className="text-lg font-bold text-center text-gray-700 mb-3">
          Your Neighbourhood, Your Vibe!
        </h2>

        <p className="text-center text-gray-500 text-sm leading-relaxed max-w-xs">
          Make we show you the closest vendors, hottest deals, and exclusive
          offers near you. Your location dey safe with us — we no go share am
          anyhow. 🔒
        </p>
      </div>

      {/* Location Detection Button */}
      <div className="w-full max-w-sm mt-4">
        <button
          onClick={detectLocation}
          disabled={isDetecting}
          className="w-full h-12 rounded-xl font-medium flex items-center justify-center gap-2 transition-all"
          style={{
            background: "linear-gradient(90deg, #0d9488, #14b8a6)",
            color: "#fff",
            opacity: isDetecting ? 0.7 : 1,
          }}
        >
          {isDetecting ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              Detecting your location...
            </>
          ) : (
            <>
              <Navigation className="w-4 h-4" />
              Use My Current Location
            </>
          )}
        </button>

        {/* Detected Address Display */}
        {detectedAddress && (
          <div className="mt-3 p-3 bg-green-50 rounded-xl border border-green-200 flex items-start gap-2">
            <CheckCircle className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
            <div className="flex-1">
              <p className="text-xs font-medium text-green-800">📍 Location detected</p>
              <p className="text-[11px] text-green-700 mt-0.5">{detectedAddress}</p>
            </div>
          </div>
        )}
      </div>

      {/* Email Section */}
      <div className="w-full max-w-sm flex flex-col gap-3 mt-4">
        <label className="text-sm font-semibold" style={{ color: "#0d9488" }}>
          Stay in the Loop 🎉
        </label>
        <Input
          type="email"
          placeholder="Drop your email — e.g. you@example.com"
          value={email}
          onChange={(e) => {
            setEmail(e.target.value);
            setEmailError("");
          }}
          className="h-12 rounded-xl border-2 text-sm focus:border-teal-500 transition-colors"
          style={{ borderColor: emailError ? "#ef4444" : "#d1d5db" }}
        />
        {emailError && (
          <p className="text-xs text-red-500 -mt-1">{emailError}</p>
        )}

        <p className="text-xs text-gray-400 text-center">
          You fit change this setting anytime.
        </p>
      </div>

      {/* CTA Button */}
      <div className="w-full max-w-sm mt-4">
        <Button
          onClick={handleContinue}
          disabled={loading}
          className="w-full h-14 text-base font-bold rounded-2xl active:scale-[0.97] transition-transform flex items-center justify-center gap-2"
          style={{
            background: "linear-gradient(90deg, #0d9488, #14b8a6)",
            color: "#fff",
            boxShadow: "0 4px 20px #14b8a644",
          }}
        >
          {loading ? (
            <Loader2 className="w-5 h-5 animate-spin" />
          ) : (
            "E Don Set — Let's Go! 🚀"
          )}
        </Button>

        {/* Skip option */}
        <button
          onClick={() => {
            localStorage.setItem("mirimore_onboarding_complete", "true");
            navigate("/home");
          }}
          className="w-full text-center text-xs text-gray-400 mt-3 underline underline-offset-2"
        >
          Skip for now
        </button>
      </div>

      <style>{`
        @keyframes pulse-glow {
          0%, 100% { box-shadow: 0 0 0 12px #d1fae533, 0 0 0 24px #a7f3d011; }
          50% { box-shadow: 0 0 0 18px #d1fae555, 0 0 0 36px #a7f3d022; }
        }
      `}</style>
    </div>
  );
};

export default Location;