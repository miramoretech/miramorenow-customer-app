// src/pages/MiraAIPage.tsx
import { useState, useRef, useEffect } from "react";
import { ArrowLeft, Send, Sparkles, Loader2, Mic, X, Zap, TrendingUp, DollarSign, Flame } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { supabase } from "@/lib/supabase";
import ReactMarkdown from "react-markdown";

// ============================================
// SUPER INTELLIGENT MIRA AI - KNOWS EVERYTHING ABOUT YOUR APP
// ============================================

// All vendor data
const VENDORS = [
  { id: "78cecfdb-23cf-4cf6-a60e-f471e985863e", name: "Amala Oriki", category: "food", rating: 4.9, deliveryTime: "20-30 min", isOpen: true },
  { id: "58c12030-a299-4e13-a61f-47ac494dfca0", name: "Cravings by K.O.L", category: "food", rating: 4.7, deliveryTime: "20-30 min", isOpen: false },
  { id: "ed3c60d2-efef-4aa7-84ec-f2a9c6721cfd", name: "Mr. Good Grill Resto", category: "food", rating: 4.8, deliveryTime: "20-30 min", isOpen: false },
  { id: "b12b45ba-4413-4e45-b4a4-bf91a88c716c", name: "Divine Delight Foodies", category: "food", rating: 5.0, deliveryTime: "20-30 min", isOpen: false },
  { id: "215e885e-7149-4098-9786-b57ff985351a", name: "Yoghurt_Arcade", category: "food", rating: 4.8, deliveryTime: "20-30 min", isOpen: false },
  { id: "215e885e-7149-4098-9786-b57ff985351a", name: "Hair & Locs_by_Effa", category: "beauty", rating: 4.9, deliveryTime: "20-30 min", isOpen: false },
];

