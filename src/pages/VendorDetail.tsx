// src/pages/VendorDetail.tsx
import { useEffect, useState, useMemo, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { supabase } from '@/lib/supabase';
import { ArrowLeft, Loader2, Star, Clock, Search, Mic, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import ProductDetailModal from '@/components/ProductDetailModal';
import type { Product } from '@/components/ProductCard';
import { toast } from 'sonner';
import { smartSearch } from '@/lib/searchUtils'; // ✅ ADDED fuzzy search

// ========== IMPORT ALL STATIC PRODUCT IMAGES ==========
import deluxeParfait250 from "@/assets/products/deluxe-parfait-250ml.png";
import deluxeParfait330 from "@/assets/products/deluxe-parfait-330ml.png";
import deluxeParfait500 from "@/assets/products/deluxe-parfait-500ml.png";
import greekYoghurt from "@/assets/products/greek-yoghurt-500ml.png";
import shawarmaImg from "@/assets/products/shawarma.png";
import bbqChickenImg from "@/assets/products/bbq-chicken.png";
import goatMeatImg from "@/assets/products/goat-meat-asun.png";
import friedRiceImg from "@/assets/products/fried-rice.png";
import jollofRiceImg from "@/assets/products/jollof-rice.png";
import whiteRiceImg from "@/assets/products/white-rice.png";
import amalaImg from "@/assets/products/amala.png";
import fufuImg from "@/assets/products/fufu-akpu.png";
import eweduImg from "@/assets/products/ewedu.png";
import fantaOrangeImg from "@/assets/products/fanta-orange.png";
import cocaColaImg from "@/assets/products/coca-cola.png";
import evaWaterImg from "@/assets/products/eva-water.png";
import maltaGuinnessImg from "@/assets/products/malta-guinness.png";
import chivitaImg from "@/assets/products/chivita-active.png";
import okroSoupImg from "@/assets/products/okro-soup.png";
import egusiSoupImg from "@/assets/products/egusi-soup.png";
import efoRiroImg from "@/assets/products/efo-riro.png";
import gbegiriImg from "@/assets/products/gbegiri.png";
import turkeyBigImg from "@/assets/products/turkey-big.png";
import titusFishImg from "@/assets/products/titus-fish.png";
import boiledEggImg from "@/assets/products/boiled-egg.png";
import ebaImg from "@/assets/products/eba.png";
import breadBigImg from "@/assets/products/bread-big.png";
import breadSmallImg from "@/assets/products/bread-small.png";
import saladImg from "@/assets/products/salad.png";
import spicyCatfishImg from "@/assets/products/spicy-grilled-catfish.png";
import pepperedCroakerImg from "@/assets/products/peppered-croaker-fish.png";
import bigGrillCatfishImg from "@/assets/products/big-grill-catfish.png";
import pixieCut from "@/assets/products/pixie-cut-wig.png";
import sddBlonde from "@/assets/products/sdd-blonde-unit.png";
import omotolaFringe from "@/assets/products/omotola-fringe-bounce.png";
import boneStraight from "@/assets/products/bone-straight-unit.png";
import pianoMagicCurls from "@/assets/products/piano-magic-curls.png";
import sddBrownBoneStraight from "@/assets/products/sdd-brown-bone-straight.png";
import sddVietnameseBouncyCurls from "@/assets/products/sdd-vietnamese-bouncy-curls.png";
import sddBurgundyBurmeseCurls from "@/assets/products/sdd-burgundy-burmese-curls.png";
import sddBrownFringeUnit from "@/assets/products/sdd-brown-fringe-unit.png";

// Image mapping function (fallback for items without uploaded image)
const getProductImage = (productName: string): string => {
  const map: Record<string, string> = {
    "250ml Deluxe Parfait": deluxeParfait250,
    "330ml Deluxe Parfait": deluxeParfait330,
    "500ml Deluxe Parfait": deluxeParfait500,
    "500ml Greek Yoghurt": greekYoghurt,
    "Shawarma + 1 Hotdog": shawarmaImg,
    "Shawarma + 2 Hotdogs": shawarmaImg,
    "Barbeque Chicken": bbqChickenImg,
    "🐐 Goat Meat (Asun / Stew)": goatMeatImg,
    "🍛 Fried Rice": friedRiceImg,
    "🍅 Jollof Rice": jollofRiceImg,
    "🍚 White Rice": whiteRiceImg,
    "🍠 Amala": amalaImg,
    "🌿 Fufu (Akpu) Wrap": fufuImg,
    "🥣 Ewedu": eweduImg,
    "🍊 Fanta Orange 50cl PET": fantaOrangeImg,
    "🥤 Coca-Cola 50cl PET": cocaColaImg,
    "💧 Eva Water 75cl PET": evaWaterImg,
    "🍺 Malta Guinness 33cl Can": maltaGuinnessImg,
    "🧃 Chivita Active Juice (1L)": chivitaImg,
    "🍲 Okro Soup – Fresh & Drawy Delight": okroSoupImg,
    "🥘 Egusi Soup – Thick, Rich & Traditional": egusiSoupImg,
    "🥬 Efo Riro – Yoruba Veggie Supreme": efoRiroImg,
    "🫘 Gbegiri Soup – Smooth Bean Classic": gbegiriImg,
    "🍗 Grilled Turkey (Big Cut)": turkeyBigImg,
    "🐟 Boiled Titus Fish (Full Size)": titusFishImg,
    "🥚 Boiled Egg – Simple Protein Boost": boiledEggImg,
    "🍚 Eba – Smooth Cassava Swallow": ebaImg,
    "🍞 Soft Family Bread (Big Size)": breadBigImg,
    "🍞 Soft Bread (Small Size)": breadSmallImg,
    "🥗 Fresh Creamy Salad": saladImg,
    "🔥 Spicy Grilled Catfish Deluxe": spicyCatfishImg,
    "🐟 Peppered Grilled Croaker Fish Platter": pepperedCroakerImg,
    "🍗 Big Grill Catfish with Plantain & Chips": bigGrillCatfishImg,
    "Pixie Cut Unit": pixieCut,
    "10\" SDD Blonde Unit": sddBlonde,
    "10\" Omotola Fringe Bounce": omotolaFringe,
    "10\" Vietnamese Bone Straight": boneStraight,
    "16\" SDD Piano Bouncy Curl": pianoMagicCurls,
    "16\" SDD Donor Bone Straight": sddBrownBoneStraight,
    "20-24\" SDD Vietnamese Bounce Curls": sddVietnameseBouncyCurls,
    "20\" SDD Burgundy Burmese Curls": sddBurgundyBurmeseCurls,
    "14\" SDD Bone Straight Fringe Wig": sddBrownFringeUnit,
  };
  return map[productName] || "";
};

// Packaging options – can be shown for all vendors
const packagingOptions = [
  { id: 'branded', name: 'Branded Pack', description: 'Premium pack', price: 700 },
  { id: 'big', name: 'Big Pack', description: 'Large portions', price: 500 },
];

// Proteins are only for Amala Oriki
const AMALA_ORIKI_PROTEINS = [
  { id: 'turkey', name: 'Turkey (Big)', price: 8300 },
  { id: 'titus', name: 'Titus Fish', price: 6500 },
  { id: 'goat', name: 'Goat Meat', price: 4500 },
  { id: 'egg', name: 'Boiled Egg', price: 700 },
];

export default function VendorDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [vendor, setVendor] = useState<any>(null);
  const [menuItems, setMenuItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  
  // ========== SEARCH BAR STATE ==========
  const [vendorSearchQuery, setVendorSearchQuery] = useState("");
  const [isListeningVendor, setIsListeningVendor] = useState(false);
  const [vendorRecognition, setVendorRecognition] = useState<any>(null);

  // Setup voice recognition for vendor search
  useEffect(() => {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (SpeechRecognition) {
      const recognitionInstance = new SpeechRecognition();
      recognitionInstance.continuous = false;
      recognitionInstance.interimResults = false;
      recognitionInstance.lang = 'en-NG';
      recognitionInstance.onresult = (event: any) => {
        const transcript = event.results[0][0].transcript;
        setVendorSearchQuery(transcript);
        setIsListeningVendor(false);
      };
      recognitionInstance.onerror = () => {
        setIsListeningVendor(false);
        toast.error("Voice search failed. Please try again.");
      };
      recognitionInstance.onend = () => setIsListeningVendor(false);
      setVendorRecognition(recognitionInstance);
    }
  }, []);

  const startVendorVoiceSearch = () => {
    if (!vendorRecognition) {
      toast.error("Voice search not supported in your browser.");
      return;
    }
    try {
      vendorRecognition.start();
      setIsListeningVendor(true);
    } catch (err) {
      toast.error("Could not start voice search. Check microphone permissions.");
    }
  };

  const clearSearch = () => {
    setVendorSearchQuery("");
  };

  useEffect(() => {
    if (!id) {
      setError('Vendor ID missing');
      setLoading(false);
      return;
    }

    const fetchVendorAndMenu = async () => {
      try {
        const { data: vendorData, error: vendorErr } = await supabase
          .from('vendors')
          .select('*')
          .eq('id', id)
          .single();
        if (vendorErr || !vendorData) throw new Error('Vendor not found');
        setVendor(vendorData);

        const { data: items, error: itemsErr } = await supabase
          .from('menu_items')
          .select(`
            *,
            options:menu_item_variations(*)
          `)
          .eq('vendor_id', id)
          .eq('is_available', true)
          .order('name');
        if (itemsErr) throw itemsErr;

        const itemsWithImages = (items || []).map(item => ({
          ...item,
          staticImage: getProductImage(item.name),
          options: item.options || [],
        }));
        setMenuItems(itemsWithImages);
      } catch (err: any) {
        console.error(err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchVendorAndMenu();
  }, [id]);

  // ✅ UPDATED: fuzzy search for menu items (typo‑tolerant)
  const filteredMenuItems = useMemo(() => {
    if (!menuItems.length) return [];
    if (!vendorSearchQuery.trim()) return menuItems;
    // Use smartSearch from searchUtils – searches name and description fields
    return smartSearch(
      menuItems,
      vendorSearchQuery,
      ['name', 'description'],
      0.4 // threshold: 0.0 = exact, 0.6 = very fuzzy
    );
  }, [menuItems, vendorSearchQuery]);

  const getModalImageUrl = (item: any): string | null => {
    if (item.image_url) {
      return `${item.image_url}?t=${Date.now()}`;
    }
    if (item.staticImage) {
      return item.staticImage;
    }
    return null;
  };

  const getDisplayPrice = (item: any) => {
    if (item.options && item.options.length > 0) {
      const prices = item.options.map((opt: any) => opt.price);
      const minPrice = Math.min(...prices);
      const maxPrice = Math.max(...prices);
      if (minPrice !== maxPrice) {
        return `₦${minPrice.toLocaleString()} - ₦${maxPrice.toLocaleString()}`;
      }
      return `₦${minPrice.toLocaleString()}`;
    }
    return `₦${item.price.toLocaleString()}`;
  };

  const handleProductClick = (item: any) => {
    const productForModal: Product = {
      id: item.id,
      name: item.name,
      description: item.description,
      price: item.price,
      image: getModalImageUrl(item),
      vendor: vendor?.store_name,
      category: vendor?.store_category,
      options: item.options || [],
    };
    setSelectedProduct(productForModal);
  };

  const vendorRating = vendor?.rating && vendor.rating > 0 ? vendor.rating : 5.0;
  const isAmalaOriki = vendor?.store_name === 'Amala Oriki';
  const proteinAddons = isAmalaOriki ? AMALA_ORIKI_PROTEINS : [];

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <Loader2 className="w-6 h-6 animate-spin text-brand-red" />
      </div>
    );
  }

  if (error || !vendor) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-4 bg-gray-50">
        <p className="text-red-500 mb-4 text-sm">{error || 'Vendor not found'}</p>
        <Button onClick={() => navigate('/home')} className="bg-brand-red hover:bg-brand-red-dark">
          ← Back to Home
        </Button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      {/* Header - Mobile optimized */}
      <div className="sticky top-0 z-10 bg-white border-b border-gray-100 shadow-sm px-3 py-2 flex items-center gap-2">
        <button
          onClick={() => navigate(-1)}
          className="p-1.5 rounded-full hover:bg-gray-100 transition-colors active:scale-95"
        >
          <ArrowLeft className="w-4 h-4 text-brand-red" />
        </button>
        <h1 className="text-base font-bold truncate text-gray-800 flex-1">{vendor.store_name}</h1>
      </div>

      {/* Vendor info - Mobile optimized */}
      <div className="bg-white p-3 shadow-sm border-b border-gray-100">
        <div className="flex items-center gap-2.5">
          {vendor.store_logo_url ? (
            <img 
              src={`${vendor.store_logo_url}?t=${Date.now()}`} 
              alt={vendor.store_name} 
              className="w-12 h-12 rounded-xl object-contain border border-gray-100" 
            />
          ) : (
            <div className="w-12 h-12 rounded-xl bg-gray-100 flex items-center justify-center text-xl">🏪</div>
          )}
          <div>
            <div className="flex items-center gap-1 text-xs text-gray-500">
              <Clock className="w-3 h-3" />
              <span>2-10 min</span>
            </div>
            <div className="flex items-center gap-1 mt-0.5">
              <Star className="w-3 h-3 fill-yellow-400 text-yellow-400" />
              <span className="text-gray-800 font-semibold text-sm">{vendorRating}</span>
              <span className="text-gray-400 text-[10px]">rating</span>
            </div>
          </div>
        </div>
        <p className="text-xs text-gray-500 mt-2 leading-relaxed">{vendor.store_description}</p>
      </div>

      {/* Search Bar - Mobile optimized */}
      <div className="p-3 bg-white border-b border-gray-100 sticky top-[57px] z-10">
        <div className="relative">
          <div className="bg-gray-50 rounded-xl border border-gray-200 flex items-center p-0.5 pl-3 focus-within:border-brand-red focus-within:ring-2 focus-within:ring-brand-red/20 transition-all">
            <Search className="w-3.5 h-3.5 text-gray-400 mr-1.5 flex-shrink-0" />
            <input
              type="text"
              placeholder={`Search in ${vendor.store_name}...`}
              value={vendorSearchQuery}
              onChange={(e) => setVendorSearchQuery(e.target.value)}
              className="flex-1 py-2 text-sm outline-none bg-transparent text-gray-800 placeholder-gray-400"
            />
            {vendorSearchQuery && (
              <button
                onClick={clearSearch}
                className="p-1 rounded-full hover:bg-gray-200 transition-colors mr-0.5"
              >
                <X className="w-3 h-3 text-gray-400" />
              </button>
            )}
            <button
              onClick={startVendorVoiceSearch}
              className={`p-1.5 rounded-full transition-all ml-0.5 ${isListeningVendor ? "bg-brand-red/20 animate-pulse" : "hover:bg-gray-100"}`}
            >
              <Mic className={`w-3.5 h-3.5 ${isListeningVendor ? "text-brand-red" : "text-gray-400"}`} />
            </button>
          </div>
          {isListeningVendor && (
            <p className="text-[10px] text-brand-red mt-1 text-center animate-pulse font-medium">
              🎤 Listening... Speak now
            </p>
          )}
          {vendorSearchQuery && (
            <p className="text-[10px] text-gray-500 mt-1.5">
              Found {filteredMenuItems.length} item{filteredMenuItems.length !== 1 ? 's' : ''} for "{vendorSearchQuery}"
            </p>
          )}
        </div>
      </div>

      {/* Menu items - Mobile optimized grid */}
      <div className="p-3">
        <div className="flex justify-between items-center mb-2.5">
          <h2 className="font-bold text-base text-gray-800">Menu</h2>
          {vendorSearchQuery && (
            <button 
              onClick={clearSearch}
              className="text-[11px] text-brand-red font-medium"
            >
              Clear search
            </button>
          )}
        </div>
        
        {filteredMenuItems.length === 0 ? (
          <div className="text-center py-12 bg-white rounded-xl">
            <div className="text-4xl mb-2">🔍</div>
            <p className="text-gray-500 text-sm">No items found for "{vendorSearchQuery}"</p>
            <button 
              onClick={clearSearch}
              className="mt-2 text-brand-red text-xs font-medium"
            >
              Clear search
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-2">
            {filteredMenuItems.map((item) => (
              <div
                key={item.id}
                className="bg-white rounded-xl shadow-sm overflow-hidden cursor-pointer active:scale-[0.98] transition-all hover:shadow-md border border-gray-100"
                onClick={() => handleProductClick(item)}
              >
                <div className="aspect-square overflow-hidden bg-gray-100">
                  {item.image_url ? (
                    <img src={`${item.image_url}?t=${Date.now()}`} alt={item.name} className="w-full h-full object-cover" />
                  ) : item.staticImage ? (
                    <img src={item.staticImage} alt={item.name} className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-2xl bg-gradient-to-br from-gray-50 to-gray-100">🍽️</div>
                  )}
                </div>
                <div className="p-2.5">
                  <h3 className="font-semibold text-sm text-gray-800 line-clamp-1">{item.name}</h3>
                  <p className="text-[11px] text-gray-500 line-clamp-2 mt-0.5 leading-relaxed">{item.description}</p>
                  <div className="flex justify-between items-center mt-1.5">
                    <span className="font-bold text-brand-red text-sm">{getDisplayPrice(item)}</span>
                    {item.options && item.options.length > 0 && (
                      <span className="text-[9px] bg-brand-red/10 text-brand-red px-1.5 py-0.5 rounded-full font-medium">
                        {item.options.length} sizes
                      </span>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Product Detail Modal */}
      <ProductDetailModal
        product={selectedProduct}
        open={!!selectedProduct}
        onClose={() => setSelectedProduct(null)}
        proteinAddons={proteinAddons}
        packagingOptions={packagingOptions}
        soupIds={new Set()}
      />
    </div>
  );
}