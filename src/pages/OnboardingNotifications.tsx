// src/pages/OnboardingNotifications.tsx
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Bell, ArrowRight, Check, X, BellRing, BellOff, Zap } from "lucide-react";
import { supabase } from "@/lib/supabase";
import { toast } from "sonner";
import MiramoreLogo from "@/components/MiramoreLogo";

export default function OnboardingNotifications() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [permissionStatus, setPermissionStatus] = useState<NotificationPermission | "unsupported">("default");
  const [submitted, setSubmitted] = useState(false);

  useEffect(() => {
    // Check current permission status
    if ("Notification" in window) {
      setPermissionStatus(Notification.permission);
    } else {
      setPermissionStatus("unsupported");
    }
  }, []);

  const completeOnboarding = async () => {
    const userId = sessionStorage.getItem("user_id");
    const email = sessionStorage.getItem("onboarding_email");
    const phone = sessionStorage.getItem("onboarding_phone");

    if (userId && email && phone) {
      await supabase
        .from("profiles")
        .update({
          email,
          phone,
          onboarding_completed: true,
          updated_at: new Date().toISOString(),
        })
        .eq("id", userId);
    }

    // Clear onboarding session data
    sessionStorage.removeItem("onboarding_email");
    sessionStorage.removeItem("onboarding_phone");
    sessionStorage.removeItem("user_id");
    sessionStorage.removeItem("user_email");
    sessionStorage.removeItem("user_phone");
    localStorage.setItem("onboarding_complete", "true");

    navigate("/home", { replace: true });
  };

  const requestNotificationPermission = async () => {
    if (permissionStatus === "unsupported") {
      toast.info("Notifications not supported on this browser. Continuing to app...");
      setTimeout(() => completeOnboarding(), 500);
      return;
    }

    if (permissionStatus === "granted") {
      // Already granted, just save and continue
      await saveNotificationPreference(true);
      toast.success("Notifications already enabled! Welcome to Miramore!");
      setTimeout(() => completeOnboarding(), 800);
      return;
    }

    setLoading(true);
    try {
      const permission = await Notification.requestPermission();
      setPermissionStatus(permission);

      if (permission === "granted") {
        await saveNotificationPreference(true);
        toast.success("Notifications enabled! 🎉 You'll receive order updates & exclusive offers.");
        setSubmitted(true);
        setTimeout(() => completeOnboarding(), 1000);
      } else {
        await saveNotificationPreference(false);
        toast.info("You can always enable notifications later in your phone settings.");
        setSubmitted(true);
        setTimeout(() => completeOnboarding(), 800);
      }
    } catch (err) {
      console.error("Notification permission error:", err);
      toast.error("Unable to request permission. You can enable later.");
      setTimeout(() => completeOnboarding(), 500);
    } finally {
      setLoading(false);
    }
  };

  const saveNotificationPreference = async (enabled: boolean) => {
    const userId = sessionStorage.getItem("user_id");
    if (userId) {
      await supabase
        .from("profiles")
        .update({
          notifications_enabled: enabled,
          updated_at: new Date().toISOString(),
        })
        .eq("id", userId);
    }
  };

  const skipAndContinue = async () => {
    setLoading(true);
    await saveNotificationPreference(false);
    setSubmitted(true);
    setTimeout(() => completeOnboarding(), 300);
  };

  const goBack = () => {
    navigate("/onboarding/location");
  };

  // Determine the main illustration based on permission state
  const getIllustration = () => {
    if (permissionStatus === "granted") return <BellRing className="w-8 h-8 text-white" />;
    if (permissionStatus === "denied") return <BellOff className="w-8 h-8 text-white" />;
    return <Bell className="w-8 h-8 text-white" />;
  };

  const getMessage = () => {
    if (permissionStatus === "granted") return "Notifications are already enabled. Let's go!";
    if (permissionStatus === "denied") return "You've previously blocked notifications. You can enable them later in settings.";
    return "Get real‑time updates on your orders, exclusive discounts, and faster support.";
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
        <h1 className="text-2xl font-bold text-gray-900">Stay in the loop</h1>
        <p className="text-sm text-gray-500 mt-2">Never miss a deal or delivery update</p>
      </div>

      <div className="flex-1 px-6 max-w-md mx-auto w-full">
        <div className="space-y-6">
          <div className="bg-gradient-to-br from-brand-red/10 via-orange-50 to-purple-50 rounded-2xl p-6 text-center border border-brand-red/10">
            <div
              className={`w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 shadow-md transition-all ${
                permissionStatus === "granted" ? "bg-green-500" : "bg-brand-red"
              }`}
            >
              {getIllustration()}
            </div>
            <div className="flex items-center justify-center gap-1 mb-2">
              <Zap className="w-3 h-3 text-amber-500" />
              <span className="text-[10px] font-bold text-amber-600 uppercase tracking-wider">Benefits</span>
            </div>
            <p className="text-sm text-gray-700 leading-relaxed">{getMessage()}</p>
          </div>

          {submitted && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-green-50 rounded-xl p-3 border border-green-200 flex items-center gap-2"
            >
              <Check className="w-4 h-4 text-green-600" />
              <p className="text-xs text-green-700">Taking you to the app...</p>
            </motion.div>
          )}

          <button
            onClick={requestNotificationPermission}
            disabled={loading || permissionStatus === "granted"}
            className={`w-full py-3 rounded-xl font-semibold flex items-center justify-center gap-2 active:scale-95 transition-all shadow-md ${
              permissionStatus === "granted"
                ? "bg-green-500 text-white cursor-default"
                : "bg-brand-red text-white hover:bg-brand-red/90"
            } disabled:opacity-60`}
          >
            {loading ? (
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
            ) : permissionStatus === "granted" ? (
              <>
                <Check className="w-4 h-4" /> Already enabled
              </>
            ) : (
              <>
                <Bell className="w-4 h-4" /> Turn on notifications
              </>
            )}
          </button>

          <button
            onClick={skipAndContinue}
            disabled={loading}
            className="w-full py-3 rounded-xl bg-gray-100 text-gray-700 font-semibold active:scale-95 transition-all hover:bg-gray-200 disabled:opacity-50"
          >
            {loading ? "Please wait..." : "Maybe later →"}
          </button>

          {permissionStatus === "denied" && (
            <p className="text-center text-[10px] text-gray-400">
              💡 You blocked notifications. To enable, go to Settings → Apps → Miramore → Permissions.
            </p>
          )}
        </div>
      </div>

      <div className="h-8" />
    </motion.div>
  );
}