// All products with prices and vendors
const PRODUCTS = [
  // Amala Oriki products
  { name: "Amala", price: 800, vendor: "Amala Oriki", category: "food", description: "Premium yam/cassava flour swallow · Yoruba classic" },
  { name: "Ewedu", price: 600, vendor: "Amala Oriki", category: "food", description: "Silky jute leaves with locust beans" },
  { name: "Jollof Rice", price: 1000, vendor: "Amala Oriki", category: "food", description: "Party jollof simmered in rich tomato & pepper base" },
  { name: "Fried Rice", price: 1500, vendor: "Amala Oriki", category: "food", description: "Stir-fried with sweet peas, carrots & green beans" },
  { name: "White Rice", price: 1300, vendor: "Amala Oriki", category: "food", description: "Fluffy steamed long-grain rice" },
  { name: "Goat Meat (Asun / Stew)", price: 4500, vendor: "Amala Oriki", category: "food", description: "Tender goat meat in rich West African spices" },
  { name: "Okro Soup", price: 1800, vendor: "Amala Oriki", category: "food", description: "Freshly prepared okro, perfectly drawy" },
  { name: "Egusi Soup", price: 1800, vendor: "Amala Oriki", category: "food", description: "Deep, flavorful melon seed soup" },
  { name: "Efo Riro", price: 2500, vendor: "Amala Oriki", category: "food", description: "Rich blend of leafy greens" },
  { name: "Gbegiri Soup", price: 650, vendor: "Amala Oriki", category: "food", description: "Creamy Yoruba bean soup" },
  { name: "Fufu (Akpu) Wrap", price: 750, vendor: "Amala Oriki", category: "food", description: "One wrap of fermented cassava fufu" },
  { name: "Eba", price: 850, vendor: "Amala Oriki", category: "food", description: "Soft, stretchy eba from premium cassava flour" },
  { name: "Grilled Turkey", price: 8300, vendor: "Amala Oriki", category: "food", description: "Juicy, well-seasoned turkey grilled to smoky perfection" },
  { name: "Boiled Titus Fish", price: 6500, vendor: "Amala Oriki", category: "food", description: "Fresh titus fish, properly seasoned" },
  { name: "Boiled Egg", price: 700, vendor: "Amala Oriki", category: "food", description: "Clean, healthy and perfectly boiled" },
  { name: "Soft Bread (Small)", price: 2100, vendor: "Amala Oriki", category: "food", description: "Warm, soft, and satisfying" },
  { name: "Soft Family Bread (Big)", price: 3500, vendor: "Amala Oriki", category: "food", description: "Freshly baked, soft and fluffy bread" },
  { name: "Fresh Creamy Salad", price: 2300, vendor: "Amala Oriki", category: "food", description: "Crunchy veggies mixed with rich creamy dressing" },
  { name: "Coca-Cola 50cl", price: 1000, vendor: "Amala Oriki", category: "food", description: "Crisp, bold & ice-cold" },
  { name: "Fanta Orange 50cl", price: 1000, vendor: "Amala Oriki", category: "food", description: "Zesty bubbly orange soda" },
  { name: "Eva Water 75cl", price: 500, vendor: "Amala Oriki", category: "food", description: "Pure crisp hydration" },
  { name: "Malta Guinness", price: 1300, vendor: "Amala Oriki", category: "food", description: "Rich non-alcoholic malt drink" },
  { name: "Chivita Active Juice", price: 4300, vendor: "Amala Oriki", category: "food", description: "Refreshing, chilled and energizing" },
  
  // Yoghurt_Arcade products
  { name: "250ml Deluxe Parfait", price: 6000, vendor: "Yoghurt_Arcade", category: "food", description: "Fresh layered parfait with fruits & granola" },
  { name: "330ml Deluxe Parfait", price: 8000, vendor: "Yoghurt_Arcade", category: "food", description: "Medium-size parfait loaded with toppings" },
  { name: "500ml Deluxe Parfait", price: 10000, vendor: "Yoghurt_Arcade", category: "food", description: "Large parfait — the ultimate indulgence" },
  { name: "500ml Greek Yoghurt", price: 8000, vendor: "Yoghurt_Arcade", category: "food", description: "Sweetened / Unsweetened — creamy & natural" },
  
  // Cravings by K.O.L products
  { name: "Shawarma + 1 Hotdog", price: 4000, vendor: "Cravings by K.O.L", category: "food", description: "Signature shawarma with 1 hotdog" },
  { name: "Shawarma + 2 Hotdogs", price: 5000, vendor: "Cravings by K.O.L", category: "food", description: "Signature shawarma with 2 hotdogs" },
  { name: "Barbeque Chicken", price: 8500, vendor: "Cravings by K.O.L", category: "food", description: "Juicy grilled BBQ chicken" },
  
  // Mr. Good Grill Resto products
  { name: "Spicy Grilled Catfish Deluxe", price: 22500, vendor: "Mr. Good Grill Resto", category: "food", description: "Grilled catfish with coleslaw, chips, cucumber & pepper sauce" },
  { name: "Peppered Grilled Croaker Fish Platter", price: 25000, vendor: "Mr. Good Grill Resto", category: "food", description: "Grilled croaker with plantain, cucumber, coleslaw & pepper sauce" },
  { name: "Big Grill Catfish with Plantain & Chips", price: 15000, vendor: "Mr. Good Grill Resto", category: "food", description: "Grilled catfish with crispy chips, sweet plantain & sauce" },
  
  // Divine Delight Foodies products
  { name: "Amala / Yam flour", price: 3000, vendor: "Divine Delight Foodies", category: "food", description: "Smooth, warm, and richly satisfying" },
  { name: "Cassava flour (Lafun white Amala)", price: 2000, vendor: "Divine Delight Foodies", category: "food", description: "Soft, smooth lafun" },
  { name: "Plantain flour", price: 3000, vendor: "Divine Delight Foodies", category: "food", description: "Soft, smooth, and slightly sweet" },
  { name: "Kulikuli", price: 1000, vendor: "Divine Delight Foodies", category: "food", description: "Crunchy, tasty kulikuli" },
  { name: "Dried locust beans", price: 1000, vendor: "Divine Delight Foodies", category: "food", description: "Rich, aromatic seasoning" },
  { name: "White ponmo", price: 1500, vendor: "Divine Delight Foodies", category: "food", description: "Clean, soft ponmo" },
  
  // Hair & Locs_by_Effa products (Beauty)
  { name: "Pixie Cut Unit", price: 350000, vendor: "Hair & Locs_by_Effa", category: "beauty", description: "Paired with 13×4 frontal · Styled on request" },
  { name: "10\" SDD Blonde Unit", price: 280000, vendor: "Hair & Locs_by_Effa", category: "beauty", description: "Paired with 5×5 closure" },
  { name: "10\" Omotola Fringe Bounce", price: 320000, vendor: "Hair & Locs_by_Effa", category: "beauty", description: "Bouncy fringe style" },
  { name: "10\" Vietnamese Bone Straight", price: 350000, vendor: "Hair & Locs_by_Effa", category: "beauty", description: "Bone straight unit" },
  { name: "16\" SDD Piano Bouncy Curl", price: 420000, vendor: "Hair & Locs_by_Effa", category: "beauty", description: "Bouncy curl style" },
  { name: "16\" SDD Donor Bone Straight", price: 220000, vendor: "Hair & Locs_by_Effa", category: "beauty", description: "Paired with KimK closure" },
  { name: "20-24\" SDD Vietnamese Bounce Curls", price: 560000, vendor: "Hair & Locs_by_Effa", category: "beauty", description: "300g · Paired with 5×5 closure" },
  { name: "20\" SDD Burgundy Burmese Curls", price: 480000, vendor: "Hair & Locs_by_Effa", category: "beauty", description: "Burgundy curly unit" },
  { name: "14\" SDD Bone Straight Fringe Wig", price: 250000, vendor: "Hair & Locs_by_Effa", category: "beauty", description: "Fringe wig style" },
];

