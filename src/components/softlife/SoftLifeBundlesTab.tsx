import { Zap, ArrowRight } from "lucide-react";
import { motion } from "framer-motion";
import { foodProducts } from "@/data/products";
import type { GiftCartItem } from "./types";

interface Props {
  onSelectBundle: (items: GiftCartItem[]) => void;
}

const bundles = [
  {
    name: "Soft Life Combo",
    emoji: "✨",
    desc: "Deluxe Parfait + Greek Yoghurt — smooth & sweet",
    productIds: ["f1", "f4"],
  },
  {
    name: "Date Night Duo",
    emoji: "🌹",
    desc: "2× 330ml Parfaits — double the indulgence",
    productIds: ["f2", "f2"],
  },
  {
    name: "Apology Pack",
    emoji: "🙏",
    desc: "Shawarma + BBQ Chicken — serious peace offering",
    productIds: ["f5", "f7"],
  },
  {
    name: "Office Fuel",
    emoji: "☕",
    desc: "Shawarma + 2 Hotdogs — team energy boost",
    productIds: ["f6"],
  },
];

const SoftLifeBundlesTab = ({ onSelectBundle }: Props) => {
  const handleSend = (productIds: string[]) => {
    const items: GiftCartItem[] = [];
    productIds.forEach((id) => {
      const product = foodProducts.find((p) => p.id === id);
      if (product) {
        const existing = items.find((i) => i.product.id === id);
        if (existing) existing.quantity++;
        else items.push({ product, quantity: 1 });
      }
    });
    onSelectBundle(items);
  };

  const getBundlePrice = (ids: string[]) =>
    ids.reduce((sum, id) => sum + (foodProducts.find((p) => p.id === id)?.price || 0), 0);

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="space-y-3 py-3"
    >
      <div className="text-center space-y-1">
        <h3 className="font-bold text-foreground font-display flex items-center justify-center gap-1.5">
          <Zap className="w-4 h-4 text-primary" /> Soft Life Bundles
        </h3>
        <p className="text-xs text-muted-foreground">Curated combos ready to gift — one tap to send</p>
      </div>

      <div className="space-y-2.5">
        {bundles.map((bundle, i) => (
          <motion.div
            key={bundle.name}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.08 }}
            className="flex items-center gap-3 bg-card rounded-2xl border border-border p-3 shadow-sm hover:shadow-md transition-shadow"
          >
            <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center text-2xl shrink-0">
              {bundle.emoji}
            </div>
            <div className="flex-1 min-w-0">
              <h4 className="font-bold text-sm text-foreground truncate">{bundle.name}</h4>
              <p className="text-[10px] text-muted-foreground truncate">{bundle.desc}</p>
              <span className="price-amount text-sm font-bold">
                ₦{getBundlePrice(bundle.productIds).toLocaleString()}
              </span>
            </div>
            <button
              onClick={() => handleSend(bundle.productIds)}
              className="px-3 py-1.5 rounded-xl bg-primary text-primary-foreground text-xs font-bold press-scale hover:bg-primary/90 transition-colors shrink-0 flex items-center gap-1"
            >
              Send <ArrowRight className="w-3 h-3" />
            </button>
          </motion.div>
        ))}
      </div>
    </motion.div>
  );
};

export default SoftLifeBundlesTab;
