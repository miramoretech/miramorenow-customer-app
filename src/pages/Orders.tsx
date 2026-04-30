// src/pages/Orders.tsx
import { useEffect, useState, useCallback, useRef } from "react";
import { 
  ArrowLeft, ShoppingBag, Clock, Package, RotateCcw, MapPin, Phone, 
  Navigation, RefreshCw, ChevronRight, History, CheckCircle, 
  Truck, Store, User, X, Maximize2, Minimize2
} from "lucide-react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { supabase } from "@/integrations/supabase/client";
import BottomNav from "@/components/BottomNav";
import WhatsAppButton from "@/components/WhatsAppButton";
import { toast } from "sonner";

declare global {
  interface Window {
    google: any;
    initGoogleMaps: () => void;
  }
}

type OrderStatus = "pending" | "confirmed" | "preparing" | "out_for_delivery" | "delivered" | "cancelled";

interface Order {
  id: string;
  status: OrderStatus;
  total_amount: number;
  delivery_fee: number;
  service_charge: number;
  created_at: string;
  items: any[];
  customer_name: string;
  customer_phone: string;
  delivery_address: string;
  payment_reference: string;
  vendor_id: string;
  vendor_name?: string;
  vendor_phone?: string;
  vendor_lat?: number;
  vendor_lng?: number;
  rider_id?: string;
  rider_name?: string;
  rider_phone?: string;
  rider_lat?: number;
  rider_lng?: number;
  estimated_delivery_time?: string;
  archived: boolean;
  delivered_at?: string;
}

// STATUS_CONFIG with brand colors
const STATUS_CONFIG: Record<OrderStatus, { label: string; color: string; bg: string; icon: string; step: number }> = {
  pending:          { label: "Pending",      color: "#F59E0B", bg: "#FEF3C7", icon: "⏳", step: 1 },
  confirmed:        { label: "Confirmed",    color: "#10B981", bg: "#D1FAE5", icon: "✅", step: 2 },
  preparing:        { label: "Preparing",    color: "#FBBF24", bg: "#FEF9C3", icon: "🍳", step: 3 },
  out_for_delivery: { label: "On the way",   color: "#10B981", bg: "#D1FAE5", icon: "🛵", step: 4 },
  delivered:        { label: "Delivered",    color: "#059669", bg: "#D1FAE5", icon: "🎉", step: 5 },
  cancelled:        { label: "Cancelled",    color: "#EF4444", bg: "#FEE2E2", icon: "❌", step: 0 },
};

const isActive = (s: OrderStatus) =>
  ["pending", "confirmed", "preparing", "out_for_delivery"].includes(s);

// Get authenticated user ID reliably
const getUserId = async (): Promise<string | null> => {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (user?.id) return user.id;
    
    const email = localStorage.getItem("mirimore_user_email");
    if (email) {
      const { data } = await supabase
        .from("profiles")
        .select("id")
        .eq("email", email)
        .maybeSingle();
      if (data?.id) return data.id;
    }
    return null;
  } catch (error) {
    console.error("Error getting user ID:", error);
    return null;
  }
};

// ✅ YOUR GOOGLE MAPS API KEY
const GOOGLE_MAPS_API_KEY = "AIzaSyAcgWyOPX7Y1qY98BolRvjPqwMuSs6prfY";

