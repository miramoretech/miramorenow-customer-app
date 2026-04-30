// src/pages/Offers.tsx
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  ArrowLeft, Gift, Copy, Check, ChevronRight, Sparkles,
  ShoppingCart, Search, MessageCircle, X, Share2, Truck
} from "lucide-react";
import { toast } from "sonner";
import BottomNav from "@/components/BottomNav";
import WhatsAppButton from "@/components/WhatsAppButton";
import { isFreeDeliveryActive, getRemainingPromoDays } from "@/utils/promoConfig";

const Offers = () => {
  const navigate = useNavigate();
  const [copiedCode, setCopiedCode] = useState<string | null>(null);
  const [showReferModal, setShowReferModal] = useState(false);
  
  const promoActive = isFreeDeliveryActive();
  const remainingDays = getRemainingPromoDays();

  const handleCopyCode = (code: string) => {
    navigator.clipboard.writeText(code);
    setCopiedCode(code);
    toast.success(`Code ${code} copied!`);
    setTimeout(() => setCopiedCode(null), 2000);
  };

  const handleReferFriend = () => {
    const referralCode = "MIRAMORE2024";
    navigator.clipboard.writeText(referralCode);
    toast.success(`Referral code ${referralCode} copied! Share with friends.`);
    setShowReferModal(false);
  };

  return (
    <div className="min-h-screen pb-24 bg-gradient-to-b from-amber-50 to-white">
      {/* Header */}
      <header className="sticky top-0 z-30 bg-white/95 backdrop-blur-sm border-b border-amber-100">
        <div className="flex items-center justify-between px-4 py-3">
          <button onClick={() => navigate(-1)} className="p-2 -ml-2 rounded-full hover:bg-gray-100">
            <ArrowLeft className="w-5 h-5" />
          </button>
          <h1 className="text-lg font-bold text-gray-800">Offers & Deals</h1>
          <button 
            onClick={() => setShowReferModal(true)}
            className="p-2 rounded-full hover:bg-gray-100"
          >
            <Share2 className="w-5 h-5 text-brand-red" />
          </button>
        </div>
      </header>

      {/* 🎉 FREE DELIVERY PROMO BANNER - MAIN OFFER */}
      {promoActive && (
        <div className="px-4 mt-4">
          <div className="bg-gradient-to-r from-green-500 to-green-600 rounded-2xl p-4 shadow-lg">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center">
                <Truck className="w-6 h-6 text-white" />
              </div>
              <div className="flex-1">
                <p className="text-white font-bold text-lg">FREE DELIVERY!</p>
                <p className="text-green-100 text-xs">For the first 14 days</p>
              </div>
              {remainingDays > 0 && (
                <div className="bg-white/20 rounded-lg px-3 py-1">
                  <p className="text-white text-sm font-bold">{remainingDays} days left</p>
                </div>
              )}
            </div>
            <p className="text-white text-sm mb-3">
              Enjoy FREE delivery on all orders from any vendor. No minimum order required!
            </p>
            <div className="flex items-center gap-2">
              <div className="bg-white/20 rounded-full px-3 py-1">
                <p className="text-white text-xs font-mono">AUTO-APPLIED AT CHECKOUT</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Refer & Earn Banner */}
      <div className="px-4 mt-4">
        <div 
          onClick={() => setShowReferModal(true)}
          className="bg-gradient-to-r from-amber-500 to-orange-500 rounded-2xl p-4 flex items-center justify-between cursor-pointer shadow-md"
        >
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center">
              <Gift className="w-5 h-5 text-white" />
            </div>
            <div>
              <p className="text-white font-bold text-sm">Refer & Earn</p>
              <p className="text-white/80 text-[10px]">Get ₦500 for each friend who orders</p>
            </div>
          </div>
          <ChevronRight className="w-5 h-5 text-white" />
        </div>
      </div>

      {/* Offer Cards Section - Show active offers */}
      <div className="px-4 mt-4">
        <h3 className="text-md font-bold text-gray-800 mb-3">Active Offers</h3>
        
        {promoActive && (
          <div className="space-y-3">
            {/* Free Delivery Offer Card */}
            <div className="bg-white rounded-2xl border-l-4 border-green-500 shadow-sm p-4">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-green-500 text-lg">🚚</span>
                    <span className="text-xs font-bold text-green-600 bg-green-50 px-2 py-0.5 rounded-full">
                      LAUNCH PROMO
                    </span>
                  </div>
                  <h4 className="font-bold text-gray-800">FREE Delivery on All Orders</h4>
                  <p className="text-xs text-gray-500 mt-1">
                    No minimum order required. Valid in Lagos only.
                  </p>
                  <p className="text-xs text-green-600 font-medium mt-2">
                    ✨ Automatically applied at checkout
                  </p>
                </div>
                <div className="text-right">
                  <span className="text-xs text-gray-400 line-through decoration-red-500">₦1,200+</span>
                  <p className="text-lg font-bold text-green-600">FREE</p>
                </div>
              </div>
            </div>
          </div>
        )}

        {!promoActive && (
          <div className="bg-gray-50 rounded-2xl p-6 text-center">
            <p className="text-sm text-gray-500">No active offers at the moment</p>
            <p className="text-xs text-gray-400 mt-1">Check back soon for new deals!</p>
          </div>
        )}
      </div>

      {/* How It Works */}
      <div className="px-4 py-4">
        <h3 className="text-md font-bold text-gray-800 mb-3">How to Use Offers</h3>
        <div className="grid grid-cols-3 gap-3">
          {[
            { icon: <Search className="w-6 h-6" />, text: "Find Offer", subtext: "Browse available deals" },
            { icon: <Copy className="w-6 h-6" />, text: "Copy Code", subtext: "Tap to copy promo code" },
            { icon: <ShoppingCart className="w-6 h-6" />, text: "Apply at Checkout", subtext: "Paste code when ordering" },
          ].map((step, i) => (
            <div key={i} className="text-center">
              <div className="w-12 h-12 bg-brand-red/10 rounded-full flex items-center justify-center mx-auto mb-2">
                {step.icon}
              </div>
              <p className="text-xs font-medium text-gray-800">{step.text}</p>
              <p className="text-[10px] text-gray-500">{step.subtext}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Terms & Conditions */}
      <div className="px-4 pb-6">
        <div className="bg-gray-50 rounded-2xl p-4">
          <p className="text-xs text-gray-500 font-medium mb-2">Terms & Conditions</p>
          <ul className="text-[10px] text-gray-400 space-y-1 list-disc list-inside">
            <li>Free delivery valid for first 14 days after launch</li>
            <li>Valid only on Miramore app</li>
            <li>No minimum order value required for free delivery</li>
            <li>Cannot be combined with other delivery offers</li>
            <li>Valid only for delivery locations in Lagos</li>
            <li>Service charge of ₦1,500 still applies</li>
            <li>Offers subject to change without notice</li>
          </ul>
        </div>
      </div>

      {/* Referral Modal */}
      <AnimatePresence>
        {showReferModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/70"
            onClick={() => setShowReferModal(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[90%] max-w-md bg-white rounded-2xl p-6"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="text-center mb-4">
                <div className="w-16 h-16 bg-brand-red/10 rounded-full flex items-center justify-center mx-auto mb-3">
                  <Gift className="w-8 h-8 text-brand-red" />
                </div>
                <h3 className="text-xl font-bold text-gray-800 mb-2">Refer & Earn ₦500</h3>
                <p className="text-sm text-gray-500">
                  Share Miramore with your friends and earn ₦500 for every friend who makes their first order!
                </p>
              </div>
              
              <div className="bg-gray-50 rounded-xl p-4 mb-4">
                <p className="text-xs text-gray-500 mb-1">Your Referral Code</p>
                <div className="flex justify-between items-center">
                  <p className="text-2xl font-bold font-mono text-brand-red">MIRAMORE2024</p>
                  <button
                    onClick={handleReferFriend}
                    className="px-4 py-2 bg-brand-red text-white rounded-lg text-sm font-medium"
                  >
                    Copy
                  </button>
                </div>
              </div>
              
              <div className="flex gap-3">
                <button
                  onClick={() => setShowReferModal(false)}
                  className="flex-1 py-3 bg-gray-100 text-gray-700 rounded-xl font-medium"
                >
                  Close
                </button>
                <button
                  onClick={() => {
                    const message = "Join me on Miramore! Use my code MIRAMORE2024 to get ₦1,500 OFF your first order + FREE delivery! 🍔🍕 Download now: https://miramore.com/download";
                    window.open(`https://wa.me/?text=${encodeURIComponent(message)}`, "_blank");
                  }}
                  className="flex-1 py-3 bg-green-600 text-white rounded-xl font-medium flex items-center justify-center gap-2"
                >
                  <MessageCircle className="w-4 h-4" />
                  Share on WhatsApp
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <BottomNav />
      <WhatsAppButton />
    </div>
  );
};

export default Offers;