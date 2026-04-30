// src/components/ProductCard.tsx
import { Plus, Check, Star, Flame, Heart, ShoppingBag, Sparkles } from "lucide-react";
import { useState, useEffect, useRef } from "react";
import { useCartStore } from "@/stores/cartStore";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/lib/supabase";
import { favoritesService } from "@/services/favorites";
import chillsthrillzLogo from "@/assets/products/chillsthrillz-logo.png";
import effaLogo from "@/assets/products/effa-logo.jpg";
import kolLogo from "@/assets/products/cravings-kol-logo.png";
import amalaOrikiLogo from "@/assets/products/amala-oriki-logo.png";

const vendorLogos: Record<string, string> = {
  "Yoghurt_Arcade": chillsthrillzLogo,
  "Hair & Locs_by_Effa": effaLogo,
  "Cravings by K.O.L": kolLogo,
  "Amala Oriki": amalaOrikiLogo,
};

// ✅ Helper to format price with comma and proper Naira symbol
const formatPrice = (price: number): string => {
  // Use en-NG locale which uses commas as thousand separators
  return `₦${price.toLocaleString('en-NG', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`;
};

export interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  image?: string;
  vendor: string;
  category: "food" | "beauty";
  options?: Array<{ id: string; name: string; price: number; is_default: boolean; is_best_value: boolean; is_most_popular: boolean }>;
}

interface ProductCardProps {
  product: Product;
  index?: number;
  showVendor?: boolean;
  onClick?: () => void;
}

// Shared auth promise to prevent multiple simultaneous calls
let authPromise: Promise<any> | null = null;

const getSharedUser = () => {
  if (!authPromise) {
    authPromise = supabase.auth.getUser().finally(() => {
      authPromise = null;
    });
  }
  return authPromise;
};

