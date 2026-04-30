import { Home, Search, ShoppingBag, MessageCircle, User, Sparkles } from "lucide-react";
import { useLocation, useNavigate } from "react-router-dom";
import { cn } from "@/lib/utils";
import { useEffect, useState } from "react";

const tabs = [
  { label: "Home", icon: Home, path: "/home" },
  { label: "Search", icon: Search, path: "/home?search=1" },
  { label: "Orders", icon: ShoppingBag, path: "/orders" },
  { label: "MiraAI", icon: Sparkles, path: "/mira-ai" },
  { label: "Profile", icon: User, path: "/profile" },
];

const BottomNav = () => {
  const location = useLocation();
  const navigate = useNavigate();
  
  // State for Android safe area bottom padding
  const [safeBottomPadding, setSafeBottomPadding] = useState(0);

  useEffect(() => {
    // Detect if running on Android
    const isAndroid = /android/i.test(navigator.userAgent);
    
    if (isAndroid) {
      // Get safe area inset from CSS environment variable
      const getSafeArea = () => {
        const style = getComputedStyle(document.documentElement);
        const safeAreaBottom = style.getPropertyValue('env(safe-area-inset-bottom)');
        
        if (safeAreaBottom && safeAreaBottom !== '0px') {
          // Convert to number (remove 'px')
          const bottomPadding = parseInt(safeAreaBottom, 10);
          setSafeBottomPadding(bottomPadding);
        } else {
          // Fallback for devices without safe area reporting
          // Typical gesture bar height on Android is about 16-20px
          setSafeBottomPadding(20);
        }
      };
      
      getSafeArea();
      
      // Also listen for resize events (in case orientation changes)
      window.addEventListener('resize', getSafeArea);
      return () => window.removeEventListener('resize', getSafeArea);
    }
  }, []);

  const isActive = (path: string) => {
    if (path === "/home") {
      return location.pathname === "/home" && !location.search.includes("search");
    }
    if (path === "/home?search=1") {
      return location.pathname === "/home" && location.search.includes("search");
    }
    return location.pathname === path;
  };

  return (
    <nav 
      className="fixed bottom-0 left-0 right-0 bg-white border-t border-brand-green-soft/50 z-40 shadow-[0_-4px_20px_rgba(0,0,0,0.04)]"
      style={{ 
        paddingBottom: safeBottomPadding > 0 ? `${safeBottomPadding}px` : 'env(safe-area-inset-bottom)',
      }}
    >
      <div className="flex items-center justify-around h-16 max-w-lg mx-auto px-2">
        {tabs.map((tab) => {
          const active = isActive(tab.path);
          return (
            <button
              key={tab.label}
              onClick={() => navigate(tab.path)}
              className={cn(
                "relative flex flex-col items-center justify-center gap-0.5 py-1 transition-all duration-200 active:scale-95 min-w-[56px] min-h-[48px] rounded-2xl",
                active
                  ? "text-brand-green"
                  : "text-gray-400 hover:text-brand-green/70"
              )}
            >
              {/* Active pill indicator - Green */}
              {active && (
                <div className="absolute -top-1 left-1/2 -translate-x-1/2 w-8 h-1 bg-brand-green rounded-full shadow-sm animate-fade-in-up" />
              )}
              
              {/* Icon with brand colors */}
              <tab.icon 
                className={cn(
                  "w-5 h-5 transition-all duration-300",
                  active && "scale-110 drop-shadow-md text-brand-green"
                )} 
                strokeWidth={active ? 2.5 : 1.8}
                fill={active ? "none" : "none"}
              />
              
              {/* Label with brand colors */}
              <span className={cn(
                "text-[11px] font-medium transition-all duration-200",
                active ? "font-bold text-brand-green" : "text-gray-400"
              )}>
                {tab.label}
              </span>
              
              {/* Subtle background pulse on active - Green glow */}
              {active && (
                <div className="absolute inset-0 -z-10 bg-brand-green-light/30 rounded-2xl animate-pulse-gentle" />
              )}
            </button>
          );
        })}
      </div>
      
      {/* Decorative gradient line at top of nav */}
      <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-brand-green/30 to-transparent" />
    </nav>
  );
};

export default BottomNav;