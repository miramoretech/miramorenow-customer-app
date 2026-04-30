// src/pages/WelcomeScreen.tsx
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowRight, Star, Truck, Shield, Leaf } from "lucide-react";
import MiramoreLogo from "@/components/MiramoreLogo";

export default function WelcomeScreen() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-white flex flex-col">
      {/* Hero Image Section - Updated to Fresh Green gradient */}
      <div className="relative h-2/3 bg-gradient-to-br from-[#2E7D32]/20 to-[#1B5E20]/10 overflow-hidden">
        <div className="absolute inset-0 flex items-center justify-center">
          <img
            src="https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=800&auto=format"
            alt="Delicious food"
            className="w-full h-full object-cover opacity-40"
          />
        </div>
        <div className="absolute inset-0 bg-gradient-to-t from-white via-transparent to-transparent" />
        
        {/* Logo on hero */}
        <div className="absolute top-12 left-0 right-0 flex justify-center">
          <MiramoreLogo size="lg" variant="green" />
        </div>
        
        {/* Centered tagline - Updated to Fresh Green */}
        <div className="absolute bottom-12 left-0 right-0 text-center px-6">
          <motion.div
            initial={{ y: 30, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.3 }}
          >
            <h1 className="text-3xl font-bold text-gray-900">Fresh food.</h1>
            <h1 className="text-3xl font-bold text-[#2E7D32] mt-1">Fresh life.</h1>
            <p className="text-sm text-gray-500 mt-2">Delivered faster.</p>
          </motion.div>
        </div>
      </div>

      {/* Features Section - Updated to Fresh Green */}
      <div className="flex-1 px-6 py-8 space-y-6">
        <div className="grid grid-cols-3 gap-4">
          <div className="text-center">
            <div className="w-10 h-10 bg-[#2E7D32]/10 rounded-full flex items-center justify-center mx-auto mb-2">
              <Star className="w-5 h-5 text-[#2E7D32]" />
            </div>
            <p className="text-xs font-medium text-gray-700">Top-rated</p>
            <p className="text-[10px] text-gray-400">Vendors</p>
          </div>
          <div className="text-center">
            <div className="w-10 h-10 bg-[#2E7D32]/10 rounded-full flex items-center justify-center mx-auto mb-2">
              <Truck className="w-5 h-5 text-[#2E7D32]" />
            </div>
            <p className="text-xs font-medium text-gray-700">Fast delivery</p>
            <p className="text-[10px] text-gray-400">20-30 min</p>
          </div>
          <div className="text-center">
            <div className="w-10 h-10 bg-[#2E7D32]/10 rounded-full flex items-center justify-center mx-auto mb-2">
              <Shield className="w-5 h-5 text-[#2E7D32]" />
            </div>
            <p className="text-xs font-medium text-gray-700">Secure</p>
            <p className="text-[10px] text-gray-400">Payments</p>
          </div>
        </div>

        {/* Fresh Tagline with Leaf Icon */}
        <div className="flex justify-center">
          <div className="bg-[#2E7D32]/5 px-4 py-2 rounded-full flex items-center gap-2">
            <Leaf className="w-3.5 h-3.5 text-[#2E7D32]" />
            <p className="text-[10px] font-medium text-[#2E7D32]">Fresh ingredients. Authentic taste. Fast delivery.</p>
          </div>
        </div>

        <motion.button
          whileTap={{ scale: 0.96 }}
          onClick={() => navigate("/onboarding/phone-login")}
          className="w-full py-3.5 rounded-xl bg-[#2E7D32] text-white font-semibold flex items-center justify-center gap-2 shadow-md shadow-[#2E7D32]/20 hover:bg-[#1B5E20] transition-all duration-200"
        >
          Get Started <ArrowRight className="w-4 h-4" />
        </motion.button>

        <p className="text-[10px] text-gray-400 text-center">
          By continuing, you agree to our Terms of Service & Privacy Policy.
        </p>
      </div>
    </div>
  );
}