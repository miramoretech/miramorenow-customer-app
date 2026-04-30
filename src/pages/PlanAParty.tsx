// src/pages/PlanAParty.tsx
import { useState, useMemo, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  ArrowLeft, Calendar, Users, Clock, MapPin, ShoppingCart,
  Cake, Utensils, Beef, Pizza, Wine, Gift, Sparkles, ChevronRight,
  Plus, Minus, Trash2, PartyPopper, Music, Camera, Check,
  Phone, Mail, MessageCircle, Send, Star, Flame, Zap, X
} from "lucide-react";
import { useCartStore } from "@/stores/cartStore";
import { supabase } from "@/lib/supabase";
import { useQuery } from "@tanstack/react-query";
import { toast } from "sonner";
import BottomNav from "@/components/BottomNav";
import WhatsAppButton from "@/components/WhatsAppButton";

// Types
interface PartyPackage {
  id: string;
  name: string;
  description: string;
  image: string;
  minGuests: number;
  maxGuests: number;
  pricePerPerson: number;
  estimatedPrice: number;
  popular?: boolean;
  includes: string[];
  vendors: string[];
  items: {
    vendorId: string;
    vendorName: string;
    productId: string;
    productName: string;
    quantity: number;
    price: number;
  }[];
}

// Fetch vendors
const fetchVendors = async () => {
  const { data, error } = await supabase
    .from('vendors')
    .select('*')
    .eq('is_active', true);
  if (error) throw error;
  return data || [];
};

const fetchMenuItems = async () => {
  const { data, error } = await supabase
    .from('menu_items')
    .select(`
      *,
      vendor:vendor_id(store_name, store_category)
    `)
    .eq('is_available', true);
  if (error) throw error;
  return data || [];
};

