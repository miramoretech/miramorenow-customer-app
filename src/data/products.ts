import type { Product } from "@/components/ProductCard";
import deluxeParfait250 from "@/assets/products/deluxe-parfait-250ml.png";
import deluxeParfait330 from "@/assets/products/deluxe-parfait-330ml.png";
import deluxeParfait500 from "@/assets/products/deluxe-parfait-500ml.png";
import greekYoghurt from "@/assets/products/greek-yoghurt-500ml.png";
import pixieCut from "@/assets/products/pixie-cut-wig.png";
import sddBlonde from "@/assets/products/sdd-blonde-unit.png";
import omotolaFringe from "@/assets/products/omotola-fringe-bounce.png";
import boneStraight from "@/assets/products/bone-straight-unit.png";
import pianoMagicCurls from "@/assets/products/piano-magic-curls.png";
import sddBrownBoneStraight from "@/assets/products/sdd-brown-bone-straight.png";
import sddVietnameseBouncyCurls from "@/assets/products/sdd-vietnamese-bouncy-curls.png";
import sddBurgundyBurmeseCurls from "@/assets/products/sdd-burgundy-burmese-curls.png";
import sddBrownFringeUnit from "@/assets/products/sdd-brown-fringe-unit.png";
import shawarmaImg from "@/assets/products/shawarma.png";
import bbqChickenImg from "@/assets/products/bbq-chicken.png";
import { amalaOrikiFood, amalaOrikiDrinks, amalaOrikiSoups, amalaOrikiProteins, amalaOrikiSwallow, amalaOrikiSides } from "@/data/amalaOriki";
import { mrGoodGrillProducts } from "@/data/mrGoodGrill";

export const foodProducts: Product[] = [
  { id: "f1", name: "250ml Deluxe Parfait", description: "Fresh layered parfait with fruits & granola", price: 6000, image: deluxeParfait250, vendor: "Yoghurt_Arcade", category: "food" },
  { id: "f2", name: "330ml Deluxe Parfait", description: "Medium-size parfait loaded with toppings", price: 8000, image: deluxeParfait330, vendor: "Yoghurt_Arcade", category: "food" },
  { id: "f3", name: "500ml Deluxe Parfait", description: "Large parfait — the ultimate indulgence", price: 10000, image: deluxeParfait500, vendor: "Yoghurt_Arcade", category: "food" },
  { id: "f4", name: "500ml Greek Yoghurt", description: "Sweetened / Unsweetened — creamy & natural", price: 8000, image: greekYoghurt, vendor: "Yoghurt_Arcade", category: "food" },
  { id: "f5", name: "Shawarma + 1 Hotdog", description: "Signature shawarma with 1 hotdog · Choice of sauce", price: 4000, image: shawarmaImg, vendor: "Cravings by K.O.L", category: "food" },
  { id: "f6", name: "Shawarma + 2 Hotdogs", description: "Signature shawarma with 2 hotdogs · Choice of sauce", price: 5000, image: shawarmaImg, vendor: "Cravings by K.O.L", category: "food" },
  { id: "f7", name: "Barbeque Chicken", description: "Juicy grilled BBQ chicken · Perfectly seasoned", price: 8500, image: bbqChickenImg, vendor: "Cravings by K.O.L", category: "food" },
  ...amalaOrikiFood,
  ...amalaOrikiDrinks,
  ...amalaOrikiSoups,
  ...amalaOrikiProteins,
  ...amalaOrikiSwallow,
  ...amalaOrikiSides,
  ...mrGoodGrillProducts,
];

export const beautyProducts: Product[] = [
  { id: "b1", name: "Pixie Cut Unit", description: "Paired with 13×4 frontal · Styled on request", price: 57000, image: pixieCut, vendor: "Hair & Locs_by_Effa", category: "beauty" },
  { id: "b2", name: "10\" SDD Blonde Unit", description: "200g · Paired with KimK closure", price: 145000, image: sddBlonde, vendor: "Hair & Locs_by_Effa", category: "beauty" },
  { id: "b3", name: "10\" Omotola Fringe Bounce", description: "300g curls · Full bounce volume", price: 150000, image: omotolaFringe, vendor: "Hair & Locs_by_Effa", category: "beauty" },
  { id: "b4", name: "10\" Vietnamese Bone Straight", description: "Paired with 5×5 closure · Sleek finish", price: 165000, image: boneStraight, vendor: "Hair & Locs_by_Effa", category: "beauty" },
  { id: "b5", name: "16\" SDD Piano Bouncy Curl", description: "300g · Paired with 5×5 closure · As a wig", price: 280000, image: pianoMagicCurls, vendor: "Hair & Locs_by_Effa", category: "beauty" },
  { id: "b6", name: "16\" SDD Donor Bone Straight", description: "Paired with KimK closure · As a wig", price: 220000, image: sddBrownBoneStraight, vendor: "Hair & Locs_by_Effa", category: "beauty" },
  { id: "b7", name: "20-24\" SDD Vietnamese Bounce Curls", description: "300g · Paired with 5×5 closure · As a wig", price: 560000, image: sddVietnameseBouncyCurls, vendor: "Hair & Locs_by_Effa", category: "beauty" },
  { id: "b8", name: "20\" SDD Burgundy Burmese Curls", description: "Paired with 5×5 closure · As a wig", price: 300000, image: sddBurgundyBurmeseCurls, vendor: "Hair & Locs_by_Effa", category: "beauty" },
  { id: "b9", name: "14\" SDD Bone Straight Fringe Wig", description: "Paired with 2×4 closure · Customized fringe", price: 190000, image: sddBrownFringeUnit, vendor: "Hair & Locs_by_Effa", category: "beauty" },
];

export interface VendorInfo {
  id: string;
  name: string;
  logo: string;
  category: "food" | "beauty";
  subtitle: string;
  location: string;
  deliveryTime: string;
  rating: number;
  popular?: boolean;
  openTime?: string;
  closeTime?: string;
}
