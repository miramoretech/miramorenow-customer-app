import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { UserPlus, LogIn, Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

export default function Welcome() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [greeting, setGreeting] = useState("");
  const [isCompact, setIsCompact] = useState(false);

  // 🔥 DETECT SCREEN HEIGHT (Adaptive UI)
  useEffect(() => {
    const checkScreen = () => {
      const height = window.innerHeight;
      setIsCompact(height < 700); // small phones
    };

    checkScreen();
    window.addEventListener("resize", checkScreen);
    return () => window.removeEventListener("resize", checkScreen);
  }, []);

  // 🔥 DYNAMIC GREETING
  useEffect(() => {
    const getGreeting = () => {
      const hour = new Date().getHours();

      const morningMessages = [
        "Good morning, Miramore Fam! 💚",
        "Rise and shine! Ready for something tasty? 🍳",
        "Morning! Let’s get your day started right ☀️"
      ];

      const afternoonMessages = [
        "Good afternoon, Miramore Fam! 💚",
        "Lunch time? We’ve got you covered 🍲",
        "What are you craving today? 👀"
      ];

      const eveningMessages = [
        "Good evening, Miramore Fam! 💚",
        "Dinner plans? Let’s handle that 🍛",
        "Relax, we’ll bring it to you 🚀"
      ];

      let selectedGroup;

      if (hour < 12) selectedGroup = morningMessages;
      else if (hour < 17) selectedGroup = afternoonMessages;
      else selectedGroup = eveningMessages;

      const randomIndex = Math.floor(Math.random() * selectedGroup.length);
      setGreeting(selectedGroup[randomIndex]);
    };

    getGreeting();
    const interval = setInterval(getGreeting, 60000);
    return () => clearInterval(interval);
  }, []);

  // ✅ SESSION CHECK
  useEffect(() => {
    const checkSession = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session) navigate("/home");
      setLoading(false);
    };
    checkSession();
  }, [navigate]);

  // ✅ FEATURES
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
    <div
      className={`min-h-screen bg-[#1B5E20] flex flex-col justify-between transition-all duration-300
      ${isCompact ? "px-4 py-6" : "px-6 py-10"}`}
    >

      {/* HEADER */}
      <div className={`text-center ${isCompact ? "mt-2" : "mt-6"}`}>
        <motion.h1
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className={`text-white font-bold ${
            isCompact ? "text-lg" : "text-xl sm:text-2xl"
          }`}
        >
          {greeting}
        </motion.h1>

        <p className="text-white/80 text-xs sm:text-sm mt-2 tracking-wide">
          MiramoreNow — The App for Everything
        </p>
      </div>

      {/* FEATURES */}
      <div
        className={`grid grid-cols-3 ${
          isCompact ? "gap-3 my-6" : "gap-4 my-10"
        }`}
      >
        {features.map((item, i) => (
          <motion.div
            key={i}
            whileTap={{ scale: 0.92 }}
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.05 }}
            className="flex flex-col items-center"
          >
            <div
              className={`bg-white rounded-2xl flex items-center justify-center shadow-sm
              ${isCompact ? "w-14 h-14" : "w-16 h-16"}`}
            >
              <img
                src={item.icon}
                alt={item.title}
                className={`object-contain ${
                  isCompact ? "w-9 h-9" : "w-11 h-11"
                }`}
              />
            </div>

            <p className="text-white text-[10px] sm:text-xs mt-2 font-medium text-center">
              {item.title}
            </p>
          </motion.div>
        ))}
      </div>

      {/* CTA */}
      <div className="space-y-3">
        <button
          onClick={() => navigate("/onboarding/phone-login")}
          className={`w-full bg-white text-[#1B5E20] rounded-xl font-bold flex items-center justify-center gap-2 active:scale-95 transition
          ${isCompact ? "py-3 text-base" : "py-4 text-lg"}`}
        >
          <UserPlus className="w-5 h-5" />
          Create Account
        </button>

        <button
          onClick={() => navigate("/login")}
          className={`w-full border-2 border-white text-white rounded-xl font-bold flex items-center justify-center gap-2 active:scale-95 transition
          ${isCompact ? "py-3 text-base" : "py-4 text-lg"}`}
        >
          <LogIn className="w-5 h-5" />
          Login
        </button>
      </div>

      {/* FOOTER */}
      <p className="text-white/50 text-[10px] text-center mt-4">
        Eat. Shop. Live Nigerian 🇳🇬
      </p>
    </div>
  );
}