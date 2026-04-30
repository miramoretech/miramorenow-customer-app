// src/pages/OrderTracking.tsx
import { useEffect, useState, useRef, useCallback } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  CheckCircle, MapPin, Clock, Phone, MessageCircle,
  Navigation, ArrowLeft, Star, RefreshCw
} from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { toast } from 'sonner';

const GOOGLE_MAPS_API_KEY = "AIzaSyAcgWyOPX7Y1qY98BolRvjPqwMuSs6prfY";

// ✅ FIXED: Changed 'const' to 'let' for mapsCallbacks (allows reassignment)
let mapsLoaded = false;
let mapsLoading = false;
let mapsCallbacks: (() => void)[] = [];  // ✅ Changed from const to let

function loadGoogleMaps(cb: () => void) {
  // ✅ If already loaded, call callback immediately
  if (window.google && window.google.maps) {
    mapsLoaded = true;
    cb();
    return;
  }
  
  // ✅ If already loaded (our flag), call callback
  if (mapsLoaded) {
    cb();
    return;
  }
  
  // ✅ If script already exists but not loaded yet, queue callback
  if (document.querySelector('#google-maps-script')) {
    if (!mapsCallbacks.includes(cb)) {
      mapsCallbacks.push(cb);
    }
    return;
  }
  
  // ✅ If currently loading, just queue callback
  if (mapsLoading) {
    if (!mapsCallbacks.includes(cb)) {
      mapsCallbacks.push(cb);
    }
    return;
  }
  
  // ✅ Start loading
  mapsCallbacks.push(cb);
  mapsLoading = true;
  
  (window as any).initGoogleMaps = () => {
    mapsLoaded = true;
    mapsLoading = false;
    const callbacks = [...mapsCallbacks];
    mapsCallbacks = [];  // ✅ Now works with 'let'
    callbacks.forEach(f => f());
  };
  
  const s = document.createElement('script');
  s.id = 'google-maps-script';
  s.src = `https://maps.googleapis.com/maps/api/js?key=${GOOGLE_MAPS_API_KEY}&libraries=places,geometry&callback=initGoogleMaps&loading=async`;
  s.async = true;
  s.defer = true;
  s.onerror = () => { 
    mapsLoading = false; 
    mapsCallbacks = [];  // ✅ Now works with 'let'
    toast.error("Maps failed to load. Check your internet connection.");
  };
  
  // ✅ Remove existing script if any (prevents duplicates)
  const existingScript = document.querySelector('#google-maps-script');
  if (existingScript) {
    existingScript.remove();
  }
  
  document.head.appendChild(s);
}

// ✅ Brand Colors (Green theme)
const BRAND_GREEN = "#10B981";
const BRAND_GREEN_DARK = "#059669";
const BRAND_GREEN_LIGHT = "#D1FAE5";
const BRAND_YELLOW = "#FBBF24";

const STATUS_STEPS = [
  { key: 'confirmed',        label: 'Order Confirmed',      sub: 'Your order has been received',     icon: '✅', color: BRAND_GREEN },
  { key: 'preparing',        label: 'Chef is Cooking',      sub: 'Your food is being prepared',      icon: '👨‍🍳', color: BRAND_YELLOW },
  { key: 'out_for_delivery', label: 'Rider on the Way',     sub: 'Your food is heading to you',      icon: '🛵', color: BRAND_GREEN },
  { key: 'delivered',        label: 'Delivered!',            sub: 'Enjoy your meal! Leave a review',  icon: '🎉', color: BRAND_GREEN },
];

