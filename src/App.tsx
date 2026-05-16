import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes, Navigate } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { useAndroidBackButton } from "@/hooks/useAndroidBackButton";
import { useCapacitorPushNotifications } from "@/hooks/useCapacitorPushNotifications";
import { supabase } from "@/lib/supabase";
import { useEffect, useState } from "react";

// Import AdminRoute guard
import { AdminRoute } from "@/components/AdminRoute";

// Page imports
import Splash from "./pages/Splash";
import Welcome from "./pages/Welcome";
import OnboardingSignup from "./pages/OnboardingSignup";
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
import ShopPage from "./pages/ShopPage";
import SendPage from "./pages/SendPage";
import DeliveryTracking from "./pages/DeliveryTracking";
import PharmaciesPage from "./pages/PharmaciesPage";
import LocalMarketsPage from "./pages/LocalMarketsPage";

// Admin pages (ensure these files exist)
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
import AdminDeliveries from "./pages/admin/AdminDeliveries";     // <-- NEW
import AdminFoodOrders from "./pages/admin/AdminFoodOrders";   // <-- NEW (create if needed)

// Rider pages
import RiderLogin from "./pages/rider/RiderLogin";
import RiderDashboard from "./pages/rider/RiderDashboard";
import RiderHistory from "./pages/rider/RiderHistory";
import RiderEarnings from "./pages/rider/RiderEarnings";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: { retry: 1, refetchOnWindowFocus: false, staleTime: 5 * 60 * 1000 },
  },
});

function PushNotificationInitializer() {
  const [userId, setUserId] = useState<string | undefined>();
  const [initAttempted, setInitAttempted] = useState(false);

  useEffect(() => {
    const getSession = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      const newUserId = session?.user?.id;
      setUserId(newUserId);
      if (newUserId && !initAttempted) setInitAttempted(true);
    };
    getSession();
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      const newUserId = session?.user?.id;
      setUserId(newUserId);
      if (newUserId && !initAttempted) setInitAttempted(true);
    });
    return () => subscription.unsubscribe();
  }, [initAttempted]);

  useCapacitorPushNotifications(userId);
  return null;
}

function PushNotificationNavigation() {
  useEffect(() => {
    const handleNavigateToOrder = (event: CustomEvent) => {
      const { orderId } = event.detail;
      if (window.location.pathname !== `/order-tracking?order_id=${orderId}`) {
        window.location.href = `/order-tracking?order_id=${orderId}`;
      }
    };
    window.addEventListener('navigate-to-order', handleNavigateToOrder as EventListener);
    return () => window.removeEventListener('navigate-to-order', handleNavigateToOrder as EventListener);
  }, []);
  return null;
}

function AppContent() {
  useAndroidBackButton();
  return (
    <>
      <PushNotificationInitializer />
      <PushNotificationNavigation />
      <Routes>
        <Route path="/" element={<Splash />} />
        <Route path="/splash" element={<Splash />} />
        <Route path="/welcome" element={<Welcome />} />
        <Route path="/onboarding/signup" element={<OnboardingSignup />} />
        <Route path="/onboarding/email" element={<OnboardingSignup />} />
        <Route path="/onboarding/password" element={<OnboardingSignup />} />
        <Route path="/onboarding/phone-login" element={<Navigate to="/onboarding/signup" replace />} />
        <Route path="/onboarding/phone" element={<Navigate to="/onboarding/signup" replace />} />
        <Route path="/onboarding/location" element={<Navigate to="/onboarding/signup" replace />} />
        <Route path="/onboarding/notifications" element={<Navigate to="/onboarding/signup" replace />} />
        <Route path="/location" element={<Location />} />
        <Route path="/signup" element={<Navigate to="/onboarding/signup" replace />} />
        <Route path="/login" element={<Login />} />
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
        <Route path="/gift-cards" element={<GiftCards />} />
        <Route path="/gift-card-success" element={<GiftCardSuccess />} />
        <Route path="/party" element={<PlanAParty />} />
        <Route path="/offers" element={<Offers />} />
        <Route path="/collections" element={<Collections />} />
        <Route path="/collection/:id" element={<CollectionDetail />} />
        <Route path="/play" element={<PlayAndWin />} />
        <Route path="/healthy-challenge" element={<HealthyChallenge />} />

        {/* Shops, Send Package, Delivery Tracking, Pharmacies, Markets */}
        <Route path="/shops" element={<ShopPage />} />
        <Route path="/send" element={<SendPage />} />
        <Route path="/delivery-tracking/:trackingNumber" element={<DeliveryTracking />} />
        <Route path="/pharmacies" element={<PharmaciesPage />} />
        <Route path="/local-markets" element={<LocalMarketsPage />} />

        {/* Admin - Protected with AdminRoute */}
        <Route path="/admin/login" element={<AdminLogin />} />
        <Route path="/admin" element={<AdminLayout />}>
          {/* Protected routes - only accessible to admin users */}
          <Route path="dashboard" element={<AdminRoute><AdminDashboard /></AdminRoute>} />
          <Route path="orders" element={<AdminRoute><AdminOrders /></AdminRoute>} />
          <Route path="orders/:id" element={<AdminRoute><AdminOrderDetail /></AdminRoute>} />
          <Route path="customers" element={<AdminRoute><AdminCustomers /></AdminRoute>} />
          <Route path="riders" element={<AdminRoute><AdminRiders /></AdminRoute>} />
          <Route path="riders/:id" element={<AdminRoute><AdminRiderDetail /></AdminRoute>} />
          <Route path="vendors" element={<AdminRoute><AdminVendors /></AdminRoute>} />
          <Route path="payouts" element={<AdminRoute><AdminPayouts /></AdminRoute>} />
          <Route path="analytics" element={<AdminRoute><AdminAnalytics /></AdminRoute>} />
          <Route path="settings" element={<AdminRoute><AdminSettings /></AdminRoute>} />
          
          {/* New admin pages for package deliveries and food orders */}
          <Route path="deliveries" element={<AdminRoute><AdminDeliveries /></AdminRoute>} />
          <Route path="food-orders" element={<AdminRoute><AdminFoodOrders /></AdminRoute>} />
        </Route>

        {/* Rider */}
        <Route path="/rider/login" element={<RiderLogin />} />
        <Route path="/rider/dashboard" element={<RiderDashboard />} />
        <Route path="/rider/history" element={<RiderHistory />} />
        <Route path="/rider/earnings" element={<RiderEarnings />} />

        <Route path="*" element={<NotFound />} />
      </Routes>
    </>
  );
}

function App() {
  return (
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
}

export default App;