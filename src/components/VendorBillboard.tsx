import { useEffect, useMemo, useState, useCallback, forwardRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { foodProducts, beautyProducts } from "@/data/products";
import type { Product } from "@/components/ProductCard";
import { useNavigate } from "react-router-dom";

const DISPLAY_COUNT = 4;
const ROTATION_TIME = 4000;

const shuffle = <T,>(arr: T[]): T[] => [...arr].sort(() => 0.5 - Math.random());

function mixItems(items: Product[]) {
  const food = items.filter((i) => i.category === "food");
  const beauty = items.filter((i) => i.category === "beauty");
  const mixed: Product[] = [];
  const max = Math.max(food.length, beauty.length);
  for (let i = 0; i < max; i++) {
    if (food[i]) mixed.push(food[i]);
    if (beauty[i]) mixed.push(beauty[i]);
  }
  return mixed;
}

const VendorBillboard = () => {
  const navigate = useNavigate();
  const [activeItems, setActiveItems] = useState<Product[]>([]);

  const validItems = useMemo(() => {
    const all = [...foodProducts, ...beautyProducts];
    return all.filter((item) => item.image);
  }, []);

  const generateFeed = useCallback(() => {
    const mixed = mixItems(validItems);
    return shuffle(mixed).slice(0, DISPLAY_COUNT);
  }, [validItems]);

  useEffect(() => {
    setActiveItems(generateFeed());
    const interval = setInterval(() => {
      setActiveItems(generateFeed());
    }, ROTATION_TIME);
    return () => clearInterval(interval);
  }, [generateFeed]);

  return (
    <div className="px-4 pt-4">
      <div className="relative w-full h-[220px] overflow-hidden rounded-3xl bg-foreground/95">
        {/* Premium gradient background */}
        <div
          className="absolute inset-0 z-0"
          style={{
            background: `
              radial-gradient(circle at 20% 30%, hsl(var(--secondary) / 0.15), transparent 50%),
              radial-gradient(circle at 80% 70%, hsl(var(--primary) / 0.12), transparent 50%),
              radial-gradient(circle at 50% 90%, hsl(var(--secondary) / 0.08), transparent 50%)
            `,
          }}
        />

        {/* Billboard grid */}
        <div className="grid grid-cols-4 gap-2 p-2 h-full relative z-10">
          <AnimatePresence mode="popLayout">
            {activeItems.map((item) => (
              <BillboardCard key={item.id} item={item} />
            ))}
          </AnimatePresence>
        </div>

        {/* Gradient overlay for text readability */}
        <div className="absolute inset-0 bg-gradient-to-t from-foreground/80 via-foreground/20 to-transparent z-20 pointer-events-none" />

        {/* Overlay Text */}
        <div className="absolute bottom-4 left-4 right-4 z-30">
          <p className="text-[10px] uppercase tracking-widest text-secondary font-bold mb-0.5">
            🔥 Trending Now
          </p>
          <h2 className="text-base font-bold text-primary-foreground font-display leading-tight">
            Real Vendors. Real Flavours.
          </h2>
          <p className="text-[10px] text-primary-foreground/60 mt-0.5">
            Discover what Lagos is craving today
          </p>
        </div>
      </div>
    </div>
  );
};

const BillboardCard = forwardRef<HTMLDivElement, { item: Product }>(
  ({ item }, ref) => {
    return (
      <motion.div
        ref={ref}
        layout
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        transition={{ duration: 0.5, ease: "easeOut" }}
        className="relative rounded-2xl overflow-hidden"
      >
        <motion.img
          src={item.image}
          alt={item.name}
          className="w-full h-full object-cover"
          loading="lazy"
          initial={{ scale: 1 }}
          animate={{ scale: 1.08 }}
          transition={{ duration: 6, ease: "easeInOut", repeat: Infinity, repeatType: "reverse" }}
          style={{
            filter: "contrast(1.05) brightness(1.03) saturate(1.08)",
          }}
        />
        {/* Dark overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-foreground/60 to-transparent" />
        {/* Item info */}
        <div className="absolute bottom-1.5 left-1.5 right-1.5">
          <p className="text-[8px] font-bold text-primary-foreground truncate leading-tight">
            {item.name}
          </p>
          <p className="text-[7px] text-primary-foreground/60 truncate">
            {item.vendor}
          </p>
        </div>
      </motion.div>
    );
  }
);

BillboardCard.displayName = "BillboardCard";

export default VendorBillboard;