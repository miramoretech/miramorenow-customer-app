import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { useAndroidBackButton } from "@/hooks/useAndroidBackButton";
import { useCapacitorPushNotifications, isPushSupported, getPushPlatform } from "@/hooks/useCapacitorPushNotifications";
import { supabase } from "@/lib/supabase";
import { useEffect, useState } from "react";
import { Capacitor } from "@capacitor/core";

// Import all your pages (keep as they were)
import Index from "./pages/Index";
import Splash from "./pages/Splash";
import WelcomeScreen from "./pages/WelcomeScreen";
import Welcome from "./pages/Welcome";
import OnboardingPhoneLogin from "./pages/OnboardingPhoneLogin";
import OnboardingEmail from "./pages/OnboardingEmail";
import OnboardingPhone from "./pages/OnboardingPhone";
import OnboardingPassword from "./pages/OnboardingPassword";
import OnboardingLocation from "./pages/OnboardingLocation";
import OnboardingNotifications from "./pages/OnboardingNotifications";
import Location from "./pages/Location";
import Home from "./pages/Home";
import VendorDetail from "./pages/VendorDetail";
import Orders from "./pages/Orders";
import WalletPage from "./pages/WalletPage";
import Profile from "./pages/Profile";
import Cart from "./pages/Cart";
import OrderSuccess from "./pages/OrderSuccess";
import OrderTracking from "./pages/OrderTracking";
import Rewards from "./pages/Rewards";
import Signup from "./pages/Signup";
import Login from "./pages/Login";
import InviteFriend from "./pages/InviteFriend";
import Settings from "./pages/Settings";
import Support from "./pages/Support";
import NotFound from "./pages/NotFound";
import MiraAIPage from "./pages/MiraAIPage";
import GiftCards from "./pages/GiftCards";
import GiftCardSuccess from "./pages/GiftCardSuccess";
import PlanAParty from "./pages/PlanAParty";
import Offers from "./pages/Offers";
import Collections from "./pages/Collections";
import CollectionDetail from "./pages/CollectionDetail";
import PlayAndWin from "./pages/PlayAndWin";
import HealthyChallenge from "./pages/HealthyChallenge";

// NEW page imports for shops, pharmacies, local markets
import ShopPage from "./pages/ShopPage";
import PharmaciesPage from "./pages/PharmaciesPage";
import LocalMarketsPage from "./pages/LocalMarketsPage";

// Admin imports
import AdminLogin from "./pages/admin/AdminLogin";
import AdminLayout from "./pages/admin/AdminLayout";
import AdminDashboard from "./pages/admin/AdminDashboard";
import AdminOrders from "./pages/admin/AdminOrders";
import AdminOrderDetail from "./pages/admin/AdminOrderDetail";
import AdminCustomers from "./pages/admin/AdminCustomers";
import AdminRiders from "./pages/admin/AdminRiders";
import AdminRiderDetail from "./pages/admin/AdminRiderDetail";
import AdminVendors from "./pages/admin/AdminVendors";
import AdminPayouts from "./pages/admin/AdminPayouts";
import AdminAnalytics from "./pages/admin/AdminAnalytics";
import AdminSettings from "./pages/admin/AdminSettings";

// Rider imports
import RiderLogin from "./pages/rider/RiderLogin";
import RiderDashboard from "./pages/rider/RiderDashboard";
import RiderHistory from "./pages/rider/RiderHistory";
import RiderEarnings from "./pages/rider/RiderEarnings";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      refetchOnWindowFocus: false,
      staleTime: 5 * 60 * 1000, // 5 minutes
    },
  },
});

// Component that initializes push notifications for the logged-in user
function PushNotificationInitializer() {
  const [userId, setUserId] = useState<string | undefined>();
  const [initAttempted, setInitAttempted] = useState(false);

  useEffect(() => {
    // Log platform info on mount
    const platform = Capacitor.getPlatform();
    const isNative = Capacitor.isNativePlatform();
    console.log(`📱 App running on: ${platform} (Native: ${isNative})`);
    
    if (isPushSupported()) {
      console.log(`✅ Push notifications supported on ${getPushPlatform()}`);
    } else {
      console.log('⚠️ Push notifications not supported on this platform');
    }
  }, []);

  useEffect(() => {
    // Get user session
    const getSession = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      const newUserId = session?.user?.id;
      setUserId(newUserId);
      
      if (newUserId && !initAttempted) {
        console.log('👤 User authenticated, initializing push notifications...');
        setInitAttempted(true);
      }
    };
    
    getSession();

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      const newUserId = session?.user?.id;
      setUserId(newUserId);
      
      if (newUserId && !initAttempted) {
        console.log('👤 Auth state changed, initializing push notifications...');
        setInitAttempted(true);
      }
    });

    return () => subscription.unsubscribe();
  }, [initAttempted]);

  // Initialize push notifications (works on Android, iOS, and Web)
  useCapacitorPushNotifications(userId);
  
  return null;
}

