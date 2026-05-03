import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { UserPlus, LogIn, Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

// ✅ FIXED LOGO IMPORT
import logo from "../assets/icon.png";

export default function Welcome() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [greeting, setGreeting] = useState("");
  const [isCompact, setIsCompact] = useState(false);

  // SCREEN SIZE DETECTION
  useEffect(() => {
    const checkScreen = () => {
      setIsCompact(window.innerHeight < 700);
    };

    checkScreen();
    window.addEventListener("resize", checkScreen);
    return () => window.removeEventListener("resize", checkScreen);
  }, []);

  // GREETING
  useEffect(() => {
    const getGreeting = () => {
      const hour = new Date().getHours();

      const morning = ["Good morning, Miramore Fam! 💚", "Rise and shine ☀️"];
      const afternoon = ["Good afternoon, Miramore Fam! 💚", "Lunch time? 🍲"];
      const evening = ["Good evening, Miramore Fam! 💚", "Dinner time 🍛"];

      const group =
        hour < 12 ? morning : hour < 17 ? afternoon : evening;

      setGreeting(group[Math.floor(Math.random() * group.length)]);
    };

    getGreeting();
    const interval = setInterval(getGreeting, 60000);
    return () => clearInterval(interval);
  }, []);

  // SESSION CHECK
  useEffect(() => {
    const checkSession = async () => {
      const { data: { session } } = await supabase.auth.getSession();

      if (session) {
        navigate("/home", { replace: true });
        return;
      }

      setLoading(false);
    };

    checkSession();
  }, [navigate]);

  const features = [
    { title: "Shopping", icon: "https://cdn-icons-png.flaticon.com/512/263/263142.png" },
    { title: "Delivery", icon: "/ridermiramore.png" },
    { title: "Food", icon: "https://cdn-icons-png.flaticon.com/512/1046/1046784.png" },
    { title: "Beauty", icon: "/hairbeauty.png" },
    { title: "AI", icon: "https://cdn-icons-png.flaticon.com/512/4712/4712027.png" },
    { title: "Games", icon: "https://cdn-icons-png.flaticon.com/512/686/686589.png" }
  ];

  if (loading) {
    return (
      <div className="min-h-screen bg-[#1B5E20] flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-white animate-spin" />
      </div>
    );
  }

  return (
    <div className={`min-h-screen bg-[#1B5E20] flex flex-col justify-between transition-all
      ${isCompact ? "px-4 py-6" : "px-6 py-10"}`}>

      {/* HEADER LOGO SECTION */}
      <div className={`text-center ${isCompact ? "mt-2" : "mt-6"}`}>

        {/* ✅ NEW LOGO */}
        <motion.img
          src={logo}
          alt="Miramore Logo"
          className="w-24 h-24 mx-auto object-contain rounded-2xl shadow-lg"
          initial={{ opacity: 0, scale: 0.7 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5 }}
        />

        <motion.h1
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className={`text-white font-bold mt-4 ${
            isCompact ? "text-lg" : "text-xl sm:text-2xl"
          }`}
        >
          {greeting}
        </motion.h1>

        <p className="text-white/80 text-xs sm:text-sm mt-2">
          MiramoreNow — The App for Everything
        </p>
      </div>

      {/* FEATURES */}
      <div className={`grid grid-cols-3 ${isCompact ? "gap-3 my-6" : "gap-4 my-10"}`}>
        {features.map((item, i) => (
          <motion.div
            key={i}
            whileTap={{ scale: 0.92 }}
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.05 }}
            className="flex flex-col items-center"
          >
            <div className={`bg-white rounded-2xl flex items-center justify-center shadow-sm
              ${isCompact ? "w-14 h-14" : "w-16 h-16"}`}>
              <img
                src={item.icon}
                className={isCompact ? "w-9 h-9" : "w-11 h-11"}
              />
            </div>

            <p className="text-white text-[10px] sm:text-xs mt-2 font-medium">
              {item.title}
            </p>
          </motion.div>
        ))}
      </div>

      {/* CTA */}
      <div className="space-y-3">
        <button
          onClick={() => navigate("/onboarding/phone-login")}
          className={`w-full bg-white text-[#1B5E20] rounded-xl font-bold flex items-center justify-center gap-2 active:scale-95
          ${isCompact ? "py-3 text-base" : "py-4 text-lg"}`}
        >
          <UserPlus className="w-5 h-5" />
          Create Account
        </button>

        <button
          onClick={() => navigate("/login")}
          className={`w-full border-2 border-white text-white rounded-xl font-bold flex items-center justify-center gap-2 active:scale-95
          ${isCompact ? "py-3 text-base" : "py-4 text-lg"}`}
        >
          <LogIn className="w-5 h-5" />
          Login
        </button>
      </div>

      <p className="text-white/50 text-[10px] text-center mt-4">
        Eat. Shop. Live Nigerian 🇳🇬
      </p>
    </div>
  );
}