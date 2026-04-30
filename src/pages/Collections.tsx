import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  ArrowLeft, Bookmark, Heart, Plus, Trash2, MoreHorizontal,
  ShoppingCart, Star, Clock, MapPin, X, Check, FolderPlus,
  Utensils, Building2, Sparkles, Search, Filter, Home,
  Coffee, Pizza, Beer, Cake, Gift, Tag, Zap, Flame,
  ChevronRight  // ✅ ADDED
} from "lucide-react";
import { useCartStore } from "@/stores/cartStore";
import { supabase } from "@/lib/supabase";
import { useQuery } from "@tanstack/react-query";
import { toast } from "sonner";
import BottomNav from "@/components/BottomNav";
import WhatsAppButton from "@/components/WhatsAppButton";

// Types
interface Collection {
  id: string;
  name: string;
  createdAt: string;
  itemCount: number;
  dishCount: number;
  restaurantCount: number;
  beautyCount: number;
  image?: string;
  isDefault?: boolean;
}

interface BookmarkedItem {
  id: string;
  productId: string;
  name: string;
  price: number;
  image: string;
  vendorName: string;
  vendorId: string;
  rating: number;
  savedAt: string;
  type: "dish" | "restaurant" | "beauty";
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
      vendor:vendor_id(store_name, store_category, rating, store_logo_url)
    `)
    .eq('is_available', true);
  if (error) throw error;
  return data || [];
};

const Collections = () => {
  const navigate = useNavigate();
  const [activeMainTab, setActiveMainTab] = useState<"delivery" | "dining">("delivery");
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newCollectionName, setNewCollectionName] = useState("");
  const [showDeleteConfirm, setShowDeleteConfirm] = useState<string | null>(null);
  
  // Sample bookmarked dishes (in real app, this comes from backend)
  const [bookmarkedDishes] = useState<BookmarkedItem[]>([
    {
      id: "1",
      productId: "prod1",
      name: "Jollof Rice",
      price: 1000,
      image: "https://images.unsplash.com/photo-1589302168068-964664d93dc0?w=200&h=200&fit=crop",
      vendorName: "Amala Oriki",
      vendorId: "vendor1",
      rating: 4.9,
      savedAt: new Date().toISOString(),
      type: "dish"
    },
  ]);

  const [favedRestaurants] = useState<BookmarkedItem[]>([
    {
      id: "v1",
      productId: "vendor1",
      name: "Amala Oriki",
      price: 0,
      image: "",
      vendorName: "Amala Oriki",
      vendorId: "vendor1",
      rating: 4.9,
      savedAt: new Date().toISOString(),
      type: "restaurant"
    },
  ]);

  const [favedBeauty] = useState<BookmarkedItem[]>([
    {
      id: "b1",
      productId: "vendor4",
      name: "Hair & Locs_by_Effa",
      price: 0,
      image: "",
      vendorName: "Hair & Locs_by_Effa",
      vendorId: "vendor4",
      rating: 4.9,
      savedAt: new Date().toISOString(),
      type: "beauty"
    },
  ]);

  const [collections, setCollections] = useState<Collection[]>([
    { 
      id: "1", 
      name: "Late Night Cravings", 
      createdAt: new Date().toISOString(), 
      itemCount: 3,
      dishCount: 2,
      restaurantCount: 1,
      beautyCount: 0,
      isDefault: false 
    },
  ]);

  const { data: vendors = [] } = useQuery({
    queryKey: ['vendors'],
    queryFn: fetchVendors,
  });

  const { data: menuItems = [] } = useQuery({
    queryKey: ['menu-items'],
    queryFn: fetchMenuItems,
  });

  const handleCreateCollection = () => {
    if (!newCollectionName.trim()) {
      toast.error("Please enter a collection name");
      return;
    }
    
    const newCollection: Collection = {
      id: Date.now().toString(),
      name: newCollectionName,
      createdAt: new Date().toISOString(),
      itemCount: 0,
      dishCount: 0,
      restaurantCount: 0,
      beautyCount: 0,
      isDefault: false,
    };
    
    setCollections([newCollection, ...collections]);
    setNewCollectionName("");
    setShowCreateModal(false);
    toast.success(`Collection "${newCollectionName}" created!`);
  };

  const handleDeleteCollection = (id: string) => {
    setCollections(collections.filter(c => c.id !== id));
    setShowDeleteConfirm(null);
    toast.success("Collection deleted");
  };

  const handleVendorClick = (vendorId: string) => {
    const vendor = vendors.find(v => v.id === vendorId);
    if (vendor) {
      navigate(`/vendor/${vendor.id}`);
    } else {
      toast.error("Vendor not found. Please try again later.");
    }
  };

  return (
    <div className="min-h-screen pb-24 bg-gradient-to-b from-amber-50 to-white">
      {/* Header */}
      <header className="sticky top-0 z-30 bg-white/95 backdrop-blur-sm border-b border-amber-100">
        <div className="flex items-center justify-between px-4 py-3">
          <button onClick={() => navigate(-1)} className="p-2 -ml-2 rounded-full hover:bg-gray-100">
            <ArrowLeft className="w-5 h-5" />
          </button>
          <h1 className="text-lg font-bold text-gray-800">My Collections</h1>
          <div className="w-10" />
        </div>
      </header>

      {/* Main Tabs: Delivery vs Dining (Eat Out) */}
      <div className="px-4 mt-4">
        <div className="flex gap-2 bg-white rounded-2xl p-1 shadow-sm">
          {[
            { id: "delivery", label: "Delivery", icon: <Home className="w-4 h-4" /> },
            { id: "dining", label: "Eat Out", icon: <Utensils className="w-4 h-4" /> },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveMainTab(tab.id as any)}
              className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-medium transition-all ${
                activeMainTab === tab.id
                  ? "bg-brand-red text-white shadow-md"
                  : "text-gray-600 hover:bg-gray-50"
              }`}
            >
              {tab.icon}
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Delivery Tab Content */}
      {activeMainTab === "delivery" && (
        <div className="px-4 py-4">
          {/* Stats Cards Row */}
          <div className="grid grid-cols-2 gap-3 mb-4">
            {/* Bookmarks Card */}
            <div className="bg-gradient-to-br from-amber-500 to-orange-500 rounded-2xl p-4 text-white">
              <Bookmark className="w-8 h-8 mb-2 opacity-80" />
              <p className="text-2xl font-bold">{bookmarkedDishes.length}</p>
              <p className="text-sm font-medium">Bookmarked Dishes</p>
              <p className="text-xs opacity-80 mt-1">Tap to add more</p>
            </div>

            {/* My Faves Card */}
            <div className="bg-gradient-to-br from-purple-500 to-pink-500 rounded-2xl p-4 text-white">
              <Heart className="w-8 h-8 mb-2 opacity-80" />
              <p className="text-2xl font-bold">{favedRestaurants.length + favedBeauty.length}</p>
              <p className="text-sm font-medium">My Faves</p>
              <p className="text-xs opacity-80 mt-1">{favedRestaurants.length} restaurants • {favedBeauty.length} beauty</p>
            </div>
          </div>

          {/* Create New Collection Card */}
          <button
            onClick={() => setShowCreateModal(true)}
            className="w-full bg-white rounded-2xl p-4 mb-6 shadow-sm border border-dashed border-brand-red flex items-center justify-between hover:shadow-md transition group"
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-brand-red/10 rounded-full flex items-center justify-center">
                <Plus className="w-5 h-5 text-brand-red" />
              </div>
              <div className="text-left">
                <p className="font-bold text-gray-800">Create New Collection</p>
                <p className="text-xs text-gray-500">Save your favorite items together</p>
              </div>
            </div>
            <ChevronRight className="w-5 h-5 text-gray-400 group-hover:translate-x-1 transition" />
          </button>

          {/* My Collections List */}
          <div className="space-y-3">
            <h3 className="text-md font-bold text-gray-800 mb-2">My Collections</h3>
            {collections.map((collection, idx) => (
              <motion.div
                key={collection.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: idx * 0.05 }}
                onClick={() => navigate(`/collection/${collection.id}`, { state: { collection } })}
                className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100 cursor-pointer hover:shadow-md transition"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 bg-gradient-to-br from-amber-100 to-orange-100 rounded-xl flex items-center justify-center">
                      <FolderPlus className="w-6 h-6 text-brand-red" />
                    </div>
                    <div>
                      <h4 className="font-bold text-gray-800">{collection.name}</h4>
                      <div className="flex gap-2 mt-1">
                        <span className="text-[10px] text-gray-500">🍽️ {collection.dishCount} dishes</span>
                        <span className="text-[10px] text-gray-500">🏪 {collection.restaurantCount} restaurants</span>
                      </div>
                    </div>
                  </div>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setShowDeleteConfirm(collection.id);
                    }}
                    className="p-2 rounded-full hover:bg-red-50"
                  >
                    <Trash2 className="w-4 h-4 text-red-400" />
                  </button>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      )}

      {/* Dining/Eat Out Tab Content */}
      {activeMainTab === "dining" && (
        <div className="px-4 py-4">
          <div className="bg-gradient-to-r from-amber-50 to-orange-50 rounded-2xl p-6 text-center mb-6">
            <Utensils className="w-12 h-12 text-brand-red mx-auto mb-3" />
            <h3 className="text-lg font-bold text-gray-800 mb-2">Eat Out Experience</h3>
            <p className="text-sm text-gray-600">
              Discover restaurants near you, make reservations, and earn rewards
            </p>
            <button 
              onClick={() => navigate("/home")}
              className="mt-4 px-6 py-2 bg-brand-red text-white rounded-full text-sm font-medium"
            >
              Explore Nearby
            </button>
          </div>

          {/* Popular Dining Spots */}
          <h3 className="text-md font-bold text-gray-800 mb-3">Popular Dining Spots</h3>
          <div className="space-y-3">
            {vendors.slice(0, 3).map((vendor, idx) => (
              <div 
                key={vendor.id}
                onClick={() => handleVendorClick(vendor.id)}
                className="bg-white rounded-2xl p-3 shadow-sm border border-gray-100 cursor-pointer hover:shadow-md transition"
              >
                <div className="flex gap-3">
                  <div className="w-16 h-16 bg-gradient-to-br from-amber-100 to-orange-100 rounded-xl flex items-center justify-center">
                    <Building2 className="w-8 h-8 text-brand-red" />
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
                      </div>
                      <button className="px-3 py-1 bg-brand-red/10 rounded-full text-xs font-medium text-brand-red">
                        Book Table
                      </button>
                    </div>
                    <div className="flex items-center gap-3 mt-2 text-[10px] text-gray-500">
                      <span>📍 Lagos</span>
                      <span>💰 ₦{vendor.min_price || 1350}+</span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Create Collection Modal */}
      <AnimatePresence>
        {showCreateModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/50"
            onClick={() => setShowCreateModal(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[90%] max-w-md bg-white rounded-2xl p-5"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-xl font-bold text-gray-800">Create Collection</h3>
                <button onClick={() => setShowCreateModal(false)} className="p-1">
                  <X className="w-5 h-5" />
                </button>
              </div>
              
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Collection Name
                </label>
                <input
                  type="text"
                  value={newCollectionName}
                  onChange={(e) => setNewCollectionName(e.target.value)}
                  placeholder="e.g., My Favorite Dishes"
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-red/30 focus:border-brand-red"
                  autoFocus
                />
              </div>
              
              <div className="flex gap-3">
                <button
                  onClick={() => setShowCreateModal(false)}
                  className="flex-1 py-3 bg-gray-100 text-gray-700 rounded-xl font-medium"
                >
                  Cancel
                </button>
                <button
                  onClick={handleCreateCollection}
                  className="flex-1 py-3 bg-brand-red text-white rounded-xl font-bold"
                >
                  Create
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Delete Confirmation Modal */}
      <AnimatePresence>
        {showDeleteConfirm && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/50"
            onClick={() => setShowDeleteConfirm(null)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[90%] max-w-md bg-white rounded-2xl p-5"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="text-center mb-4">
                <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-3">
                  <Trash2 className="w-8 h-8 text-red-500" />
                </div>
                <h3 className="text-xl font-bold text-gray-800 mb-2">Delete Collection?</h3>
                <p className="text-sm text-gray-500">
                  This action cannot be undone. All items in this collection will be removed.
                </p>
              </div>
              
              <div className="flex gap-3">
                <button
                  onClick={() => setShowDeleteConfirm(null)}
                  className="flex-1 py-3 bg-gray-100 text-gray-700 rounded-xl font-medium"
                >
                  Cancel
                </button>
                <button
                  onClick={() => handleDeleteCollection(showDeleteConfirm)}
                  className="flex-1 py-3 bg-red-500 text-white rounded-xl font-bold"
                >
                  Delete
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Floating Action Button for Quick Add */}
      <button
        onClick={() => navigate("/home")}
        className="fixed bottom-24 right-4 z-40 w-14 h-14 bg-brand-red rounded-full shadow-lg flex items-center justify-center active:scale-95 transition"
      >
        <Plus className="w-6 h-6 text-white" />
      </button>

      <BottomNav />
      <WhatsAppButton />
    </div>
  );
};

export default Collections;