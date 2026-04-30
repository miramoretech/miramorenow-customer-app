import type { Product } from "@/components/ProductCard";
import goatMeatImg from "@/assets/products/goat-meat-asun.png";
import friedRiceImg from "@/assets/products/fried-rice.png";
import jollofRiceImg from "@/assets/products/jollof-rice.png";
import whiteRiceImg from "@/assets/products/white-rice.png";
import amalaImg from "@/assets/products/amala.png";
import fufuImg from "@/assets/products/fufu-akpu.png";
import eweduImg from "@/assets/products/ewedu.png";
import evaWaterImg from "@/assets/products/eva-water.png";
import maltaGuinnessImg from "@/assets/products/malta-guinness.png";
import fantaOrangeImg from "@/assets/products/fanta-orange.png";
import cocaColaImg from "@/assets/products/coca-cola.png";
import okroSoupImg from "@/assets/products/okro-soup.png";
import egusiSoupImg from "@/assets/products/egusi-soup.png";
import efoRiroImg from "@/assets/products/efo-riro.png";
import turkeyBigImg from "@/assets/products/turkey-big.png";
import titusFishImg from "@/assets/products/titus-fish.png";
import ebaImg from "@/assets/products/eba.png";
import breadBigImg from "@/assets/products/bread-big.png";
import breadSmallImg from "@/assets/products/bread-small.png";
import chivitaImg from "@/assets/products/chivita-active.png";
import gbegiriImg from "@/assets/products/gbegiri.png";
import saladImg from "@/assets/products/salad.png";
import boiledEggImg from "@/assets/products/boiled-egg.png";

export const VENDOR_NAME = "Amala Oriki";

// Soft Life descriptions
export const softLifeDescriptions: Record<string, string> = {
  "ao-goat": "Tender, slow-cooked goat meat marinated in a secret blend of West African spices, kissed with smoky heat and finished with a whisper of habanero. A true Lagos classic.",
  "ao-fried-rice": "Golden grains stir-fried with sweet peas, carrots, and green beans in a delicate umami broth. Light, fragrant, and perfect for any occasion—served without protein for you to customize.",
  "ao-jollof": "The undisputed party starter. Our jollof simmers for hours in a rich tomato and pepper base, infused with thyme, curry, and a hint of smoky fire. No protein, all soul.",
  "ao-white-rice": "Fluffy, perfectly steamed long-grain rice. A blank canvas ready to soak up your favorite stew or sauce—simple, comforting, and endlessly versatile.",
  "ao-amala": "Velvety smooth, earthy, and made fresh from premium yam or cassava flour. A timeless swallow that carries the heart of Yoruba cuisine.",
  "ao-fufu": "A single, neatly wrapped ball of fermented cassava fufu—soft, slightly tangy, and expertly molded. The ultimate partner for rich, savory soups.",
  "ao-ewedu": "Silky, vibrant green jute leaves blended to perfection with a touch of locust beans and seasoning. Light yet deeply flavorful—the perfect complement to amala.",
  "ao-fanta": "Zesty, bubbly, and unapologetically bright. The classic orange soda that turns any meal into a celebration.",
  "ao-coke": "The iconic refreshment—crisp, bold, and ice-cold. A timeless companion to every Nigerian feast.",
  "ao-eva": "Pure, crisp hydration. Clean and refreshing, bottled with care to keep you cool and collected.",
  "ao-malta": "Rich, non-alcoholic malt with a deep caramel heart. Energizing and satisfying—a true Lagos favorite.",
  "ao-okro": "Freshly prepared okro, perfectly drawy and loaded with rich local flavor. Smooth, satisfying, and made to pair beautifully with any swallow.",
  "ao-egusi": "A deep, flavorful melon seed soup cooked to perfection with local spices. Thick, hearty, and crafted for true Nigerian food lovers.",
  "ao-efo-riro": "A rich blend of leafy greens cooked in savory pepper sauce. Bold, nutritious, and packed with authentic Yoruba goodness.",
  "ao-turkey": "Juicy, well-seasoned turkey grilled to perfection. Smoky, tender, and bursting with flavor in every bite.",
  "ao-titus": "Fresh titus fish, properly seasoned and boiled soft. Clean, rich taste that complements any soup perfectly.",
  "ao-eba": "Soft, stretchy eba made from premium cassava flour. The perfect companion for your favorite Nigerian soups.",
  "ao-bread-big": "Freshly baked, soft and fluffy bread. Perfect for soaking up rich soups or enjoying on its own.",
  "ao-bread-small": "Warm, soft, and satisfying. A quick bite that still delivers that homely Nigerian bakery goodness.",
  "ao-chivita": "Refreshing, chilled and energizing fruit drink. The perfect cool-down companion for your meal.",
  "ao-gbegiri": "Creamy Yoruba bean soup, smooth and flavorful. Best paired with amala for that authentic local experience.",
  "ao-salad": "Crunchy veggies mixed with rich creamy dressing. Fresh, colorful, and refreshing on every bite.",
  "ao-boiled-egg": "Clean, healthy and perfectly boiled. A simple add-on to complete your meal.",
};

