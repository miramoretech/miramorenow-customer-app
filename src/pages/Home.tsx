// src/pages/Home.tsx
// FIXES IN THIS VERSION:
// 1. ✅ Removed broken unicode \uD83D\uDC4B wave emoji from greeting
// 2. ✅ "Shops" tab renamed to "Beauty Shop"
// 3. ✅ "Send" tab added before "Pharmacies" in top filter tabs
// 4. ✅ Top filter tabs now inside HScroll — all tabs scrollable on mobile

import { useState, useMemo, useEffect, useCallback } from "react";
import {
  ShoppingCart, Search, MapPin, Menu, Star, Mic, X,
  Filter, Leaf, ChevronRight, Clock, Sparkles, TrendingUp, Flame, CheckCircle2,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { useQuery } from "@tanstack/react-query";
import MiramoreLogo from "@/components/MiramoreLogo";
import BottomNav from "@/components/BottomNav";
import WhatsAppButton from "@/components/WhatsAppButton";
import ProductCard from "@/components/ProductCard";
import VendorCard from "@/components/VendorCard";
import TodayObsession from "@/components/TodayObsession";
import ShareSoftLifeModal from "@/components/ShareSoftLifeModal";
import SideMenu from "@/components/SideMenu";
import ProductDetailModal from "@/components/ProductDetailModal";
import { useCartStore } from "@/stores/cartStore";
import { supabase } from "@/lib/supabase";
import type { Product } from "@/components/ProductCard";
import { toast } from "sonner";

const formatPrice = (price: number): string =>
  `\u20A6${price.toLocaleString("en-NG", { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`;

import deluxeParfait250   from "@/assets/products/deluxe-parfait-250ml.png";
import deluxeParfait330   from "@/assets/products/deluxe-parfait-330ml.png";
import deluxeParfait500   from "@/assets/products/deluxe-parfait-500ml.png";
import greekYoghurt       from "@/assets/products/greek-yoghurt-500ml.png";
import shawarmaImg        from "@/assets/products/shawarma.png";
import bbqChickenImg      from "@/assets/products/bbq-chicken.png";
import goatMeatImg        from "@/assets/products/goat-meat-asun.png";
import friedRiceImg       from "@/assets/products/fried-rice.png";
import jollofRiceImg      from "@/assets/products/jollof-rice.png";
import whiteRiceImg       from "@/assets/products/white-rice.png";
import amalaImg           from "@/assets/products/amala.png";
import fufuImg            from "@/assets/products/fufu-akpu.png";
import eweduImg           from "@/assets/products/ewedu.png";
import fantaOrangeImg     from "@/assets/products/fanta-orange.png";
import cocaColaImg        from "@/assets/products/coca-cola.png";
import evaWaterImg        from "@/assets/products/eva-water.png";
import maltaGuinnessImg   from "@/assets/products/malta-guinness.png";
import chivitaImg         from "@/assets/products/chivita-active.png";
import okroSoupImg        from "@/assets/products/okro-soup.png";
import egusiSoupImg       from "@/assets/products/egusi-soup.png";
import efoRiroImg         from "@/assets/products/efo-riro.png";
import gbegiriImg         from "@/assets/products/gbegiri.png";
import turkeyBigImg       from "@/assets/products/turkey-big.png";
import titusFishImg       from "@/assets/products/titus-fish.png";
import boiledEggImg       from "@/assets/products/boiled-egg.png";
import ebaImg             from "@/assets/products/eba.png";
import breadBigImg        from "@/assets/products/bread-big.png";
import saladImg           from "@/assets/products/salad.png";
import spicyCatfishImg    from "@/assets/products/spicy-grilled-catfish.png";
import pepperedCroakerImg from "@/assets/products/peppered-croaker-fish.png";
import bigGrillCatfishImg from "@/assets/products/big-grill-catfish.png";
import pixieCut           from "@/assets/products/pixie-cut-wig.png";
import sddBlonde          from "@/assets/products/sdd-blonde-unit.png";
import omotolaFringe      from "@/assets/products/omotola-fringe-bounce.png";
import boneStraight       from "@/assets/products/bone-straight-unit.png";
import pianoMagicCurls    from "@/assets/products/piano-magic-curls.png";
import sddBrownBoneStraight     from "@/assets/products/sdd-brown-bone-straight.png";
import sddVietnameseBouncyCurls from "@/assets/products/sdd-vietnamese-bouncy-curls.png";
import sddBurgundyBurmeseCurls  from "@/assets/products/sdd-burgundy-burmese-curls.png";
import sddBrownFringeUnit       from "@/assets/products/sdd-brown-fringe-unit.png";

import parfaitCatImg  from "@/assets/products/deluxe-parfait-330ml.png";
import shawarmaCatImg from "@/assets/products/shawarma.png";
import beautyCatImg   from "@/assets/products/omotola-fringe-bounce.png";
import chickenCatImg  from "@/assets/products/bbq-chicken.png";
import riceCatImg     from "@/assets/products/fried-rice.png";
import grillsCatImg   from "@/assets/products/spicy-grilled-catfish.png";
import cakesCatImg    from "@/assets/products/deluxe-parfait-330ml.png";
import drinksCatImg   from "@/assets/products/coca-cola.png";
import healthyCatImg  from "@/assets/products/salad.png";
import swallowCatImg  from "@/assets/products/amala.png";
import soupsCatImg    from "@/assets/products/egusi-soup.png";

const C = {
  green:"#1B6B2F", greenDark:"#145228", greenMid:"#2E7D32",
  green100:"#E8F5E9", green50:"#F1F8F2",
  gold:"#F5A623", goldDark:"#E08B00", goldLight:"#FEF3DC",
  cream:"#FAFDF6", white:"#FFFFFF", border:"#E8F5E9",
  text:"#1a1a1a", textSub:"#777777",
};

const VENDOR_NAMES = {
  YOGHURT_ARCADE:"Yoghurt_Arcade", HAIR_LOCS:"Hair & Locs_by_Effa",
  CRAVINGS:"Cravings by K.O.L", SAFARI:"Safari Restaurant & Lounge",
  AMALA_ORIKI:"Amala Oriki", MR_GOOD_GRILL:"Mr. Good Grill Resto",
  DIVINE_DELIGHT:"Divine Delight Foodies",
};

const CAT_VENDORS: Record<string,string[]> = {
  parfait:[VENDOR_NAMES.YOGHURT_ARCADE], shawarma:[VENDOR_NAMES.CRAVINGS],
  beauty:[VENDOR_NAMES.HAIR_LOCS],
  chicken:[VENDOR_NAMES.SAFARI,VENDOR_NAMES.CRAVINGS,VENDOR_NAMES.MR_GOOD_GRILL],
  rice:[VENDOR_NAMES.SAFARI,VENDOR_NAMES.AMALA_ORIKI], grills:[VENDOR_NAMES.MR_GOOD_GRILL],
  fastfood:[VENDOR_NAMES.SAFARI], cakes:[VENDOR_NAMES.YOGHURT_ARCADE],
  drinks:[VENDOR_NAMES.AMALA_ORIKI], healthy:[VENDOR_NAMES.YOGHURT_ARCADE],
  swallow_staples:[VENDOR_NAMES.DIVINE_DELIGHT], soups:[VENDOR_NAMES.DIVINE_DELIGHT],
};

const IMG_MAP: Record<string,string> = {
  "250ml Deluxe Parfait":deluxeParfait250,"330ml Deluxe Parfait":deluxeParfait330,
  "500ml Deluxe Parfait":deluxeParfait500,"500ml Greek Yoghurt":greekYoghurt,
  "Shawarma + 1 Hotdog":shawarmaImg,"Shawarma + 2 Hotdogs":shawarmaImg,
  "Barbeque Chicken":bbqChickenImg,
  "\uD83D\uDC10 Goat Meat (Asun / Stew)":goatMeatImg,
  "\uD83C\uDF5B Fried Rice":friedRiceImg,"\uD83C\uDF45 Jollof Rice":jollofRiceImg,
  "\uD83C\uDF5A White Rice":whiteRiceImg,"\uD83C\uDF60 Amala":amalaImg,
  "\uD83C\uDF3F Fufu (Akpu) Wrap":fufuImg,"\uD83E\uDD63 Ewedu":eweduImg,
  "\uD83C\uDF4A Fanta Orange 50cl PET":fantaOrangeImg,
  "\uD83E\uDD64 Coca-Cola 50cl PET":cocaColaImg,
  "\uD83D\uDCA7 Eva Water 75cl PET":evaWaterImg,
  "\uD83C\uDF7A Malta Guinness 33cl Can":maltaGuinnessImg,
  "\uD83E\uDDE3 Chivita Active Juice (1L)":chivitaImg,
  "\uD83C\uDF72 Okro Soup \u2013 Fresh & Drawy Delight":okroSoupImg,
  "\uD83E\uDD58 Egusi Soup \u2013 Thick, Rich & Traditional":egusiSoupImg,
  "\uD83E\uDD6C Efo Riro \u2013 Yoruba Veggie Supreme":efoRiroImg,
  "\uD9F5\uDEB7 Gbegiri Soup \u2013 Smooth Bean Classic":gbegiriImg,
  "\uD83C\uDF57 Grilled Turkey (Big Cut)":turkeyBigImg,
  "\uD83D\uDC1F Boiled Titus Fish (Full Size)":titusFishImg,
  "\uD83E\uDD5A Boiled Egg \u2013 Simple Protein Boost":boiledEggImg,
  "\uD83C\uDF5A Eba \u2013 Smooth Cassava Swallow":ebaImg,
  "\uD83C\uDF5E Soft Family Bread (Big Size)":breadBigImg,
  "\uD83E\uDD57 Fresh Creamy Salad":saladImg,
  "\uD83D\uDD25 Spicy Grilled Catfish Deluxe":spicyCatfishImg,
  "\uD83D\uDC1F Peppered Grilled Croaker Fish Platter":pepperedCroakerImg,
  "\uD83C\uDF57 Big Grill Catfish with Plantain & Chips":bigGrillCatfishImg,
  "Pixie Cut Unit":pixieCut,"10\" SDD Blonde Unit":sddBlonde,
  "10\" Omotola Fringe Bounce":omotolaFringe,"10\" Vietnamese Bone Straight":boneStraight,
  "16\" SDD Piano Bouncy Curl":pianoMagicCurls,"16\" SDD Donor Bone Straight":sddBrownBoneStraight,
  "20-24\" SDD Vietnamese Bounce Curls":sddVietnameseBouncyCurls,
  "20\" SDD Burgundy Burmese Curls":sddBurgundyBurmeseCurls,
  "14\" SDD Bone Straight Fringe Wig":sddBrownFringeUnit,
};
const getPImg = (n: string) => IMG_MAP[n] || "";

const proteinAddons = [
  {id:"turkey",name:"Turkey (Big)",price:8300},{id:"titus",name:"Titus Fish",price:6500},
  {id:"goat",name:"Goat Meat",price:4500},{id:"egg",name:"Boiled Egg",price:700},
];
const packagingOptions = [
  {id:"branded",name:"Branded Pack",description:"Premium pack",price:700},
  {id:"big",name:"Big Pack",description:"Large portions",price:500},
];
const soupIds = new Set(["ao-okro","ao-egusi","ao-efo-riro","ao-gbegiri"]);

const fetchVendors = async () => {
  const {data,error} = await supabase.from("vendors").select("*").eq("is_active",true);
  if(error) throw error; return data||[];
};
const fetchMenuItems = async () => {
  const {data,error} = await supabase
    .from("menu_items")
    .select("*, vendor:vendor_id(store_name, store_category), options:menu_item_variations(*)")
    .eq("is_available",true);
  if(error) throw error; return data||[];
};

const getGreeting = () => {
  const h = new Date().getHours();
  return h<12?"Good morning":h<18?"Good afternoon":"Good evening";
};
const isValidName = (n:string) =>
  ![/\.com$/,/^active$/i,/^inactive$/i,/^test$/i,/^$/].some(p=>p.test(n.trim()));

const SDICT: Record<string,string[]> = {
  "jolof":["jollof","jollof rice"],"jollof":["jollof rice"],"fried rice":["fried rice"],
  "amala":["amala"],"eba":["eba"],"fufu":["fufu","akpu"],"egusi":["egusi soup"],
  "okro":["okro soup"],"efo":["efo riro"],"gbegiri":["gbegiri"],
  "goat":["goat meat","asun"],"turkey":["turkey"],"chicken":["chicken","bbq"],
  "bbq":["bbq","barbeque chicken"],"fish":["fish","catfish","titus","croaker"],
  "fanta":["fanta"],"coke":["coca-cola"],"malt":["malta"],"water":["eva water"],
  "juice":["chivita"],"bread":["bread"],"salad":["salad"],
  "shawarma":["shawarma"],"hair":["hair","wig","locs","bone straight","curls"],
  "parfait":["parfait"],"yoghurt":["yoghurt"],
};
function lev(a:string,b:string):number{
  const m=a.length,n=b.length;
  const dp=Array.from({length:m+1},(_,i)=>Array.from({length:n+1},(_,j)=>i===0?j:j===0?i:0));
  for(let i=1;i<=m;i++)for(let j=1;j<=n;j++)dp[i][j]=a[i-1]===b[j-1]?dp[i-1][j-1]:1+Math.min(dp[i-1][j],dp[i][j-1],dp[i-1][j-1]);
  return dp[m][n];
}
function expandQ(q:string):string[]{
  const low=q.toLowerCase().trim();
  const terms=new Set<string>([low]);
  if(SDICT[low])SDICT[low].forEach(t=>terms.add(t));
  Object.entries(SDICT).forEach(([k,v])=>{
    if(k.includes(low)||low.includes(k)||lev(low,k)<=Math.max(2,Math.floor(low.length*0.35)))
      v.forEach(t=>terms.add(t));
  });
  return Array.from(terms);
}
function smartSearch(items:any[],query:string,fields:string[]):any[]{
  if(!query.trim())return items;
  const terms=expandQ(query);
  return items.filter(item=>{
    const hay=fields.map(f=>(item[f]||"").toString().toLowerCase()).join(" ");
    for(const t of terms)if(hay.includes(t))return true;
    return(item.name||"").toLowerCase().split(/\s+/).some((w:string)=>
      lev(query.toLowerCase(),w)<=Math.max(1,Math.floor(w.length*0.35)));
  }).sort((a,b)=>{
    const q=query.toLowerCase();
    return((b.name||"").toLowerCase().includes(q)?2:0)-((a.name||"").toLowerCase().includes(q)?2:0);
  });
}

const BANNERS = [
  {id:"play",bg:`linear-gradient(135deg,#0D3D1A 0%,#1B6B2F 55%,#2E7D32 100%)`,accent:"#F5A623",badge:"\uD83C\uDFC6 3 Chances Daily",title:"Play & Win",sub:"Real Rewards!",desc:"Match Nigerian dishes \u2014 earn \u20A61,000 OFF your next order.",cta:"Play Now \u2192",topDeco:"\uD83C\uDFAE",route:"/play",action:false},
  {id:"send",bg:`linear-gradient(135deg,#145228 0%,#1B6B2F 55%,#388E3C 100%)`,accent:"#F5A623",badge:"\u2764\uFE0F Share the Love",title:"Send Food",sub:"Anywhere in Lagos",desc:"Surprise someone special with a hot meal today.",cta:"Send Now \u2192",topDeco:"\uD83D\uDEF5",route:null,action:true},
  {id:"party",bg:`linear-gradient(135deg,#1A0D2E 0%,#3B1F6E 55%,#512DA8 100%)`,accent:"#F5A623",badge:"\uD83C\uDF89 Bulk Orders",title:"Planning a Party?",sub:"We've Got You!",desc:"Jollof, Suya, Small Chops & more \u2014 catering made easy.",cta:"Plan Party \u2192",topDeco:"\uD83E\uDD73",route:"/party",action:false},
  {id:"gift",bg:`linear-gradient(135deg,#2A1500 0%,#7B3F00 55%,#BF6000 100%)`,accent:"#F5A623",badge:"\uD83C\uDF81 Perfect Present",title:"Gift Cards",sub:"for Food Lovers",desc:"8+ beautiful designs \u2014 send joy in any amount.",cta:"Buy Gift Card \u2192",topDeco:"\u2728",route:"/gift-cards",action:false},
  {id:"collect",bg:`linear-gradient(135deg,#0D3D1A 0%,#1B6B2F 50%,#00796B 100%)`,accent:"#F5A623",badge:"\uD83D\uDCC2 Stay Organised",title:"Save Your",sub:"Favourite Spots",desc:"Bookmark vendors and dishes \u2014 find them instantly.",cta:"Explore \u2192",topDeco:"\uD83D\uDD16",route:"/collections",action:false},
];

const CATS = [
  {id:"parfait",name:"Parfait",emoji:"\uD83C\uDF6E",img:parfaitCatImg,fb:[deluxeParfait330],ac:"#F5A623"},
  {id:"shawarma",name:"Shawarma",emoji:"\uD83C\uDF2F",img:shawarmaCatImg,fb:[shawarmaImg],ac:"#E53935"},
  {id:"beauty",name:"Beauty",emoji:"\uD83D\uDC84",img:beautyCatImg,fb:[omotolaFringe],ac:"#AD1457"},
  {id:"chicken",name:"Chicken & BBQ",emoji:"\uD83C\uDF57",img:chickenCatImg,fb:[bbqChickenImg],ac:"#E65100"},
  {id:"rice",name:"Rice",emoji:"\uD83C\uDF5A",img:riceCatImg,fb:[jollofRiceImg],ac:"#2E7D32"},
  {id:"grills",name:"Grills & Suya",emoji:"\uD83D\uDD25",img:grillsCatImg,fb:[spicyCatfishImg],ac:"#BF360C"},
  {id:"fastfood",name:"Fast Food",emoji:"\uD83C\uDF54",img:shawarmaCatImg,fb:[shawarmaImg],ac:"#F57F17"},
  {id:"cakes",name:"Desserts",emoji:"\uD83C\uDF70",img:cakesCatImg,fb:[deluxeParfait500],ac:"#880E4F"},
  {id:"drinks",name:"Drinks",emoji:"\uD83E\uDD64",img:drinksCatImg,fb:[cocaColaImg],ac:"#1565C0"},
  {id:"healthy",name:"Healthy",emoji:"\uD83E\uDD57",img:healthyCatImg,fb:[saladImg],ac:"#1B6B2F"},
  {id:"swallow_staples",name:"Swallow",emoji:"\uD83C\uDF72",img:swallowCatImg,fb:[amalaImg],ac:"#4E342E"},
  {id:"soups",name:"Soups",emoji:"\uD9F5\uDEB5",img:soupsCatImg,fb:[okroSoupImg],ac:"#E53935"},
];

const CAT_SUBCATS: Record<string,string[]> = {
  parfait:["250ml Parfait","330ml Parfait","500ml Parfait","Greek Yoghurt"],
  shawarma:["Chicken Shawarma","Beef Shawarma","Mixed Shawarma"],
  beauty:["Hair Wigs","Bone Straight","Curls & Bouncy","Fringe Units"],
  chicken:["Grilled Chicken","BBQ Wings","Barbeque Chicken","Fried Chicken"],
  rice:["Jollof Rice","Fried Rice","White Rice","Coconut Rice"],
  grills:["Grilled Catfish","Croaker Fish","Suya","Asun","Turkey"],
  fastfood:["Burger","Pizza","Hotdog","Fries","Shawarma"],
  cakes:["Deluxe Parfait","Greek Yoghurt","Ice Cream","Cupcakes"],
  drinks:["Soft Drinks","Malta","Eva Water","Chivita Juice"],
  healthy:["Fresh Salad","Grilled Fish","Yoghurt Bowl"],
  swallow_staples:["Amala","Eba","Fufu","Cassava flour","Plantain flour"],
  soups:["Egusi Soup","Okro Soup","Efo Riro","Gbegiri","Pepper Soup"],
};

const VendorImg = ({url,name}:{url:string|null;name:string}) => {
  const [src,setSrc]=useState<string|null>(null);
  const [err,setErr]=useState(false);
  useEffect(()=>{if(url)setSrc(`${url}?v=1`);},[url]);
  if(!src||err)return<div style={{width:"100%",height:"100%",display:"flex",alignItems:"center",justifyContent:"center",fontSize:22,background:C.green50}}>\uD83C\uDFEA</div>;
  return<img src={src} alt={name} loading="eager" decoding="async" style={{width:"100%",height:"100%",objectFit:"cover"}} onError={()=>setErr(true)}/>;
};

const HScroll = ({children,style={},innerPaddingLeft=14,innerPaddingRight=14}:{
  children:React.ReactNode;style?:React.CSSProperties;
  innerPaddingLeft?:number;innerPaddingRight?:number;
}) => (
  <div style={{
    width:"100%",overflowX:"scroll",overflowY:"visible",
    WebkitOverflowScrolling:"touch",overscrollBehaviorX:"contain",
    scrollbarWidth:"none",msOverflowStyle:"none",
    boxSizing:"border-box",...style,
  }}>
    <div style={{
      display:"flex",flexDirection:"row",flexWrap:"nowrap",alignItems:"center",
      paddingLeft:innerPaddingLeft,paddingRight:innerPaddingRight,
      minWidth:"max-content",width:"max-content",boxSizing:"content-box",
    }}>
      {children}
    </div>
  </div>
);

const EXPLORE = [
  {label:"Offers",route:"/offers",emoji:"\uD83C\uDFF7\uFE0F",bg:C.green,action:false},
  {label:"Play & Win",route:"/play",emoji:"\uD83C\uDFAE",bg:"#512DA8",action:false},
  {label:"Send Food",route:null,emoji:"\uD83D\uDE80",bg:C.green,action:true},
  {label:"Plan a Party",route:"/party",emoji:"\uD83C\uDF89",bg:"#C62828",action:false},
  {label:"Gift Cards",route:"/gift-cards",emoji:"\uD83C\uDF81",bg:C.goldDark,action:false},
  {label:"Collections",route:"/collections",emoji:"\uD83D\uDCC2",bg:"#00796B",action:false},
];

const FT=["Sort By","Time","Rating","Offers","Price","Trust"];
const SORT_O=["Relevance","Popularity","Rating: High to Low","Price: Low to High","Price: High to Low"];
const TIME_O=["Near & Fast","Within 30 min","Within 1 hour"];
const RAT_O=["3.5+","4.0+"];
const OFFER_O=["Free Delivery","Buy 1 Get 1","Discount 20%+"];
const TRUST_O=["Top Vendor","Verified Store","Miramore Choice"];

type QF="near"|"top_rated"|"under3k"|"deals"|"healthy";
const QFS:{id:QF;label:string;bg:string}[]=[
  {id:"near",label:"\u26A1 Near & Fast",bg:C.green},
  {id:"top_rated",label:"\u2B50 Top Rated",bg:C.goldDark},
  {id:"under3k",label:"\uD83D\uDCB8 Under \u20A63K",bg:C.greenMid},
  {id:"deals",label:"\uD83D\uDD25 Deals",bg:"#C62828"},
  {id:"healthy",label:"\uD83E\uDD57 Healthy",bg:C.green},
];

const QUICK_CATEGORIES=[
  {id:"cakes",label:"Pastries",emoji:"\uD83E\uDD50"},
  {id:"healthy",label:"Healthy",emoji:"\uD83E\uDD57"},
  {id:"fastfood",label:"Breakfast",emoji:"\uD83C\uDF73"},
  {id:"fastfood",label:"Pizza",emoji:"\uD83C\uDF55"},
];

const Home = () => {
  const navigate=useNavigate();
  const items=useCartStore(s=>s.items);
  const cartCount=items.reduce((s,i)=>s+i.quantity,0);

  const [menuOpen,setMenuOpen]=useState(false);
  const [searchQuery,setSearchQuery]=useState("");
  const [sendFoodOpen,setSendFoodOpen]=useState(false);
  const [selectedProduct,setSelectedProduct]=useState<Product|null>(null);
  const [activeCat,setActiveCat]=useState("parfait");
  const [showFilterModal,setShowFilterModal]=useState(false);
  const [showHealthy,setShowHealthy]=useState(false);
  const [activeQF,setActiveQF]=useState<Set<QF>>(new Set());
  const [isListening,setIsListening]=useState(false);
  const [recognition,setRecognition]=useState<any>(null);
  const [userName,setUserName]=useState<string|null>(null);
  const [filterTab,setFilterTab]=useState("Sort By");
  const [activePageFilter,setActivePageFilter]=useState<"All"|"Restaurants">("All");
  const [filters,setFilters]=useState({
    sortBy:"Relevance",time:null as string|null,rating:null as number|null,
    offers:[] as string[],priceRange:[0,50000],trust:[] as string[],
  });
  const [vendorPickModal,setVendorPickModal]=useState<{open:boolean;catLabel:string;vendorNames:string[]}>({open:false,catLabel:"",vendorNames:[]});
  const [bannerIdx,setBannerIdx]=useState(0);
  const [bannerPaused,setBannerPaused]=useState(false);

  useEffect(()=>{
    if(bannerPaused)return;
    const id=setInterval(()=>setBannerIdx(p=>(p+1)%BANNERS.length),5000);
    return()=>clearInterval(id);
  },[bannerPaused]);

  useEffect(()=>{
    const SR=(window as any).SpeechRecognition||(window as any).webkitSpeechRecognition;
    if(!SR)return;
    const r=new SR();r.continuous=false;r.interimResults=false;r.lang="en-NG";
    r.onresult=(e:any)=>{setSearchQuery(e.results[0][0].transcript);setIsListening(false);};
    r.onerror=()=>{toast.error("Voice search failed.");setIsListening(false);};
    r.onend=()=>setIsListening(false);
    setRecognition(r);
  },[]);

  const startVoice=()=>{
    if(!recognition){toast.error("Not supported.");return;}
    try{recognition.start();setIsListening(true);}catch{toast.error("Mic permission needed.");}
  };

  useEffect(()=>{
    supabase.auth.getUser().then(({data})=>{
      if(data.user?.user_metadata?.full_name)
        setUserName(data.user.user_metadata.full_name.split(" ")[0]);
    });
  },[]);

  const {data:vendorsData=[],isLoading:vl}=useQuery({queryKey:["vendors"],queryFn:fetchVendors,staleTime:300_000});
  const {data:menuData=[],isLoading:ml}=useQuery({queryKey:["menu-items"],queryFn:fetchMenuItems,staleTime:300_000});

  const {food,beauty,allRaw}=useMemo(()=>{
    const all=menuData.map((item:any)=>({
      id:item.id,name:item.name,description:item.description,price:item.price,
      image:item.image_url||getPImg(item.name),
      vendor:item.vendor?.store_name||"",
      category:item.vendor?.store_category==="beauty"?"beauty":"food",
      options:item.options||[],
    })).filter((p:any)=>isValidName(p.name));
    return{food:all.filter((p:any)=>p.category==="food"),beauty:all.filter((p:any)=>p.category==="beauty"),allRaw:all};
  },[menuData]);

  const loading=vl||ml;
  const allVendors=useMemo(()=>[...vendorsData].sort((a:any,b:any)=>(b.rating||5)-(a.rating||5)),[vendorsData]);

  const vendorsQF=useMemo(()=>{
    let vs=[...allVendors];
    if(activeQF.has("near"))vs.sort((a:any,b:any)=>(parseInt(a.delivery_time)||30)-(parseInt(b.delivery_time)||30));
    else if(activeQF.has("top_rated"))vs.sort((a:any,b:any)=>(b.rating||5)-(a.rating||5));
    else if(activeQF.has("under3k"))vs.sort((a:any,b:any)=>(a.min_price||0)-(b.min_price||0));
    else if(activeQF.has("deals"))vs.sort((a:any,b:any)=>(b.has_promo?1:0)-(a.has_promo?1:0));
    return vs;
  },[allVendors,activeQF]);

  const filteredV=useMemo(()=>{
    let vs=[...vendorsQF];
    if(activePageFilter==="Restaurants")vs=vs.filter(v=>{const c=v.store_category?.toLowerCase();return c==="food"||c==="restaurant";});
    if(filters.rating)vs=vs.filter((v:any)=>(v.rating||5)>=filters.rating!);
    if(filters.time==="Near & Fast")vs=vs.filter((v:any)=>v.delivery_time?parseInt(v.delivery_time)<=30:true);
    vs=vs.filter((v:any)=>(v.min_price||0)<=filters.priceRange[1]);
    return vs;
  },[vendorsQF,filters,activePageFilter]);

  const isSearching=searchQuery.trim().length>0;
  const products=useMemo(()=>{
    const all=[...food,...beauty];
    if(isSearching)return smartSearch(all,searchQuery,["name","description","vendor"]);
    return all;
  },[isSearching,searchQuery,food,beauty]);

  const miraPicks=useMemo(()=>allRaw.length?[...allRaw].sort(()=>0.5-Math.random()).slice(0,4):[]  ,[allRaw]);

  const toggleQF=(id:QF)=>setActiveQF(p=>{const n=new Set(p);n.has(id)?n.delete(id):n.add(id);return n;});

  const handleCatClick=useCallback((catId:string,catName:string)=>{
    const vendorNames=CAT_VENDORS[catId]||[];
    if(vendorNames.length===0){toast.info("Coming soon!");return;}
    if(vendorNames.length===1){
      const vendor=(vendorsData as any[]).find(v=>v.store_name.toLowerCase().trim()===vendorNames[0].toLowerCase().trim());
      if(vendor)navigate(`/vendor/${vendor.id}`);
      else toast.error(`${vendorNames[0]} is not available right now.`);
      return;
    }
    setVendorPickModal({open:true,catLabel:catName,vendorNames});
  },[vendorsData,navigate]);

  const handleSubcatClick=useCallback((catId:string,catName:string)=>{handleCatClick(catId,catName);},[handleCatClick]);

  const handleQuickCat=(catId:string,label:string)=>{
    const mc=CATS.find(c=>c.id===catId);
    if(mc){setActiveCat(mc.id);handleCatClick(mc.id,mc.name);}
    else toast.info(`Exploring ${label}`);
  };

  const banner=BANNERS[bannerIdx];

  if(loading)return(
    <div style={{minHeight:"100vh",display:"flex",alignItems:"center",justifyContent:"center",background:C.cream}}>
      <div style={{textAlign:"center"}}>
        <div style={{width:52,height:52,borderRadius:"50%",border:`4px solid ${C.green100}`,borderTopColor:C.green,animation:"mm-spin 0.8s linear infinite",margin:"0 auto 12px"}}/>
        <p style={{fontSize:13,fontWeight:600,color:C.green}}>Loading your cravings...</p>
      </div>
      <style>{`@keyframes mm-spin{to{transform:rotate(360deg)}}`}</style>
    </div>
  );

  const healthyBottom=cartCount>0
    ?"calc(144px + env(safe-area-inset-bottom, 0px))"
    :"calc(80px + env(safe-area-inset-bottom, 0px))";

  return(
    <div style={{minHeight:"100vh",paddingBottom:"calc(120px + env(safe-area-inset-bottom, 0px))",background:C.cream,overflowX:"hidden"}}>
      <style>{`@keyframes mm-spin{to{transform:rotate(360deg)}}@keyframes mm-fadeup{from{opacity:0;transform:translateY(8px)}to{opacity:1;transform:translateY(0)}}`}</style>
      <SideMenu open={menuOpen} onClose={()=>setMenuOpen(false)}/>

      {/* HEADER */}
      <header style={{position:"sticky",top:0,zIndex:30,background:"rgba(250,253,246,0.97)",backdropFilter:"blur(14px)",borderBottom:`1px solid ${C.border}`,paddingTop:"env(safe-area-inset-top, 0px)"}}>
        <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",padding:"10px 14px"}}>
          <button onClick={()=>setMenuOpen(true)} style={{width:36,height:36,borderRadius:10,background:C.green100,border:"none",display:"flex",alignItems:"center",justifyContent:"center",cursor:"pointer"}}>
            <Menu style={{width:20,height:20,color:C.green}}/>
          </button>
          <MiramoreLogo size="sm"/>
          <div style={{display:"flex",alignItems:"center",gap:8}}>
            <button style={{display:"flex",alignItems:"center",gap:4,fontSize:11,fontWeight:700,padding:"5px 10px",borderRadius:99,background:C.goldLight,color:C.goldDark,border:`1.5px solid ${C.gold}`,cursor:"pointer"}}>
              <MapPin style={{width:12,height:12}}/><span>Lagos</span>
            </button>
            <button onClick={()=>navigate("/cart")} style={{position:"relative",width:36,height:36,borderRadius:10,background:C.green100,border:"none",display:"flex",alignItems:"center",justifyContent:"center",cursor:"pointer"}}>
              <ShoppingCart style={{width:20,height:20,color:C.green}}/>
              {cartCount>0&&(
                <motion.span initial={{scale:0}} animate={{scale:1}} transition={{type:"spring",stiffness:400}}
                  style={{position:"absolute",top:-4,right:-4,width:20,height:20,background:C.gold,color:C.greenDark,fontSize:10,fontWeight:900,borderRadius:"50%",display:"flex",alignItems:"center",justifyContent:"center",boxShadow:`0 2px 8px ${C.gold}80`}}>
                  {cartCount}
                </motion.span>
              )}
            </button>
          </div>
        </div>
      </header>

      {/* SEARCH */}
      <div style={{padding:"10px 14px 4px"}}>
        <div style={{display:"flex",alignItems:"center",padding:"10px 14px",borderRadius:16,background:C.white,border:`1.5px solid ${C.border}`,boxShadow:"0 1px 6px rgba(27,107,47,0.08)"}}>
          <Search style={{width:16,height:16,color:C.green,marginRight:10,flexShrink:0}}/>
          <input type="text" placeholder="Search jollof, suya, hair, shawarma..." value={searchQuery} onChange={e=>setSearchQuery(e.target.value)}
            style={{flex:1,fontSize:13,border:"none",outline:"none",background:"transparent",color:C.text}}/>
          {searchQuery&&<button onClick={()=>setSearchQuery("")} style={{background:"none",border:"none",cursor:"pointer",padding:4}}><X style={{width:14,height:14,color:"#aaa"}}/></button>}
          <button onClick={startVoice} style={{width:32,height:32,borderRadius:10,background:isListening?C.green100:"transparent",border:"none",display:"flex",alignItems:"center",justifyContent:"center",cursor:"pointer"}}>
            <Mic style={{width:16,height:16,color:isListening?C.green:"#bbb"}}/>
          </button>
        </div>
        {isListening&&<p style={{fontSize:10,fontWeight:600,textAlign:"center",marginTop:4,color:C.green}}>Listening...</p>}
        {isSearching&&<p style={{fontSize:10,marginTop:4,paddingLeft:4,color:"#888"}}>{products.length>0?`Found ${products.length} result${products.length!==1?"s":""} for "${searchQuery}"`:`No results for "${searchQuery}"`}</p>}
      </div>

      {/* ─── TOP FILTER TABS — NOW SCROLLABLE ─────────────────────────────────
          Previously these were static flex buttons clipped at 5 visible items.
          Now wrapped in HScroll so user can swipe left to reveal Send, Pharmacies,
          Local Markets. "Shops" renamed to "Beauty Shop". "Send" added before Pharmacies.
      ─────────────────────────────────────────────────────────────────────── */}
      <HScroll style={{marginTop:8,marginBottom:8}} innerPaddingLeft={14} innerPaddingRight={20}>
        {[
          {label:"All",        action:()=>setActivePageFilter("All"),        active:activePageFilter==="All"},
          {label:"Restaurants",action:()=>setActivePageFilter("Restaurants"),active:activePageFilter==="Restaurants"},
          {label:"Beauty Shop",action:()=>navigate("/shops"),                active:false},
          {label:"Send",       action:()=>navigate("/send"),                 active:false},
          {label:"Pharmacies", action:()=>navigate("/pharmacies"),           active:false},
          {label:"Local Markets",action:()=>navigate("/local-markets"),      active:false},
        ].map(item=>(
          <button key={item.label} onClick={item.action}
            style={{
              fontSize:15,
              fontWeight:item.active?800:500,
              color:item.active?C.green:"#666",
              paddingBottom:4,
              paddingRight:20,
              background:"transparent",
              border:"none",
              borderBottom:`2.5px solid ${item.active?C.green:"transparent"}`,
              cursor:"pointer",
              whiteSpace:"nowrap",
              flexShrink:0,
            }}>
            {item.label}
          </button>
        ))}
      </HScroll>

      {/* QUICK PILLS */}
      <HScroll style={{marginBottom:16}} innerPaddingLeft={14} innerPaddingRight={14}>
        {QUICK_CATEGORIES.map((cat,idx)=>(
          <button key={idx} onClick={()=>handleQuickCat(cat.id,cat.label)}
            style={{display:"flex",alignItems:"center",gap:6,background:C.white,border:`1px solid ${C.border}`,borderRadius:40,padding:"8px 14px",marginRight:10,fontSize:12,fontWeight:600,color:C.text,cursor:"pointer",whiteSpace:"nowrap"}}>
            <span>{cat.emoji}</span><span>{cat.label}</span>
          </button>
        ))}
      </HScroll>

      {/* BANNER */}
      <div style={{padding:"0 14px"}}>
        <div style={{borderRadius:20,overflow:"hidden",boxShadow:"0 6px 28px rgba(0,0,0,0.22)",position:"relative",height:168}} onTouchStart={()=>setBannerPaused(true)} onTouchEnd={()=>setBannerPaused(false)}>
          <AnimatePresence mode="wait">
            <motion.div key={banner.id} initial={{opacity:0,x:40}} animate={{opacity:1,x:0}} exit={{opacity:0,x:-40}} transition={{duration:0.3,ease:"easeInOut"}}
              style={{position:"absolute",inset:0,background:banner.bg,display:"flex",flexDirection:"column",justifyContent:"space-between",padding:"14px 16px 14px"}}>
              <svg style={{position:"absolute",inset:0,width:"100%",height:"100%",opacity:0.05,pointerEvents:"none"}}>
                <defs><pattern id={`pp-${banner.id}`} x="0" y="0" width="16" height="16" patternUnits="userSpaceOnUse"><circle cx="2" cy="2" r="1.2" fill="white"/></pattern></defs>
                <rect width="100%" height="100%" fill={`url(#pp-${banner.id})`}/>
              </svg>
              <div style={{position:"absolute",right:0,top:0,width:90,height:90,background:`radial-gradient(circle,${banner.accent}50 0%,transparent 70%)`,filter:"blur(18px)",pointerEvents:"none"}}/>
              <div style={{position:"absolute",right:16,top:"50%",transform:"translateY(-50%)",fontSize:52,opacity:0.18,pointerEvents:"none",userSelect:"none",filter:"drop-shadow(0 3px 8px rgba(0,0,0,0.25))"}}>{banner.topDeco}</div>
              <div style={{position:"relative",zIndex:2,maxWidth:"72%"}}>
                <div style={{display:"inline-flex",alignItems:"center",borderRadius:99,padding:"3px 10px",marginBottom:8,background:`${banner.accent}20`,border:`1px solid ${banner.accent}50`}}>
                  <span style={{fontSize:10,fontWeight:800,color:banner.accent,letterSpacing:"0.02em"}}>{banner.badge}</span>
                </div>
                <p style={{color:"#FFFFFF",fontWeight:900,fontSize:18,lineHeight:1.15,margin:0,textShadow:"0 1px 6px rgba(0,0,0,0.4)"}}>{banner.title}</p>
                <p style={{color:banner.accent,fontWeight:700,fontSize:13,lineHeight:1.3,margin:"3px 0 6px",textShadow:"0 1px 4px rgba(0,0,0,0.3)"}}>{banner.sub}</p>
                <p style={{color:"rgba(255,255,255,0.82)",fontSize:11,lineHeight:1.55,margin:0,textShadow:"0 1px 3px rgba(0,0,0,0.3)"}}>{banner.desc}</p>
              </div>
              <motion.button whileTap={{scale:0.92}}
                onClick={()=>{if(banner.action)setSendFoodOpen(true);else if(banner.route)navigate(banner.route);}}
                style={{alignSelf:"flex-start",padding:"7px 16px",borderRadius:10,background:banner.accent,color:"#1B2A00",fontWeight:900,fontSize:12,border:"none",cursor:"pointer",boxShadow:`0 3px 12px ${banner.accent}60`,position:"relative",zIndex:2}}>
                {banner.cta}
              </motion.button>
            </motion.div>
          </AnimatePresence>
        </div>
        <div style={{display:"flex",justifyContent:"center",gap:5,marginTop:8}}>
          {BANNERS.map((_,i)=>(
            <button key={i} onClick={()=>setBannerIdx(i)} style={{height:5,width:i===bannerIdx?18:5,borderRadius:99,background:i===bannerIdx?C.green:C.border,border:"none",cursor:"pointer",padding:0,transition:"all 0.3s ease"}}/>
          ))}
        </div>
      </div>

      {/* GREETING — FIX: removed broken unicode wave, use plain text greeting only */}
      <div style={{padding:"14px 14px 0"}}>
        <div style={{marginBottom:10}}>
          <p style={{fontSize:11,fontWeight:500,color:"#999",margin:0}}>{getGreeting()}</p>
          <h2 style={{fontSize:16,fontWeight:900,color:C.text,margin:0}}>{userName?`${userName}!`:"Foodie!"}</h2>
        </div>
        <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:10}}>
          <h2 style={{fontSize:14,fontWeight:900,color:C.text,margin:0}}>Categories</h2>
          <span style={{fontSize:10,fontWeight:600,padding:"2px 8px",borderRadius:99,background:C.green100,color:C.green}}>All {CATS.length}</span>
        </div>
      </div>

      {/* CATEGORY SCROLL */}
      <HScroll style={{marginBottom:16}} innerPaddingLeft={14} innerPaddingRight={20}>
        {CATS.map(cat=>{
          const isActive=activeCat===cat.id;
          return(
            <button key={cat.id}
              onClick={()=>{setActiveCat(cat.id);handleCatClick(cat.id,cat.name);}}
              style={{
                display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",
                flexShrink:0,width:76,marginRight:10,padding:"8px 4px",
                borderRadius:16,
                background:isActive?C.green100:C.white,
                border:`1.5px solid ${isActive?C.green:C.border}`,
                cursor:"pointer",transition:"all 0.2s ease",
                WebkitTapHighlightColor:"transparent",
              }}>
              <div style={{width:52,height:52,borderRadius:26,overflow:"hidden",background:C.green50,display:"flex",alignItems:"center",justifyContent:"center"}}>
                <img src={cat.img} alt={cat.name} style={{width:"100%",height:"100%",objectFit:"cover"}} loading="lazy"
                  onError={e=>{(e.target as HTMLImageElement).style.display="none";}}/>
              </div>
              <span style={{fontSize:10,fontWeight:isActive?800:600,color:isActive?C.green:"#444",marginTop:6,whiteSpace:"nowrap",display:"block",maxWidth:72,overflow:"hidden",textOverflow:"ellipsis",textAlign:"center"}}>
                {cat.emoji} {cat.name}
              </span>
            </button>
          );
        })}
      </HScroll>

      {/* REST OF CONTENT */}
      <div style={{padding:"0 14px"}}>
        {CAT_SUBCATS[activeCat]?.length>0&&(
          <HScroll style={{marginBottom:14}} innerPaddingLeft={0} innerPaddingRight={14}>
            {CAT_SUBCATS[activeCat].map(sub=>(
              <button key={sub} onClick={()=>handleSubcatClick(activeCat,CATS.find(c=>c.id===activeCat)?.name||sub)}
                style={{fontSize:11,fontWeight:600,whiteSpace:"nowrap",padding:"7px 14px",borderRadius:99,marginRight:8,background:C.white,border:`1.5px solid ${C.border}`,color:"#444",cursor:"pointer",boxShadow:"0 1px 4px rgba(0,0,0,0.06)"}}>
                {sub}
              </button>
            ))}
          </HScroll>
        )}

        <HScroll style={{marginBottom:14}} innerPaddingLeft={0} innerPaddingRight={14}>
          {QFS.map(({id,label,bg})=>{
            const on=activeQF.has(id);
            return(
              <button key={id} onClick={()=>toggleQF(id)}
                style={{padding:"8px 14px",borderRadius:12,fontSize:12,fontWeight:700,marginRight:8,cursor:"pointer",background:on?bg:C.white,color:on?"#fff":"#444",border:`1.5px solid ${on?bg:C.border}`,boxShadow:on?`0 2px 10px ${bg}50`:"0 1px 4px rgba(0,0,0,0.05)",transition:"all 0.18s ease",whiteSpace:"nowrap"}}>
                {label}
              </button>
            );
          })}
          <button onClick={()=>setShowFilterModal(true)}
            style={{padding:"8px 12px",borderRadius:12,fontSize:12,fontWeight:700,cursor:"pointer",background:C.green100,color:C.green,border:`1.5px solid ${C.border}`,display:"flex",alignItems:"center",gap:5,whiteSpace:"nowrap"}}>
            <Filter style={{width:12,height:12}}/> More
          </button>
        </HScroll>

        <AnimatePresence>
          {activeQF.size>0&&(
            <motion.div initial={{opacity:0,height:0}} animate={{opacity:1,height:"auto"}} exit={{opacity:0,height:0}}
              style={{background:C.green100,border:`1px solid ${C.border}`,borderRadius:12,padding:"8px 12px",display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:14,overflow:"hidden"}}>
              <span style={{fontSize:11,fontWeight:600,color:C.green,display:"flex",alignItems:"center",gap:5}}>
                <CheckCircle2 style={{width:14,height:14}}/>
                {activeQF.size} filter{activeQF.size>1?"s":""} active — {filteredV.length} vendors
              </span>
              <button onClick={()=>setActiveQF(new Set())} style={{fontSize:10,fontWeight:700,color:C.green,background:"none",border:"none",cursor:"pointer",textDecoration:"underline"}}>Clear</button>
            </motion.div>
          )}
        </AnimatePresence>

        <section style={{marginBottom:24}}>
          <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:12}}>
            <h2 style={{fontSize:14,fontWeight:900,color:C.text,margin:0,display:"flex",alignItems:"center",gap:6}}>
              <TrendingUp style={{width:16,height:16,color:C.green}}/>
              {activeQF.has("near")?"Fastest Near You":activeQF.has("top_rated")?"Top Rated":activeQF.has("under3k")?"Budget Picks":activeQF.has("deals")?"Best Deals":activeQF.has("healthy")?"Healthy Options":"RECOMMENDED FOR YOU"}
            </h2>
            <span style={{fontSize:10,fontWeight:600,padding:"2px 8px",borderRadius:99,background:C.green100,color:C.green}}>{filteredV.length} vendors</span>
          </div>
          <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10}}>
            {filteredV.map((v:any,i:number)=>(
              <VendorCard key={v.id} vendor={v} index={i} onClick={()=>navigate(`/vendor/${v.id}`)}/>
            ))}
          </div>
        </section>

        <section style={{marginBottom:24}}>
          <h2 style={{fontSize:14,fontWeight:900,color:C.text,marginBottom:12}}>EXPLORE MORE</h2>
          <div style={{display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:10}}>
            {EXPLORE.map((item,idx)=>(
              <button key={idx} onClick={()=>{if(item.action)setSendFoodOpen(true);else if(item.route)navigate(item.route);}}
                style={{display:"flex",flexDirection:"column",alignItems:"center",padding:"14px 8px",gap:8,borderRadius:16,background:C.white,border:`1.5px solid ${C.border}`,cursor:"pointer",minHeight:88,boxShadow:`0 2px 8px rgba(27,107,47,0.07)`}}>
                <div style={{width:44,height:44,borderRadius:12,display:"flex",alignItems:"center",justifyContent:"center",background:item.bg,boxShadow:`0 3px 10px ${item.bg}50`}}>
                  <span style={{fontSize:20}}>{item.emoji}</span>
                </div>
                <span style={{fontSize:11,fontWeight:700,textAlign:"center",lineHeight:1.3,color:"#444"}}>{item.label}</span>
              </button>
            ))}
          </div>
        </section>

        <section style={{marginBottom:24}}>
          <div style={{display:"flex",alignItems:"center",gap:8,marginBottom:12}}>
            <div style={{width:28,height:28,borderRadius:10,background:C.green,display:"flex",alignItems:"center",justifyContent:"center"}}><MapPin style={{width:14,height:14,color:"#fff"}}/></div>
            <h3 style={{fontSize:14,fontWeight:900,color:C.text,margin:0}}>Popular Near You</h3>
          </div>
          <div style={{display:"flex",flexDirection:"column",gap:8}}>
            {filteredV.slice(0,5).map((v:any)=>(
              <div key={v.id} onClick={()=>navigate(`/vendor/${v.id}`)}
                style={{display:"flex",alignItems:"center",gap:12,padding:12,borderRadius:16,background:C.white,border:`1.5px solid ${C.border}`,cursor:"pointer",boxShadow:"0 2px 8px rgba(27,107,47,0.07)"}}>
                <div style={{width:48,height:48,borderRadius:12,overflow:"hidden",flexShrink:0,background:C.green50}}><VendorImg url={v.store_logo_url} name={v.store_name}/></div>
                <div style={{flex:1,minWidth:0}}>
                  <h4 style={{fontWeight:700,fontSize:13,color:C.text,margin:0,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{v.store_name}</h4>
                  <div style={{display:"flex",alignItems:"center",gap:6,fontSize:11,color:"#888",marginTop:3}}>
                    <Star style={{width:12,height:12,fill:C.gold,color:C.gold}}/><span style={{fontWeight:600,color:"#555"}}>{v.rating||5.0}</span>
                    <span style={{color:"#ddd"}}>•</span><Clock style={{width:12,height:12}}/><span>5–10 min</span>
                    <span style={{color:"#ddd"}}>•</span><span>From {formatPrice(v.min_price||1350)}</span>
                  </div>
                </div>
                {v.has_promo&&<span style={{fontSize:9,fontWeight:700,padding:"3px 7px",borderRadius:99,background:C.goldLight,color:C.goldDark,border:`1px solid ${C.gold}60`,flexShrink:0}}>{v.promo_text||"Free delivery"}</span>}
              </div>
            ))}
          </div>
        </section>

        {miraPicks.length>0&&(
          <section style={{marginBottom:24}}>
            <div style={{display:"flex",alignItems:"center",gap:8,marginBottom:12}}>
              <div style={{width:28,height:28,borderRadius:10,background:C.green,display:"flex",alignItems:"center",justifyContent:"center"}}><Sparkles style={{width:14,height:14,color:"#fff"}}/></div>
              <h3 style={{fontSize:14,fontWeight:900,color:C.text,margin:0}}>Mira Picks for You</h3>
              <span style={{fontSize:9,fontWeight:700,padding:"2px 7px",borderRadius:99,background:C.goldLight,color:C.goldDark,border:`1px solid ${C.gold}60`}}>AI Curated</span>
            </div>
            <HScroll innerPaddingLeft={0} innerPaddingRight={14}>
              {miraPicks.map((item:any,i:number)=>(
                <div key={item.id} style={{minWidth:138,flexShrink:0,marginRight:10}}>
                  <ProductCard product={item} index={i} showVendor={true} onClick={()=>setSelectedProduct(item)}/>
                </div>
              ))}
            </HScroll>
          </section>
        )}

        <TodayObsession/>

        {allVendors.length>0&&(
          <section style={{marginBottom:24}}>
            <div style={{display:"flex",alignItems:"center",gap:8,marginBottom:12}}>
              <div style={{width:28,height:28,borderRadius:10,background:`linear-gradient(135deg,${C.green},${C.goldDark})`,display:"flex",alignItems:"center",justifyContent:"center"}}><Flame style={{width:14,height:14,color:"#fff"}}/></div>
              <div><h3 style={{fontSize:14,fontWeight:900,color:C.text,margin:0}}>Today's Hot Picks</h3><p style={{fontSize:10,color:"#aaa",margin:0}}>All vendors, one place</p></div>
            </div>
            <div style={{display:"flex",flexDirection:"column",gap:8}}>
              {allVendors.slice(0,5).map((v:any)=>(
                <div key={v.id} onClick={()=>navigate(`/vendor/${v.id}`)}
                  style={{display:"flex",alignItems:"flex-start",gap:12,padding:12,borderRadius:16,background:C.white,border:`1.5px solid ${C.border}`,cursor:"pointer",boxShadow:"0 2px 8px rgba(27,107,47,0.07)"}}>
                  <div style={{width:56,height:56,borderRadius:12,overflow:"hidden",flexShrink:0,background:C.green50}}><VendorImg url={v.store_logo_url} name={v.store_name}/></div>
                  <div style={{flex:1,minWidth:0}}>
                    <h3 style={{fontWeight:900,fontSize:13,color:C.text,margin:0,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{v.store_name}</h3>
                    <div style={{display:"flex",alignItems:"center",flexWrap:"wrap",gap:5,fontSize:10,color:"#888",marginTop:4}}>
                      <Star style={{width:11,height:11,fill:C.gold,color:C.gold}}/><span style={{fontWeight:700,color:"#555"}}>{v.rating||5.0}</span>
                      <span style={{color:"#ddd"}}>•</span><span>From {formatPrice(v.min_price||1350)}</span>
                      <span style={{color:"#ddd"}}>•</span><Clock style={{width:10,height:10}}/><span>5–10 min</span>
                    </div>
                    <span style={{display:"inline-flex",alignItems:"center",gap:4,marginTop:6,fontSize:10,fontWeight:700,padding:"2px 8px",borderRadius:99,background:C.goldLight,color:C.goldDark,border:`1px solid ${C.gold}50`}}>Free delivery</span>
                  </div>
                  <ChevronRight style={{width:16,height:16,color:"#ccc",flexShrink:0,marginTop:4}}/>
                </div>
              ))}
            </div>
          </section>
        )}

        <section style={{marginBottom:24}}>
          <h2 style={{fontSize:14,fontWeight:900,color:C.text,marginBottom:12}}>{isSearching?`Search: "${searchQuery}"`:"Popular Items"}</h2>
          {products.length===0
            ?<div style={{textAlign:"center",padding:"40px 20px",background:C.white,borderRadius:16,border:`1.5px solid ${C.border}`}}>
               <p style={{fontSize:32,margin:"0 0 8px"}}>🍽️</p>
               <p style={{fontSize:13,fontWeight:500,color:"#888",margin:0}}>{isSearching?`Nothing found for "${searchQuery}"`:"No products found"}</p>
             </div>
            :<div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10}}>
               {products.map((p:any,i:number)=>(
                 <ProductCard key={p.id} product={p} index={i} showVendor={isSearching} onClick={()=>setSelectedProduct(p)}/>
               ))}
             </div>
          }
        </section>

        <div style={{textAlign:"center",padding:"16px 0 8px"}}>
          <p style={{fontSize:11,fontWeight:600,color:C.green,margin:0}}>"Send love. Send food." 💚</p>
        </div>
      </div>

      <BottomNav/>

      {/* CART FAB */}
      <AnimatePresence>
        {cartCount>0&&(
          <motion.button initial={{scale:0,y:20}} animate={{scale:1,y:0}} exit={{scale:0,y:20}} whileTap={{scale:0.95}}
            onClick={()=>navigate("/cart")}
            style={{position:"fixed",bottom:"calc(80px + env(safe-area-inset-bottom, 0px))",right:14,zIndex:50,display:"flex",alignItems:"center",gap:8,padding:"10px 18px",borderRadius:99,background:C.green,color:"#fff",fontWeight:900,fontSize:12,border:"none",cursor:"pointer",boxShadow:`0 4px 20px ${C.green}60`}}>
            <ShoppingCart style={{width:14,height:14}}/>Cart ({cartCount})
          </motion.button>
        )}
      </AnimatePresence>

      {/* HEALTHY FAB */}
      <motion.button
        animate={{bottom:healthyBottom}}
        transition={{type:"spring",stiffness:300,damping:28}}
        onClick={()=>setShowHealthy(true)}
        style={{position:"fixed",right:14,zIndex:50,width:56,height:56,borderRadius:28,background:`linear-gradient(135deg,${C.green},${C.greenMid})`,border:"none",cursor:"pointer",display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",boxShadow:`0 6px 20px ${C.green}80`}}
        onTouchStart={e=>{e.currentTarget.style.transform="scale(0.94)";}}
        onTouchEnd={e=>{e.currentTarget.style.transform="scale(1)";}}
      >
        <Leaf style={{width:20,height:20,color:"#fff"}}/>
        <span style={{fontSize:8,color:"#fff",fontWeight:900,marginTop:2}}>Healthy</span>
      </motion.button>

      <WhatsAppButton/>

      {/* VENDOR PICK MODAL */}
      <AnimatePresence>
        {vendorPickModal.open&&(
          <motion.div initial={{opacity:0}} animate={{opacity:1}} exit={{opacity:0}}
            style={{position:"fixed",inset:0,zIndex:60,background:"rgba(0,0,0,0.55)",display:"flex",alignItems:"flex-end",justifyContent:"center"}}
            onClick={()=>setVendorPickModal({...vendorPickModal,open:false})}>
            <motion.div initial={{y:"100%"}} animate={{y:0}} exit={{y:"100%"}} transition={{type:"spring",damping:28}}
              style={{width:"100%",maxWidth:480,background:C.white,borderRadius:"20px 20px 0 0",padding:"20px 16px",paddingBottom:"calc(32px + env(safe-area-inset-bottom, 0px))"}}
              onClick={e=>e.stopPropagation()}>
              <div style={{width:36,height:4,borderRadius:99,background:"#ddd",margin:"0 auto 16px"}}/>
              <h3 style={{fontSize:15,fontWeight:900,color:C.text,marginBottom:4,textAlign:"center"}}>{vendorPickModal.catLabel}</h3>
              <p style={{fontSize:12,color:"#888",textAlign:"center",marginBottom:18}}>Choose a vendor to browse their menu</p>
              <div style={{display:"flex",flexDirection:"column",gap:10}}>
                {vendorPickModal.vendorNames.map(vName=>{
                  const vendor=(vendorsData as any[]).find(v=>v.store_name.toLowerCase().trim()===vName.toLowerCase().trim());
                  return(
                    <button key={vName} onClick={()=>{setVendorPickModal({...vendorPickModal,open:false});if(vendor)navigate(`/vendor/${vendor.id}`);else toast.error(`${vName} is not available right now.`);}}
                      style={{display:"flex",alignItems:"center",gap:12,padding:12,borderRadius:16,background:C.green50,border:`1.5px solid ${C.border}`,cursor:"pointer",textAlign:"left"}}>
                      <div style={{width:48,height:48,borderRadius:12,overflow:"hidden",flexShrink:0,background:C.white}}><VendorImg url={vendor?.store_logo_url||null} name={vName}/></div>
                      <div style={{flex:1}}>
                        <p style={{fontWeight:800,fontSize:13,color:C.text,margin:0}}>{vName}</p>
                        {vendor&&<div style={{display:"flex",alignItems:"center",gap:5,fontSize:11,color:"#888",marginTop:3}}><Star style={{width:11,height:11,fill:C.gold,color:C.gold}}/><span style={{fontWeight:600,color:"#555"}}>{vendor.rating||5.0}</span><span style={{color:"#ddd"}}>•</span><span>5–10 min</span></div>}
                      </div>
                      <ChevronRight style={{width:16,height:16,color:C.green,flexShrink:0}}/>
                    </button>
                  );
                })}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* HEALTHY MODAL */}
      <AnimatePresence>
        {showHealthy&&(
          <motion.div initial={{opacity:0}} animate={{opacity:1}} exit={{opacity:0}}
            style={{position:"fixed",inset:0,zIndex:50,background:"rgba(0,0,0,0.5)",display:"flex",alignItems:"center",justifyContent:"center"}}
            onClick={()=>setShowHealthy(false)}>
            <motion.div initial={{scale:0.9,opacity:0}} animate={{scale:1,opacity:1}} exit={{scale:0.9,opacity:0}}
              style={{width:"90%",maxWidth:340,background:C.white,borderRadius:20,padding:20}}
              onClick={e=>e.stopPropagation()}>
              <div style={{textAlign:"center",marginBottom:16}}>
                <div style={{width:56,height:56,borderRadius:16,background:C.green100,display:"flex",alignItems:"center",justifyContent:"center",margin:"0 auto 12px"}}><Leaf style={{width:28,height:28,color:C.green}}/></div>
                <h3 style={{fontSize:15,fontWeight:900,color:C.text,margin:"0 0 4px"}}>Miramore Fit Feast Challenge 💚</h3>
                <p style={{fontSize:12,color:"#888",margin:0}}>Order 4 healthy meals — get a FREE meal!</p>
              </div>
              <div style={{background:C.green50,border:`1px solid ${C.border}`,borderRadius:12,padding:12,marginBottom:14}}>
                <div style={{display:"flex",justifyContent:"space-between",marginBottom:6}}>
                  <span style={{fontSize:11,fontWeight:700,color:C.green}}>Your progress</span>
                  <span style={{fontSize:11,fontWeight:700,color:C.green}}>0 / 4</span>
                </div>
                <div style={{height:8,borderRadius:99,background:C.green100}}><div style={{height:8,borderRadius:99,width:0,background:C.green}}/></div>
              </div>
              <button onClick={()=>{setShowHealthy(false);navigate("/healthy-challenge");}}
                style={{width:"100%",padding:"12px 0",borderRadius:12,fontSize:13,fontWeight:900,color:"#fff",background:`linear-gradient(135deg,${C.green},${C.greenMid})`,border:"none",cursor:"pointer",boxShadow:`0 4px 16px ${C.green}50`}}>
                Start My Naija Fit Journey 🇳🇬
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* FILTER MODAL */}
      <AnimatePresence>
        {showFilterModal&&(
          <motion.div initial={{opacity:0}} animate={{opacity:1}} exit={{opacity:0}}
            style={{position:"fixed",inset:0,zIndex:50,background:"rgba(0,0,0,0.5)"}}
            onClick={()=>setShowFilterModal(false)}>
            <motion.div initial={{y:"100%"}} animate={{y:0}} exit={{y:"100%"}} transition={{type:"spring",damping:28}}
              style={{position:"absolute",bottom:0,left:0,right:0,background:C.white,borderRadius:"20px 20px 0 0",height:"85vh",display:"flex",flexDirection:"column"}}
              onClick={e=>e.stopPropagation()}>
              <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",padding:"16px",borderBottom:`1px solid ${C.border}`}}>
                <h3 style={{fontWeight:900,color:C.text,margin:0}}>Advanced Filters</h3>
                <button onClick={()=>setShowFilterModal(false)} style={{width:28,height:28,borderRadius:"50%",background:C.green100,border:"none",display:"flex",alignItems:"center",justifyContent:"center",cursor:"pointer"}}><X style={{width:14,height:14,color:C.green}}/></button>
              </div>
              <div style={{display:"flex",flex:1,overflow:"hidden"}}>
                <div style={{width:"33%",background:C.green50,borderRight:`1px solid ${C.border}`}}>
                  {FT.map(tab=>(
                    <button key={tab} onClick={()=>setFilterTab(tab)}
                      style={{width:"100%",textAlign:"left",padding:"12px",fontSize:12,fontWeight:700,background:filterTab===tab?C.white:"transparent",color:filterTab===tab?C.green:"#666",borderLeft:filterTab===tab?`4px solid ${C.green}`:"4px solid transparent",border:"none",cursor:"pointer"}}>
                      {tab}
                    </button>
                  ))}
                </div>
                <div style={{flex:1,padding:12,overflowY:"auto"}}>
                  {filterTab==="Sort By"&&SORT_O.map(o=><button key={o} onClick={()=>setFilters({...filters,sortBy:o})} style={{display:"block",width:"100%",padding:"10px 12px",marginBottom:4,borderRadius:10,textAlign:"left",fontSize:12,fontWeight:700,background:filters.sortBy===o?C.green100:"transparent",color:filters.sortBy===o?C.green:"#555",border:"none",cursor:"pointer"}}>{o}</button>)}
                  {filterTab==="Time"&&TIME_O.map(o=><button key={o} onClick={()=>setFilters({...filters,time:o})} style={{display:"block",width:"100%",padding:"10px 12px",marginBottom:4,borderRadius:10,textAlign:"left",fontSize:12,fontWeight:700,background:filters.time===o?C.green100:"transparent",color:filters.time===o?C.green:"#555",border:"none",cursor:"pointer"}}>{o}</button>)}
                  {filterTab==="Rating"&&RAT_O.map(o=><button key={o} onClick={()=>setFilters({...filters,rating:o==="3.5+"?3.5:4.0})} style={{display:"block",width:"100%",padding:"10px 12px",marginBottom:4,borderRadius:10,textAlign:"left",fontSize:12,fontWeight:700,background:filters.rating===(o==="3.5+"?3.5:4.0)?C.green100:"transparent",color:filters.rating===(o==="3.5+"?3.5:4.0)?C.green:"#555",border:"none",cursor:"pointer"}}>{o}</button>)}
                  {filterTab==="Offers"&&OFFER_O.map(o=><label key={o} style={{display:"flex",alignItems:"center",gap:8,padding:"10px 0",fontSize:12,cursor:"pointer"}}><input type="checkbox" checked={filters.offers.includes(o)} onChange={e=>setFilters({...filters,offers:e.target.checked?[...filters.offers,o]:filters.offers.filter(x=>x!==o)})} style={{accentColor:C.green}}/><span style={{fontWeight:500,color:"#555"}}>{o}</span></label>)}
                  {filterTab==="Price"&&<div><p style={{fontSize:12,fontWeight:700,color:"#555",marginBottom:8}}>Max: {formatPrice(filters.priceRange[1])}</p><input type="range" min="0" max="50000" step="1000" value={filters.priceRange[1]} onChange={e=>setFilters({...filters,priceRange:[0,+e.target.value]})} style={{width:"100%",accentColor:C.green}}/></div>}
                  {filterTab==="Trust"&&TRUST_O.map(o=><label key={o} style={{display:"flex",alignItems:"center",gap:8,padding:"10px 0",fontSize:12,cursor:"pointer"}}><input type="checkbox" checked={filters.trust.includes(o)} onChange={e=>setFilters({...filters,trust:e.target.checked?[...filters.trust,o]:filters.trust.filter(x=>x!==o)})} style={{accentColor:C.green}}/><span style={{fontWeight:500,color:"#555"}}>{o}</span></label>)}
                </div>
              </div>
              <div style={{padding:12,borderTop:`1px solid ${C.border}`,display:"flex",gap:10,paddingBottom:"calc(12px + env(safe-area-inset-bottom, 0px))"}}>
                <button onClick={()=>{setFilters({sortBy:"Relevance",time:null,rating:null,offers:[],priceRange:[0,50000],trust:[]});setShowFilterModal(false);}} style={{flex:1,padding:"10px 0",borderRadius:12,fontSize:12,fontWeight:900,background:C.green100,color:C.green,border:"none",cursor:"pointer"}}>Reset All</button>
                <button onClick={()=>setShowFilterModal(false)} style={{flex:1,padding:"10px 0",borderRadius:12,fontSize:12,fontWeight:900,background:C.green,color:"#fff",border:"none",cursor:"pointer"}}>Apply</button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <ShareSoftLifeModal open={sendFoodOpen} onOpenChange={setSendFoodOpen}/>
      <ProductDetailModal product={selectedProduct} open={!!selectedProduct} onClose={()=>setSelectedProduct(null)} proteinAddons={proteinAddons} packagingOptions={packagingOptions} soupIds={soupIds}/>
    </div>
  );
};

export default Home;