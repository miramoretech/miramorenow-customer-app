// src/components/VendorCard.tsx
import { cn } from "@/lib/utils";
import { Star, Clock, Zap, TrendingUp, Tag, Leaf } from "lucide-react";
import { useState, useMemo } from "react";

// ✅ Helper to format price with comma and proper Naira symbol
const formatPrice = (price: number): string => {
  return `₦${price.toLocaleString('en-NG', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`;
};

interface VendorCardProps {
  vendor: any;
  index?: number;
  onClick?: () => void;
  highlightBadge?: "near" | "top" | "deal" | "healthy" | null;
}

const VendorCard = ({ vendor, index = 0, onClick, highlightBadge }: VendorCardProps) => {
  const imageUrl = useMemo(() => {
    if (!vendor.store_logo_url) return null;
    const stableToken = vendor.updated_at 
      ? new Date(vendor.updated_at).getTime() 
      : "v1";
    return `${vendor.store_logo_url}?cache=${stableToken}`;
  }, [vendor.store_logo_url, vendor.updated_at]);

  const [imageError, setImageError] = useState(false);
  const rating = vendor.rating && vendor.rating > 0 ? vendor.rating : 5.0;
  const deliveryTime = "2-10 min";

  const getBadge = () => {
    if (highlightBadge === "near") {
      return { icon: <Zap className="w-2.5 h-2.5" />, text: "Fast Delivery", color: "bg-blue-500" };
    }
    if (highlightBadge === "top") {
      return { icon: <TrendingUp className="w-2.5 h-2.5" />, text: "Top Rated", color: "bg-amber-500" };
    }
    if (highlightBadge === "deal") {
      return { icon: <Tag className="w-2.5 h-2.5" />, text: vendor.promo_text || "Special Deal", color: "bg-red-500" };
    }
    if (highlightBadge === "healthy") {
      return { icon: <Leaf className="w-2.5 h-2.5" />, text: "Healthy Options", color: "bg-green-600" };
    }
    if (vendor.has_promo) {
      return { icon: <Tag className="w-2.5 h-2.5" />, text: vendor.promo_text || "Free Delivery", color: "bg-red-500" };
    }
    return null;
  };

  const badge = getBadge();

  return (
    <div
      onClick={onClick}
      className="group relative bg-white rounded-2xl overflow-hidden cursor-pointer animate-fade-in-up h-full flex flex-col transition-all duration-300"
      style={{
        animationDelay: `${index * 50}ms`,
        boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
      }}
    >
      <div className="relative aspect-square overflow-hidden bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center">
        {!imageError && imageUrl ? (
          <img
            src={imageUrl}
            alt={vendor.store_name}
            className="w-full h-full object-contain p-3 group-hover:scale-105 transition-transform duration-500"
            loading="lazy"
            onError={() => setImageError(true)}
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-5xl bg-gradient-to-br from-brand-green-light to-brand-green/20">
            🏪
          </div>
        )}
        {badge && (
          <div className={`absolute top-2 left-2 flex items-center gap-1 px-2 py-0.5 rounded-full text-[9px] font-bold text-white shadow-md ${badge.color}`}>
            {badge.icon}
            <span>{badge.text}</span>
          </div>
        )}
      </div>

      <div className="p-3 space-y-1.5 flex-1">
        <h3 className="font-bold text-sm text-gray-800 line-clamp-1">{vendor.store_name}</h3>
        <div className="flex items-center gap-2 text-xs text-gray-500">
          <div className="flex items-center gap-1">
            <Clock className="w-3 h-3" />
            <span>{deliveryTime}</span>
          </div>
          <div className="flex items-center gap-1">
            <Star className="w-3.5 h-3.5 fill-brand-gold text-brand-gold" />
            <span className="font-semibold text-gray-700">{rating.toFixed(1)}</span>
          </div>
        </div>
        {vendor.min_price && (
          <p className="text-[10px] text-gray-400">
            From {formatPrice(vendor.min_price)}
          </p>
        )}
      </div>
    </div>
  );
};

export default VendorCard;