export const amalaOrikiFood: Product[] = [
  { id: "ao-goat", name: "🐐 Goat Meat (Asun / Stew)", description: "Tender goat meat in rich West African spices", price: 4500, image: goatMeatImg, vendor: VENDOR_NAME, category: "food" },
  { id: "ao-fried-rice", name: "🍛 Fried Rice", description: "Stir-fried with sweet peas, carrots & green beans · No protein", price: 1500, image: friedRiceImg, vendor: VENDOR_NAME, category: "food" },
  { id: "ao-jollof", name: "🍅 Jollof Rice", description: "Party jollof simmered in rich tomato & pepper base · No protein", price: 1000, image: jollofRiceImg, vendor: VENDOR_NAME, category: "food" },
  { id: "ao-white-rice", name: "🍚 White Rice", description: "Fluffy steamed long-grain rice · Served with any dish", price: 1300, image: whiteRiceImg, vendor: VENDOR_NAME, category: "food" },
  { id: "ao-amala", name: "🍠 Amala", description: "Premium yam/cassava flour swallow · Yoruba classic", price: 800, image: amalaImg, vendor: VENDOR_NAME, category: "food" },
  { id: "ao-fufu", name: "🌿 Fufu (Akpu) Wrap", description: "One wrap of fermented cassava fufu · Soft & tangy", price: 750, image: fufuImg, vendor: VENDOR_NAME, category: "food" },
  { id: "ao-ewedu", name: "🥣 Ewedu", description: "Silky jute leaves with locust beans · Light & flavorful", price: 600, image: eweduImg, vendor: VENDOR_NAME, category: "food" },
];

export const amalaOrikiDrinks: Product[] = [
  { id: "ao-fanta", name: "🍊 Fanta Orange 50cl PET", description: "Zesty bubbly orange soda", price: 1000, image: fantaOrangeImg, vendor: VENDOR_NAME, category: "food" },
  { id: "ao-coke", name: "🥤 Coca-Cola 50cl PET", description: "Crisp, bold & ice-cold", price: 1000, image: cocaColaImg, vendor: VENDOR_NAME, category: "food" },
  { id: "ao-eva", name: "💧 Eva Water 75cl PET", description: "Pure crisp hydration", price: 500, image: evaWaterImg, vendor: VENDOR_NAME, category: "food" },
  { id: "ao-malta", name: "🍺 Malta Guinness 33cl Can", description: "Rich non-alcoholic malt drink", price: 1300, image: maltaGuinnessImg, vendor: VENDOR_NAME, category: "food" },
  { id: "ao-chivita", name: "🧃 Chivita Active Juice (1L)", description: "Refreshing, chilled and energizing fruit drink", price: 4300, image: chivitaImg, vendor: VENDOR_NAME, category: "food" },
];

