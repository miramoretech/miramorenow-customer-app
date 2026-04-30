// src/pages/OnboardingPhoneLogin.tsx
import { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowRight, Check, X, Loader2 } from "lucide-react";
import { toast } from "sonner";
import MiramoreLogo from "@/components/MiramoreLogo";

export default function OnboardingPhoneLogin() {
  const navigate = useNavigate();
  const [phone, setPhone] = useState("");
  const [rememberMe, setRememberMe] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  // Focus input on mount
  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  // Validate and format phone number (Nigerian 10-digit after +234)
  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let raw = e.target.value.replace(/\D/g, ""); // Remove non-digits
    if (raw.startsWith("0")) raw = raw.slice(1);
    if (raw.length > 10) raw = raw.slice(0, 10);
    setPhone(raw);
    setError("");
  };

  const isValidPhone = (): boolean => {
    if (!phone) return false;
    // Must be 10 digits after +234 (i.e., exactly 10 digits)
    return /^\d{10}$/.test(phone);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!phone.trim()) {
      setError("Phone number is required");
      return;
    }
    if (!isValidPhone()) {
      setError("Enter a valid 10‑digit phone number (e.g., 8012345678)");
      return;
    }

    setLoading(true);
    try {
      // Save the full international format for consistency
      const fullNumber = `+234${phone}`;
      sessionStorage.setItem("onboarding_phone", fullNumber);
      sessionStorage.setItem("remember_me", rememberMe ? "true" : "false");
      // Navigate to email step
      navigate("/onboarding/email");
    } catch (err) {
      toast.error("Network error. Please try again.");
      setError("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  // Display phone with +234 prefix and formatted segments for visual clarity
  const formattedPhoneDisplay = phone ? `+234 ${phone.slice(0, 4)} ${phone.slice(4, 7)} ${phone.slice(7, 10)}` : "";

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="min-h-screen bg-black flex flex-col"
    >
      {/* Close / Back button */}
      <button
        onClick={() => navigate(-1)}
        className="absolute top-5 left-5 p-2 rounded-full bg-white/10 text-white/70 hover:bg-white/20 transition"
        aria-label="Go back"
      >
        <X className="w-5 h-5" />
      </button>

      <div className="flex-1 flex flex-col items-center justify-center px-6">
        <div className="text-center mb-8">
          <MiramoreLogo size="lg" variant="light" />
          <p className="text-white/60 text-xs mt-2 tracking-wide">NIGERIA'S #1 DELIVERY APP</p>
        </div>

        <h1 className="text-2xl font-bold text-white mb-2">Log in or sign up</h1>
        <p className="text-sm text-gray-400 mb-8">Enter your phone number to continue</p>

        <form onSubmit={handleSubmit} className="w-full max-w-sm space-y-6">
          <div className="relative">
            <div className="absolute left-0 top-1/2 -translate-y-1/2 flex items-center gap-1">
              <span className="text-white font-medium">+234</span>
              <span className="text-gray-600">|</span>
            </div>
            <input
              ref={inputRef}
              type="tel"
              inputMode="numeric"
              value={phone}
              onChange={handlePhoneChange}
              placeholder="8012345678"
              className={`w-full pl-16 pr-4 py-3 bg-transparent border-b text-white text-base focus:outline-none focus:border-brand-red transition-colors ${
                error ? "border-red-500" : "border-gray-700"
              }`}
              aria-invalid={!!error}
              aria-describedby="phone-error"
            />
            {phone && !error && (
              <div className="text-xs text-gray-500 mt-1 flex justify-between">
                <span>{formattedPhoneDisplay}</span>
                {isValidPhone() && <Check className="w-4 h-4 text-green-500" />}
              </div>
            )}
            {error && (
              <p id="phone-error" className="text-red-500 text-xs mt-1">
                {error}
              </p>
            )}
          </div>

          <label className="flex items-center gap-2 cursor-pointer">
            <div
              onClick={() => setRememberMe(!rememberMe)}
              className={`w-5 h-5 rounded border-2 flex items-center justify-center transition-all ${
                rememberMe ? "border-brand-red bg-brand-red" : "border-gray-600"
              }`}
            >
              {rememberMe && <Check className="w-3 h-3 text-white" />}
            </div>
            <span className="text-sm text-gray-400">Remember my login for faster sign-in</span>
          </label>

          <button
            type="submit"
            disabled={loading || !isValidPhone()}
            className="w-full py-3 rounded-lg bg-brand-red text-white font-semibold flex items-center justify-center gap-2 active:scale-95 transition-transform disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <ArrowRight className="w-4 h-4" />}
            {loading ? "Please wait..." : "Continue"}
          </button>
        </form>

        <p className="text-[10px] text-gray-500 text-center mt-8 max-w-xs">
          By continuing, you agree to our{" "}
          <button type="button" className="text-white underline" onClick={() => navigate("/terms")}>
            Terms of Service
          </button>
          ,{" "}
          <button type="button" className="text-white underline" onClick={() => navigate("/privacy")}>
            Privacy Policy
          </button>{" "}
          and{" "}
          <button type="button" className="text-white underline" onClick={() => navigate("/content-policy")}>
            Content Policy
          </button>
        </p>
      </div>
    </motion.div>
  );
}