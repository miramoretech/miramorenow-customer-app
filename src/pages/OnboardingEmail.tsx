// src/pages/OnboardingEmail.tsx
import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Mail, ArrowRight, Sparkles, X, CheckCircle2, AlertCircle } from "lucide-react";
import { toast } from "sonner";
import MiramoreLogo from "@/components/MiramoreLogo";

export default function OnboardingEmail() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [touched, setTouched] = useState(false);
  const [error, setError] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  const isValidEmail = (email: string): boolean => {
    const re = /^[^\s@]+@([^\s@]+\.)+[^\s@]+$/;
    return re.test(email);
  };

  const handleEmailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setEmail(value);
    setTouched(true);
    if (value && !isValidEmail(value)) {
      setError("Enter a valid email address (e.g., name@example.com)");
    } else {
      setError("");
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setTouched(true);
    if (!email.trim()) {
      setError("Email address is required");
      return;
    }
    if (!isValidEmail(email)) {
      setError("Please enter a valid email address");
      return;
    }

    setLoading(true);
    try {
      sessionStorage.setItem("onboarding_email", email);
      navigate("/onboarding/password");
    } catch (err) {
      toast.error("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const goBack = () => {
    navigate("/onboarding/phone");
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
        <h1 className="text-2xl font-bold text-gray-900">What's your email?</h1>
        <p className="text-sm text-gray-500 mt-2">
          We'll send order updates and exclusive offers
        </p>
      </div>

      <div className="flex-1 px-6 max-w-md mx-auto w-full">
        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Email address</label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                ref={inputRef}
                type="email"
                value={email}
                onChange={handleEmailChange}
                onBlur={() => setTouched(true)}
                placeholder="hello@miramore.com"
                className={`w-full pl-10 pr-12 py-3 rounded-xl border ${
                  touched && error ? "border-red-300 bg-red-50" : "border-gray-200 bg-gray-50"
                } text-sm focus:outline-none focus:border-brand-red focus:ring-1 focus:ring-brand-red transition-all`}
                autoComplete="email"
              />
              {touched && email && !error && isValidEmail(email) && (
                <CheckCircle2 className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-green-500" />
              )}
            </div>
            {touched && error && (
              <p className="text-red-500 text-xs mt-1 flex items-center gap-1">
                <AlertCircle className="w-3 h-3" /> {error}
              </p>
            )}
          </div>

          <button
            type="submit"
            disabled={loading || (touched && !!error) || (email && !isValidEmail(email))}
            className="w-full py-3 rounded-xl bg-brand-red text-white font-semibold flex items-center justify-center gap-2 active:scale-95 transition-transform disabled:opacity-50 disabled:cursor-not-allowed shadow-md"
          >
            {loading ? (
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
            ) : (
              <ArrowRight className="w-4 h-4" />
            )}
            {loading ? "Please wait..." : "Continue"}
          </button>

          <div className="bg-gray-50 rounded-xl p-4 border border-gray-100">
            <div className="flex items-start gap-2">
              <Sparkles className="w-4 h-4 text-brand-red mt-0.5 flex-shrink-0" />
              <p className="text-[10px] text-gray-500 leading-relaxed">
                We'll never share your email. You can unsubscribe from marketing emails anytime.
              </p>
            </div>
          </div>
        </form>
      </div>

      <div className="h-8" />
    </motion.div>
  );
}