export const amalaOrikiSoups: Product[] = [
  { id: "ao-okro", name: "🍲 Okro Soup – Fresh & Drawy Delight", description: "Freshly prepared okro, perfectly drawy & loaded with rich local flavor", price: 1800, image: okroSoupImg, vendor: VENDOR_NAME, category: "food" },
  { id: "ao-egusi", name: "🥘 Egusi Soup – Thick, Rich & Traditional", description: "Deep, flavorful melon seed soup cooked to perfection with local spices", price: 1800, image: egusiSoupImg, vendor: VENDOR_NAME, category: "food" },
  { id: "ao-efo-riro", name: "🥬 Efo Riro – Yoruba Veggie Supreme", description: "Rich blend of leafy greens cooked in savory pepper sauce", price: 2500, image: efoRiroImg, vendor: VENDOR_NAME, category: "food" },
  { id: "ao-gbegiri", name: "🫘 Gbegiri Soup – Smooth Bean Classic", description: "Creamy Yoruba bean soup, smooth and flavorful", price: 650, image: gbegiriImg, vendor: VENDOR_NAME, category: "food" },
];

export const amalaOrikiProteins: Product[] = [
  { id: "ao-turkey", name: "🍗 Grilled Turkey (Big Cut)", description: "Juicy, well-seasoned turkey grilled to smoky perfection", price: 8300, image: turkeyBigImg, vendor: VENDOR_NAME, category: "food" },
  { id: "ao-titus", name: "🐟 Boiled Titus Fish (Full Size)", description: "Fresh titus fish, properly seasoned and boiled soft", price: 6500, image: titusFishImg, vendor: VENDOR_NAME, category: "food" },
  { id: "ao-boiled-egg", name: "🥚 Boiled Egg – Simple Protein Boost", description: "Clean, healthy and perfectly boiled", price: 700, image: boiledEggImg, vendor: VENDOR_NAME, category: "food" },
];

export const amalaOrikiSwallow: Product[] = [
  { id: "ao-eba", name: "🍚 Eba – Smooth Cassava Swallow", description: "Soft, stretchy eba from premium cassava flour", price: 850, image: ebaImg, vendor: VENDOR_NAME, category: "food" },
];

export const amalaOrikiSides: Product[] = [
  { id: "ao-bread-big", name: "🍞 Soft Family Bread (Big Size)", description: "Freshly baked, soft and fluffy bread", price: 3500, image: breadBigImg, vendor: VENDOR_NAME, category: "food" },
  { id: "ao-bread-small", name: "🍞 Soft Bread (Small Size)", description: "Warm, soft, and satisfying", price: 2100, image: breadSmallImg, vendor: VENDOR_NAME, category: "food" },
  { id: "ao-salad", name: "🥗 Fresh Creamy Salad", description: "Crunchy veggies mixed with rich creamy dressing", price: 2300, image: saladImg, vendor: VENDOR_NAME, category: "food" },
];

// Protein add-ons available for soups
export interface ProteinAddon {
  productId: string;
  name: string;
  price: number;
}

export const proteinAddons: ProteinAddon[] = [
  { productId: "ao-turkey", name: "Turkey (Big)", price: 8300 },
  { productId: "ao-titus", name: "Titus Fish (Big)", price: 6500 },
  { productId: "ao-goat", name: "Goat Meat", price: 4500 },
  { productId: "ao-boiled-egg", name: "Boiled Egg", price: 700 },
];

// IDs of soups that support protein add-ons
export const soupIds = new Set(["ao-okro", "ao-egusi", "ao-efo-riro", "ao-gbegiri"]);

export interface ComboItem {
  productId: string;
  quantity: number;
}

export interface ComboDeal {
  id: string;
  name: string;
  tagline: string;
  description: string;
  items: ComboItem[];
  originalPrice: number;
  comboPrice: number;
  badge?: string;
}

