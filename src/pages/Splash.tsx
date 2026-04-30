import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";

export default function Splash() {
  const navigate = useNavigate();

  useEffect(() => {
    const timer = setTimeout(() => {
      const onboardingComplete = localStorage.getItem("onboarding_complete");

      if (onboardingComplete === "true") {
        navigate("/home");
      } else {
        navigate("/welcome");
      }
    }, 5000);

    return () => clearTimeout(timer);
  }, [navigate]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#10B981] to-[#059669] flex items-center justify-center">
      <motion.div
        initial={{ opacity: 0, scale: 0.85 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.8, ease: "easeOut" }}
        className="text-center"
      >
        {/* ✅ Just use the exact filename */}
        <img
          src="/miramore-logo.png.png"
          alt="Miramore Logo"
          className="w-28 h-28 mx-auto object-contain rounded-2xl shadow-xl"
          onError={(e) => {
            console.error("Logo failed to load");
          }}
        />
        
        <motion.h1
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3, duration: 0.5 }}
          className="text-white text-3xl font-bold mt-6 tracking-tight"
        >
          Miramore
        </motion.h1>
        
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5, duration: 0.5 }}
          className="text-white/80 text-sm mt-1"
        >
          Fresh. Local. Delivered.
        </motion.p>

        {/* Loading dots */}
        <div className="flex justify-center gap-1.5 mt-8">
          {[0, 1, 2].map((i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0.3, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{
                duration: 0.6,
                repeat: Infinity,
                repeatType: "reverse",
                delay: i * 0.2,
              }}
              className="w-2 h-2 rounded-full bg-white/60"
            />
          ))}
        </div>
      </motion.div>
    </div>
  );
}