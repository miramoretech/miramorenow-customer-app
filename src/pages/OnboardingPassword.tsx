// src/pages/OnboardingPassword.tsx
import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Lock, ArrowRight, Eye, EyeOff, Shield, X, CheckCircle2, AlertCircle } from "lucide-react";
import { supabase } from "@/lib/supabase";
import { toast } from "sonner";
import MiramoreLogo from "@/components/MiramoreLogo";

export default function OnboardingPassword() {
  const navigate = useNavigate();
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [touched, setTouched] = useState({ password: false, confirm: false });
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  // Password strength calculation
  const calculateStrength = (pwd: string): { score: 0 | 1 | 2 | 3; label: string; color: string } => {
    let score = 0;
    if (pwd.length >= 6) score++;
    if (pwd.length >= 8) score++;
    if (/[A-Z]/.test(pwd)) score++;
    if (/[0-9]/.test(pwd)) score++;
    if (/[^A-Za-z0-9]/.test(pwd)) score++;
    // Normalize to 0-3 range for display
    let finalScore: 0 | 1 | 2 | 3 = 0;
    if (score >= 4) finalScore = 3;
    else if (score >= 2) finalScore = 2;
    else if (score >= 1) finalScore = 1;
    else finalScore = 0;
    const labels = ["Very weak", "Weak", "Fair", "Strong"];
    const colors = ["#EF4444", "#F97316", "#EAB308", "#22C55E"];
    return { score: finalScore, label: labels[finalScore], color: colors[finalScore] };
  };

  const strength = calculateStrength(password);

  // Validation checks
  const isValidLength = password.length >= 6;
  const hasMix = /[A-Za-z]/.test(password) && /[0-9]/.test(password);
  const passwordsMatch = password === confirmPassword && password !== "";
  const isPasswordValid = isValidLength && hasMix;
  const canSubmit = isPasswordValid && passwordsMatch && !loading;

  const getValidationIcon = (condition: boolean) =>
    condition ? <CheckCircle2 className="w-3.5 h-3.5 text-green-500" /> : <AlertCircle className="w-3.5 h-3.5 text-gray-400" />;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setTouched({ password: true, confirm: true });
    if (!isPasswordValid) {
      toast.error("Please meet all password requirements");
      return;
    }
    if (!passwordsMatch) {
      toast.error("Passwords do not match");
      return;
    }

    setLoading(true);
    try {
      const email = sessionStorage.getItem("onboarding_email");
      const phone = sessionStorage.getItem("onboarding_phone");
      const rememberMe = sessionStorage.getItem("remember_me") === "true";

      if (!email) {
        toast.error("Email not found. Please restart.");
        navigate("/onboarding/email");
        return;
      }

      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            phone,
            full_name: email.split("@")[0],
            onboarding_completed: false,
          },
        },
      });

      if (error) throw error;

      if (data.user) {
        sessionStorage.setItem("user_id", data.user.id);
        sessionStorage.setItem("user_email", email);
        sessionStorage.setItem("user_phone", phone || "");
        if (rememberMe) {
          // Optional: store session persistence flag
        }
        toast.success("Account created successfully!");
        navigate("/onboarding/location");
      }
    } catch (error: any) {
      console.error("Signup error:", error);
      toast.error(error.message || "Unable to create account. Please try again.");
    } finally {
      setLoading(false);
    }
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
        onClick={() => navigate(-1)}
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
        <h1 className="text-2xl font-bold text-gray-900">Secure your account</h1>
        <p className="text-sm text-gray-500 mt-2">Create a strong password to protect your account</p>
      </div>

      <div className="flex-1 px-6 max-w-md mx-auto w-full">
        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Password field */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                ref={inputRef}
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                onBlur={() => setTouched((p) => ({ ...p, password: true }))}
                placeholder="Minimum 6 characters"
                className={`w-full pl-10 pr-12 py-3 rounded-xl border ${
                  touched.password && !isValidLength ? "border-red-300 bg-red-50" : "border-gray-200 bg-gray-50"
                } text-sm focus:outline-none focus:border-brand-red focus:ring-1 focus:ring-brand-red transition-all`}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2"
              >
                {showPassword ? <EyeOff className="w-4 h-4 text-gray-400" /> : <Eye className="w-4 h-4 text-gray-400" />}
              </button>
            </div>
            {touched.password && (
              <div className="mt-2 space-y-1 text-[11px]">
                <div className="flex items-center gap-1.5">
                  {getValidationIcon(isValidLength)}
                  <span className={isValidLength ? "text-green-600" : "text-gray-500"}>
                    At least 6 characters
                  </span>
                </div>
                <div className="flex items-center gap-1.5">
                  {getValidationIcon(hasMix)}
                  <span className={hasMix ? "text-green-600" : "text-gray-500"}>
                    Mix of letters and numbers
                  </span>
                </div>
              </div>
            )}
          </div>

          {/* Password strength indicator (only show when password has some input) */}
          {password.length > 0 && (
            <div className="space-y-1">
              <div className="flex justify-between text-[11px]">
                <span className="text-gray-500">Password strength</span>
                <span style={{ color: strength.color }} className="font-medium">
                  {strength.label}
                </span>
              </div>
              <div className="h-1.5 w-full bg-gray-100 rounded-full overflow-hidden">
                <div
                  className="h-full transition-all duration-300 rounded-full"
                  style={{ width: `${(strength.score + 1) * 25}%`, backgroundColor: strength.color }}
                />
              </div>
            </div>
          )}

          {/* Confirm password field */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Confirm password</label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type={showConfirmPassword ? "text" : "password"}
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                onBlur={() => setTouched((p) => ({ ...p, confirm: true }))}
                placeholder="Re-enter your password"
                className={`w-full pl-10 pr-12 py-3 rounded-xl border ${
                  touched.confirm && confirmPassword && !passwordsMatch ? "border-red-300 bg-red-50" : "border-gray-200 bg-gray-50"
                } text-sm focus:outline-none focus:border-brand-red focus:ring-1 focus:ring-brand-red transition-all`}
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2"
              >
                {showConfirmPassword ? <EyeOff className="w-4 h-4 text-gray-400" /> : <Eye className="w-4 h-4 text-gray-400" />}
              </button>
            </div>
            {touched.confirm && confirmPassword && !passwordsMatch && (
              <p className="text-red-500 text-[11px] mt-1 flex items-center gap-1">
                <AlertCircle className="w-3 h-3" /> Passwords do not match
              </p>
            )}
          </div>

          {/* Security tip */}
          <div className="bg-amber-50 rounded-xl p-3 border border-amber-100">
            <div className="flex items-start gap-2">
              <Shield className="w-4 h-4 text-amber-600 mt-0.5 flex-shrink-0" />
              <p className="text-[10px] text-amber-700">
                For better security, use a mix of uppercase, lowercase, numbers, and symbols. Never reuse passwords from other sites.
              </p>
            </div>
          </div>

          <button
            type="submit"
            disabled={!canSubmit || loading}
            className="w-full py-3 rounded-xl bg-brand-red text-white font-semibold flex items-center justify-center gap-2 active:scale-95 transition-transform disabled:opacity-50 disabled:cursor-not-allowed shadow-md"
          >
            {loading ? (
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
            ) : (
              <ArrowRight className="w-4 h-4" />
            )}
            {loading ? "Creating account..." : "Create account & continue"}
          </button>
        </form>
      </div>

      <div className="h-6" />
    </motion.div>
  );
}