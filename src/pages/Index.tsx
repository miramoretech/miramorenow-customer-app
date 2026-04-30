import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";

export default function Index() {
  const navigate = useNavigate();

  useEffect(() => {
    const timer = setTimeout(() => {
      navigate("/home");
    }, 2000);
    return () => clearTimeout(timer);
  }, [navigate]);

  return (
    <div className="h-screen flex items-center justify-center bg-gradient-to-br from-brand-green-deep via-brand-green to-brand-lime">
      <motion.div
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.8 }}
        className="text-center"
      >
        <div className="text-5xl font-black text-white drop-shadow-lg">Miramore</div>
        <div className="mt-4 w-12 h-1 bg-white rounded-full mx-auto animate-pulse" />
      </motion.div>
    </div>
  );
}