// Party packages based on actual vendor items
const getPartyPackages = (vendors: any[], menuItems: any[]): PartyPackage[] => {
  const packages: PartyPackage[] = [];

  const amalaOriki = vendors.find(v => v.store_name === "Amala Oriki");
  const cravings = vendors.find(v => v.store_name === "Cravings by K.O.L");
  const mrGoodGrill = vendors.find(v => v.store_name === "Mr. Good Grill Resto");
  const divineDelight = vendors.find(v => v.store_name === "Divine Delight Foodies");
  const yoghurtArcade = vendors.find(v => v.store_name === "Yoghurt_Arcade");

  const jollofRice = menuItems.find(m => m.name?.includes("Jollof Rice"));
  const friedRice = menuItems.find(m => m.name?.includes("Fried Rice"));
  const shawarma = menuItems.find(m => m.name?.includes("Shawarma"));
  const goatMeat = menuItems.find(m => m.name?.includes("Goat Meat"));
  const turkey = menuItems.find(m => m.name?.includes("Turkey"));
  const catfish = menuItems.find(m => m.name?.includes("Catfish"));
  const salad = menuItems.find(m => m.name?.includes("Salad"));
  const parfait = menuItems.find(m => m.name?.includes("Deluxe Parfait"));

  if (amalaOriki && jollofRice) {
    packages.push({
      id: "classic-party",
      name: "Classic Nigerian Party",
      description: "Complete party package with Jollof rice, assorted meats, and traditional sides",
      image: "https://images.unsplash.com/photo-1606491956689-2ea866880c84?w=400&h=300&fit=crop",
      minGuests: 20,
      maxGuests: 100,
      pricePerPerson: 3500,
      estimatedPrice: 70000,
      popular: true,
      includes: ["Jollof Rice", "Fried Rice", "Grilled Chicken", "Goat Meat Pepper Soup", "Fresh Salad", "Drinks", "Disposable plates & cutlery", "Free delivery within 10km"],
      vendors: [amalaOriki?.store_name, cravings?.store_name].filter(Boolean),
      items: [
        {
          vendorId: amalaOriki?.id || "",
          vendorName: amalaOriki?.store_name || "Amala Oriki",
          productId: jollofRice?.id || "",
          productName: "Jollof Rice",
          quantity: 1,
          price: jollofRice?.price || 1000
        },
        {
          vendorId: amalaOriki?.id || "",
          vendorName: amalaOriki?.store_name || "Amala Oriki",
          productId: friedRice?.id || "",
          productName: "Fried Rice",
          quantity: 1,
          price: friedRice?.price || 1500
        }
      ]
    });
  }

  if (mrGoodGrill && goatMeat) {
    packages.push({
      id: "suya-grill",
      name: "Suya & Grill Special",
      description: "Perfect for meat lovers - assorted grilled meats with spicy suya",
      image: "https://images.unsplash.com/photo-1555939594-58d7cb561ad1?w=400&h=300&fit=crop",
      minGuests: 15,
      maxGuests: 80,
      pricePerPerson: 4500,
      estimatedPrice: 67500,
      includes: ["Spicy Grilled Catfish", "Peppered Croaker Fish", "Grilled Turkey", "Suya", "Jollof Rice", "Fresh Coleslaw", "Pepper Sauce", "Soft drinks & Water"],
      vendors: [mrGoodGrill?.store_name, amalaOriki?.store_name].filter(Boolean),
      items: [
        {
          vendorId: mrGoodGrill?.id || "",
          vendorName: mrGoodGrill?.store_name || "Mr. Good Grill Resto",
          productId: catfish?.id || "",
          productName: "Spicy Grilled Catfish",
          quantity: 1,
          price: catfish?.price || 15000
        }
      ]
    });
  }

  if (cravings && shawarma) {
    packages.push({
      id: "shawarma-express",
      name: "Shawarma Express",
      description: "Quick and delicious shawarma party pack for smaller gatherings",
      image: "https://images.unsplash.com/photo-1626700059175-7e68aea48e6b?w=400&h=300&fit=crop",
      minGuests: 10,
      maxGuests: 50,
      pricePerPerson: 3000,
      estimatedPrice: 30000,
      includes: ["Chicken Shawarma", "Beef Shawarma", "Mixed Shawarma", "Chapman drinks", "Small chops", "Disposable plates"],
      vendors: [cravings?.store_name],
      items: [
        {
          vendorId: cravings?.id || "",
          vendorName: cravings?.store_name || "Cravings by K.O.L",
          productId: shawarma?.id || "",
          productName: "Shawarma Platter",
          quantity: 1,
          price: shawarma?.price || 4000
        }
      ]
    });
  }

  if (amalaOriki && mrGoodGrill && yoghurtArcade) {
    packages.push({
      id: "premium-deluxe",
      name: "Premium Deluxe",
      description: "Ultimate party experience with premium dishes and desserts",
      image: "https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=400&h=300&fit=crop",
      minGuests: 30,
      maxGuests: 150,
      pricePerPerson: 6000,
      estimatedPrice: 180000,
      popular: true,
      includes: ["Premium Jollof Rice", "Grilled Catfish Deluxe", "Grilled Turkey", "Titus Fish", "Deluxe Parfait Dessert", "Fresh Creamy Salad", "Assorted Drinks", "Waitstaff service", "Decorations", "Premium cutlery"],
      vendors: [amalaOriki?.store_name, mrGoodGrill?.store_name, yoghurtArcade?.store_name].filter(Boolean),
      items: [
        {
          vendorId: amalaOriki?.id || "",
          vendorName: amalaOriki?.store_name || "Amala Oriki",
          productId: jollofRice?.id || "",
          productName: "Jollof Rice",
          quantity: 2,
          price: jollofRice?.price || 1000
        }
      ]
    });
  }

  return packages;
};

const partyExtras = [
  { id: "decorations", name: "Party Decorations", price: 15000, icon: "🎈", description: "Balloons, banners, table decorations" },
  { id: "photography", name: "Photography", price: 50000, icon: "📸", description: "Professional photographer (2 hours)" },
  { id: "dj", name: "DJ Service", price: 80000, icon: "🎧", description: "Professional DJ with speakers" },
  { id: "cake", name: "Custom Cake", price: 35000, icon: "🎂", description: "Personalized party cake" },
  { id: "waiters", name: "Waitstaff", price: 25000, icon: "👨‍🍳", description: "2 waiters for 4 hours" },
];

