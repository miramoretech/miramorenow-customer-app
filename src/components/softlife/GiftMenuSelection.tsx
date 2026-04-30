import { useState } from "react";
import { Sparkles, Plus, Minus, Store } from "lucide-react";
import type { GiftRecipient, GiftCartItem } from "./types";
import { foodProducts } from "@/data/products";
import { vendors, getVendorsByCategory } from "@/data/vendors";
import type { Product } from "@/components/ProductCard";

interface Props {
  recipient: GiftRecipient;
  giftCart: GiftCartItem[];
  setGiftCart: (items: GiftCartItem[]) => void;
  onContinue: () => void;
}

const GiftMenuSelection = ({ recipient, giftCart, setGiftCart, onContinue }: Props) => {
  const [selectedVendor, setSelectedVendor] = useState<string | null>(null);
  const foodVendors = getVendorsByCategory("food");

  const products = selectedVendor
    ? foodProducts.filter((p) => p.vendor === selectedVendor)
    : foodProducts;

  const getQty = (id: string) => giftCart.find((i) => i.product.id === id)?.quantity || 0;

  const updateQty = (product: Product, delta: number) => {
    const existing = giftCart.find((i) => i.product.id === product.id);
    if (existing) {
      const newQty = existing.quantity + delta;
      if (newQty <= 0) {
        setGiftCart(giftCart.filter((i) => i.product.id !== product.id));
      } else {
        setGiftCart(giftCart.map((i) => i.product.id === product.id ? { ...i, quantity: newQty } : i));
      }
    } else if (delta > 0) {
      setGiftCart([...giftCart, { product, quantity: 1 }]);
    }
  };

  const total = giftCart.reduce((sum, i) => sum + i.product.price * i.quantity, 0);

  // AI suggestion based on occasion
  const getSuggestion = () => {
    if (recipient.occasion.includes("Birthday")) return "🎂 Birthday pick: try a Deluxe Parfait — sweet & celebratory!";
    if (recipient.occasion.includes("Apology")) return "🙏 Say sorry with comfort food — Shawarma + Hotdog combo hits right";
    if (recipient.occasion.includes("Hangry")) return "😤 Fast fix: grab a Shawarma combo — they'll forgive you in 30 mins";
    return "💛 Pick something they'll love — you know best!";
  };

  return (
    <div className="space-y-3">
      {/* AI suggestion */}
      <div className="flex items-start gap-2 bg-primary/5 rounded-2xl p-3 border border-primary/20">
        <Sparkles className="w-4 h-4 text-primary mt-0.5 shrink-0" />
        <p className="text-xs text-foreground">{getSuggestion()}</p>
      </div>

      {/* Vendor filter */}
      <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide">
        <button
          onClick={() => setSelectedVendor(null)}
          className={`shrink-0 px-3 py-1.5 rounded-full text-xs font-bold transition-all press-scale ${
            !selectedVendor ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"
          }`}
        >
          All
        </button>
        {foodVendors.map((v) => (
          <button
            key={v.id}
            onClick={() => setSelectedVendor(v.name)}
            className={`shrink-0 flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold transition-all press-scale ${
              selectedVendor === v.name ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"
            }`}
          >
            <img src={v.logo} alt={v.name} className="w-4 h-4 rounded-full object-cover" />
            {v.name.length > 15 ? v.name.slice(0, 15) + "…" : v.name}
          </button>
        ))}
      </div>

      {/* Product list */}
      <div className="space-y-2 max-h-[35vh] overflow-y-auto pr-1">
        {products.map((p) => {
          const qty = getQty(p.id);
          return (
            <div key={p.id} className="flex items-center gap-3 bg-card rounded-2xl border border-border p-2.5 shadow-sm">
              <img src={p.image} alt={p.name} className="w-12 h-12 rounded-xl object-cover shrink-0" />
              <div className="flex-1 min-w-0">
                <h4 className="font-bold text-xs text-foreground truncate">{p.name}</h4>
                <p className="text-[10px] text-muted-foreground truncate">{p.vendor}</p>
                <span className="price-amount text-xs font-bold">₦{p.price.toLocaleString()}</span>
              </div>
              <div className="flex items-center gap-1.5 shrink-0">
                {qty > 0 && (
                  <>
                    <button onClick={() => updateQty(p, -1)} className="w-7 h-7 rounded-full bg-muted flex items-center justify-center press-scale">
                      <Minus className="w-3 h-3" />
                    </button>
                    <span className="text-xs font-bold w-5 text-center">{qty}</span>
                  </>
                )}
                <button onClick={() => updateQty(p, 1)} className="w-7 h-7 rounded-full bg-primary text-primary-foreground flex items-center justify-center press-scale">
                  <Plus className="w-3 h-3" />
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Cart summary */}
      {giftCart.length > 0 && (
        <div className="bg-primary/5 rounded-2xl p-3 border border-primary/20">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold text-foreground">
              🎁 Gift Cart ({giftCart.reduce((s, i) => s + i.quantity, 0)} items)
            </span>
            <span className="price-amount text-sm font-bold">₦{total.toLocaleString()}</span>
          </div>
          <button
            onClick={onContinue}
            className="w-full py-2.5 rounded-2xl bg-primary text-primary-foreground font-bold text-sm press-scale hover:bg-primary/90 transition-colors shadow-md"
          >
            Add Voice Note & Pay →
          </button>
        </div>
      )}
    </div>
  );
};

export default GiftMenuSelection;