// Component to handle push notification navigation
function PushNotificationNavigation() {
  useEffect(() => {
    const handleNavigateToOrder = (event: CustomEvent) => {
      const { orderId } = event.detail;
      console.log('🔗 Navigating to order:', orderId);
      
      // Use window.location for web, or find a better way for React Router
      // This will work on all platforms
      if (window.location.pathname !== `/order-tracking?order_id=${orderId}`) {
        window.location.href = `/order-tracking?order_id=${orderId}`;
      }
    };

    window.addEventListener('navigate-to-order', handleNavigateToOrder as EventListener);
    
    return () => {
      window.removeEventListener('navigate-to-order', handleNavigateToOrder as EventListener);
    };
  }, []);

  return null;
}

function AppContent() {
  // Initialize Android back button handling
  useAndroidBackButton();

  return (
    <>
      <PushNotificationInitializer />
      <PushNotificationNavigation />
      <Routes>
        {/* ===== SPLASH & WELCOME ===== */}
        <Route path="/" element={<Splash />} />
        <Route path="/splash" element={<Splash />} />
        <Route path="/welcome" element={<Welcome />} />

        {/* ===== ONBOARDING FLOW ===== */}
        <Route path="/onboarding/phone-login" element={<OnboardingPhoneLogin />} />
        <Route path="/onboarding/email" element={<OnboardingEmail />} />
        <Route path="/onboarding/password" element={<OnboardingPassword />} />
        <Route path="/onboarding/location" element={<OnboardingLocation />} />
        <Route path="/onboarding/notifications" element={<OnboardingNotifications />} />
        <Route path="/onboarding/phone" element={<OnboardingPhone />} />

        {/* ===== AUTH ROUTES ===== */}
        <Route path="/location" element={<Location />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/login" element={<Login />} />

        {/* ===== MAIN APP ROUTES ===== */}
        <Route path="/home" element={<Home />} />
        <Route path="/vendor/:id" element={<VendorDetail />} />
        <Route path="/orders" element={<Orders />} />
        <Route path="/wallet" element={<WalletPage />} />
        <Route path="/profile" element={<Profile />} />
        <Route path="/cart" element={<Cart />} />
        <Route path="/order-success" element={<OrderSuccess />} />
        <Route path="/order-tracking" element={<OrderTracking />} />
        <Route path="/rewards" element={<Rewards />} />
        <Route path="/invite" element={<InviteFriend />} />
        <Route path="/settings" element={<Settings />} />
        <Route path="/support" element={<Support />} />
        <Route path="/mira-ai" element={<MiraAIPage />} />

        {/* ===== GIFT CARD ROUTES ===== */}
        <Route path="/gift-cards" element={<GiftCards />} />
        <Route path="/gift-card-success" element={<GiftCardSuccess />} />

        {/* ===== PARTY PLANNING ROUTE ===== */}
        <Route path="/party" element={<PlanAParty />} />

        {/* ===== OFFERS & DEALS ROUTE ===== */}
        <Route path="/offers" element={<Offers />} />

        {/* ===== COLLECTIONS ROUTES ===== */}
        <Route path="/collections" element={<Collections />} />
        <Route path="/collection/:id" element={<CollectionDetail />} />

        {/* ===== PLAY & WIN GAME ROUTE ===== */}
        <Route path="/play" element={<PlayAndWin />} />

        {/* ===== HEALTHY CHALLENGE ROUTE ===== */}
        <Route path="/healthy-challenge" element={<HealthyChallenge />} />

        {/* ===== NEW ROUTES FOR SHOPS, PHARMACIES, LOCAL MARKETS ===== */}
        <Route path="/shops" element={<ShopPage />} />
        <Route path="/pharmacies" element={<PharmaciesPage />} />
        <Route path="/local-markets" element={<LocalMarketsPage />} />

        {/* ===== ADMIN ROUTES ===== */}
        <Route path="/admin/login" element={<AdminLogin />} />
        <Route path="/admin" element={<AdminLayout />}>
          <Route path="dashboard" element={<AdminDashboard />} />
          <Route path="orders" element={<AdminOrders />} />
          <Route path="orders/:id" element={<AdminOrderDetail />} />
          <Route path="customers" element={<AdminCustomers />} />
          <Route path="riders" element={<AdminRiders />} />
          <Route path="riders/:id" element={<AdminRiderDetail />} />
          <Route path="vendors" element={<AdminVendors />} />
          <Route path="payouts" element={<AdminPayouts />} />
          <Route path="analytics" element={<AdminAnalytics />} />
          <Route path="settings" element={<AdminSettings />} />
        </Route>

        {/* ===== RIDER ROUTES ===== */}
        <Route path="/rider/login" element={<RiderLogin />} />
        <Route path="/rider/dashboard" element={<RiderDashboard />} />
        <Route path="/rider/history" element={<RiderHistory />} />
        <Route path="/rider/earnings" element={<RiderEarnings />} />

        {/* ===== 404 NOT FOUND ===== */}
        <Route path="*" element={<NotFound />} />
      </Routes>
    </>
  );
}

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner position="top-center" richColors closeButton />
      <BrowserRouter>
        <AppContent />
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;