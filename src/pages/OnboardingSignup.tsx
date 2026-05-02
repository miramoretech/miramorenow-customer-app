// src/pages/OnboardingSignup.tsx
import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Mail, Lock, Eye, EyeOff, Smartphone, ArrowRight, X, CheckCircle } from "lucide-react";
import { supabase } from "@/lib/supabase";
import { toast } from "sonner";
import MiramoreLogo from "@/components/MiramoreLogo";
import { Geolocation } from "@capacitor/geolocation";
import { Capacitor } from "@capacitor/core";

export default function OnboardingSignup() {
  const navigate = useNavigate();
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const emailRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    emailRef.current?.focus();
  }, []);

  // Phone formatting (Nigerian 10-digit)
  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let raw = e.target.value.replace(/\D/g, "");
    if (raw.startsWith("0")) raw = raw.slice(1);
    if (raw.length > 10) raw = raw.slice(0, 10);
    setPhone(raw);
  };

  const isValidPhone = () => /^\d{10}$/.test(phone);
  const isValidEmail = () => email.trim().includes("@") && email.trim().includes(".");
  // No password length restriction – any non-empty password is allowed
  const isValidPassword = () => password.trim().length > 0;

  // Request location and save to database
  const requestAndSaveLocation = async (userId: string): Promise<boolean> => {
    try {
      if (Capacitor.isNativePlatform()) {
        const perm = await Geolocation.requestPermissions({
          permissions: ["fineLocation", "coarseLocation"],
        });
        if (perm.location !== "granted") {
          toast.warning("Location permission denied. You can enable it later in settings.");
          return false;
        }
      }
      const position = await Geolocation.getCurrentPosition({
        enableHighAccuracy: true,
        timeout: 15000,
      });
      const { latitude, longitude } = position.coords;

      let formattedAddress = "";
      try {
        const res = await fetch(
          `https://maps.googleapis.com/maps/api/geocode/json?latlng=${latitude},${longitude}&key=${import.meta.env.VITE_GOOGLE_MAPS_API_KEY}`
        );
        const data = await res.json();
        formattedAddress = data.results[0]?.formatted_address || `${latitude}, ${longitude}`;
      } catch {
        formattedAddress = `${latitude}, ${longitude}`;
      }

      await supabase
        .from("profiles")
        .update({
          latitude,
          longitude,
          location_address: formattedAddress,
          updated_at: new Date().toISOString(),
        })
        .eq("id", userId);

      localStorage.setItem("user_lat", String(latitude));
      localStorage.setItem("user_lng", String(longitude));
      localStorage.setItem("user_address", formattedAddress);

      toast.success("Location saved! We'll show you nearby vendors.");
      return true;
    } catch (err: any) {
      console.error("Location error:", err);
      toast.error("Could not get your location. You can set it later in your profile.");
      return false;
    }
  };

  // Request notification permission and save preference
  const requestAndSaveNotifications = async (userId: string): Promise<void> => {
    if (!("Notification" in window)) {
      await supabase.from("profiles").update({ notifications_enabled: false }).eq("id", userId);
      return;
    }

    let permission = Notification.permission;
    if (permission === "default") {
      permission = await Notification.requestPermission();
    }
    const enabled = permission === "granted";
    await supabase.from("profiles").update({ notifications_enabled: enabled }).eq("id", userId);
    if (enabled) {
      toast.success("Notifications enabled! You'll receive order updates & offers.");
    } else {
      toast.info("You can enable notifications later in your phone settings.");
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!isValidPhone()) {
      toast.error("Enter a valid 10-digit phone number (e.g., 8012345678)");
      return;
    }
    if (!isValidEmail()) {
      toast.error("Enter a valid email address");
      return;
    }
    if (!isValidPassword()) {
      toast.error("Please enter a password");
      return;
    }

    setLoading(true);
    try {
      const fullPhone = `+234${phone}`;
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            phone: fullPhone,
            full_name: email.split("@")[0],
            onboarding_completed: false,
          },
        },
      });

      if (error) throw error;

      if (data.user) {
        const userId = data.user.id;
        sessionStorage.setItem("user_id", userId);
        sessionStorage.setItem("user_email", email);
        sessionStorage.setItem("user_phone", fullPhone);

        toast.success("Account created! 🎉");

        // Step 1: request & save location
        await requestAndSaveLocation(userId);

        // Step 2: request & save notification preference
        await requestAndSaveNotifications(userId);

        // Step 3: mark onboarding as complete
        await supabase
          .from("profiles")
          .update({ onboarding_completed: true })
          .eq("id", userId);

        // Clear any leftover session data
        sessionStorage.removeItem("onboarding_phone");
        localStorage.setItem("onboarding_complete", "true");

        // Navigate to home
        navigate("/", { replace: true });
      }
    } catch (error: any) {
      toast.error(error.message || "Unable to create account. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col" style={{ background: "linear-gradient(160deg, #1a5c2a 0%, #2d8a3e 40%, #f5a623 100%)" }}>
      {/* Decorative blobs */}
      <div className="absolute top-[-60px] right-[-60px] w-[220px] h-[220px] rounded-full bg-[rgba(245,166,35,0.18)] pointer-events-none" />
      <div className="absolute top-[120px] left-[-80px] w-[180px] h-[180px] rounded-full bg-[rgba(255,255,255,0.07)] pointer-events-none" />

      {/* Back button */}
      <button
        onClick={() => navigate(-1)}
        className="absolute top-5 left-5 p-2 rounded-full transition bg-white/20 text-white"
        aria-label="Go back"
      >
        <X className="w-5 h-5" />
      </button>

      {/* Logo */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="pt-14 pb-6 flex flex-col items-center"
      >
        <MiramoreLogo size="lg" />
        <p className="text-xs font-bold tracking-widest text-[#f5d98b] mt-2">NIGERIA'S #1 DELIVERY APP</p>
      </motion.div>

      {/* Form card */}
      <motion.div
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.55 }}
        className="flex-1 mx-4 mb-8 rounded-3xl overflow-hidden bg-white/95 shadow-xl"
      >
        <div className="px-1 py-1 text-center bg-gradient-to-r from-[#1a5c2a] to-[#f5a623]">
          <p className="text-white text-xs font-semibold py-0.5">Create your free account</p>
        </div>

        <div className="px-6 pt-7 pb-2">
          <h1 className="text-2xl font-extrabold text-gray-900">Join Miramore 🚀</h1>
          <p className="text-sm text-gray-500 mb-6">Fast delivery, amazing deals — just for you</p>

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Phone */}
            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-1 uppercase tracking-wide">
                Phone Number
              </label>
              <div className="relative">
                <Smartphone className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-[#2d8a3e]" />
                <input
                  type="tel"
                  inputMode="numeric"
                  value={phone}
                  onChange={handlePhoneChange}
                  placeholder="8012345678"
                  className="w-full pl-10 pr-4 py-3.5 rounded-2xl text-sm outline-none border-2 border-gray-200 bg-gray-50 focus:border-[#2d8a3e] transition"
                  autoComplete="tel"
                />
              </div>
              {phone && isValidPhone() && (
                <div className="flex justify-end items-center gap-1 mt-1">
                  <CheckCircle className="w-3 h-3 text-green-600" />
                  <span className="text-[10px] text-green-600">Valid Nigerian number</span>
                </div>
              )}
            </div>

            {/* Email */}
            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-1 uppercase tracking-wide">
                Email Address
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-[#2d8a3e]" />
                <input
                  ref={emailRef}
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@example.com"
                  className="w-full pl-10 pr-4 py-3.5 rounded-2xl text-sm outline-none border-2 border-gray-200 bg-gray-50 focus:border-[#2d8a3e] transition"
                  autoComplete="email"
                />
              </div>
            </div>

            {/* Password - no length restriction */}
            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-1 uppercase tracking-wide">
                Password
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-[#2d8a3e]" />
                <input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Any password (no length limit)"
                  className="w-full pl-10 pr-12 py-3.5 rounded-2xl text-sm outline-none border-2 border-gray-200 bg-gray-50 focus:border-[#2d8a3e] transition"
                  autoComplete="new-password"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400"
                  tabIndex={-1}
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-4 rounded-2xl font-bold text-white flex items-center justify-center gap-2 transition-all active:scale-95 disabled:opacity-60"
              style={{
                background: loading ? "#9ca3af" : "linear-gradient(90deg, #1a5c2a 0%, #2d8a3e 60%, #f5a623 100%)",
                boxShadow: loading ? "none" : "0 4px 18px rgba(26,92,42,0.28)",
              }}
            >
              {loading ? (
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                <ArrowRight className="w-5 h-5" />
              )}
              {loading ? "Creating account..." : "Create Account & Continue"}
            </button>
          </form>
        </div>

        {/* Bonus strip */}
        <div className="mx-6 my-5 rounded-2xl px-4 py-3 flex items-center gap-3 bg-green-50 border border-green-200">
          <span className="text-xl">🎁</span>
          <p className="text-xs text-green-700 leading-relaxed">
            <strong>Welcome bonus:</strong> Get ₦500 off your first order after signing up!
          </p>
        </div>
      </motion.div>
    </div>
  );
}