const ProductCard = ({ product, index = 0, showVendor = false, onClick }: ProductCardProps) => {
  const navigate = useNavigate();
  const addItem = useCartStore((s) => s.addItem);
  const [added, setAdded] = useState(false);
  const [isFavorite, setIsFavorite] = useState(false);
  const [userId, setUserId] = useState<string | null>(null);
  const mountedRef = useRef(true);

  // Helper to get display price for items with options
  const getDisplayPrice = () => {
    if (product.options && product.options.length > 0) {
      const prices = product.options.map((opt) => opt.price);
      const minPrice = Math.min(...prices);
      const maxPrice = Math.max(...prices);
      if (minPrice !== maxPrice) {
        return `From ${formatPrice(minPrice)}`;
      }
      return formatPrice(minPrice);
    }
    return formatPrice(product.price);
  };

  const hasOptions = product.options && product.options.length > 0;

  // On‑the‑fly image compression for Supabase images
  const getOptimizedImageUrl = (url?: string) => {
    if (!url) return undefined;
    if (url.includes('supabase.co/storage/v1/object/public')) {
      const separator = url.includes('?') ? '&' : '?';
      return `${url}${separator}width=300&height=300&resize=cover`;
    }
    return url;
  };

  // Consistent 5.0 rating for all products
  const rating = 5.0;
  // Random order count between 50-500 for social proof
  const totalOrders = Math.floor(Math.random() * 450) + 50;

  useEffect(() => {
    mountedRef.current = true;
    
    const checkAuthAndFavorite = async () => {
      try {
        const { data } = await getSharedUser();
        if (data?.user && mountedRef.current) {
          setUserId(data.user.id);
          const fav = await favoritesService.isFavorite(data.user.id, product.id);
          if (mountedRef.current) {
            setIsFavorite(fav);
          }
        }
      } catch (err) {
        console.warn("Auth check failed:", err);
      }
    };
    
    checkAuthAndFavorite();
    
    return () => {
      mountedRef.current = false;
    };
  }, [product.id]);

  const handleAdd = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (hasOptions) {
      onClick?.();
      return;
    }
    addItem(product);
    setAdded(true);
    setTimeout(() => setAdded(false), 3000);
  };

  const handleGoToCheckout = (e: React.MouseEvent) => {
    e.stopPropagation();
    navigate('/cart');
  };

  const toggleFavorite = async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!userId) return;
    try {
      if (isFavorite) {
        await favoritesService.removeFavorite(userId, product.id);
        if (mountedRef.current) setIsFavorite(false);
      } else {
        await favoritesService.addFavorite(userId, product.id);
        if (mountedRef.current) setIsFavorite(true);
      }
    } catch (err) {
      console.error("Error toggling favorite:", err);
    }
  };

  return (
    <div
      onClick={onClick}
      className="group bg-white rounded-2xl border border-[#E8F5E9] overflow-hidden shadow-sm hover:shadow-lg transition-all duration-300 cursor-pointer active:scale-[0.98]"
      style={{ animationDelay: `${index * 80}ms` }}
    >
      {/* Image container - 4:3 aspect ratio */}
      <div className="relative aspect-[4/3] overflow-hidden bg-gradient-to-br from-[#F0FDF4] to-[#ECFDF5]">
        {product.image ? (
          <img
            src={getOptimizedImageUrl(product.image) || product.image}
            alt={product.name}
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
            loading="lazy"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-5xl">
            {product.category === "food" ? "🍽️" : "💇‍♀️"}
          </div>
        )}
        
        {/* Rating badge - Gold stars (brand yellow) */}
        <div className="absolute bottom-2 left-2 bg-white/95 backdrop-blur-sm rounded-full px-2 py-0.5 flex items-center gap-1 shadow-sm">
          <Star className="w-2.5 h-2.5 fill-[#FBBF24] text-[#FBBF24]" />
          <span className="text-[9px] font-bold text-gray-800">{rating}</span>
          <span className="text-[8px] text-gray-400">({totalOrders})</span>
        </div>
        
        {/* Size indicator badge - Green */}
        {hasOptions && (
          <div className="absolute bottom-2 right-2 bg-[#10B981]/80 backdrop-blur-sm rounded-full px-2 py-0.5 shadow-sm">
            <span className="text-[8px] text-white font-semibold">{product.options?.length} sizes</span>
          </div>
        )}
        
        {/* Heart button - Red when favorite */}
        <button
          onClick={toggleFavorite}
          className="absolute top-2 right-2 z-10 p-1.5 rounded-full bg-white/90 backdrop-blur-sm shadow-sm hover:bg-white transition active:scale-95"
        >
          <Heart
            className={`w-3.5 h-3.5 transition-all ${
              isFavorite 
                ? 'fill-[#EF4444] text-[#EF4444]' 
                : 'text-gray-500 hover:text-[#EF4444]'
            }`}
            strokeWidth={1.8}
          />
        </button>
        
        {/* Hot badge for popular items */}
        {!hasOptions && totalOrders > 300 && (
          <div className="absolute top-2 left-2 bg-gradient-to-r from-[#FBBF24] to-[#F59E0B] rounded-full px-1.5 py-0.5 flex items-center gap-0.5 shadow-sm">
            <Flame className="w-2.5 h-2.5 text-white" />
            <span className="text-[8px] text-white font-bold">HOT</span>
          </div>
        )}
      </div>

      {/* Content */}
      <div className="p-3 space-y-1.5">
        {/* Vendor row with brand colors */}
        {showVendor && (
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1.5">
              {vendorLogos[product.vendor] && (
                <img 
                  src={vendorLogos[product.vendor]} 
                  alt={product.vendor} 
                  className="w-3.5 h-3.5 rounded-full object-cover" 
                />
              )}
              <span className="text-[9px] font-medium text-[#10B981] truncate">{product.vendor}</span>
            </div>
            {/* Trust badge */}
            <div className="flex items-center gap-0.5">
              <Sparkles className="w-2.5 h-2.5 text-[#FBBF24]" />
              <span className="text-[8px] text-[#FBBF24] font-semibold">Trusted</span>
            </div>
          </div>
        )}
        
        {/* Product name */}
        <h3 className="font-bold text-sm text-gray-800 leading-tight line-clamp-2 group-hover:text-[#10B981] transition-colors">
          {product.name}
        </h3>
        
        {/* Description */}
        <p className="text-[9px] text-gray-400 line-clamp-2 leading-relaxed">{product.description}</p>
        
        {/* Price row with gold urgency badge */}
        <div className="flex items-center justify-between mt-1">
          <span className="font-bold text-sm text-[#10B981]">{getDisplayPrice()}</span>
          {!hasOptions && totalOrders > 200 && (
            <div className="flex items-center gap-0.5 bg-[#FEF3C7] rounded-full px-1.5 py-0.5">
              <Flame className="w-2 h-2 text-[#F59E0B]" />
              <span className="text-[7px] text-[#D97706] font-semibold">Bestseller</span>
            </div>
          )}
        </div>
        
        {/* Action button - ALL USING BRAND GREEN + YELLOW (No Orange!) */}
        {added ? (
          // ✅ CONFIRM & PAY BUTTON - Brand Yellow/Gold for urgency (not orange)
          <button
            onClick={handleGoToCheckout}
            className="w-full flex items-center justify-center gap-1.5 py-2.5 rounded-full text-xs font-bold transition-all bg-gradient-to-r from-[#FBBF24] to-[#F59E0B] text-[#78350F] shadow-md hover:shadow-lg active:scale-95"
          >
            <ShoppingBag className="w-3.5 h-3.5" />
            Confirm & Pay
          </button>
        ) : hasOptions ? (
          // ✅ SELECT OPTIONS BUTTON - Outline Green (secondary)
          <button
            onClick={handleAdd}
            className="w-full flex items-center justify-center gap-1.5 py-2.5 rounded-full text-xs font-bold transition-all border-2 border-[#10B981] text-[#10B981] bg-white hover:bg-[#F0FDF4] active:scale-95"
          >
            <Sparkles className="w-3.5 h-3.5" />
            Select Options
          </button>
        ) : (
          // ✅ ADD TO CART BUTTON - Solid Green (primary CTA)
          <button
            onClick={handleAdd}
            className="w-full flex items-center justify-center gap-1.5 py-2.5 rounded-full text-xs font-bold transition-all bg-gradient-to-r from-[#10B981] to-[#059669] text-white shadow-md hover:shadow-lg active:scale-95"
          >
            <Plus className="w-3.5 h-3.5" />
            Add to Cart
          </button>
        )}
      </div>
    </div>
  );
};

export default ProductCard;