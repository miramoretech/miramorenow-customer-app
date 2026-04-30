// src/pages/GiftCards.tsx
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowLeft, CreditCard, Gift, Sparkles, CheckCircle, X } from "lucide-react";
import { supabase } from "@/lib/supabase";
import { toast } from "sonner";
import MiramoreLogo from "@/components/MiramoreLogo";

declare global {
  interface Window {
    FlutterwaveCheckout: (config: Record<string, unknown>) => void;
  }
}

const FLW_PUBLIC_KEY = "FLWPUBK-a4dc9522e8b015ae0f4ae2f39b05be30-X";

// Gift card categories with Nigerian themes
const CATEGORIES = [
  { id: "miramore", name: "Miramore", color: "from-brand-red to-red-700", icon: "🎁", bgPattern: "https://images.unsplash.com/photo-1542838132-92c533f91d2b?w=200&auto=format" },
  { id: "birthday", name: "Birthday", color: "from-pink-500 to-rose-600", icon: "🎂", bgPattern: "https://images.unsplash.com/photo-1530103862676-de8c9debad1d?w=200&auto=format" },
  { id: "thankyou", name: "Thank You", color: "from-amber-500 to-orange-600", icon: "🙏", bgPattern: "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=200&auto=format" },
  { id: "anniversary", name: "Anniversary", color: "from-purple-500 to-indigo-600", icon: "💍", bgPattern: "https://images.unsplash.com/photo-1511795409834-ef04bbd61622?w=200&auto=format" },
  { id: "getwell", name: "Get Well Soon", color: "from-green-500 to-emerald-600", icon: "🌿", bgPattern: "https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=200&auto=format" },
  { id: "sorry", name: "Sorry", color: "from-blue-500 to-cyan-600", icon: "💙", bgPattern: "https://images.unsplash.com/photo-1584036561566-baf8f5f1b144?w=200&auto=format" },
  { id: "wedding", name: "Wedding", color: "from-rose-400 to-pink-600", icon: "💒", bgPattern: "https://images.unsplash.com/photo-1519741497674-611481863552?w=200&auto=format" },
  { id: "promotion", name: "Promotion", color: "from-yellow-500 to-amber-600", icon: "🚀", bgPattern: "https://images.unsplash.com/photo-1557804506-669a67965ba0?w=200&auto=format" },
];

const AMOUNTS = [1000, 2000, 5000, 10000];