export default function OrderTracking() {
  const [searchParams]  = useSearchParams();
  const navigate        = useNavigate();
  const orderId         = searchParams.get('order_id');
  const reference       = searchParams.get('reference');

  const [order,          setOrder]          = useState<any>(null);
  const [loading,        setLoading]        = useState(true);
  const [deliveryStatus, setDeliveryStatus] = useState('confirmed');
  const [mapReady,       setMapReady]       = useState(false);
  const [lastUpdated,    setLastUpdated]    = useState<Date>(new Date());
  const [riderLocation,  setRiderLocation]  = useState<{ lat: number; lng: number } | null>(null);
  const [trackingInterval, setTrackingInterval] = useState<NodeJS.Timeout | null>(null);

  const mapDivRef   = useRef<HTMLDivElement>(null);
  const mapInstance = useRef<any>(null);
  const riderMarkerRef = useRef<any>(null);
  const vendorMarkerRef = useRef<any>(null);
  const customerMarkerRef = useRef<any>(null);

  // ── Fetch order
  const fetchOrder = useCallback(async () => {
    if (!orderId) { navigate('/home'); return; }
    try {
      const { data, error } = await supabase
        .from('orders')
        .select('*, vendor:vendor_id(store_name, latitude, longitude, address, phone)')
        .eq('id', orderId)
        .single();
      if (error) throw error;
      setOrder(data);
      if (data.status) setDeliveryStatus(data.status);
      setLastUpdated(new Date());
      
      // If order is out for delivery, start tracking rider
      if (data.status === 'out_for_delivery') {
        startRiderTracking(orderId);
      }
    } catch (err) {
      console.error(err);
      toast.error('Could not load order details');
    } finally {
      setLoading(false);
    }
  }, [orderId, navigate]);

  // ── Start real-time rider tracking
  const startRiderTracking = (orderId: string) => {
    if (trackingInterval) clearInterval(trackingInterval);
    
    const interval = setInterval(async () => {
      const { data, error } = await supabase
        .from('orders')
        .select('rider_lat, rider_lng, status')
        .eq('id', orderId)
        .single();
      
      if (error) return;
      
      if (data.rider_lat && data.rider_lng) {
        setRiderLocation({ lat: data.rider_lat, lng: data.rider_lng });
        
        // Update marker on map if map is ready
        if (mapInstance.current && riderMarkerRef.current) {
          riderMarkerRef.current.setPosition({ lat: data.rider_lat, lng: data.rider_lng });
          // Center map on rider
          mapInstance.current.panTo({ lat: data.rider_lat, lng: data.rider_lng });
        }
      }
      
      if (data.status === 'delivered') {
        clearInterval(interval);
        toast.success('Your order has been delivered! 🎉');
      }
    }, 5000);
    
    setTrackingInterval(interval);
  };

  useEffect(() => { fetchOrder(); }, [fetchOrder]);

  // Cleanup tracking on unmount
  useEffect(() => {
    return () => {
      if (trackingInterval) clearInterval(trackingInterval);
    };
  }, [trackingInterval]);

  // ── Poll for status changes every 15 s
  useEffect(() => {
    if (!orderId) return;
    const interval = setInterval(async () => {
      const { data } = await supabase
        .from('orders')
        .select('status, rider_lat, rider_lng')
        .eq('id', orderId)
        .single();
      if (data?.status && data.status !== deliveryStatus) {
        setDeliveryStatus(data.status);
        setLastUpdated(new Date());
        const step = STATUS_STEPS.find(s => s.key === data.status);
        if (step) toast.success(`${step.icon} ${step.label}`);
        
        // Start tracking when status changes to out_for_delivery
        if (data.status === 'out_for_delivery') {
          startRiderTracking(orderId);
        }
      }
      if (data?.rider_lat && data?.rider_lng) {
        setRiderLocation({ lat: data.rider_lat, lng: data.rider_lng });
      }
    }, 15_000);
    return () => clearInterval(interval);
  }, [orderId, deliveryStatus]);

  // ── Build map
  const buildMap = useCallback((order: any) => {
    const vLat = order?.vendor?.latitude ?? 6.6018;
    const vLng = order?.vendor?.longitude ?? 3.3515;
    const cLat = order?.dropoff_lat;
    const cLng = order?.dropoff_lng;

    const tryBuild = (attempts = 0) => {
      if (!mapDivRef.current) {
        if (attempts < 30) setTimeout(() => tryBuild(attempts + 1), 100);
        return;
      }
      if (mapInstance.current) return;

      const map = new window.google.maps.Map(mapDivRef.current, {
        center: { lat: vLat, lng: vLng },
        zoom: 14,
        disableDefaultUI: true,
        zoomControl: true,
        styles: [
          { featureType: 'poi',     elementType: 'labels', stylers: [{ visibility: 'off' }] },
          { featureType: 'transit', elementType: 'labels', stylers: [{ visibility: 'off' }] },
        ],
      });

      // Vendor marker (Green)
      const vendorMarker = new window.google.maps.Marker({
        position: { lat: vLat, lng: vLng },
        map,
        title: order?.vendor?.store_name || 'Vendor',
        icon: {
          path: window.google.maps.SymbolPath.CIRCLE,
          scale: 12,
          fillColor: BRAND_GREEN,
          fillOpacity: 1,
          strokeColor: '#fff',
          strokeWeight: 2.5,
        },
      });
      vendorMarkerRef.current = vendorMarker;

      if (cLat && cLng) {
        // Customer marker (Yellow)
        const customerMarker = new window.google.maps.Marker({
          position: { lat: cLat, lng: cLng },
          map,
          title: 'Your location',
          icon: {
            path: window.google.maps.SymbolPath.CIRCLE,
            scale: 12,
            fillColor: BRAND_YELLOW,
            fillOpacity: 1,
            strokeColor: '#fff',
            strokeWeight: 2.5,
          },
        });
        customerMarkerRef.current = customerMarker;

        // Route line
        new window.google.maps.Polyline({
          path: [{ lat: vLat, lng: vLng }, { lat: cLat, lng: cLng }],
          geodesic: true,
          strokeColor: BRAND_GREEN,
          strokeOpacity: 0.5,
          strokeWeight: 3,
          map,
        });

        // Fit both pins
        const bounds = new window.google.maps.LatLngBounds();
        bounds.extend({ lat: vLat, lng: vLng });
        bounds.extend({ lat: cLat, lng: cLng });
        map.fitBounds(bounds, { top: 60, right: 60, bottom: 60, left: 60 });
      }

      // Rider marker (Blue/Animation)
      if (riderLocation) {
        const riderMarker = new window.google.maps.Marker({
          position: { lat: riderLocation.lat, lng: riderLocation.lng },
          map,
          title: 'Rider',
          icon: {
            url: 'https://maps.google.com/mapfiles/ms/icons/blue-dot.png',
            scaledSize: new window.google.maps.Size(40, 40),
          },
          animation: window.google.maps.Animation.BOUNCE,
          zIndex: 10,
        });
        riderMarkerRef.current = riderMarker;
      } else if (cLat && cLng && !riderLocation) {
        // Fallback: midpoint marker
        const midLat = (vLat + cLat) / 2;
        const midLng = (vLng + cLng) / 2;
        const riderMarker = new window.google.maps.Marker({
          position: { lat: midLat, lng: midLng },
          map,
          title: 'Rider',
          icon: {
            url: 'https://maps.google.com/mapfiles/ms/icons/blue-dot.png',
            scaledSize: new window.google.maps.Size(40, 40),
          },
          animation: window.google.maps.Animation.BOUNCE,
          zIndex: 10,
        });
        riderMarkerRef.current = riderMarker;
      }

      mapInstance.current = map;
      setMapReady(true);
    };

    tryBuild();
  }, [riderLocation]);

  // ── Update rider marker when location changes
  useEffect(() => {
    if (mapInstance.current && riderMarkerRef.current && riderLocation) {
      riderMarkerRef.current.setPosition({ lat: riderLocation.lat, lng: riderLocation.lng });
      mapInstance.current.panTo({ lat: riderLocation.lat, lng: riderLocation.lng });
    }
  }, [riderLocation]);

  // ── Load Google Maps then build map once order is ready
  useEffect(() => {
    if (!order) return;
    loadGoogleMaps(() => buildMap(order));
  }, [order, buildMap]);

  const currentStepIdx = STATUS_STEPS.findIndex(s => s.key === deliveryStatus);
  const currentStep = STATUS_STEPS[currentStepIdx];

  // ── ETA string
  const etaString = () => {
    switch (deliveryStatus) {
      case 'confirmed':        return '30–45 min';
      case 'preparing':        return '20–30 min';
      case 'out_for_delivery': return '10–15 min';
      case 'delivered':        return 'Delivered!';
      default:                 return '–';
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-[#10B981] border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-gray-500 text-sm">Loading your order…</p>
        </div>
      </div>
    );
  }

  if (!order) return (
    <div className="min-h-screen flex items-center justify-center">
      <p className="text-gray-500">Order not found.</p>
    </div>
  );

  return (
    <motion.div
      className="min-h-screen bg-[#F7FAF7] pb-24"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.35 }}
    >
      {/* ── HEADER - Brand Green ── */}
      <div className="bg-gradient-to-r from-[#10B981] to-[#059669] px-4 pt-12 pb-4 flex items-center gap-3 sticky top-0 z-20 shadow-md">
        <button onClick={() => navigate('/home')} className="p-2 -ml-2 active:scale-90 transition-transform">
          <ArrowLeft className="w-5 h-5 text-white" />
        </button>
        <h1 className="text-lg font-bold text-white flex-1">Track Order</h1>
        <button onClick={fetchOrder} className="p-2 active:scale-90 transition-transform">
          <RefreshCw className="w-4 h-4 text-white/80" />
        </button>
      </div>

      {/* ── HERO - Brand Green ── */}
      <div className="bg-gradient-to-r from-[#10B981] to-[#059669] px-4 pb-8 text-center">
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: 'spring', damping: 14 }}
          className="w-16 h-16 bg-white rounded-full flex items-center justify-center mx-auto mb-3 shadow-xl"
        >
          <CheckCircle className="w-8 h-8 text-[#10B981]" />
        </motion.div>
        <h2 className="text-xl font-black text-white">Order #{order.id?.slice(-8).toUpperCase()}</h2>
        <p className="text-white/75 text-xs mt-0.5">
          Last updated {lastUpdated.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
        </p>
      </div>

      <div className="px-4 -mt-4 space-y-4">

        {/* ── ETA card ── */}
        <div className="bg-white rounded-2xl shadow-sm p-4 flex items-center justify-between border border-[#D1FAE5]">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-[#F0FDF4] rounded-full flex items-center justify-center text-xl">🛵</div>
            <div>
              <p className="text-xs text-gray-500 font-medium">Estimated arrival</p>
              <p className="text-base font-black text-[#10B981]">{etaString()}</p>
            </div>
          </div>
          <div className="text-right">
            <p className="text-xs text-gray-500">Total paid</p>
            <p className="text-base font-black text-[#10B981]">₦{order.total_amount?.toLocaleString()}</p>
          </div>
        </div>

        {/* ── MAP ── */}
        <div className="bg-white rounded-2xl shadow-sm overflow-hidden border border-[#D1FAE5]">
          <div className="relative" style={{ height: 220 }}>
            <div ref={mapDivRef} className="w-full h-full" />
            {!mapReady && (
              <div className="absolute inset-0 bg-gray-100 flex items-center justify-center gap-2">
                <div className="w-6 h-6 border-2 border-[#10B981] border-t-transparent rounded-full animate-spin" />
                <span className="text-sm text-gray-500">Loading map…</span>
              </div>
            )}
          </div>
          <div className="px-4 py-3 border-t border-[#D1FAE5] flex items-center gap-3">
            <div className="flex items-center gap-1.5">
              <span className="w-3 h-3 rounded-full bg-[#10B981] flex-shrink-0" />
              <p className="text-xs text-gray-600 font-medium">{order.vendor?.store_name}</p>
            </div>
            <span className="text-gray-300">→</span>
            <div className="flex items-center gap-1.5">
              <span className="w-3 h-3 rounded-full bg-[#FBBF24] flex-shrink-0" />
              <p className="text-xs text-gray-600 font-medium truncate max-w-[140px]">
                {order.delivery_address || 'Your location'}
              </p>
            </div>
          </div>
        </div>

        {/* ── STATUS TRACKER - Brand Green ── */}
        <div className="bg-white rounded-2xl shadow-sm p-4 border border-[#D1FAE5]">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-bold text-gray-800">Live Status</h3>
            <div className="flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-[#10B981] animate-pulse" />
              <span className="text-[10px] text-[#10B981] font-semibold">LIVE</span>
            </div>
          </div>

          <div className="space-y-0">
            {STATUS_STEPS.map((step, idx) => {
              const done    = idx <= currentStepIdx;
              const current = idx === currentStepIdx;
              return (
                <div key={step.key} className="flex items-start gap-3">
                  <div className="flex flex-col items-center">
                    <div className={`
                      w-8 h-8 rounded-full flex items-center justify-center text-sm flex-shrink-0
                      transition-all duration-500
                      ${done ? 'bg-[#10B981] shadow-sm' : 'bg-gray-100'}
                    `}>
                      {done
                        ? <span style={{ fontSize: 13 }}>{step.icon}</span>
                        : <span className="w-2 h-2 rounded-full bg-gray-300 block" />
                      }
                    </div>
                    {idx < STATUS_STEPS.length - 1 && (
                      <div className={`w-0.5 h-10 mt-0.5 transition-colors duration-700 ${idx < currentStepIdx ? 'bg-[#10B981]' : 'bg-gray-200'}`} />
                    )}
                  </div>
                  <div className="pb-2 flex-1 pt-1">
                    <div className="flex items-center gap-2">
                      <p className={`text-sm font-bold ${done ? 'text-gray-900' : 'text-gray-400'}`}>{step.label}</p>
                      {current && deliveryStatus !== 'delivered' && (
                        <span className="bg-[#D1FAE5] text-[#10B981] text-[9px] font-bold px-1.5 py-0.5 rounded-full">NOW</span>
                      )}
                    </div>
                    <p className={`text-[11px] ${done ? 'text-gray-500' : 'text-gray-300'}`}>{step.sub}</p>
                    {current && deliveryStatus !== 'delivered' && (
                      <div className="mt-1 flex items-center gap-1">
                        <span className="w-1.5 h-1.5 rounded-full bg-[#10B981] animate-pulse block" />
                        <span className="text-[10px] text-[#10B981] font-semibold">In progress…</span>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* ── ORDER SUMMARY ── */}
        <div className="bg-white rounded-2xl shadow-sm p-4 border border-[#D1FAE5]">
          <h3 className="text-sm font-bold text-gray-800 mb-3">Order Summary</h3>
          <div className="space-y-2">
            {[
              ['Subtotal',   `₦${(order.total_amount - (order.delivery_fee || 0) - (order.service_charge || 0) - (order.tip_amount || 0)).toLocaleString()}`],
              ['Delivery fee', `₦${order.delivery_fee?.toLocaleString() || 0}`],
              ['Service charge (30%)', `₦${order.service_charge?.toLocaleString() || 0}`],
              order.tip_amount > 0 ? ['Tip', `₦${order.tip_amount?.toLocaleString()}`] : null,
              ['Total', `₦${order.total_amount?.toLocaleString()}`],
              ['Address',  order.delivery_address],
              ['Payment',  order.payment_method?.replace('_', ' ')],
            ].filter(Boolean).map(([label, val]) => val ? (
              <div key={label} className="flex justify-between">
                <span className="text-xs text-gray-500">{label}</span>
                <span className="text-xs text-gray-900 font-medium text-right max-w-[55%] capitalize">{val}</span>
              </div>
            ) : null)}
          </div>
        </div>

        {/* ── VENDOR CONTACT ── */}
        {order.vendor && (
          <div className="bg-white rounded-2xl shadow-sm p-4 border border-[#D1FAE5]">
            <h3 className="text-sm font-bold text-gray-800 mb-3">Vendor</h3>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-semibold text-gray-800">{order.vendor.store_name}</p>
                <p className="text-xs text-gray-400">{order.vendor.address || 'Lagos'}</p>
              </div>
              <div className="flex gap-2">
                {order.vendor.phone && (
                  <>
                    <a href={`tel:${order.vendor.phone}`}
                      className="w-10 h-10 rounded-full bg-[#F0FDF4] flex items-center justify-center active:scale-90 transition-transform">
                      <Phone className="w-4 h-4 text-[#10B981]" />
                    </a>
                    <a href={`https://wa.me/${order.vendor.phone.replace(/\D/g, '')}?text=Hello, my order is ${order.id?.slice(-8)}`}
                      target="_blank" rel="noopener noreferrer"
                      className="w-10 h-10 rounded-full bg-[#F0FDF4] flex items-center justify-center active:scale-90 transition-transform">
                      <MessageCircle className="w-4 h-4 text-[#10B981]" />
                    </a>
                  </>
                )}
              </div>
            </div>
          </div>
        )}

        {/* ── RIDER INFO (if out for delivery) ── */}
        {deliveryStatus === 'out_for_delivery' && (
          <div className="bg-white rounded-2xl shadow-sm p-4 border border-[#D1FAE5]">
            <h3 className="text-sm font-bold text-gray-800 mb-3 flex items-center gap-2">
              <span>🛵</span> Rider Information
            </h3>
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <span className="text-xs text-gray-500">Status</span>
                <span className="text-xs font-semibold text-[#10B981] flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#10B981] animate-pulse" />
                  On the way
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-xs text-gray-500">Estimated arrival</span>
                <span className="text-xs font-semibold text-gray-800">{etaString()}</span>
              </div>
            </div>
          </div>
        )}

        {/* ── POST-DELIVERY: Review - Brand Green ── */}
        {deliveryStatus === 'delivered' && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-gradient-to-r from-[#10B981] to-[#059669] rounded-2xl p-4 text-center shadow-md"
          >
            <p className="text-white font-black text-lg mb-1">🎉 Enjoy your meal!</p>
            <p className="text-white/80 text-xs mb-3">How was your experience?</p>
            <div className="flex justify-center gap-2 mb-3">
              {[1,2,3,4,5].map(n => (
                <button key={n}
                  onClick={() => toast.success(`Thanks for rating ${n} star${n > 1 ? 's' : ''}! ⭐`)}
                  className="w-9 h-9 bg-white/20 rounded-full flex items-center justify-center active:scale-90 transition-transform">
                  <Star className="w-4 h-4 text-[#FBBF24] fill-[#FBBF24]" />
                </button>
              ))}
            </div>
            <button onClick={() => navigate('/home')}
              className="bg-white text-[#10B981] font-bold text-sm px-6 py-2 rounded-full active:scale-95 transition-transform shadow-md">
              Order again
            </button>
          </motion.div>
        )}
      </div>

      {/* ── BOTTOM NAV - Brand Green ── */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-[#D1FAE5] px-6 py-2 flex justify-around z-20 shadow-lg">
        {[
          { icon: '🏠', label: 'Home',    route: '/home' },
          { icon: '📦', label: 'Orders',   route: '/orders' },
          { icon: '🛒', label: 'Cart',    route: '/cart' },
          { icon: '👤', label: 'Profile', route: '/profile' },
        ].map(item => (
          <button key={item.label} onClick={() => navigate(item.route)}
            className={`flex flex-col items-center gap-0.5 transition-all active:scale-95
              ${window.location.pathname === item.route ? 'text-[#10B981]' : 'text-gray-400'}`}>
            <span className="text-xl">{item.icon}</span>
            <span className={`text-[9px] ${window.location.pathname === item.route ? 'font-bold' : ''}`}>{item.label}</span>
          </button>
        ))}
      </div>
    </motion.div>
  );
}