// Nigerian Pidgin translation
const translatePidgin = (text: string): string => {
  const slang: Record<string, string> = {
    "chop": "eat", "wahala": "problem", "abeg": "please", "shebi": "right", "oya": "let's go",
    "biko": "please", "sef": "anyway", "jare": "please", "abi": "isn't it", "kudi": "money",
    "owambe": "party", "pepper": "spice", "sabi": "know", "waka": "walk", "gbese": "debt",
    "yawa": "trouble", "sharp": "smart", "how far": "hello", "wetin": "what", "dey": "is/are",
    "dis": "this", "dat": "that", "na": "it is", "come": "and", "go": "will"
  };
  let translated = text.toLowerCase();
  for (const [pidgin, english] of Object.entries(slang)) {
    translated = translated.replace(new RegExp(`\\b${pidgin}\\b`, 'gi'), english);
  }
  return translated;
};

// Search products
const searchProducts = (query: string, category?: string, maxPrice?: number): any[] => {
  let results = PRODUCTS;
  if (query) {
    results = results.filter(p => 
      p.name.toLowerCase().includes(query.toLowerCase()) || 
      p.vendor.toLowerCase().includes(query.toLowerCase()) ||
      p.description.toLowerCase().includes(query.toLowerCase())
    );
  }
  if (category) {
    results = results.filter(p => p.category === category);
  }
  if (maxPrice) {
    results = results.filter(p => p.price <= maxPrice);
  }
  return results.slice(0, 5);
};

// Nigerian food vocabulary
const nigerianFoods = [
  "jollof", "fried rice", "amala", "ewedu", "egusi", "efo riro", "ogbono", 
  "pounded yam", "fufu", "eba", "semovita", "suya", "kilishi", "akara", 
  "moi moi", "plantain", "dodo", "boli", "yam", "okro", "afang", 
  "edikang ikong", "banga", "nkwobi", "pepper soup", "catfish", "shawarma"
];

const isNigerianFood = (query: string): boolean => {
  return nigerianFoods.some(food => query.toLowerCase().includes(food));
};

type Msg = { role: "user" | "assistant"; content: string };

// Quick prompts for users
const quickPrompts = [
  { icon: "🔥", text: "What's trending right now?" },
  { icon: "💰", text: "Cheap eats under ₦3000" },
  { icon: "💇‍♀️", text: "Show me hair products" },
  { icon: "📍", text: "What vendors are open?" },
  { icon: "🎁", text: "How to get free delivery?" },
  { icon: "🚚", text: "Track my order" },
];