const Orders = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [tab, setTab] = useState<"active" | "history">("active");
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [showTracking, setShowTracking] = useState(false);
  const [userId, setUserId] = useState<string | null>(null);
  const [mapLoaded, setMapLoaded] = useState(false);
  const [mapInstance, setMapInstance] = useState<any>(null);
  const [riderMarker, setRiderMarker] = useState<any>(null);
  const [trackingInterval, setTrackingInterval] = useState<NodeJS.Timeout | null>(null);
  const [isMapFullscreen, setIsMapFullscreen] = useState(false);
  const [mapError, setMapError] = useState(false);
  
  const mapContainerRef = useRef<HTMLDivElement>(null);

  // ✅ Load Google Maps script once
  useEffect(() => {
    // Check if script already exists
    if (document.querySelector('#google-maps-script')) {
      if (window.google?.maps) {
        setMapLoaded(true);
      }
      return;
    }

    const script = document.createElement('script');
    script.id = 'google-maps-script';
    script.src = `https://maps.googleapis.com/maps/api/js?key=${GOOGLE_MAPS_API_KEY}&libraries=places,geometry`;
    script.async = true;
    script.defer = true;
    script.onload = () => {
      console.log("Google Maps loaded successfully");
      setMapLoaded(true);
      setMapError(false);
    };
    script.onerror = () => {
      console.error("Failed to load Google Maps");
      setMapError(true);
      toast.error("Map failed to load. Check your internet connection.");
    };
    document.head.appendChild(script);

    return () => {
      if (trackingInterval) clearInterval(trackingInterval);
    };
  }, []);

  // ✅ Initialize map when tracking modal opens
  useEffect(() => {
    if (showTracking && selectedOrder && mapLoaded && mapContainerRef.current && !mapInstance) {
      // Small delay to ensure DOM is ready
      setTimeout(() => {
        initMap();
      }, 100);
    }
  }, [showTracking, selectedOrder, mapLoaded]);

  const initMap = () => {
    if (!mapContainerRef.current || !window.google) {
      console.error("Map container or Google not ready");
      return;
    }

    try {
      const defaultCenter = { lat: 6.5244, lng: 3.3792 }; // Lagos center
      
      const map = new window.google.maps.Map(mapContainerRef.current, {
        center: defaultCenter,
        zoom: 13,
        styles: [
          {
            featureType: "poi",
            elementType: "labels",
            stylers: [{ visibility: "off" }]
          }
        ],
        controlSize: 30,
        zoomControl: true,
        mapTypeControl: false,
        streetViewControl: false,
        fullscreenControl: true,
      });
      
      setMapInstance(map);
      
      // Add vendor marker
      if (selectedOrder?.vendor_lat && selectedOrder?.vendor_lng) {
        new window.google.maps.Marker({
          position: { lat: selectedOrder.vendor_lat, lng: selectedOrder.vendor_lng },
          map: map,
          title: selectedOrder.vendor_name,
          icon: {
            url: "https://maps.google.com/mapfiles/ms/icons/green-dot.png",
            scaledSize: new window.google.maps.Size(40, 40)
          }
        });
      }
      
      // Add rider marker if available
      if (selectedOrder?.rider_lat && selectedOrder?.rider_lng) {
        const rider = new window.google.maps.Marker({
          position: { lat: selectedOrder.rider_lat, lng: selectedOrder.rider_lng },
          map: map,
          title: selectedOrder.rider_name || "Rider",
          icon: {
            url: "https://maps.google.com/mapfiles/ms/icons/blue-dot.png",
            scaledSize: new window.google.maps.Size(40, 40)
          }
        });
        setRiderMarker(rider);
        map.setCenter({ lat: selectedOrder.rider_lat, lng: selectedOrder.rider_lng });
        map.setZoom(14);
      } else if (selectedOrder?.vendor_lat && selectedOrder?.vendor_lng) {
        map.setCenter({ lat: selectedOrder.vendor_lat, lng: selectedOrder.vendor_lng });
        map.setZoom(15);
      }
    } catch (error) {
      console.error("Error initializing map:", error);
      toast.error("Could not load map. Please try again.");
    }
  };

  // ✅ Update rider location in real-time
  const startRealTimeTracking = useCallback((orderId: string) => {
    if (trackingInterval) clearInterval(trackingInterval);
    
    const interval = setInterval(async () => {
      try {
        const { data, error } = await supabase
          .from("orders")
          .select("rider_lat, rider_lng, status")
          .eq("id", orderId)
          .single();
        
        if (error) return;
        
        if (data.rider_lat && data.rider_lng && mapInstance) {
          const newPosition = { lat: data.rider_lat, lng: data.rider_lng };
          
          if (riderMarker) {
            riderMarker.setPosition(newPosition);
          } else if (window.google) {
            const newRiderMarker = new window.google.maps.Marker({
              position: newPosition,
              map: mapInstance,
              title: "Rider",
              icon: {
                url: "https://maps.google.com/mapfiles/ms/icons/blue-dot.png",
                scaledSize: new window.google.maps.Size(40, 40),
              }
            });
            setRiderMarker(newRiderMarker);
          }
          
          // Center map on rider smoothly
          mapInstance.panTo(newPosition);
        }
        
        // If order is delivered, stop tracking
        if (data.status === "delivered") {
          clearInterval(interval);
          toast.success("Your order has been delivered! 🎉");
        }
      } catch (err) {
        console.error("Tracking update error:", err);
      }
    }, 5000);
    
    setTrackingInterval(interval);
  }, [mapInstance, riderMarker, trackingInterval]);

  // ✅ Clean up tracking on modal close
  useEffect(() => {
    return () => {
      if (trackingInterval) clearInterval(trackingInterval);
    };
  }, [trackingInterval]);

  // Check for order_id in URL
  useEffect(() => {
    const orderId = searchParams.get("order_id");
    if (orderId) {
      setTimeout(() => {
        const element = document.getElementById(`order-${orderId}`);
        if (element) {
          element.scrollIntoView({ behavior: "smooth", block: "center" });
          element.classList.add("ring-2", "ring-[#10B981]", "ring-offset-2");
          setTimeout(() => {
            element.classList.remove("ring-2", "ring-[#10B981]", "ring-offset-2");
          }, 3000);
        }
      }, 500);
    }
  }, [searchParams, orders]);

  // Get user ID on mount
  useEffect(() => {
    const initUser = async () => {
      const id = await getUserId();
      setUserId(id);
    };
    initUser();
  }, []);

  // Fetch orders with vendor and rider info
  const fetchOrders = useCallback(async (showRefresh = false) => {
    if (showRefresh) setRefreshing(true);
    else setLoading(true);
    
    try {
      const uid = await getUserId();
      if (!uid) {
        setOrders([]);
        setLoading(false);
        setRefreshing(false);
        return;
      }
      
      const { data: ordersData, error: ordersError } = await supabase
        .from("orders")
        .select(`
          *,
          vendor:vendor_id (
            store_name,
            phone,
            address,
            latitude,
            longitude
          ),
          rider:rider_id (
            full_name,
            phone,
            current_lat,
            current_lng
          )
        `)
        .eq("customer_id", uid)
        .order("created_at", { ascending: false });
      
      if (ordersError) throw ordersError;
      
      const transformed = (ordersData || []).map((order: any) => ({
        ...order,
        vendor_name: order.vendor?.store_name || "Unknown Vendor",
        vendor_phone: order.vendor?.phone,
        vendor_lat: order.vendor?.latitude,
        vendor_lng: order.vendor?.longitude,
        rider_name: order.rider?.full_name,
        rider_phone: order.rider?.phone,
        rider_lat: order.rider?.current_lat,
        rider_lng: order.rider?.current_lng,
        archived: order.status === "delivered" || order.status === "cancelled",
        delivered_at: order.status === "delivered" ? order.updated_at : null
      }));
      
      setOrders(transformed);
    } catch (error: any) {
      console.error("Error fetching orders:", error);
      toast.error("Failed to load orders");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    fetchOrders();
  }, [fetchOrders]);

  // Real-time order updates
  useEffect(() => {
    if (!userId) return;
    
    const channel = supabase
      .channel("customer-orders-live")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "orders", filter: `customer_id=eq.${userId}` },
        (payload) => {
          console.log("Order update received:", payload);
          if (payload.eventType === "UPDATE") {
            setOrders(prev =>
              prev.map(o => o.id === payload.new.id ? { ...o, ...payload.new } as Order : o)
            );
            if (payload.old.status !== payload.new.status) {
              const newStatus = payload.new.status as OrderStatus;
              const config = STATUS_CONFIG[newStatus];
              toast.success(`Order status: ${config.label} ${config.icon}`);
            }
          } else if (payload.eventType === "INSERT") {
            setOrders(prev => [payload.new as Order, ...prev]);
            toast.success("New order placed! 🎉");
          }
        }
      )
      .subscribe();
    
    return () => { supabase.removeChannel(channel); };
  }, [userId]);

  // ✅ FIXED: Track order handler - prevents navigation issues
  const handleTrackOrder = (order: Order, e: React.MouseEvent) => {
    e.stopPropagation();
    e.preventDefault();
    
    // Reset map instance before opening new tracking
    if (mapInstance) {
      // Don't destroy, just nullify reference
      setMapInstance(null);
    }
    if (riderMarker) {
      setRiderMarker(null);
    }
    
    setSelectedOrder(order);
    setShowTracking(true);
    
    // Start tracking if order is out for delivery
    if (order.status === "out_for_delivery") {
      // Delay tracking start to let map initialize first
      setTimeout(() => {
        startRealTimeTracking(order.id);
      }, 1000);
    }
  };

  const handleCallVendor = (phone?: string) => {
    if (phone) {
      window.location.href = `tel:${phone}`;
    } else {
      toast.error("Vendor phone number not available");
    }
  };

  const handleCallRider = (phone?: string) => {
    if (phone) {
      window.location.href = `tel:${phone}`;
    } else {
      toast.error("Rider phone number not available");
    }
  };

  const handleGetDirections = (lat?: number, lng?: number) => {
    if (lat && lng) {
      const url = `https://www.google.com/maps/dir/?api=1&destination=${lat},${lng}`;
      window.open(url, "_blank");
    } else {
      toast.error("Location not available");
    }
  };

  // ✅ FIXED: Close tracking modal properly
  const closeTrackingModal = () => {
    if (trackingInterval) {
      clearInterval(trackingInterval);
      setTrackingInterval(null);
    }
    setShowTracking(false);
    setSelectedOrder(null);
    setMapInstance(null);
    setRiderMarker(null);
  };

  const displayed = orders.filter(o =>
    tab === "active" ? isActive(o.status) && !o.archived : (!isActive(o.status) || o.archived)
  );

  const handleRefresh = () => fetchOrders(true);

  return (
    <motion.div
      className="min-h-screen bg-[#FAFAF9] pb-24"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
    >
      {/* Header */}
      <header className="sticky top-0 z-30 bg-gradient-to-r from-[#10B981] to-[#059669] text-white px-4 py-4 flex items-center gap-3 shadow-md">
        <button 
          onClick={() => navigate(-1)} 
          className="p-2.5 active:scale-95 transition-transform min-w-[44px] min-h-[44px] flex items-center justify-center"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
        <h1 className="font-bold text-lg flex-1">My Orders</h1>
        <button 
          onClick={handleRefresh} 
          className="p-2.5 active:scale-95 transition-transform"
          disabled={refreshing}
        >
          <RefreshCw className={`w-4 h-4 ${refreshing ? "animate-spin" : ""}`} />
        </button>
      </header>

      {/* Tabs */}
      <div className="px-4 flex gap-2 mt-4">
        {([
          { id: "active", label: "Active", icon: Clock },
          { id: "history", label: "History", icon: History }
        ] as const).map((t) => (
          <button 
            key={t.id}
            onClick={() => setTab(t.id)}
            className={`flex items-center gap-1.5 flex-1 justify-center py-3 rounded-2xl text-xs font-bold active:scale-95 transition-all min-h-[48px] ${
              tab === t.id
                ? "bg-[#10B981] text-white shadow-md"
                : "bg-white text-gray-500 border border-gray-100 shadow-sm"
            }`}
          >
            <t.icon className="w-3.5 h-3.5" />
            {t.label}
          </button>
        ))}
      </div>

      {/* Orders List */}
      <div className="px-4 mt-4 space-y-3 pb-4">
        {loading ? (
          Array.from({ length: 2 }).map((_, i) => (
            <div key={i} className="bg-white rounded-2xl border border-gray-100 p-4 space-y-3 animate-pulse shadow-sm">
              <div className="h-4 bg-gray-200 rounded w-1/2" />
              <div className="h-3 bg-gray-200 rounded w-3/4" />
              <div className="h-3 bg-gray-200 rounded w-1/3" />
            </div>
          ))
        ) : displayed.length === 0 ? (
          <div className="flex flex-col items-center justify-center gap-3 py-16 text-gray-500">
            <div className="w-16 h-16 rounded-full bg-gray-100 flex items-center justify-center">
              <ShoppingBag className="w-8 h-8 opacity-40" />
            </div>
            <p className="text-sm font-medium">
              {tab === "active" ? "No active orders" : "No order history yet"}
            </p>
            <p className="text-xs text-gray-400 text-center">
              {tab === "active" 
                ? "Place an order and track it here" 
                : "Completed orders will appear here"}
            </p>
            <button
              onClick={() => navigate("/home")}
              className="mt-2 px-6 py-3 rounded-2xl bg-[#10B981] text-white text-sm font-semibold shadow-md active:scale-95 transition-all"
            >
              Browse vendors
            </button>
          </div>
        ) : (
          <AnimatePresence>
            {displayed.map((order) => {
              const cfg = STATUS_CONFIG[order.status];
              const itemsList = Array.isArray(order.items) ? order.items : [];
              const isOrderActive = isActive(order.status);
              
              return (
                <motion.div
                  key={order.id}
                  id={`order-${order.id}`}
                  layout
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="bg-white rounded-2xl border border-gray-100 p-4 space-y-3 shadow-sm active:scale-[0.98] transition-all"
                >
                  {/* Header */}
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-xs text-gray-500">
                        {new Date(order.created_at).toLocaleDateString("en-NG", {
                          day: "numeric", month: "short", hour: "2-digit", minute: "2-digit"
                        })}
                      </p>
                      <p className="text-[10px] text-gray-400 font-mono">
                        #{order.id.slice(0, 8).toUpperCase()}
                      </p>
                    </div>
                    <span
                      className="text-[11px] font-bold px-3 py-1 rounded-full"
                      style={{ color: cfg.color, background: cfg.bg }}
                    >
                      {cfg.icon} {cfg.label}
                    </span>
                  </div>

                  {/* Vendor info */}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-full bg-[#D1FAE5] flex items-center justify-center">
                        <Store className="w-4 h-4 text-[#10B981]" />
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-gray-900">{order.vendor_name}</p>
                        {order.estimated_delivery_time && (
                          <p className="text-[10px] text-gray-400">Est. {order.estimated_delivery_time}</p>
                        )}
                      </div>
                    </div>
                    {isOrderActive && order.vendor_phone && (
                      <button
                        onClick={(e) => handleCallVendor(order.vendor_phone)}
                        className="flex items-center gap-1 px-3 py-1.5 rounded-full bg-[#F0FDF4] text-[#10B981] text-xs font-medium"
                      >
                        <Phone className="w-3 h-3" /> Call
                      </button>
                    )}
                  </div>

                  {/* Items summary */}
                  {itemsList.length > 0 && (
                    <div className="space-y-1">
                      {itemsList.slice(0, 2).map((item: any, i: number) => (
                        <div key={i} className="flex justify-between text-xs">
                          <span className="text-gray-600">{item.name} × {item.quantity}</span>
                          <span className="text-[#10B981] font-semibold">₦{(item.price * item.quantity).toLocaleString()}</span>
                        </div>
                      ))}
                      {itemsList.length > 2 && (
                        <p className="text-[10px] text-gray-400">
                          +{itemsList.length - 2} more items
                        </p>
                      )}
                    </div>
                  )}

                  {/* Progress Bar */}
                  {isOrderActive && (
                    <div className="space-y-1">
                      <div className="flex justify-between text-[10px] text-gray-400">
                        <span>Ordered</span>
                        <span>Confirmed</span>
                        <span>Preparing</span>
                        <span>Delivery</span>
                      </div>
                      <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
                        <div 
                          className="h-full bg-gradient-to-r from-[#10B981] to-[#059669] rounded-full transition-all duration-500"
                          style={{ width: `${(cfg.step / 5) * 100}%` }}
                        />
                      </div>
                    </div>
                  )}

                  {/* Footer */}
                  <div className="flex items-center justify-between pt-1 border-t border-gray-100">
                    <span className="text-xs text-gray-500">Total</span>
                    <span className="text-sm font-bold text-[#10B981]">
                      ₦{order.total_amount.toLocaleString()}
                    </span>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex gap-2 pt-1">
                    {isOrderActive && (
                      <button
                        onClick={(e) => handleTrackOrder(order, e)}
                        className="flex-1 py-2.5 rounded-xl text-xs font-bold text-white bg-gradient-to-r from-[#10B981] to-[#059669] shadow-md active:scale-95 transition-all flex items-center justify-center gap-1.5"
                      >
                        <Navigation className="w-3.5 h-3.5" />
                        Track Live →
                      </button>
                    )}
                    
                    {!isOrderActive && order.status === "delivered" && (
                      <button
                        onClick={() => navigate(`/order-success?order_id=${order.id}`)}
                        className="flex-1 py-2.5 rounded-xl text-xs font-bold text-[#10B981] bg-[#D1FAE5] active:scale-95 transition-all"
                      >
                        View Receipt
                      </button>
                    )}
                    
                    {order.status === "cancelled" && (
                      <button
                        onClick={() => navigate("/home")}
                        className="flex-1 py-2.5 rounded-xl text-xs font-bold text-white bg-gradient-to-r from-[#F97316] to-[#EA580C] active:scale-95 transition-all"
                      >
                        Order Again
                      </button>
                    )}
                    
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        navigate(`/order-success?order_id=${order.id}`);
                      }}
                      className="py-2.5 px-4 rounded-xl text-xs font-bold text-gray-600 bg-gray-100 active:scale-95 transition-all"
                    >
                      Details
                    </button>
                  </div>
                </motion.div>
              );
            })}
          </AnimatePresence>
        )}
      </div>

      {/* ✅ FIXED: Live Tracking Modal with Full Map */}
      <AnimatePresence>
        {showTracking && selectedOrder && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black"
            onClick={closeTrackingModal}
          >
            <motion.div
              initial={{ y: "100%" }}
              animate={{ y: 0 }}
              exit={{ y: "100%" }}
              transition={{ type: "spring", damping: 25 }}
              className="absolute bottom-0 left-0 right-0 bg-white rounded-t-3xl flex flex-col"
              style={{ height: isMapFullscreen ? "100vh" : "90vh" }}
              onClick={(e) => e.stopPropagation()}
            >
              {/* Map Header */}
              <div className="sticky top-0 bg-white border-b border-gray-100 p-4 flex items-center justify-between z-10">
                <div>
                  <h3 className="font-bold text-gray-900">
                    {selectedOrder.status === "out_for_delivery" ? "Live Tracking" : "Order Status"}
                  </h3>
                  <p className="text-xs text-gray-500">#{selectedOrder.id.slice(0, 8).toUpperCase()}</p>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setIsMapFullscreen(!isMapFullscreen)}
                    className="p-2 rounded-full bg-gray-100 active:scale-95"
                  >
                    {isMapFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
                  </button>
                  <button
                    onClick={closeTrackingModal}
                    className="p-2 rounded-full bg-gray-100 active:scale-95"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>
              </div>

              {/* ✅ Google Map Container with error handling */}
              {mapError ? (
                <div className="w-full h-[280px] bg-gray-100 flex flex-col items-center justify-center">
                  <p className="text-gray-500 text-sm">Unable to load map</p>
                  <p className="text-xs text-gray-400 mt-1">Check your internet connection</p>
                </div>
              ) : (
                <div 
                  ref={mapContainerRef}
                  className="w-full bg-gray-100"
                  style={{ height: isMapFullscreen ? "calc(100vh - 200px)" : "280px" }}
                />
              )}

              {/* Order Info Panel */}
              <div className="flex-1 overflow-y-auto p-4 space-y-4">
                {/* Status Timeline */}
                <div className="bg-[#F0FDF4] rounded-2xl p-4">
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-xs font-semibold text-[#10B981]">ORDER STATUS</span>
                    <span className="text-xs font-bold text-[#10B981]">
                      {STATUS_CONFIG[selectedOrder.status].label}
                    </span>
                  </div>
                  <div className="relative">
                    <div className="absolute left-5 top-0 bottom-0 w-0.5 bg-gray-200" />
                    {["Order Placed", "Confirmed", "Preparing", "Out for Delivery", "Delivered"].map((step, idx) => {
                      const stepNumber = idx + 1;
                      const isCompleted = stepNumber <= STATUS_CONFIG[selectedOrder.status].step;
                      return (
                        <div key={step} className="relative flex items-start gap-3 mb-4 last:mb-0">
                          <div className={`relative z-10 w-8 h-8 rounded-full flex items-center justify-center ${
                            isCompleted ? "bg-[#10B981]" : "bg-gray-200"
                          }`}>
                            {isCompleted ? (
                              <CheckCircle className="w-4 h-4 text-white" />
                            ) : (
                              <span className="text-gray-500 text-xs">{idx + 1}</span>
                            )}
                          </div>
                          <div className="flex-1">
                            <p className={`font-semibold text-sm ${isCompleted ? "text-gray-900" : "text-gray-400"}`}>
                              {step}
                            </p>
                            {step === "Out for Delivery" && selectedOrder.rider_name && isCompleted && (
                              <div className="flex items-center gap-2 mt-1">
                                <User className="w-3 h-3 text-gray-400" />
                                <span className="text-xs text-gray-500">{selectedOrder.rider_name}</span>
                                {selectedOrder.rider_phone && (
                                  <button
                                    onClick={() => handleCallRider(selectedOrder.rider_phone)}
                                    className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-[#10B981] text-white text-[10px]"
                                  >
                                    <Phone className="w-2 h-2" /> Call
                                  </button>
                                )}
                              </div>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Location Info */}
                <div className="bg-white border border-gray-100 rounded-2xl p-4 space-y-3">
                  <div className="flex items-start gap-3">
                    <Store className="w-4 h-4 text-[#10B981] mt-0.5" />
                    <div className="flex-1">
                      <p className="text-xs font-semibold text-gray-700">From</p>
                      <p className="text-sm text-gray-900">{selectedOrder.vendor_name}</p>
                      {selectedOrder.vendor_lat && selectedOrder.vendor_lng && (
                        <button
                          onClick={() => handleGetDirections(selectedOrder.vendor_lat, selectedOrder.vendor_lng)}
                          className="text-xs text-[#10B981] flex items-center gap-1 mt-1"
                        >
                          <MapPin className="w-3 h-3" /> Get directions
                        </button>
                      )}
                    </div>
                  </div>
                  
                  <div className="flex items-start gap-3">
                    <Truck className="w-4 h-4 text-[#FBBF24] mt-0.5" />
                    <div className="flex-1">
                      <p className="text-xs font-semibold text-gray-700">Delivery to</p>
                      <p className="text-sm text-gray-900">{selectedOrder.delivery_address || "Address not set"}</p>
                    </div>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex gap-3">
                  {selectedOrder.vendor_phone && (
                    <button
                      onClick={() => handleCallVendor(selectedOrder.vendor_phone)}
                      className="flex-1 py-3 rounded-xl bg-[#F0FDF4] text-[#10B981] font-semibold text-sm flex items-center justify-center gap-2 active:scale-95"
                    >
                      <Phone className="w-4 h-4" /> Call Vendor
                    </button>
                  )}
                  {selectedOrder.vendor_lat && selectedOrder.vendor_lng && (
                    <button
                      onClick={() => handleGetDirections(selectedOrder.vendor_lat, selectedOrder.vendor_lng)}
                      className="flex-1 py-3 rounded-xl bg-[#10B981] text-white font-semibold text-sm flex items-center justify-center gap-2 active:scale-95"
                    >
                      <Navigation className="w-4 h-4" /> Directions
                    </button>
                  )}
                </div>

                {/* Support */}
                <div className="text-center pt-2">
                  <p className="text-xs text-gray-400">
                    Need help? Contact support at 
                    <a href="tel:+234123456789" className="text-[#10B981] ml-1">+234 123 456 789</a>
                  </p>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <BottomNav />
      <WhatsAppButton />
    </motion.div>
  );
};

export default Orders;