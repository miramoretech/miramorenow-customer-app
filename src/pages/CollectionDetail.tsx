import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { motion } from "framer-motion";
import {
  ArrowLeft, Bookmark, Heart, Plus, MoreHorizontal, Search,
  ShoppingCart, Star, Clock, MapPin, X, Check, FolderPlus,
  Utensils, Building2, Sparkles, Filter, Grid3x3, List,
  Trash2, ChevronRight, Home, Coffee, Zap
} from "lucide-react";
import { useCartStore } from "@/stores/cartStore";
import { supabase } from "@/lib/supabase";
import { useQuery } from "@tanstack/react-query";
import { toast } from "sonner";
import BottomNav from "@/components/BottomNav";
import WhatsAppButton from "@/components/WhatsAppButton";

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
      vendor:vendor_id(store_name, store_category, rating, store_logo_url)
    `)
    .eq('is_available', true);
  if (error) throw error;
  return data || [];
};

const CollectionDetail = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const collection = location.state?.collection;
  const [activeTab, setActiveTab] = useState<"dishes" | "restaurants" | "beauty">("dishes");
  const [searchQuery, setSearchQuery] = useState("");
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [showStartExploring, setShowStartExploring] = useState(true);

  const { data: vendors = [] } = useQuery({
    queryKey: ['vendors'],
    queryFn: fetchVendors,
  });

  const { data: menuItems = [] } = useQuery({
    queryKey: ['menu-items'],
    queryFn: fetchMenuItems,
  });

  // Filter menu items by type
  const foodItems = menuItems.filter(item => item.vendor?.store_category === 'food');
  const beautyItems = menuItems.filter(item => item.vendor?.store_category === 'beauty');
  const restaurantVendors = vendors.filter(v => v.store_category === 'food');
  const beautyVendors = vendors.filter(v => v.store_category === 'beauty');

  const filteredDishes = foodItems.filter(item =>
    item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    item.vendor?.store_name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const filteredRestaurants = restaurantVendors.filter(v =>
    v.store_name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const filteredBeauty = beautyVendors.filter(v =>
    v.store_name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleVendorClick = (vendorId: string) => {
    const vendor = vendors.find(v => v.id === vendorId);
    if (vendor) {
      navigate(`/vendor/${vendor.id}`);
    } else {
      toast.error("Vendor not found. Please try again.");
    }
  };

  const handleAddToCart = (item: any) => {
    toast.success(`Added ${item.name} to cart!`);
  };

  const handleAddToCollection = (item: any) => {
    toast.success(`Added to ${collection?.name}!`);
  };

  if (!collection) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-6">
        <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mb-4">
          <FolderPlus className="w-10 h-10 text-gray-400" />
        </div>
        <p className="text-gray-500 text-center">Collection not found</p>
        <button
          onClick={() => navigate("/collections")}
          className="mt-4 px-6 py-2 bg-brand-red text-white rounded-full text-sm font-medium"
        >
          Back to Collections
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen pb-24 bg-gradient-to-b from-amber-50 to-white">
      {/* Header */}
      <header className="sticky top-0 z-30 bg-white/95 backdrop-blur-sm border-b border-amber-100">
        <div className="flex items-center justify-between px-4 py-3">
          <button onClick={() => navigate(-1)} className="p-2 -ml-2 rounded-full hover:bg-gray-100">
            <ArrowLeft className="w-5 h-5" />
          </button>
          <h1 className="text-lg font-bold text-gray-800 truncate max-w-[200px]">{collection.name}</h1>
          <button className="p-2 rounded-full hover:bg-gray-100">
            <MoreHorizontal className="w-5 h-5" />
          </button>
        </div>
      </header>

      {/* Collection Header */}
      <div className="bg-gradient-to-r from-brand-red to-orange-500 text-white px-6 py-8">
        <div className="flex items-center justify-between mb-4">
          <div className="w-16 h-16 bg-white/20 rounded-2xl flex items-center justify-center">
            <FolderPlus className="w-8 h-8" />
          </div>
          <div className="text-right">
            <p className="text-xs opacity-90">Created {new Date(collection.createdAt).toLocaleDateString()}</p>
            <p className="text-sm font-medium mt-1">{collection.itemCount} items</p>
          </div>
        </div>
        <h2 className="text-2xl font-bold mb-2">{collection.name}</h2>
        <p className="text-sm opacity-90">Your personalized collection of favorite items</p>
        
        {/* Start Exploring Button */}
        {showStartExploring && (
          <motion.button
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            onClick={() => {
              setShowStartExploring(false);
              toast.success("Start exploring! Tap on any dish to add to your collection");
            }}
            className="mt-4 px-6 py-2 bg-white text-brand-red rounded-full text-sm font-bold flex items-center gap-2 w-fit hover:shadow-lg transition"
          >
            <Sparkles className="w-4 h-4" />
            Start Exploring
          </motion.button>
        )}
      </div>

      {/* Info Banner when Start Exploring is clicked */}
      {!showStartExploring && (
        <div className="mx-4 mt-4 bg-amber-50 rounded-xl p-3 flex items-center gap-2">
          <Zap className="w-4 h-4 text-brand-red" />
          <p className="text-xs text-gray-600 flex-1">
            💡 Tip: Tap the <Bookmark className="w-3 h-3 inline" /> icon on any dish to add it to this collection!
          </p>
          <button onClick={() => setShowStartExploring(true)} className="text-[10px] text-brand-red">
            Got it
          </button>
        </div>
      )}

      {/* Tabs */}
      <div className="px-4 mt-4">
        <div className="flex gap-2 bg-white rounded-2xl p-1 shadow-sm">
          {[
            { id: "dishes", label: "Dishes", icon: <Utensils className="w-4 h-4" />, count: filteredDishes.length },
            { id: "restaurants", label: "Restaurants", icon: <Building2 className="w-4 h-4" />, count: filteredRestaurants.length },
            { id: "beauty", label: "Beauty", icon: <Sparkles className="w-4 h-4" />, count: filteredBeauty.length },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-medium transition-all ${
                activeTab === tab.id
                  ? "bg-brand-red text-white shadow-md"
                  : "text-gray-600 hover:bg-gray-50"
              }`}
            >
              {tab.icon}
              {tab.label}
              <span className={`text-xs px-1.5 py-0.5 rounded-full ${
                activeTab === tab.id ? "bg-white/20" : "bg-gray-100"
              }`}>
                {tab.count}
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* Search Bar */}
      <div className="px-4 mt-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            placeholder={`Search in ${collection.name}...`}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-3 bg-white border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-red/30 focus:border-brand-red"
          />
          <button
            onClick={() => setViewMode(viewMode === "grid" ? "list" : "grid")}
            className="absolute right-3 top-1/2 -translate-y-1/2"
          >
            {viewMode === "grid" ? (
              <List className="w-4 h-4 text-gray-400" />
            ) : (
              <Grid3x3 className="w-4 h-4 text-gray-400" />
            )}
          </button>
        </div>
      </div>

      {/* Dishes Tab */}
      {activeTab === "dishes" && (
        <div className="px-4 py-4">
          {filteredDishes.length === 0 ? (
            <div className="text-center py-16">
              <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Utensils className="w-10 h-10 text-gray-400" />
              </div>
              <h3 className="text-lg font-semibold text-gray-800 mb-2">No dishes found</h3>
              <p className="text-sm text-gray-500 mb-4">Try searching for something else</p>
              <button
                onClick={() => navigate("/home")}
                className="px-6 py-2 bg-brand-red text-white rounded-full text-sm font-medium"
              >
                Browse Menu
              </button>
            </div>
          ) : (
            <div className={viewMode === "grid" ? "grid grid-cols-2 gap-3" : "space-y-3"}>
              {filteredDishes.slice(0, 20).map((item, idx) => (
                <motion.div
                  key={item.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: idx * 0.02 }}
                  className={`bg-white rounded-2xl shadow-sm border border-gray-100 ${
                    viewMode === "grid" ? "p-2" : "p-3"
                  }`}
                >
                  {viewMode === "grid" ? (
                    <>
                      <div className="relative cursor-pointer" onClick={() => handleVendorClick(item.vendor_id)}>
                        <img
                          src={item.image_url || "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=200&h=200&fit=crop"}
                          alt={item.name}
                          className="w-full h-32 rounded-xl object-cover"
                        />
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleAddToCollection(item);
                          }}
                          className="absolute top-2 right-2 p-1.5 bg-white rounded-full shadow-md"
                        >
                          <Plus className="w-3.5 h-3.5 text-brand-red" />
                        </button>
                      </div>
                      <div className="p-2">
                        <h4 className="font-bold text-gray-800 text-sm truncate">{item.name}</h4>
                        <p className="text-xs text-gray-500 truncate">{item.vendor?.store_name}</p>
                        <div className="flex items-center justify-between mt-2">
                          <span className="text-sm font-bold text-brand-red">₦{item.price.toLocaleString()}</span>
                          <button
                            onClick={() => handleAddToCart(item)}
                            className="px-2 py-1 bg-brand-red/10 rounded-lg text-xs font-medium text-brand-red"
                          >
                            Add
                          </button>
                        </div>
                      </div>
                    </>
                  ) : (
                    <div className="flex gap-3">
                      <div className="cursor-pointer" onClick={() => handleVendorClick(item.vendor_id)}>
                        <img
                          src={item.image_url || "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=200&h=200&fit=crop"}
                          alt={item.name}
                          className="w-16 h-16 rounded-xl object-cover"
                        />
                      </div>
                      <div className="flex-1">
                        <h4 className="font-bold text-gray-800">{item.name}</h4>
                        <p className="text-xs text-gray-500">{item.vendor?.store_name}</p>
                        <div className="flex items-center gap-2 mt-1">
                          <Star className="w-3 h-3 fill-yellow-400 text-yellow-400" />
                          <span className="text-xs text-gray-600">{item.vendor?.rating || 4.8}</span>
                        </div>
                        <div className="flex items-center justify-between mt-2">
                          <span className="text-sm font-bold text-brand-red">₦{item.price.toLocaleString()}</span>
                          <div className="flex gap-2">
                            <button
                              onClick={() => handleAddToCollection(item)}
                              className="p-1.5 rounded-lg hover:bg-gray-100"
                            >
                              <Bookmark className="w-4 h-4 text-gray-400" />
                            </button>
                            <button
                              onClick={() => handleAddToCart(item)}
                              className="px-3 py-1 bg-brand-red text-white rounded-lg text-xs font-medium"
                            >
                              Add to Cart
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </motion.div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Restaurants Tab */}
      {activeTab === "restaurants" && (
        <div className="px-4 py-4">
          {filteredRestaurants.length === 0 ? (
            <div className="text-center py-16">
              <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Building2 className="w-10 h-10 text-gray-400" />
              </div>
              <h3 className="text-lg font-semibold text-gray-800 mb-2">No restaurants found</h3>
              <p className="text-sm text-gray-500 mb-4">Try searching for something else</p>
              <button
                onClick={() => navigate("/home")}
                className="px-6 py-2 bg-brand-red text-white rounded-full text-sm font-medium"
              >
                Browse Restaurants
              </button>
            </div>
          ) : (
            <div className="space-y-3">
              {filteredRestaurants.map((vendor, idx) => (
                <motion.div
                  key={vendor.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: idx * 0.03 }}
                  onClick={() => handleVendorClick(vendor.id)}
                  className="bg-white rounded-2xl p-3 shadow-sm border border-gray-100 cursor-pointer hover:shadow-md transition"
                >
                  <div className="flex gap-3">
                    <div className="w-16 h-16 rounded-xl overflow-hidden bg-gray-100 flex-shrink-0">
                      {vendor.store_logo_url ? (
                        <img src={vendor.store_logo_url} alt={vendor.store_name} className="w-full h-full object-cover" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-2xl">🏪</div>
                      )}
                    </div>
                    <div className="flex-1">
                      <div className="flex justify-between items-start">
                        <div>
                          <h4 className="font-bold text-gray-800">{vendor.store_name}</h4>
                          <div className="flex items-center gap-2 mt-1">
                            <Star className="w-3 h-3 fill-yellow-400 text-yellow-400" />
                            <span className="text-xs text-gray-600">{vendor.rating || 5.0}</span>
                            <span className="text-xs text-gray-400">•</span>
                            <span className="text-xs text-gray-500">5-10 min</span>
                          </div>
                          <p className="text-xs text-gray-500 mt-1">From ₦{vendor.min_price || 1350}</p>
                        </div>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleAddToCollection(vendor);
                          }}
                          className="p-1.5 rounded-full hover:bg-gray-100"
                        >
                          <Heart className="w-4 h-4 text-gray-400" />
                        </button>
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Beauty Tab */}
      {activeTab === "beauty" && (
        <div className="px-4 py-4">
          {filteredBeauty.length === 0 ? (
            <div className="text-center py-16">
              <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Sparkles className="w-10 h-10 text-gray-400" />
              </div>
              <h3 className="text-lg font-semibold text-gray-800 mb-2">No beauty vendors found</h3>
              <p className="text-sm text-gray-500 mb-4">Try searching for something else</p>
              <button
                onClick={() => navigate("/home")}
                className="px-6 py-2 bg-brand-red text-white rounded-full text-sm font-medium"
              >
                Browse Beauty
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-3">
              {filteredBeauty.map((vendor, idx) => (
                <motion.div
                  key={vendor.id}
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: idx * 0.03 }}
                  onClick={() => handleVendorClick(vendor.id)}
                  className="bg-white rounded-2xl p-3 shadow-sm border border-gray-100 cursor-pointer hover:shadow-md transition"
                >
                  <div className="relative">
                    <div className="w-full h-32 bg-gradient-to-br from-pink-100 to-purple-100 rounded-xl flex items-center justify-center">
                      <Sparkles className="w-12 h-12 text-brand-red" />
                    </div>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleAddToCollection(vendor);
                      }}
                      className="absolute top-2 right-2 p-1.5 bg-white rounded-full shadow-md"
                    >
                      <Heart className="w-3.5 h-3.5 text-gray-400" />
                    </button>
                  </div>
                  <h4 className="font-bold text-gray-800 mt-2 truncate">{vendor.store_name}</h4>
                  <div className="flex items-center gap-1 mt-1">
                    <Star className="w-3 h-3 fill-yellow-400 text-yellow-400" />
                    <span className="text-xs text-gray-600">{vendor.rating || 5.0}</span>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </div>
      )}

      <BottomNav />
      <WhatsAppButton />
    </div>
  );
};

export default CollectionDetail;