export default function MiraAIPage() {
  const navigate = useNavigate();
  const [messages, setMessages] = useState<Msg[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [userName, setUserName] = useState("Foodie");
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Get user name
  useEffect(() => {
    const storedName = localStorage.getItem("mirimore_checkout_name");
    if (storedName) {
      setUserName(storedName.split(" ")[0]);
    } else {
      supabase.auth.getUser().then(({ data }) => {
        if (data.user?.user_metadata?.full_name) {
          setUserName(data.user.user_metadata.full_name.split(" ")[0]);
        }
      });
    }
  }, []);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Generate intelligent response
  const generateResponse = async (userMessage: string): Promise<string> => {
    const text = translatePidgin(userMessage.toLowerCase());
    const hour = new Date().getHours();
    const timeGreeting = hour < 12 ? "morning" : hour < 18 ? "afternoon" : "evening";

    // GREETING
    if (text.match(/^(hello|hi|hey|how far|good morning|good afternoon|good evening|wetin|sabi|ola)$/i)) {
      const greetings = [
        `Good ${timeGreeting}, ${userName}! ✨ I'm Mira, your personal assistant. I know **every product, every vendor, every price** on Miramore. What can I help you find today?`,
        `${userName}! 👋 How far? Ready to find something amazing? I can help with food, beauty products, or track your orders!`,
        `Hey ${userName}! 🎉 Welcome back. What are we craving today? Jollof? Amala? Or maybe some new hair?`
      ];
      return greetings[Math.floor(Math.random() * greetings.length)];
    }

    // TRENDING
    if (text.includes("trending") || text.includes("popular") || text.includes("hot") || text.includes("best seller")) {
      const trending = PRODUCTS.slice(0, 6);
      let response = `🔥 **Here's what's trending right now, ${userName}:**\n\n`;
      trending.forEach(p => {
        response += `• **${p.name}** – ₦${p.price.toLocaleString()} (${p.vendor})\n`;
      });
      response += `\nWant me to show you more details about any of these?`;
      return response;
    }

    // CHEAP / BUDGET
    const priceMatch = text.match(/under\s*₦?(\d+)|below\s*₦?(\d+)|budget\s*₦?(\d+)/i);
    const maxPrice = priceMatch ? parseInt(priceMatch[1] || priceMatch[2] || priceMatch[3]) : null;
    
    if (text.includes("cheap") || text.includes("budget") || text.includes("affordable") || maxPrice) {
      const budget = maxPrice || 3000;
      const cheapItems = PRODUCTS.filter(p => p.price <= budget).slice(0, 5);
      if (cheapItems.length > 0) {
        let response = `💰 **Budget-friendly options under ₦${budget.toLocaleString()}, ${userName}:**\n\n`;
        cheapItems.forEach(p => {
          response += `• **${p.name}** – ₦${p.price.toLocaleString()} (${p.vendor})\n`;
        });
        response += `\nWant me to help you add any of these to your cart?`;
        return response;
      } else {
        return `💰 Hmm, I couldn't find anything under ₦${budget.toLocaleString()}, ${userName}. Would you like me to show you options under ₦5000 instead?`;
      }
    }

    // SPECIFIC FOOD
    const isNigerian = isNigerianFood(text);
    if (isNigerian || (text.includes("food") && !text.includes("beauty"))) {
      const searchTerm = nigerianFoods.find(f => text.includes(f)) || "food";
      const results = searchProducts(searchTerm, "food");
      if (results.length > 0) {
        let response = `🍽️ **I found ${results.length} ${searchTerm} option${results.length > 1 ? 's' : ''} for you, ${userName}:**\n\n`;
        results.forEach(p => {
          response += `• **${p.name}** – ₦${p.price.toLocaleString()} (${p.vendor})\n  _${p.description}_\n`;
        });
        response += `\nWould you like to see the full menu or add something to your cart?`;
        return response;
      } else {
        return `🍽️ I couldn't find "${searchTerm}" right now, ${userName}. Would you like to see what's trending instead?`;
      }
    }

    // BEAUTY / HAIR
    if (text.includes("hair") || text.includes("wig") || text.includes("beauty") || text.includes("lace") || text.includes("frontal")) {
      const beautyProducts = PRODUCTS.filter(p => p.category === "beauty").slice(0, 5);
      let response = `💇‍♀️ **Here are our top beauty products, ${userName}:**\n\n`;
      beautyProducts.forEach(p => {
        response += `• **${p.name}** – ₦${p.price.toLocaleString()} (${p.vendor})\n  _${p.description}_\n`;
      });
      response += `\nWant to see more options or filter by price?`;
      return response;
    }

    // VENDOR SEARCH
    if (text.includes("vendor") || text.includes("restaurant") || text.includes("seller") || text.includes("open")) {
      let response = `📍 **Here are our vendors, ${userName}:**\n\n`;
      VENDORS.forEach(v => {
        response += `• **${v.name}** – ${v.rating}⭐ • ${v.deliveryTime} • ${v.isOpen ? '🟢 OPEN' : '🔴 CLOSED'}\n`;
      });
      response += `\nWhich vendor would you like to explore?`;
      return response;
    }

    // DELIVERY / ORDER
    if (text.includes("delivery") || text.includes("deliver") || text.includes("track") || text.includes("order status")) {
      return `🚚 ${userName}, here's your delivery info:\n\n✅ **FREE delivery** on all orders (LAUNCH OFFER)\n⏱️ Average delivery time: 20-30 minutes\n📍 Currently serving Lagos (expanding to PH & Abuja soon)\n\nWant to track an existing order? You can find all your orders in the Orders tab at the bottom.`;
    }

    // PROMO / DISCOUNT
    if (text.includes("promo") || text.includes("discount") || text.includes("code") || text.includes("free delivery")) {
      return `🎁 ${userName}, here are our active offers:\n\n🔥 **LAUNCH OFFER**: FREE delivery on all orders!\n🍽️ **FIRST ORDER**: Use code \`FREEMEAL\` for ₦1,500 OFF (min ₦3,000)\n👥 **REFER A FRIEND**: You both get ₦1,000 off\n\nWant me to apply any of these to your cart?`;
    }

    // CART HELP
    if (text.includes("cart") || text.includes("checkout") || text.includes("pay")) {
      return `🛒 ${userName}, you can view your cart by tapping the cart icon in the top right. From there you can:\n\n• Adjust quantities\n• Add special notes\n• Apply promo codes\n• Choose delivery or pickup\n• Complete payment with Flutterwave\n\nWould you like me to take you to your cart?`;
    }

    // HELP / SUPPORT
    if (text.includes("help") || text.includes("how to") || text.includes("guide")) {
      return `🤗 I'm here to help, ${userName}! Here's what I can do:\n\n🔍 **Find food** – "Show me Jollof Rice"\n💰 **Budget options** – "Cheap eats under ₦3000"\n💇‍♀️ **Beauty products** – "Show me wigs under ₦300k"\n📍 **Find vendors** – "What vendors are open?"\n🚚 **Track orders** – "Where's my order?"\n🎁 **Promo codes** – "How to get free delivery?"\n\nWhat would you like help with?`;
    }

    // DEFAULT
    return `${userName}, I can help you find amazing food and beauty products! Here's what you can ask me:\n\n🍽️ "What's trending right now?"\n💰 "Cheap eats under ₦3000"\n💇‍♀️ "Show me hair products"\n📍 "What vendors are open?"\n🚚 "Track my order"\n🎁 "Apply promo code FREEMEAL"\n\nWhat sounds good today?`;
  };

  const sendMessage = async (text: string) => {
    if (!text.trim() || isLoading) return;
    
    const userMsg: Msg = { role: "user", content: text.trim() };
    setMessages(prev => [...prev, userMsg]);
    setInput("");
    setIsLoading(true);

    setTimeout(async () => {
      const response = await generateResponse(text);
      const assistantMsg: Msg = { role: "assistant", content: response };
      setMessages(prev => [...prev, assistantMsg]);
      setIsLoading(false);
    }, 600);
  };

  const handleQuickPrompt = (prompt: string) => {
    sendMessage(prompt);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage(input);
    }
  };

  return (
    <motion.div
      className="min-h-screen bg-gradient-to-b from-[#F0F7F0] to-white"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      {/* Header - Brand Green */}
      <div className="sticky top-0 z-10 bg-white/95 backdrop-blur-md border-b border-[#C8E6C9] px-4 py-3 flex items-center gap-3 shadow-sm">
        <button
          onClick={() => navigate(-1)}
          className="p-2 rounded-full hover:bg-[#E8F5E9] active:scale-95 transition-all"
        >
          <ArrowLeft className="w-5 h-5 text-[#2E7D32]" />
        </button>
        <div className="flex items-center gap-3 flex-1">
          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#2E7D32] to-[#1B5E20] flex items-center justify-center shadow-md">
            <Sparkles className="w-5 h-5 text-white" />
          </div>
          <div>
            <h1 className="font-bold text-gray-900 text-lg">Mira AI</h1>
            <p className="text-[10px] text-[#2E7D32] font-semibold">✨ Online • Ready to help</p>
          </div>
        </div>
      </div>

      {/* Messages Container */}
      <div className="flex-1 px-4 py-4 pb-32 space-y-4 overflow-y-auto" style={{ height: "calc(100vh - 120px)" }}>
        {messages.length === 0 && (
          <div className="space-y-4">
            {/* Welcome Card */}
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ duration: 0.3 }}
              className="bg-gradient-to-br from-[#2E7D32] to-[#1B5E20] rounded-2xl p-5 text-white shadow-lg"
            >
              <div className="flex items-center gap-2 mb-3">
                <Sparkles className="w-5 h-5 text-[#FFD700]" />
                <span className="text-xs font-bold bg-white/20 px-2 py-0.5 rounded-full">AI POWERED</span>
              </div>
              <p className="text-sm font-medium leading-relaxed">
                Hey {userName}! ✨ I'm <span className="font-bold">Mira</span> – I know <span className="text-[#FFD700]">every product, every vendor, every price</span> on Miramore. Ask me anything!
              </p>
            </motion.div>
            
            {/* Section Title */}
            <div className="flex items-center gap-2">
              <div className="h-[2px] flex-1 bg-gradient-to-r from-transparent to-[#C8E6C9]" />
              <p className="text-[10px] font-bold text-[#2E7D32] uppercase tracking-wider">⚡ Try asking</p>
              <div className="h-[2px] flex-1 bg-gradient-to-l from-transparent to-[#C8E6C9]" />
            </div>
            
            {/* Quick Prompts Grid */}
            <div className="grid grid-cols-2 gap-2">
              {quickPrompts.map((prompt, idx) => (
                <motion.button
                  key={idx}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: idx * 0.05 }}
                  onClick={() => handleQuickPrompt(prompt.text)}
                  className="flex items-center gap-2 bg-white border border-[#C8E6C9] hover:border-[#2E7D32] hover:bg-[#E8F5E9] rounded-xl px-3 py-2.5 text-left transition-all duration-200 shadow-sm"
                >
                  <span className="text-lg">{prompt.icon}</span>
                  <span className="text-[11px] font-medium text-gray-700 flex-1">{prompt.text}</span>
                  <Zap className="w-3 h-3 text-[#2E7D32] opacity-0 group-hover:opacity-100 transition-opacity" />
                </motion.button>
              ))}
            </div>
            
            {/* Feature Badges */}
            <div className="flex flex-wrap gap-2 justify-center pt-2">
              <span className="text-[9px] bg-[#E8F5E9] text-[#2E7D32] px-2 py-1 rounded-full font-semibold">🍽️ 50+ Dishes</span>
              <span className="text-[9px] bg-[#E8F5E9] text-[#2E7D32] px-2 py-1 rounded-full font-semibold">💇‍♀️ Beauty Collection</span>
              <span className="text-[9px] bg-[#E8F5E9] text-[#2E7D32] px-2 py-1 rounded-full font-semibold">🚚 Free Delivery</span>
              <span className="text-[9px] bg-[#E8F5E9] text-[#2E7D32] px-2 py-1 rounded-full font-semibold">⭐ Top Rated Vendors</span>
            </div>
          </div>
        )}

        {messages.map((msg, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.2 }}
            className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
          >
            <div
              className={`max-w-[85%] rounded-2xl px-4 py-3 text-sm ${
                msg.role === "user"
                  ? "bg-[#2E7D32] text-white rounded-br-md shadow-md"
                  : "bg-white border border-[#E8F5E9] text-gray-700 rounded-bl-md shadow-sm"
              }`}
            >
              {msg.role === "assistant" ? (
                <div className="prose prose-sm max-w-none [&>p]:mb-1.5 [&>ul]:mb-1.5 [&>li]:text-gray-700 [&>strong]:text-[#2E7D32]">
                  <ReactMarkdown>{msg.content}</ReactMarkdown>
                </div>
              ) : (
                <p className="text-sm">{msg.content}</p>
              )}
            </div>
          </motion.div>
        ))}

        {isLoading && messages[messages.length - 1]?.role !== "assistant" && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex justify-start"
          >
            <div className="bg-white border border-[#E8F5E9] rounded-2xl rounded-bl-md px-4 py-3 flex items-center gap-2 shadow-sm">
              <div className="flex gap-1">
                <div className="w-2 h-2 bg-[#2E7D32] rounded-full animate-bounce" style={{ animationDelay: "0ms" }} />
                <div className="w-2 h-2 bg-[#2E7D32] rounded-full animate-bounce" style={{ animationDelay: "150ms" }} />
                <div className="w-2 h-2 bg-[#2E7D32] rounded-full animate-bounce" style={{ animationDelay: "300ms" }} />
              </div>
              <span className="text-xs text-gray-500">Mira is thinking...</span>
            </div>
          </motion.div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Input Bar */}
      <div className="fixed bottom-0 left-0 right-0 bg-white/95 backdrop-blur-md border-t border-[#C8E6C9] px-4 py-3 shadow-lg">
        <div className="flex items-center gap-2 max-w-lg mx-auto">
          <div className="flex-1 relative">
            <input
              ref={inputRef}
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Ask Mira anything..."
              className="w-full px-4 py-3 bg-[#F7FAF7] border border-[#C8E6C9] rounded-full text-sm focus:outline-none focus:ring-2 focus:ring-[#2E7D32] focus:border-transparent transition-all"
              disabled={isLoading}
            />
          </div>
          <motion.button
            whileTap={{ scale: 0.95 }}
            onClick={() => sendMessage(input)}
            disabled={!input.trim() || isLoading}
            className={`p-3 rounded-full transition-all ${
              input.trim() && !isLoading
                ? "bg-[#2E7D32] text-white shadow-md hover:bg-[#1B5E20]"
                : "bg-[#E8F5E9] text-[#9BA89B]"
            }`}
          >
            {isLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Send className="w-5 h-5" />}
          </motion.button>
        </div>
        
        {/* Quick action chips */}
        <div className="flex gap-2 mt-3 overflow-x-auto pb-1 scrollbar-hide max-w-lg mx-auto">
          {[
            { icon: "🔥", label: "Trending", action: "What's trending right now?" },
            { icon: "💰", label: "Budget", action: "Cheap eats under ₦3000" },
            { icon: "💇‍♀️", label: "Beauty", action: "Show me hair products" },
            { icon: "📍", label: "Vendors", action: "What vendors are open?" },
            { icon: "🎁", label: "Promo", action: "How to get free delivery?" },
            { icon: "🚚", label: "Track", action: "Track my order" },
          ].map((chip, idx) => (
            <motion.button
              key={idx}
              whileTap={{ scale: 0.95 }}
              onClick={() => handleQuickPrompt(chip.action)}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-[#F7FAF7] border border-[#C8E6C9] rounded-full text-xs font-medium whitespace-nowrap text-gray-700 hover:bg-[#E8F5E9] hover:border-[#2E7D32] hover:text-[#2E7D32] transition-all"
            >
              <span>{chip.icon}</span>
              <span>{chip.label}</span>
            </motion.button>
          ))}
        </div>
      </div>
    </motion.div>
  );
}