export default function GiftCards() {
  const navigate = useNavigate();
  const [selectedCategory, setSelectedCategory] = useState(CATEGORIES[0]);
  const [selectedAmount, setSelectedAmount] = useState<number | null>(null);
  const [customAmount, setCustomAmount] = useState("");
  const [isPurchasing, setIsPurchasing] = useState(false);
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      if (data.user) setUser(data.user);
    });
  }, []);

  const handlePurchase = async () => {
    if (!user) {
      toast.error("Please log in to purchase gift cards");
      navigate("/login");
      return;
    }

    const amount = selectedAmount || (customAmount ? parseFloat(customAmount) : 0);
    if (amount <= 0) {
      toast.error("Please select or enter a valid amount");
      return;
    }

    setIsPurchasing(true);
    const txRef = `GIFT-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;

    // 1. Create a pending gift card record in Supabase
    const { data: giftCard, error: insertError } = await supabase
      .from("gift_cards")
      .insert({
        user_id: user.id,
        category: selectedCategory.name,
        amount: amount,
        status: "pending",
        tx_ref: txRef,
      })
      .select()
      .single();

    if (insertError) {
      console.error("Failed to create gift card record:", insertError);
      toast.error("Could not initialise gift card. Please try again.");
      setIsPurchasing(false);
      return;
    }

    // 2. Initialise Flutterwave payment
    let callbackFired = false;
    window.FlutterwaveCheckout({
      public_key: FLW_PUBLIC_KEY,
      tx_ref: txRef,
      amount: amount,
      currency: "NGN",
      payment_options: "card, banktransfer, ussd",
      customer: {
        email: user.email,
        phone_number: user.user_metadata?.phone || "",
        name: user.user_metadata?.full_name || user.email?.split("@")[0] || "Customer",
      },
      customizations: {
        title: `${selectedCategory.name} Gift Card`,
        description: `₦${amount.toLocaleString()} Miramore Gift Card`,
        logo: "https://id-preview--47eebcb8-3c8f-44ed-aed1-85139916fac7.lovable.app/lovable-uploads/miramore-logo.png",
      },
      meta: {
        gift_card_id: giftCard.id,
        category: selectedCategory.name,
      },
      callback: async (data: { status: string; transaction_id: string }) => {
        callbackFired = true;
        setIsPurchasing(false);

        if (data.status === "successful") {
          // Update gift card status to paid
          const { error: updateError } = await supabase
            .from("gift_cards")
            .update({
              status: "paid",
              payment_reference: data.transaction_id,
              paid_at: new Date().toISOString(),
            })
            .eq("id", giftCard.id);

          if (updateError) {
            console.error("Failed to update gift card:", updateError);
            toast.error("Payment successful but we couldn't activate your card. Contact support.");
          } else {
            toast.success(`Gift card purchased successfully! 🎉`);
            // Navigate to success page or back to home
            navigate("/gift-card-success", { state: { giftCard } });
          }
        } else {
          // Delete pending record
          await supabase.from("gift_cards").delete().eq("id", giftCard.id);
          toast.error("Payment was not successful. Please try again.");
        }
      },
      onclose: () => {
        if (!callbackFired) {
          setIsPurchasing(false);
          supabase.from("gift_cards").delete().eq("id", giftCard.id);
          toast.info("Payment cancelled.");
        }
      },
    });
  };

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      {/* Header */}
      <div className="sticky top-0 z-10 bg-white border-b border-gray-100 px-4 py-3 flex items-center gap-3">
        <button onClick={() => navigate(-1)} className="p-2 -ml-2 rounded-full hover:bg-gray-100">
          <ArrowLeft className="w-5 h-5 text-gray-700" />
        </button>
        <h1 className="text-lg font-bold text-gray-800">Miramore Gift Card</h1>
      </div>

      <div className="p-4 space-y-6">
        {/* Hero / Tagline */}
        <div className="text-center">
          <div className="inline-flex items-center gap-2 bg-brand-red/10 rounded-full px-4 py-1.5 mb-2">
            <Gift className="w-4 h-4 text-brand-red" />
            <span className="text-xs font-semibold text-brand-red">Give the gift of choice</span>
          </div>
          <p className="text-sm text-gray-600 mt-1">Choose a design, pick an amount, and send instantly.</p>
        </div>

        {/* Category Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {CATEGORIES.map((cat) => (
            <button
              key={cat.id}
              onClick={() => setSelectedCategory(cat)}
              className={`relative rounded-2xl overflow-hidden transition-all active:scale-95 ${
                selectedCategory.id === cat.id ? "ring-2 ring-brand-red shadow-md" : "shadow-sm"
              }`}
            >
              <div className={`bg-gradient-to-r ${cat.color} p-4 flex flex-col items-center text-white`}>
                <span className="text-3xl mb-1">{cat.icon}</span>
                <span className="text-xs font-semibold">{cat.name}</span>
              </div>
            </button>
          ))}
        </div>

        {/* Selected Category Card Preview */}
        <motion.div
          key={selectedCategory.id}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="relative rounded-2xl overflow-hidden shadow-lg"
        >
          <div className={`bg-gradient-to-r ${selectedCategory.color} p-6 text-white`}>
            <div className="flex justify-between items-start">
              <div>
                <p className="text-xs opacity-80">Miramore Gift Card</p>
                <p className="text-2xl font-bold mt-1">{selectedCategory.name}</p>
              </div>
              <MiramoreLogo size="sm" variant="light" />
            </div>
            <div className="mt-6">
              <p className="text-sm opacity-90">Valid for any purchase on Miramore</p>
              {selectedAmount && (
                <p className="text-3xl font-bold mt-2">₦{selectedAmount.toLocaleString()}</p>
              )}
            </div>
          </div>
        </motion.div>

        {/* Amount Selection */}
        <div>
          <h3 className="text-sm font-semibold text-gray-700 mb-3">Select amount (₦)</h3>
          <div className="flex flex-wrap gap-3">
            {AMOUNTS.map((amt) => (
              <button
                key={amt}
                onClick={() => {
                  setSelectedAmount(amt);
                  setCustomAmount("");
                }}
                className={`px-4 py-2 rounded-xl border transition-all ${
                  selectedAmount === amt
                    ? "border-brand-red bg-brand-red/10 text-brand-red font-semibold"
                    : "border-gray-200 bg-white text-gray-700"
                }`}
              >
                ₦{amt.toLocaleString()}
              </button>
            ))}
            <div className="flex items-center gap-2">
              <input
                type="number"
                placeholder="Custom"
                value={customAmount}
                onChange={(e) => {
                  setCustomAmount(e.target.value);
                  setSelectedAmount(null);
                }}
                className="w-28 px-3 py-2 rounded-xl border border-gray-200 text-sm text-center"
              />
            </div>
          </div>
        </div>

        {/* Personal Message (optional) */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Personal message (optional)</label>
          <textarea
            rows={2}
            placeholder="Add a heartfelt note..."
            className="w-full p-3 rounded-xl border border-gray-200 bg-white text-sm focus:outline-none focus:border-brand-red"
          />
        </div>

        {/* Buy Button */}
        <button
          onClick={handlePurchase}
          disabled={isPurchasing || (!selectedAmount && !customAmount)}
          className="w-full py-3 rounded-xl bg-brand-red text-white font-semibold flex items-center justify-center gap-2 disabled:opacity-50 active:scale-95 transition-transform shadow-md"
        >
          {isPurchasing ? (
            <>
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              Processing...
            </>
          ) : (
            <>
              <CreditCard className="w-4 h-4" />
              Buy Gift Card
            </>
          )}
        </button>

        {/* Footer note */}
        <p className="text-center text-[10px] text-gray-400 mt-4">
          Gift cards are delivered instantly via email. Non‑refundable.
        </p>
      </div>
    </div>
  );
}