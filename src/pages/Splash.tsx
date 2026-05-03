import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";

// ✅ CORRECT PATH from src/pages/ to root assets/
import logo from "../../assets/icon.png";

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
    }, 4000);
    return () => clearTimeout(timer);
  }, [navigate]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#10B981] to-[#059669] flex items-center justify-center">
      <motion.div
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.7, ease: "easeOut" }}
        className="text-center"
      >
        <motion.img
          src={logo}
          alt="Miramore Logo"
          className="w-28 h-28 mx-auto object-contain rounded-2xl shadow-2xl"
          initial={{ opacity: 0, scale: 0.6 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.6 }}
        />
        <motion.h1
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="text-white text-3xl font-bold mt-6 tracking-tight"
        >
          Miramore
        </motion.h1>
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
          className="text-white/80 text-sm mt-1"
        >
          Fresh. Local. Delivered.
        </motion.p>
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
              className="w-2 h-2 rounded-full bg-white/70"
            />
          ))}
        </div>
      </motion.div>
    </div>
  );
}