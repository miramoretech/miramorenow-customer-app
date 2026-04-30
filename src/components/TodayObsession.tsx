import { useMemo } from "react";
import { motion } from "framer-motion";
import { foodProducts, beautyProducts } from "@/data/products";
import type { Product } from "@/components/ProductCard";
import { useCartStore } from "@/stores/cartStore";
import { Plus } from "lucide-react";

function getTodayObsession(items: Product[]): Product | null {
  if (items.length === 0) return null;
  const today = new Date().toDateString();
  const stored = localStorage.getItem("today_obsession");

  if (stored) {
    try {
      const parsed = JSON.parse(stored);
      if (parsed.date === today) {
        const found = items.find((i) => i.id === parsed.itemId);
        if (found) return found;
      }
    } catch {}
  }

  const randomItem = items[Math.floor(Math.random() * items.length)];
  localStorage.setItem(
    "today_obsession",
    JSON.stringify({ date: today, itemId: randomItem.id })
  );
  return randomItem;
}

const TodayObsession = () => {
  const addItem = useCartStore((s) => s.addItem);

  const obsession = useMemo(() => {
    const all = [...foodProducts, ...beautyProducts].filter((i) => i.image);
    return getTodayObsession(all);
  }, []);

  if (!obsession) return null;

  return (
    <div className="px-4 pt-3">
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.2 }}
        className="relative rounded-2xl overflow-hidden h-[120px]"
      >
        <img
          src={obsession.image}
          alt={obsession.name}
          className="w-full h-full object-cover"
          style={{ filter: "contrast(1.06) brightness(1.02) saturate(1.1)" }}
        />
        {/* Overlay */}
        <div className="absolute inset-0 bg-gradient-to-r from-foreground/70 via-foreground/40 to-transparent" />

        {/* Gold accent glow */}
        <div
          className="absolute inset-0"
          style={{
            background: "linear-gradient(to top, hsl(var(--secondary) / 0.2), transparent)",
          }}
        />

        {/* Content */}
        <div className="absolute inset-0 flex items-center justify-between px-4">
          <div className="text-primary-foreground max-w-[60%]">
            <p className="text-[9px] uppercase tracking-widest text-secondary font-bold mb-1">
              🔥 Today's Obsession
            </p>
            <h3 className="text-sm font-bold font-display leading-tight truncate">
              {obsession.name}
            </h3>
            <p className="text-[10px] opacity-70 truncate mt-0.5">
              {obsession.vendor}
            </p>
            <p className="text-xs font-bold mt-1">
              <span className="price-pill">₦{obsession.price.toLocaleString()}</span>
            </p>
          </div>
          <button
            onClick={() => addItem(obsession)}
            className="bg-primary text-primary-foreground rounded-full w-10 h-10 flex items-center justify-center shadow-lg press-scale hover:shadow-xl transition-shadow"
          >
            <Plus className="w-5 h-5" />
          </button>
        </div>
      </motion.div>
    </div>
  );
};

export default TodayObsession;
