// src/pages/HealthyChallenge.tsx
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  ArrowLeft, Leaf, CheckCircle, Circle, Flame, Trophy, Gift,
  ShoppingCart, Star, Clock, MapPin, ChevronRight, Percent,
  Salad, Apple, Coffee, Utensils, Heart, Zap, Award, Medal,
  Sparkles, Calendar, TrendingUp, Users, Share2, MessageCircle,
  X, Crown, Diamond, Target, Battery, Activity, Smile, ThumbsUp,
  Copy, Check, Facebook, Instagram, Twitter, Link2, Send
} from "lucide-react";
import { useCartStore } from "@/stores/cartStore";
import { supabase } from "@/lib/supabase";
import { useQuery } from "@tanstack/react-query";
import { toast } from "sonner";
import BottomNav from "@/components/BottomNav";
import WhatsAppButton from "@/components/WhatsAppButton";

// Nigerian Pidgin English helper
const pidgin = {
  welcome: "How far! 🌿",
  challenge: "Naija Fit Challenge",
  subtitle: "Make we chop better food, live better life!",
  progress: "Your progress so far",
  mealsLeft: "meal wey remain",
  streak: "Your current run",
  bestStreak: "Your best run ever",
  reward: "Your reward don dey wait!",
  claim: "Claim your winnings",
  healthyTip: "Healthy living tip for you",
  share: "Share with your people",
  congrats: "Big congratulations! You don do am! 🎉"
};

// Nigerian healthy meal data with local dishes
const getNigerianHealthyMeals = (menuItems: any[]): HealthyMeal[] => {
  const healthyNigerianDishes = [
    { name: "Grilled Fish", keywords: ["grilled fish", "catfish", "croaker"], vendor: "Mr. Good Grill Resto", benefits: "Rich in Omega-3, good for your heart ❤️" },
    { name: "Salad", keywords: ["salad", "fresh"], vendor: "Amala Oriki", benefits: "Fresh veggies, full of vitamins 🥗" },
    { name: "Vegetable Soup", keywords: ["efo riro", "vegetable", "greens"], vendor: "Amala Oriki", benefits: "Iron-rich, gives you energy 💪" },
    { name: "Grilled Turkey", keywords: ["turkey", "grilled turkey"], vendor: "Amala Oriki", benefits: "Lean protein, low fat 🍗" },
  ];

  return menuItems
    .filter(item => 
      healthyNigerianDishes.some(dish => 
        dish.keywords.some(keyword => 
          item.name?.toLowerCase().includes(keyword)
        )
      )
    )
    .map(item => {
      const match = healthyNigerianDishes.find(dish => 
        dish.keywords.some(keyword => item.name?.toLowerCase().includes(keyword))
      );
      return {
        id: item.id,
        name: item.name,
        description: match?.benefits || "Healthy and delicious Nigerian dish",
        price: item.price,
        image: item.image_url || getLocalFoodImage(item.name),
        vendorName: item.vendor?.store_name || "Miramore",
        vendorId: item.vendor_id,
        calories: Math.floor(Math.random() * 250) + 150,
        tags: ["Healthy", "Nigerian", "Fresh"],
        benefits: match?.benefits || "Good for your body and soul",
      };
    });
};

// Local food images
const getLocalFoodImage = (name: string): string => {
  if (name.toLowerCase().includes("fish")) 
    return "https://images.unsplash.com/photo-1555939594-58d7cb561ad1?w=200&h=200&fit=crop";
  if (name.toLowerCase().includes("salad"))
    return "https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=200&h=200&fit=crop";
  return "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=200&h=200&fit=crop";
};

// Nigerian health tips in Pidgin
const nigerianHealthTips = [
  { emoji: "🥗", tip: "Add greens to your jollof - e sweet pass with extra nutrients!" },
  { emoji: "💧", tip: "Drink enough water before you chop - your body go thank you!" },
  { emoji: "🍗", tip: "Choose grilled meat over fried - your belle go appreciate am!" },
  { emoji: "🌶️", tip: "Fresh pepper get power - e dey boost your metabolism!" },
  { emoji: "🍚", tip: "Brown rice better pass white rice - more fiber, better digestion!" },
  { emoji: "🐟", tip: "Fish good for brain - na why our grandpas dey sharp!" },
  { emoji: "🥭", tip: "Fresh fruits as dessert - sweet pass sugar and better for you!" },
  { emoji: "🏃", tip: "After food, small walk - e help your body digest well!" },
];