export const combos: ComboDeal[] = [
  {
    id: "combo-omo-eko",
    name: "The Omo Eko Special",
    tagline: "🔥 Best Value",
    description: "Goat Meat + Amala + Ewedu + Malta Guinness. A feast fit for a Lagos connoisseur—spicy, hearty, and unapologetically local.",
    items: [
      { productId: "ao-goat", quantity: 1 },
      { productId: "ao-amala", quantity: 1 },
      { productId: "ao-ewedu", quantity: 1 },
      { productId: "ao-malta", quantity: 1 },
    ],
    originalPrice: 7200,
    comboPrice: 6500,
    badge: "🔥 Best Value",
  },
  {
    id: "combo-party",
    name: "The Party Starter",
    tagline: "🎉 Crowd Pleaser",
    description: "Jollof + Fried Rice + Goat Meat + 2 soft drinks. The ultimate crowd-pleaser. Bring the party to your table.",
    items: [
      { productId: "ao-jollof", quantity: 1 },
      { productId: "ao-fried-rice", quantity: 1 },
      { productId: "ao-goat", quantity: 1 },
      { productId: "ao-fanta", quantity: 1 },
      { productId: "ao-coke", quantity: 1 },
    ],
    originalPrice: 9000,
    comboPrice: 7999,
    badge: "🎉 Popular",
  },
  {
    id: "combo-midweek",
    name: "Midweek Swallow",
    tagline: "💚 Comfort Food",
    description: "Fufu + Ewedu + Goat Meat + Eva Water. A comforting midweek reset—simple, filling, and full of flavor.",
    items: [
      { productId: "ao-fufu", quantity: 1 },
      { productId: "ao-ewedu", quantity: 1 },
      { productId: "ao-goat", quantity: 1 },
      { productId: "ao-eva", quantity: 1 },
    ],
    originalPrice: 6350,
    comboPrice: 5500,
    badge: "💚 Comfort",
  },
];

export interface PackagingOption {
  id: string;
  name: string;
  description: string;
  price: number;
}

export const packagingOptions: PackagingOption[] = [
  { id: "branded", name: "Branded Pack", description: "Look sharp with the Oriki premium pack", price: 700 },
  { id: "big", name: "Big Pack", description: "For the hungry soul (Large portions)", price: 500 },
];

// Companion suggestions: when a user selects a primary item, suggest these
export const companionMap: Record<string, string[]> = {
  "ao-goat": ["ao-fufu", "ao-ewedu", "ao-amala", "ao-jollof"],
  "ao-fried-rice": ["ao-goat", "ao-coke", "ao-fanta"],
  "ao-jollof": ["ao-goat", "ao-fanta", "ao-coke"],
  "ao-white-rice": ["ao-goat", "ao-ewedu", "ao-malta"],
  "ao-amala": ["ao-ewedu", "ao-goat", "ao-fufu", "ao-okro", "ao-egusi", "ao-gbegiri"],
  "ao-fufu": ["ao-ewedu", "ao-goat", "ao-amala", "ao-okro"],
  "ao-ewedu": ["ao-amala", "ao-fufu", "ao-goat"],
  "ao-okro": ["ao-amala", "ao-eba", "ao-fufu", "ao-turkey"],
  "ao-egusi": ["ao-amala", "ao-eba", "ao-fufu", "ao-turkey"],
  "ao-efo-riro": ["ao-amala", "ao-eba", "ao-fufu", "ao-turkey"],
  "ao-eba": ["ao-okro", "ao-egusi", "ao-efo-riro", "ao-goat"],
  "ao-gbegiri": ["ao-amala", "ao-ewedu", "ao-fufu"],
};

export const allAmalaOrikiProducts = [...amalaOrikiFood, ...amalaOrikiDrinks, ...amalaOrikiSoups, ...amalaOrikiProteins, ...amalaOrikiSwallow, ...amalaOrikiSides];

export const getProductById = (id: string) => allAmalaOrikiProducts.find((p) => p.id === id);