const PlanAParty = () => {
  const navigate = useNavigate();
  const { items: cartItems, addItem, removeItem, updateQuantity } = useCartStore();
  const [selectedPackage, setSelectedPackage] = useState<PartyPackage | null>(null);
  const [guestCount, setGuestCount] = useState(20);
  const [partyDate, setPartyDate] = useState("");
  const [partyTime, setPartyTime] = useState("");
  const [partyAddress, setPartyAddress] = useState("");
  const [selectedExtras, setSelectedExtras] = useState<string[]>([]);
  const [showCartDrawer, setShowCartDrawer] = useState(false);
  const [activeCategory, setActiveCategory] = useState("packages");
  const [showCustomModal, setShowCustomModal] = useState(false);
  
  // Custom order form state
  const [customForm, setCustomForm] = useState({
    name: "",
    phone: "",
    email: "",
    guestCount: "",
    eventType: "",
    budget: "",
    foodPreferences: "",
    specialRequests: "",
    eventDate: "",
  });

  const { data: vendors = [] } = useQuery({
    queryKey: ['vendors'],
    queryFn: fetchVendors,
  });

  const { data: menuItems = [] } = useQuery({
    queryKey: ['menu-items'],
    queryFn: fetchMenuItems,
  });

  const partyPackages = useMemo(() => getPartyPackages(vendors, menuItems), [vendors, menuItems]);

  const calculatePackagePrice = () => {
    if (!selectedPackage) return 0;
    const basePrice = selectedPackage.pricePerPerson * guestCount;
    const extrasPrice = selectedExtras.reduce((total, extraId) => {
      const extra = partyExtras.find(e => e.id === extraId);
      return total + (extra?.price || 0);
    }, 0);
    return basePrice + extrasPrice;
  };

  const addToCart = () => {
    if (!selectedPackage) return;

    selectedPackage.items.forEach(item => {
      const cartItem = {
        id: `${item.productId}-${Date.now()}`,
        productId: item.productId,
        name: `${item.productName} (Party Package)`,
        price: item.price * Math.ceil(guestCount / 10),
        quantity: 1,
        vendorId: item.vendorId,
        vendorName: item.vendorName,
      };
      addItem(cartItem);
    });

    selectedExtras.forEach(extraId => {
      const extra = partyExtras.find(e => e.id === extraId);
      if (extra) {
        addItem({
          id: `extra-${extraId}-${Date.now()}`,
          productId: extraId,
          name: `${extra.name} (Party Extra)`,
          price: extra.price,
          quantity: 1,
          vendorId: "party-service",
          vendorName: "Miramore Party Services",
        });
      }
    });

    toast.success(`Party package added to cart! Total: ₦${calculatePackagePrice().toLocaleString()}`);
    setShowCartDrawer(true);
  };

  // Updated WhatsApp function using your office number
  const handleWhatsAppChat = (message: string) => {
    // Your office WhatsApp number
    const whatsappNumber = "2349035882233"; // Remove the leading 0
    const encodedMessage = encodeURIComponent(message);
    window.open(`https://wa.me/${whatsappNumber}?text=${encodedMessage}`, "_blank");
  };

  const handleCustomOrderSubmit = () => {
    // Validate form
    if (!customForm.name || !customForm.phone || !customForm.guestCount) {
      toast.error("Please fill in all required fields (*)");
      return;
    }

    // Format message for WhatsApp
    const message = `🎉 *NEW PARTY ORDER REQUEST* 🎉%0A%0A` +
      `*Customer Details:*%0A` +
      `Name: ${customForm.name}%0A` +
      `Phone: ${customForm.phone}%0A` +
      `Email: ${customForm.email || "Not provided"}%0A%0A` +
      `*Party Details:*%0A` +
      `Event Type: ${customForm.eventType || "Not specified"}%0A` +
      `Number of Guests: ${customForm.guestCount}%0A` +
      `Budget: ₦${customForm.budget || "Flexible"}%0A` +
      `Event Date: ${customForm.eventDate || "Not specified"}%0A%0A` +
      `*Food Preferences:*%0A${customForm.foodPreferences || "None"}%0A%0A` +
      `*Special Requests:*%0A${customForm.specialRequests || "None"}`;

    handleWhatsAppChat(message);
    
    toast.success("Request sent! Our party planner will contact you shortly.");
    setShowCustomModal(false);
    setCustomForm({
      name: "",
      phone: "",
      email: "",
      guestCount: "",
      eventType: "",
      budget: "",
      foodPreferences: "",
      specialRequests: "",
      eventDate: "",
    });
  };

  const handleWhatsAppClick = () => {
    const message = "Hello Miramore! I'm interested in planning a party. Can you help me? 🎉";
    handleWhatsAppChat(message);
  };

  const cartCount = cartItems.reduce((sum, item) => sum + item.quantity, 0);

  return (
    <div className="min-h-screen pb-24 bg-gradient-to-b from-amber-50 to-white">
      {/* Header */}
      <header className="sticky top-0 z-30 bg-white/95 backdrop-blur-sm border-b border-amber-100">
        <div className="flex items-center justify-between px-4 py-3">
          <button onClick={() => navigate(-1)} className="p-2 -ml-2 rounded-full hover:bg-gray-100">
            <ArrowLeft className="w-5 h-5" />
          </button>
          <h1 className="text-lg font-bold text-gray-800">Plan a Party</h1>
          <button 
            onClick={() => setShowCartDrawer(true)} 
            className="relative p-2 rounded-full hover:bg-gray-100"
          >
            <ShoppingCart className="w-5 h-5" />
            {cartCount > 0 && (
              <span className="absolute -top-1 -right-1 w-5 h-5 bg-brand-red text-white text-[10px] font-bold rounded-full flex items-center justify-center">
                {cartCount}
              </span>
            )}
          </button>
        </div>
      </header>

      {/* Hero Banner */}
      <div className="relative h-48 bg-gradient-to-r from-brand-red to-orange-500 overflow-hidden">
        <div className="absolute inset-0 bg-black/20" />
        <div className="relative z-10 flex flex-col items-center justify-center h-full text-white text-center px-4">
          <PartyPopper className="w-12 h-12 mb-2" />
          <h2 className="text-2xl font-bold">Party with Miramore!</h2>
          <p className="text-sm opacity-90 mt-1">Let us handle the food. You enjoy the party.</p>
          <div className="flex gap-2 mt-3">
            <span className="text-xs bg-white/20 rounded-full px-3 py-1">🎉 50+ Events Planned</span>
            <span className="text-xs bg-white/20 rounded-full px-3 py-1">⭐ 4.9 Rating</span>
          </div>
        </div>
      </div>

      {/* Category Tabs */}
      <div className="px-4 mt-4">
        <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
          {[
            { id: "packages", label: "Party Packages", icon: <PartyPopper className="w-4 h-4" /> },
            { id: "extras", label: "Extras", icon: <Sparkles className="w-4 h-4" /> },
            { id: "custom", label: "Custom Order", icon: <Plus className="w-4 h-4" /> },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveCategory(tab.id)}
              className={`flex items-center gap-1.5 px-4 py-2 rounded-full text-sm font-medium transition-all ${
                activeCategory === tab.id
                  ? "bg-brand-red text-white shadow-md"
                  : "bg-gray-100 text-gray-600 hover:bg-gray-200"
              }`}
            >
              {tab.icon}
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Packages Section */}
      {activeCategory === "packages" && (
        <div className="px-4 py-4">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-bold text-gray-800">Popular Party Packages</h3>
          </div>
          
          <div className="space-y-4">
            {partyPackages.map((pkg, idx) => (
              <motion.div
                key={pkg.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.1 }}
                onClick={() => setSelectedPackage(pkg)}
                className={`bg-white rounded-2xl overflow-hidden shadow-sm border-2 transition-all cursor-pointer ${
                  selectedPackage?.id === pkg.id ? "border-brand-red shadow-md" : "border-gray-100"
                }`}
              >
                <div className="relative h-36">
                  <img src={pkg.image} alt={pkg.name} className="w-full h-full object-cover" />
                  {pkg.popular && (
                    <div className="absolute top-2 right-2 bg-brand-red text-white text-xs font-bold px-2 py-1 rounded-full">
                      🔥 Popular
                    </div>
                  )}
                </div>
                <div className="p-4">
                  <div className="flex justify-between items-start mb-2">
                    <h4 className="font-bold text-gray-800">{pkg.name}</h4>
                    <div className="text-right">
                      <span className="text-sm text-gray-500">from</span>
                      <span className="text-lg font-bold text-brand-red"> ₦{pkg.pricePerPerson.toLocaleString()}</span>
                      <span className="text-xs text-gray-500">/person</span>
                    </div>
                  </div>
                  <p className="text-xs text-gray-500 mb-3">{pkg.description}</p>
                  <div className="flex flex-wrap gap-1 mb-3">
                    {pkg.includes.slice(0, 3).map((item, i) => (
                      <span key={i} className="text-[10px] bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full">
                        {item}
                      </span>
                    ))}
                    {pkg.includes.length > 3 && (
                      <span className="text-[10px] text-gray-400">+{pkg.includes.length - 3} more</span>
                    )}
                  </div>
                  <div className="flex items-center justify-between text-xs text-gray-500">
                    <span>👥 {pkg.minGuests}-{pkg.maxGuests} guests</span>
                    <span>🏪 {pkg.vendors.length} vendor{pkg.vendors.length > 1 ? 's' : ''}</span>
                    {selectedPackage?.id === pkg.id && (
                      <span className="text-brand-red font-medium flex items-center gap-1">
                        <Check className="w-3 h-3" /> Selected
                      </span>
                    )}
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      )}

      {/* Extras Section */}
      {activeCategory === "extras" && (
        <div className="px-4 py-4">
          <h3 className="text-lg font-bold text-gray-800 mb-4">Party Extras</h3>
          <div className="space-y-3">
            {partyExtras.map((extra) => (
              <div
                key={extra.id}
                onClick={() => {
                  if (selectedExtras.includes(extra.id)) {
                    setSelectedExtras(selectedExtras.filter(e => e !== extra.id));
                  } else {
                    setSelectedExtras([...selectedExtras, extra.id]);
                  }
                }}
                className={`bg-white rounded-2xl p-4 shadow-sm border-2 cursor-pointer transition-all ${
                  selectedExtras.includes(extra.id) ? "border-brand-red bg-brand-red/5" : "border-gray-100"
                }`}
              >
                <div className="flex items-center gap-3">
                  <div className="text-3xl">{extra.icon}</div>
                  <div className="flex-1">
                    <div className="flex justify-between items-center">
                      <h4 className="font-bold text-gray-800">{extra.name}</h4>
                      <span className="font-bold text-brand-red">₦{extra.price.toLocaleString()}</span>
                    </div>
                    <p className="text-xs text-gray-500 mt-1">{extra.description}</p>
                  </div>
                  {selectedExtras.includes(extra.id) && (
                    <Check className="w-5 h-5 text-brand-red" />
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Custom Order Section - FULL FORM */}
      {activeCategory === "custom" && (
        <div className="px-4 py-4">
          <div className="bg-gradient-to-r from-amber-50 to-orange-50 rounded-2xl p-6">
            <div className="text-center mb-6">
              <Plus className="w-12 h-12 text-brand-red mx-auto mb-3" />
              <h3 className="text-xl font-bold text-gray-800 mb-2">Create Custom Party Order</h3>
              <p className="text-sm text-gray-600">
                Tell us your requirements and we'll create a custom package just for you.
              </p>
            </div>

            {/* Full Custom Order Form */}
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Full Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={customForm.name}
                    onChange={(e) => setCustomForm({ ...customForm, name: e.target.value })}
                    placeholder="Enter your full name"
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-red/30 focus:border-brand-red"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Phone Number <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="tel"
                    value={customForm.phone}
                    onChange={(e) => setCustomForm({ ...customForm, phone: e.target.value })}
                    placeholder="08012345678"
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-red/30 focus:border-brand-red"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Email Address
                  </label>
                  <input
                    type="email"
                    value={customForm.email}
                    onChange={(e) => setCustomForm({ ...customForm, email: e.target.value })}
                    placeholder="you@example.com"
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-red/30 focus:border-brand-red"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Event Type
                  </label>
                  <select
                    value={customForm.eventType}
                    onChange={(e) => setCustomForm({ ...customForm, eventType: e.target.value })}
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-red/30 focus:border-brand-red"
                  >
                    <option value="">Select event type</option>
                    <option value="birthday">Birthday Party</option>
                    <option value="wedding">Wedding</option>
                    <option value="corporate">Corporate Event</option>
                    <option value="baby-shower">Baby Shower</option>
                    <option value="anniversary">Anniversary</option>
                    <option value="other">Other</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Number of Guests <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="number"
                    value={customForm.guestCount}
                    onChange={(e) => setCustomForm({ ...customForm, guestCount: e.target.value })}
                    placeholder="e.g., 50"
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-red/30 focus:border-brand-red"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Budget (₦)
                  </label>
                  <input
                    type="number"
                    value={customForm.budget}
                    onChange={(e) => setCustomForm({ ...customForm, budget: e.target.value })}
                    placeholder="e.g., 100000"
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-red/30 focus:border-brand-red"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Event Date
                </label>
                <input
                  type="date"
                  value={customForm.eventDate}
                  onChange={(e) => setCustomForm({ ...customForm, eventDate: e.target.value })}
                  min={new Date().toISOString().split('T')[0]}
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-red/30 focus:border-brand-red"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Food Preferences
                </label>
                <textarea
                  value={customForm.foodPreferences}
                  onChange={(e) => setCustomForm({ ...customForm, foodPreferences: e.target.value })}
                  placeholder="Tell us what dishes you'd like (e.g., Jollof Rice, Grilled Chicken, Shawarma, etc.)"
                  rows={3}
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-red/30 focus:border-brand-red resize-none"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Special Requests
                </label>
                <textarea
                  value={customForm.specialRequests}
                  onChange={(e) => setCustomForm({ ...customForm, specialRequests: e.target.value })}
                  placeholder="Dietary restrictions, preferred vendors, delivery time, etc."
                  rows={2}
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-red/30 focus:border-brand-red resize-none"
                />
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  onClick={handleCustomOrderSubmit}
                  className="flex-1 py-3 bg-brand-red text-white rounded-xl font-bold hover:bg-brand-red/90 transition"
                >
                  Submit Request
                </button>
                <button
                  onClick={() => {
                    setCustomForm({
                      name: "",
                      phone: "",
                      email: "",
                      guestCount: "",
                      eventType: "",
                      budget: "",
                      foodPreferences: "",
                      specialRequests: "",
                      eventDate: "",
                    });
                  }}
                  className="px-6 py-3 bg-gray-100 text-gray-700 rounded-xl font-medium hover:bg-gray-200 transition"
                >
                  Clear
                </button>
              </div>
            </div>
          </div>

          {/* Quick vendor links */}
          <div className="mt-6">
            <h4 className="text-md font-semibold text-gray-800 mb-3">Browse Party Vendors</h4>
            <div className="flex gap-3 overflow-x-auto pb-2">
              {vendors.slice(0, 6).map((vendor) => (
                <button
                  key={vendor.id}
                  onClick={() => navigate(`/vendor/${vendor.id}`)}
                  className="min-w-[140px] bg-white rounded-xl p-3 shadow-sm border border-gray-100 text-left hover:shadow-md transition"
                >
                  <div className="w-full h-20 bg-gray-100 rounded-lg mb-2 overflow-hidden">
                    {vendor.store_logo_url ? (
                      <img src={vendor.store_logo_url} className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-2xl">🏪</div>
                    )}
                  </div>
                  <p className="font-medium text-sm truncate">{vendor.store_name}</p>
                  <div className="flex items-center gap-1 text-xs text-gray-500 mt-1">
                    <Star className="w-3 h-3 fill-yellow-400" />
                    <span>{vendor.rating || 5.0}</span>
                  </div>
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Party Details Form (shows when package selected) */}
      {selectedPackage && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-2xl mx-4 p-5 shadow-lg border border-amber-100 mt-2 mb-6"
        >
          <h3 className="font-bold text-gray-800 mb-4 flex items-center gap-2">
            <Calendar className="w-5 h-5 text-brand-red" />
            Party Details
          </h3>
          
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium text-gray-700 mb-1 block">Number of Guests</label>
              <div className="flex items-center gap-3">
                <button
                  onClick={() => setGuestCount(Math.max(selectedPackage.minGuests, guestCount - 5))}
                  className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center"
                >
                  <Minus className="w-4 h-4" />
                </button>
                <span className="text-xl font-bold w-16 text-center">{guestCount}</span>
                <button
                  onClick={() => setGuestCount(Math.min(selectedPackage.maxGuests, guestCount + 5))}
                  className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center"
                >
                  <Plus className="w-4 h-4" />
                </button>
                <span className="text-xs text-gray-500">
                  (Min: {selectedPackage.minGuests} | Max: {selectedPackage.maxGuests})
                </span>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-sm font-medium text-gray-700 mb-1 block">Party Date</label>
                <input
                  type="date"
                  value={partyDate}
                  onChange={(e) => setPartyDate(e.target.value)}
                  className="w-full p-2 border border-gray-200 rounded-xl text-sm"
                  min={new Date().toISOString().split('T')[0]}
                />
              </div>
              <div>
                <label className="text-sm font-medium text-gray-700 mb-1 block">Party Time</label>
                <input
                  type="time"
                  value={partyTime}
                  onChange={(e) => setPartyTime(e.target.value)}
                  className="w-full p-2 border border-gray-200 rounded-xl text-sm"
                />
              </div>
            </div>

            <div>
              <label className="text-sm font-medium text-gray-700 mb-1 block">Delivery Address</label>
              <div className="flex items-center gap-2">
                <MapPin className="w-4 h-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Enter party venue address"
                  value={partyAddress}
                  onChange={(e) => setPartyAddress(e.target.value)}
                  className="flex-1 p-2 border border-gray-200 rounded-xl text-sm"
                />
              </div>
            </div>

            <div className="bg-amber-50 rounded-xl p-3">
              <div className="flex justify-between text-sm mb-2">
                <span className="text-gray-600">Package ({guestCount} guests × ₦{selectedPackage.pricePerPerson.toLocaleString()})</span>
                <span className="font-medium">₦{(selectedPackage.pricePerPerson * guestCount).toLocaleString()}</span>
              </div>
              {selectedExtras.length > 0 && (
                <div className="border-t border-amber-200 pt-2 mt-2">
                  <div className="text-xs text-gray-500 mb-1">Extras:</div>
                  {selectedExtras.map(extraId => {
                    const extra = partyExtras.find(e => e.id === extraId);
                    return extra ? (
                      <div key={extraId} className="flex justify-between text-xs">
                        <span>{extra.name}</span>
                        <span>₦{extra.price.toLocaleString()}</span>
                      </div>
                    ) : null;
                  })}
                </div>
              )}
              <div className="flex justify-between font-bold pt-2 border-t border-amber-200 mt-2">
                <span>Total Estimate</span>
                <span className="text-brand-red text-lg">₦{calculatePackagePrice().toLocaleString()}</span>
              </div>
            </div>

            <div className="flex gap-3">
              <button
                onClick={addToCart}
                className="flex-1 py-3 bg-brand-red text-white rounded-xl font-bold flex items-center justify-center gap-2"
              >
                <ShoppingCart className="w-4 h-4" />
                Add to Cart
              </button>
              <button
                onClick={() => {
                  addToCart();
                  navigate('/cart');
                }}
                className="flex-1 py-3 bg-gray-900 text-white rounded-xl font-bold flex items-center justify-center gap-2"
              >
                <Zap className="w-4 h-4" />
                Book Now
              </button>
            </div>
          </div>
        </motion.div>
      )}

      {/* Party Tips Section */}
      <div className="px-4 py-6">
        <h3 className="text-md font-bold text-gray-800 mb-3">💡 Party Planning Tips</h3>
        <div className="flex gap-3 overflow-x-auto pb-2">
          {[
            { icon: "📅", tip: "Book 2 weeks in advance" },
            { icon: "👥", tip: "Order 20% extra for guests" },
            { icon: "🍽️", tip: "Include vegetarian options" },
            { icon: "🎵", tip: "Plan for music & entertainment" },
          ].map((item, i) => (
            <div key={i} className="min-w-[140px] bg-white rounded-xl p-3 shadow-sm border border-gray-100">
              <div className="text-2xl mb-1">{item.icon}</div>
              <p className="text-xs font-medium text-gray-700">{item.tip}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Testimonials */}
      <div className="px-4 pb-6">
        <h3 className="text-md font-bold text-gray-800 mb-3">⭐ Happy Party Hosts</h3>
        <div className="flex gap-3 overflow-x-auto pb-2">
          {[
            { name: "Adebayo O.", event: "Birthday Party", rating: 5, comment: "Food was amazing! Everyone loved it." },
            { name: "Chidinma K.", event: "Wedding", rating: 5, comment: "Professional service, delicious food." },
            { name: "Emeka N.", event: "Corporate Event", rating: 5, comment: "Highly recommended for events." },
          ].map((testimonial, i) => (
            <div key={i} className="min-w-[200px] bg-white rounded-xl p-3 shadow-sm border border-gray-100">
              <div className="flex items-center gap-0.5 mb-1">
                {[...Array(5)].map((_, j) => (
                  <Star key={j} className="w-3 h-3 fill-yellow-400 text-yellow-400" />
                ))}
              </div>
              <p className="text-xs text-gray-600 mb-2">"{testimonial.comment}"</p>
              <div className="flex items-center justify-between">
                <span className="text-xs font-medium text-gray-800">{testimonial.name}</span>
                <span className="text-[10px] text-gray-400">{testimonial.event}</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* WhatsApp Support - NOW LINKED TO YOUR OFFICE NUMBER */}
      <div className="px-4 pb-20">
        <button
          onClick={handleWhatsAppClick}
          className="w-full bg-green-50 rounded-2xl p-4 flex items-center justify-between hover:bg-green-100 transition cursor-pointer"
        >
          <div className="flex items-center gap-3">
            <MessageCircle className="w-8 h-8 text-green-600" />
            <div className="text-left">
              <p className="font-bold text-gray-800">Need help planning?</p>
              <p className="text-xs text-gray-500">Chat with our party specialist on WhatsApp</p>
            </div>
          </div>
          <div className="px-4 py-2 bg-green-600 text-white rounded-full text-sm font-medium flex items-center gap-2">
            <Send className="w-3 h-3" />
            Chat Now
          </div>
        </button>
      </div>

      <BottomNav />
      <WhatsAppButton />

      {/* Cart Drawer */}
      <AnimatePresence>
        {showCartDrawer && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/50"
            onClick={() => setShowCartDrawer(false)}
          >
            <motion.div
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              className="absolute right-0 top-0 bottom-0 w-full max-w-md bg-white shadow-xl"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex flex-col h-full">
                <div className="p-4 border-b border-gray-100 flex justify-between items-center">
                  <h3 className="text-lg font-bold">Your Party Cart</h3>
                  <button onClick={() => setShowCartDrawer(false)} className="p-1">
                    <X className="w-5 h-5" />
                  </button>
                </div>
                
                <div className="flex-1 overflow-y-auto p-4">
                  {cartItems.length === 0 ? (
                    <div className="text-center py-10 text-gray-400">
                      <ShoppingCart className="w-12 h-12 mx-auto mb-3 opacity-50" />
                      <p>Your cart is empty</p>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {cartItems.map((item) => (
                        <div key={item.id} className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl">
                          <div className="flex-1">
                            <p className="font-medium text-sm">{item.name}</p>
                            <p className="text-xs text-gray-500">{item.vendorName}</p>
                            <p className="text-sm font-bold text-brand-red mt-1">₦{item.price.toLocaleString()}</p>
                          </div>
                          <div className="flex items-center gap-2">
                            <button
                              onClick={() => updateQuantity(item.id, item.quantity - 1)}
                              className="w-6 h-6 rounded-full bg-gray-200 flex items-center justify-center"
                            >
                              <Minus className="w-3 h-3" />
                            </button>
                            <span className="w-6 text-center text-sm">{item.quantity}</span>
                            <button
                              onClick={() => updateQuantity(item.id, item.quantity + 1)}
                              className="w-6 h-6 rounded-full bg-gray-200 flex items-center justify-center"
                            >
                              <Plus className="w-3 h-3" />
                            </button>
                            <button
                              onClick={() => removeItem(item.id)}
                              className="w-6 h-6 rounded-full bg-red-100 flex items-center justify-center"
                            >
                              <Trash2 className="w-3 h-3 text-red-500" />
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
                
                <div className="p-4 border-t border-gray-100 space-y-3">
                  <div className="flex justify-between font-bold">
                    <span>Subtotal</span>
                    <span>₦{cartItems.reduce((sum, i) => sum + (i.price * i.quantity), 0).toLocaleString()}</span>
                  </div>
                  <button
                    onClick={() => {
                      setShowCartDrawer(false);
                      navigate('/cart');
                    }}
                    className="w-full py-3 bg-brand-red text-white rounded-xl font-bold"
                  >
                    Proceed to Checkout
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default PlanAParty;