interface HealthyMeal {
  id: string;
  name: string;
  description: string;
  price: number;
  image: string;
  vendorName: string;
  vendorId: string;
  calories: number;
  tags: string[];
  benefits?: string;
}

const HealthyChallenge = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<"meals" | "progress" | "rewards">("meals");
  const [userProgress, setUserProgress] = useState({
    mealsCompleted: 0,
    targetMeals: 4,
    currentStreak: 0,
    bestStreak: 0,
    lastMealDate: null as string | null,
    rewardsClaimed: 0,
  });
  const [selectedMeal, setSelectedMeal] = useState<any>(null);
  const [showRewardModal, setShowRewardModal] = useState(false);
  const [showCelebration, setShowCelebration] = useState(false);
  const [randomTip, setRandomTip] = useState(nigerianHealthTips[0]);
  const [showShareOptions, setShowShareOptions] = useState(false);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    const randomIndex = Math.floor(Math.random() * nigerianHealthTips.length);
    setRandomTip(nigerianHealthTips[randomIndex]);
  }, []);

  const { data: vendors = [] } = useQuery({
    queryKey: ['vendors'],
    queryFn: async () => {
      const { data, error } = await supabase.from('vendors').select('*').eq('is_active', true);
      if (error) throw error;
      return data || [];
    },
  });

  const { data: menuItems = [] } = useQuery({
    queryKey: ['menu-items'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('menu_items')
        .select(`*, vendor:vendor_id(store_name, store_category, rating, store_logo_url)`)
        .eq('is_available', true);
      if (error) throw error;
      return data || [];
    },
  });

  const healthyMeals = getNigerianHealthyMeals(menuItems);
  const progressPercent = (userProgress.mealsCompleted / userProgress.targetMeals) * 100;
  const mealsRemaining = userProgress.targetMeals - userProgress.mealsCompleted;

  // Load progress from localStorage
  useEffect(() => {
    const savedProgress = localStorage.getItem("miramore_naija_fit_challenge");
    if (savedProgress) {
      const parsed = JSON.parse(savedProgress);
      setUserProgress(parsed);
    }
  }, []);

  const saveProgress = (progress: any) => {
    localStorage.setItem("miramore_naija_fit_challenge", JSON.stringify(progress));
    setUserProgress(progress);
  };

  const handleAddHealthyMeal = (meal: any) => {
    toast.success(`✅ "${meal.name}" don join your cart! Continue like this!`, {
      icon: "🇳🇬",
      duration: 2500,
    });
    
    const newMealsCompleted = userProgress.mealsCompleted + 1;
    const today = new Date().toDateString();
    const isNewDay = userProgress.lastMealDate !== today;
    const newStreak = isNewDay ? userProgress.currentStreak + 1 : userProgress.currentStreak;
    
    const updatedProgress = {
      ...userProgress,
      mealsCompleted: newMealsCompleted,
      currentStreak: newStreak,
      bestStreak: Math.max(userProgress.bestStreak, newStreak),
      lastMealDate: today,
    };
    
    saveProgress(updatedProgress);
    
    if (newMealsCompleted >= userProgress.targetMeals) {
      setShowCelebration(true);
      setShowRewardModal(true);
      toast.success(`🏆 Wahala! You don complete the challenge! Claim your reward now!`, {
        icon: "🎉",
        duration: 5000,
      });
    } else {
      toast.success(`🔥 ${mealsRemaining - 1} more ${mealsRemaining - 1 === 1 ? 'meal' : 'meals'} to go! You fit do am!`, {
        icon: "💪",
        duration: 2000,
      });
    }
  };

  const claimReward = () => {
    const rewardAmount = 2000;
    localStorage.setItem("miramore_challenge_winnings", rewardAmount.toString());
    toast.success(`🎁 Oya! Your ₦${rewardAmount} don land! Use am for your next order!`, {
      icon: "💰",
      duration: 4000,
    });
    setShowRewardModal(false);
    setShowCelebration(false);
    
    const resetProgress = {
      ...userProgress,
      mealsCompleted: 0,
      currentStreak: userProgress.currentStreak,
      bestStreak: userProgress.bestStreak,
      rewardsClaimed: userProgress.rewardsClaimed + 1,
    };
    saveProgress(resetProgress);
  };

  const handleVendorClick = (vendorId: string) => {
    navigate(`/vendor/${vendorId}`);
  };

  // REAL SHARE FUNCTIONALITY - Works on mobile and desktop
  const handleShare = async () => {
    const shareData = {
      title: "Miramore Naija Fit Challenge 🇳🇬",
      text: `I'm taking the Miramore Healthy Challenge! I've completed ${userProgress.mealsCompleted} out of ${userProgress.targetMeals} healthy meals. Join me and win ₦2,000 OFF! 💚`,
      url: window.location.origin + "/healthy-challenge",
    };

    // Try native Web Share API first (works on mobile)
    if (navigator.share && /Mobi|Android|iPhone|iPad|iPod/i.test(navigator.userAgent)) {
      try {
        await navigator.share(shareData);
        toast.success("Thanks for sharing! 🎉");
        return;
      } catch (err) {
        console.log("Share cancelled or failed:", err);
      }
    }
    
    // Fallback: Show custom share options modal
    setShowShareOptions(true);
  };

  const copyToClipboard = async () => {
    const shareText = `🎯 Miramore Naija Fit Challenge!\n\nI've completed ${userProgress.mealsCompleted}/${userProgress.targetMeals} healthy meals!\n\nJoin me and win ₦2,000 OFF your next order!\n\nDownload Miramore: ${window.location.origin}/download\n\n#Miramore #NaijaFitChallenge #HealthyLiving 🇳🇬`;
    
    try {
      await navigator.clipboard.writeText(shareText);
      setCopied(true);
      toast.success("Link copied! Share with your people! 📋");
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      toast.error("Failed to copy. Please try again.");
    }
  };

  const shareToWhatsApp = () => {
    const message = `🎯 *Miramore Naija Fit Challenge!* 🎯%0A%0A` +
      `I've completed ${userProgress.mealsCompleted}/${userProgress.targetMeals} healthy meals!%0A%0A` +
      `Join me and win *₦2,000 OFF* your next order!%0A%0A` +
      `Download Miramore: ${window.location.origin}/download%0A%0A` +
      `#Miramore #NaijaFitChallenge #HealthyLiving 🇳🇬`;
    
    window.open(`https://wa.me/?text=${message}`, "_blank");
    setShowShareOptions(false);
    toast.success("Opening WhatsApp...");
  };

  const shareToFacebook = () => {
    const url = window.location.origin + "/healthy-challenge";
    window.open(`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`, "_blank");
    setShowShareOptions(false);
  };

  const shareToTwitter = () => {
    const text = `I've completed ${userProgress.mealsCompleted}/${userProgress.targetMeals} healthy meals on @Miramore! Join me and win ₦2,000 OFF! #Miramore #NaijaFitChallenge`;
    window.open(`https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}`, "_blank");
    setShowShareOptions(false);
  };

  const shareToInstagram = () => {
    // Instagram doesn't have direct share URL, so copy to clipboard instead
    copyToClipboard();
    toast.info("Story template copied! Paste on Instagram Stories!");
    setShowShareOptions(false);
  };

  const getStreakMessage = () => {
    if (userProgress.currentStreak === 0) return "Start your journey today! 💪";
    if (userProgress.currentStreak === 1) return "One day don pass! Keep am up! 🔥";
    if (userProgress.currentStreak === 2) return "Two days! You dey try! 🌟";
    if (userProgress.currentStreak === 3) return "Three days! You be warrior! ⚡";
    return `${userProgress.currentStreak} days! You be champion! 🏆`;
  };

  return (
    <div className="min-h-screen pb-24 bg-gradient-to-b from-green-50 to-white">
      {/* Confetti Celebration */}
      <AnimatePresence>
        {showCelebration && (
          <div className="fixed inset-0 pointer-events-none z-50">
            {[...Array(80)].map((_, i) => (
              <motion.div
                key={i}
                initial={{ 
                  x: Math.random() * window.innerWidth,
                  y: -50,
                  rotate: 0,
                  scale: 0
                }}
                animate={{ 
                  y: window.innerHeight + 100,
                  rotate: 360 * (2 + Math.random() * 2),
                  scale: 1
                }}
                transition={{ 
                  duration: 2 + Math.random() * 2,
                  delay: Math.random() * 0.5,
                  ease: "linear"
                }}
                className="absolute text-2xl"
                style={{
                  left: Math.random() * window.innerWidth,
                  fontSize: `${20 + Math.random() * 20}px`
                }}
              >
                {["🎉", "🎊", "🇳🇬", "💚", "🥗", "🏆", "⭐", "🔥"][Math.floor(Math.random() * 8)]}
              </motion.div>
            ))}
          </div>
        )}
      </AnimatePresence>

      {/* Header */}
      <header className="sticky top-0 z-30 bg-white/95 backdrop-blur-sm border-b border-green-100">
        <div className="flex items-center justify-between px-4 py-3">
          <button onClick={() => navigate(-1)} className="p-2 -ml-2 rounded-full hover:bg-gray-100">
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div className="flex items-center gap-2">
            <Leaf className="w-5 h-5 text-green-600" />
            <h1 className="text-lg font-bold text-gray-800">Naija Fit Challenge</h1>
          </div>
          <button 
            onClick={handleShare}
            className="p-2 rounded-full hover:bg-gray-100 transition-colors"
          >
            <Share2 className="w-5 h-5 text-green-600" />
          </button>
        </div>
      </header>

      {/* Share Options Modal */}
      <AnimatePresence>
        {showShareOptions && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/70"
            onClick={() => setShowShareOptions(false)}
          >
            <motion.div
              initial={{ y: "100%" }}
              animate={{ y: 0 }}
              exit={{ y: "100%" }}
              transition={{ type: "spring", damping: 25 }}
              className="absolute bottom-0 left-0 right-0 bg-white rounded-t-3xl p-6"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-lg font-bold text-gray-800">Share Challenge</h3>
                <button onClick={() => setShowShareOptions(false)} className="p-1">
                  <X className="w-5 h-5" />
                </button>
              </div>
              
              <div className="grid grid-cols-4 gap-4 mb-6">
                <button
                  onClick={shareToWhatsApp}
                  className="flex flex-col items-center gap-2 p-3 rounded-xl hover:bg-green-50 transition"
                >
                  <div className="w-12 h-12 bg-green-500 rounded-full flex items-center justify-center">
                    <MessageCircle className="w-6 h-6 text-white" />
                  </div>
                  <span className="text-xs font-medium text-gray-700">WhatsApp</span>
                </button>
                
                <button
                  onClick={shareToFacebook}
                  className="flex flex-col items-center gap-2 p-3 rounded-xl hover:bg-blue-50 transition"
                >
                  <div className="w-12 h-12 bg-blue-600 rounded-full flex items-center justify-center">
                    <Facebook className="w-6 h-6 text-white" />
                  </div>
                  <span className="text-xs font-medium text-gray-700">Facebook</span>
                </button>
                
                <button
                  onClick={shareToTwitter}
                  className="flex flex-col items-center gap-2 p-3 rounded-xl hover:bg-sky-50 transition"
                >
                  <div className="w-12 h-12 bg-black rounded-full flex items-center justify-center">
                    <Twitter className="w-6 h-6 text-white" />
                  </div>
                  <span className="text-xs font-medium text-gray-700">Twitter/X</span>
                </button>
                
                <button
                  onClick={shareToInstagram}
                  className="flex flex-col items-center gap-2 p-3 rounded-xl hover:bg-pink-50 transition"
                >
                  <div className="w-12 h-12 bg-gradient-to-br from-purple-600 to-pink-500 rounded-full flex items-center justify-center">
                    <Instagram className="w-6 h-6 text-white" />
                  </div>
                  <span className="text-xs font-medium text-gray-700">Instagram</span>
                </button>
              </div>
              
              <div className="flex gap-3">
                <button
                  onClick={copyToClipboard}
                  className="flex-1 py-3 bg-gray-100 text-gray-700 rounded-xl font-medium flex items-center justify-center gap-2"
                >
                  {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                  {copied ? "Copied!" : "Copy Link"}
                </button>
                <button
                  onClick={() => {
                    const shareText = `🎯 Miramore Naija Fit Challenge! I've completed ${userProgress.mealsCompleted}/${userProgress.targetMeals} healthy meals! Join me and win ₦2,000 OFF!`;
                    window.open(`mailto:?subject=Miramore Naija Fit Challenge&body=${encodeURIComponent(shareText)}`, "_blank");
                    setShowShareOptions(false);
                  }}
                  className="flex-1 py-3 bg-gray-100 text-gray-700 rounded-xl font-medium flex items-center justify-center gap-2"
                >
                  <Send className="w-4 h-4" />
                  Email
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Hero Banner - Nigerian Style */}
      <div className="relative bg-gradient-to-r from-green-700 to-emerald-600 text-white px-6 py-8 overflow-hidden">
        <div className="absolute top-0 right-0 opacity-10">
          <Leaf className="w-40 h-40" />
        </div>
        <div className="absolute bottom-0 left-0 opacity-10">
          <Flame className="w-32 h-32" />
        </div>
        <div className="relative z-10">
          <div className="flex items-center gap-2 mb-3">
            <span className="text-2xl">🇳🇬</span>
            <span className="text-xs font-bold uppercase tracking-wider bg-white/20 px-2 py-0.5 rounded-full">
              May Challenge
            </span>
          </div>
          <h2 className="text-2xl font-bold mb-2 flex items-center gap-2">
            Miramore Fit Feast <span className="text-yellow-300">💚</span>
          </h2>
          <p className="text-sm opacity-95 mb-1 font-medium">
            "Chop better, live better!"
          </p>
          <p className="text-xs opacity-80 mb-4">
            Order {userProgress.targetMeals} healthy meals, <br />
            collect <span className="font-bold text-yellow-300">₦2,000 OFF</span> your next order!
          </p>
          
          {/* Progress Bar */}
          <div className="bg-white/20 rounded-full h-3 mb-2 overflow-hidden">
            <motion.div 
              initial={{ width: 0 }}
              animate={{ width: `${progressPercent}%` }}
              transition={{ duration: 0.5, type: "spring" }}
              className="bg-yellow-400 h-full rounded-full"
            />
          </div>
          <div className="flex justify-between text-xs">
            <span className="font-medium">{userProgress.mealsCompleted} of {userProgress.targetMeals} meals don chop</span>
            <span className="font-medium">{mealsRemaining} more to go!</span>
          </div>
        </div>
      </div>

      {/* Stats Cards - Nigerian Style */}
      <div className="px-4 -mt-4">
        <div className="grid grid-cols-3 gap-3">
          <motion.div 
            whileTap={{ scale: 0.95 }}
            className="bg-white rounded-2xl p-3 shadow-sm text-center border border-green-100"
          >
            <Flame className="w-5 h-5 text-orange-500 mx-auto mb-1" />
            <p className="text-xl font-bold text-gray-800">{userProgress.currentStreak}</p>
            <p className="text-[10px] text-gray-500">Current Run</p>
          </motion.div>
          <motion.div 
            whileTap={{ scale: 0.95 }}
            className="bg-white rounded-2xl p-3 shadow-sm text-center border border-green-100"
          >
            <Trophy className="w-5 h-5 text-yellow-500 mx-auto mb-1" />
            <p className="text-xl font-bold text-gray-800">{userProgress.bestStreak}</p>
            <p className="text-[10px] text-gray-500">Best Run Ever</p>
          </motion.div>
          <motion.div 
            whileTap={{ scale: 0.95 }}
            className="bg-white rounded-2xl p-3 shadow-sm text-center border border-green-100"
          >
            <Gift className="w-5 h-5 text-green-500 mx-auto mb-1" />
            <p className="text-xl font-bold text-gray-800">₦{userProgress.rewardsClaimed * 2000}</p>
            <p className="text-[10px] text-gray-500">Winnings So Far</p>
          </motion.div>
        </div>
      </div>

      {/* Nigerian Wisdom Banner */}
      <div className="px-4 mt-4">
        <div className="bg-amber-50 rounded-2xl p-3 border border-amber-200">
          <div className="flex items-center gap-2">
            <span className="text-xl">💡</span>
            <p className="text-xs text-amber-800 flex-1">
              <span className="font-bold">Naija Wisdom:</span> {randomTip.tip}
            </p>
            <button 
              onClick={() => {
                const newIndex = Math.floor(Math.random() * nigerianHealthTips.length);
                setRandomTip(nigerianHealthTips[newIndex]);
              }}
              className="text-[10px] text-amber-600"
            >
              Change Tip
            </button>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="px-4 mt-4">
        <div className="flex gap-2 bg-white rounded-2xl p-1 shadow-sm">
          {[
            { id: "meals", label: "Healthy Chop", icon: <Salad className="w-4 h-4" /> },
            { id: "progress", label: "Your Progress", icon: <Activity className="w-4 h-4" /> },
            { id: "rewards", label: "Your Winnings", icon: <Gift className="w-4 h-4" /> },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-medium transition-all ${
                activeTab === tab.id
                  ? "bg-green-600 text-white shadow-md"
                  : "text-gray-600 hover:bg-gray-50"
              }`}
            >
              {tab.icon}
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Rest of the component remains the same... */}
      {/* Healthy Meals Tab - Nigerian Dishes */}
      {activeTab === "meals" && (
        <div className="px-4 py-4">
          <div className="mb-4 flex items-center justify-between">
            <p className="text-sm text-gray-600">
              🌿 <span className="font-medium">Healthy Nigerian dishes</span> wey go make you feel good
            </p>
            <span className="text-[10px] bg-green-100 text-green-700 px-2 py-0.5 rounded-full">
              {healthyMeals.length}+ options
            </span>
          </div>
          
          <div className="space-y-3">
            {healthyMeals.map((meal, idx) => (
              <motion.div
                key={meal.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.05 }}
                className="bg-white rounded-2xl p-3 shadow-sm border border-gray-100"
              >
                <div className="flex gap-3">
                  <img
                    src={meal.image}
                    alt={meal.name}
                    className="w-20 h-20 rounded-xl object-cover"
                  />
                  <div className="flex-1">
                    <div className="flex justify-between items-start">
                      <div>
                        <h4 className="font-bold text-gray-800">{meal.name}</h4>
                        <div className="flex items-center gap-2 mt-1">
                          <Star className="w-3 h-3 fill-yellow-400 text-yellow-400" />
                          <span className="text-xs text-gray-600">4.8</span>
                          <span className="text-xs text-gray-400">•</span>
                          <span className="text-xs text-green-600">🔥 ~{meal.calories} cal</span>
                        </div>
                        <p className="text-[10px] text-green-600 mt-1 flex items-center gap-1">
                          <Heart className="w-3 h-3" /> {meal.description}
                        </p>
                      </div>
                      <p className="text-sm font-bold text-green-600">₦{meal.price.toLocaleString()}</p>
                    </div>
                    <div className="flex gap-2 mt-2">
                      <button
                        onClick={() => handleVendorClick(meal.vendorId)}
                        className="flex-1 py-1.5 bg-gray-100 rounded-lg text-xs font-medium text-gray-700"
                      >
                        See Vendor
                      </button>
                      <button
                        onClick={() => handleAddHealthyMeal(meal)}
                        className="flex-1 py-1.5 bg-green-600 rounded-lg text-xs font-medium text-white flex items-center justify-center gap-1"
                      >
                        <ShoppingCart className="w-3 h-3" />
                        Add to Cart
                      </button>
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>

          {healthyMeals.length === 0 && (
            <div className="text-center py-12">
              <Salad className="w-16 h-16 text-gray-300 mx-auto mb-3" />
              <p className="text-gray-500">No healthy meals available right now</p>
              <p className="text-xs text-gray-400 mt-1">Check back soon! More dey come!</p>
            </div>
          )}
        </div>
      )}

      {/* Progress Tab */}
      {activeTab === "progress" && (
        <div className="px-4 py-4">
          <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100 mb-4">
            <h3 className="font-bold text-gray-800 mb-4 flex items-center gap-2">
              <Target className="w-5 h-5 text-green-600" />
              Your Challenge Journey
            </h3>
            
            <div className="mb-4">
              <div className="flex justify-between text-sm mb-2">
                <span className="text-gray-600">Meals Don Chop</span>
                <span className="font-bold text-green-600">{userProgress.mealsCompleted}/{userProgress.targetMeals}</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
                <motion.div 
                  initial={{ width: 0 }}
                  animate={{ width: `${progressPercent}%` }}
                  transition={{ duration: 0.5, type: "spring" }}
                  className="bg-green-600 h-full rounded-full"
                />
              </div>
            </div>
            
            <div className="grid grid-cols-2 gap-3 mb-4">
              <div className="bg-orange-50 rounded-xl p-3 text-center">
                <Flame className="w-5 h-5 text-orange-500 mx-auto mb-1" />
                <p className="text-sm font-bold text-gray-800">{userProgress.currentStreak} day{userProgress.currentStreak !== 1 ? 's' : ''}</p>
                <p className="text-[10px] text-gray-500">{getStreakMessage()}</p>
              </div>
              <div className="bg-yellow-50 rounded-xl p-3 text-center">
                <Award className="w-5 h-5 text-yellow-500 mx-auto mb-1" />
                <p className="text-sm font-bold text-gray-800">{userProgress.bestStreak} day{userProgress.bestStreak !== 1 ? 's' : ''}</p>
                <p className="text-[10px] text-gray-500">Your Best Run</p>
              </div>
            </div>
            
            {mealsRemaining > 0 ? (
              <div className="bg-green-50 rounded-xl p-3">
                <p className="text-xs text-green-700 text-center">
                  🎯 <span className="font-bold">{mealsRemaining}</span> more {mealsRemaining === 1 ? 'meal' : 'meals'} to go!
                  <br />
                  Keep pushing! You get this! 💪
                </p>
              </div>
            ) : (
              <div className="bg-green-100 rounded-xl p-3">
                <p className="text-xs text-green-700 text-center font-semibold">
                  🎉 Wahala! You don finish the challenge!
                  <br />
                  Click "Claim Your Winnings" below!
                </p>
              </div>
            )}
          </div>

          {/* Nigerian Health Tips Section */}
          <div className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-2xl p-4">
            <h4 className="font-bold text-gray-800 mb-3 flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-yellow-500" />
              Healthy Living Tips (Naija Style)
            </h4>
            <div className="space-y-2">
              {nigerianHealthTips.slice(0, 4).map((tip, i) => (
                <div key={i} className="flex items-center gap-2 text-xs text-gray-600">
                  <span className="text-sm">{tip.emoji}</span>
                  <span>{tip.tip}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Rewards Tab - Nigerian Style */}
      {activeTab === "rewards" && (
        <div className="px-4 py-4">
          <div className="bg-gradient-to-r from-green-600 to-emerald-500 rounded-2xl p-5 text-white mb-4">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center">
                <Trophy className="w-6 h-6" />
              </div>
              <div>
                <h3 className="font-bold text-lg">Complete the Challenge</h3>
                <p className="text-xs opacity-90">Order {userProgress.targetMeals} healthy meals</p>
              </div>
            </div>
            <div className="flex justify-between items-center">
              <div>
                <p className="text-2xl font-bold">₦2,000 OFF</p>
                <p className="text-xs opacity-80">Your next order!</p>
              </div>
              {userProgress.mealsCompleted >= userProgress.targetMeals ? (
                <button
                  onClick={() => setShowRewardModal(true)}
                  className="px-5 py-2.5 bg-white text-green-700 rounded-full text-sm font-bold shadow-lg hover:scale-105 transition"
                >
                  Claim Your Winnings! 🎁
                </button>
              ) : (
                <div className="px-4 py-2 bg-white/20 rounded-full text-sm font-bold">
                  {mealsRemaining} meal{mealsRemaining !== 1 ? 's' : ''} left
                </div>
              )}
            </div>
          </div>

          <div className="space-y-3">
            <h4 className="font-bold text-gray-800 mb-2 flex items-center gap-2">
              <Gift className="w-4 h-4 text-green-600" />
              Your Winnings So Far
            </h4>
            {userProgress.rewardsClaimed > 0 ? (
              <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                    <Gift className="w-6 h-6 text-green-600" />
                  </div>
                  <div className="flex-1">
                    <p className="font-bold text-gray-800">₦2,000 OFF Voucher</p>
                    <p className="text-xs text-gray-500">Claimed {userProgress.rewardsClaimed} time{userProgress.rewardsClaimed !== 1 ? 's' : ''}</p>
                  </div>
                  <CheckCircle className="w-5 h-5 text-green-500" />
                </div>
              </div>
            ) : (
              <div className="text-center py-8 bg-gray-50 rounded-2xl">
                <Gift className="w-12 h-12 text-gray-300 mx-auto mb-2" />
                <p className="text-sm text-gray-500">No winnings yet o!</p>
                <p className="text-xs text-gray-400">Complete the challenge to collect your reward!</p>
              </div>
            )}
          </div>

          {/* Referral Bonus - Nigerian Style */}
          <div className="mt-4 bg-gradient-to-r from-purple-50 to-pink-50 rounded-2xl p-4 border border-purple-100">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center">
                <Users className="w-5 h-5 text-purple-600" />
              </div>
              <div className="flex-1">
                <p className="font-bold text-gray-800">Refer Your People</p>
                <p className="text-[10px] text-gray-600">Get 1 extra healthy meal credit when your friend join!</p>
              </div>
              <button 
                onClick={handleShare}
                className="px-3 py-1.5 bg-purple-600 text-white rounded-full text-xs font-medium"
              >
                Share Now
              </button>
            </div>
          </div>

          {/* Motivation Quote */}
          <div className="mt-4 text-center">
            <p className="text-[10px] text-gray-400 italic">
              "Small small, e go better. One healthy meal at a time!" 💚🇳🇬
            </p>
          </div>
        </div>
      )}

      {/* Reward Modal - Nigerian Celebration Style */}
      <AnimatePresence>
        {showRewardModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/70"
            onClick={() => setShowRewardModal(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[90%] max-w-md bg-white rounded-2xl p-6 text-center"
              onClick={(e) => e.stopPropagation()}
            >
              <motion.div
                animate={{ 
                  scale: [1, 1.2, 1],
                  rotate: [0, 10, -10, 0]
                }}
                transition={{ duration: 0.5, repeat: 2 }}
                className="w-24 h-24 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-4"
              >
                <span className="text-5xl">🏆</span>
              </motion.div>
              <h3 className="text-2xl font-bold text-gray-800 mb-2">Big Congratulations! 🎉</h3>
              <p className="text-gray-600 mb-1">You don complete the challenge!</p>
              <p className="text-3xl font-bold text-green-600 mb-2">₦2,000 OFF</p>
              <p className="text-sm text-gray-500 mb-4">Use am for your next order. No expire o!</p>
              
              <div className="flex gap-3">
                <button
                  onClick={() => setShowRewardModal(false)}
                  className="flex-1 py-3 bg-gray-100 text-gray-700 rounded-xl font-medium"
                >
                  Later
                </button>
                <button
                  onClick={claimReward}
                  className="flex-1 py-3 bg-green-600 text-white rounded-xl font-bold flex items-center justify-center gap-2"
                >
                  <Gift className="w-4 h-4" />
                  Claim My Winnings!
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Floating Action Button */}
      <button
        onClick={() => setActiveTab("meals")}
        className="fixed bottom-24 right-4 z-40 w-14 h-14 bg-green-600 rounded-full shadow-lg flex items-center justify-center active:scale-95 transition"
      >
        <Salad className="w-6 h-6 text-white" />
      </button>

      <BottomNav />
      <WhatsAppButton />
    </div>
  );
};

export default HealthyChallenge;