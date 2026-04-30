import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { getRiderSession, riderLogout } from "@/lib/riderAuth";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import {
  Bike, LogOut, Wallet, Clock, CheckCircle2, Package, MapPin, History, DollarSign
} from "lucide-react";
import { cn } from "@/lib/utils";

interface OrderData {
  id: string;
  items: any;
  total_amount: number;
  status: string;
  created_at: string;
  customer_id: string;
  vendor_id: string;
}

const RiderDashboard = () => {
  const navigate = useNavigate();
  const session = getRiderSession();
  const [isOnline, setIsOnline] = useState(false);
  const [walletBalance, setWalletBalance] = useState(0);
  const [totalDeliveries, setTotalDeliveries] = useState(0);
  const [currentOrder, setCurrentOrder] = useState<OrderData | null>(null);
  const [availableOrders, setAvailableOrders] = useState<OrderData[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!session) {
      navigate("/rider/login");
      return;
    }
    fetchRiderData();
    fetchOrders();

    // Real-time subscription
    const channel = supabase
      .channel("rider-orders")
      .on("postgres_changes", { event: "*", schema: "public", table: "orders" }, () => {
        fetchOrders();
      })
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, []);

  const fetchRiderData = async () => {
    if (!session) return;
    const { data } = await supabase
      .from("riders")
      .select("wallet_balance, total_deliveries, is_online")
      .eq("id", session.id)
      .single();
    if (data) {
      setWalletBalance(Number(data.wallet_balance));
      setTotalDeliveries(data.total_deliveries);
      setIsOnline(data.is_online ?? false);
    }
  };

  const fetchOrders = async () => {
    if (!session) return;
    setLoading(true);

    // Current active order
    const { data: active } = await supabase
      .from("orders")
      .select("*")
      .eq("rider_id", session.id)
      .in("status", ["confirmed", "preparing", "out_for_delivery"])
      .order("created_at", { ascending: false })
      .limit(1);

    if (active && active.length > 0) {
      setCurrentOrder(active[0]);
      setAvailableOrders([]);
    } else {
      setCurrentOrder(null);
      // Available assigned orders
      const { data: available } = await supabase
        .from("orders")
        .select("*")
        .eq("rider_id", session.id)
        .eq("status", "pending")
        .order("created_at", { ascending: false });
      setAvailableOrders(available || []);
    }
    setLoading(false);
  };

  const toggleOnline = async () => {
    if (!session) return;
    const newStatus = !isOnline;
    await supabase.from("riders").update({ is_online: newStatus }).eq("id", session.id);
    setIsOnline(newStatus);
  };

  const acceptOrder = async (orderId: string) => {
    await supabase.from("orders").update({ status: "confirmed" }).eq("id", orderId);
    fetchOrders();
  };

  const pickupOrder = async () => {
    if (!currentOrder) return;
    await supabase.from("orders").update({ status: "out_for_delivery" }).eq("id", currentOrder.id);
    fetchOrders();
  };

  const deliverOrder = async () => {
    if (!currentOrder || !session) return;

    // Get commission from settings
    const { data: settings } = await supabase
      .from("admin_settings")
      .select("value")
      .eq("key", "rider_commission_per_delivery")
      .maybeSingle();

    const commission = settings ? Number(settings.value) : 500;

    // Update order
    await supabase.from("orders").update({
      status: "delivered",
      delivered_at: new Date().toISOString(),
    }).eq("id", currentOrder.id);

    // Create delivery job record
    await supabase.from("delivery_jobs").insert({
      order_id: currentOrder.id,
      rider_id: session.id,
      status: "delivered",
      delivered_at: new Date().toISOString(),
      earnings: commission,
    });

    // Update rider wallet & stats
    await supabase.from("riders").update({
      wallet_balance: walletBalance + commission,
      total_deliveries: totalDeliveries + 1,
    }).eq("id", session.id);

    setWalletBalance(walletBalance + commission);
    setTotalDeliveries(totalDeliveries + 1);
    fetchOrders();
  };

  const handleLogout = () => {
    riderLogout();
    navigate("/rider/login");
  };

  if (!session) return null;

  const statusLabel: Record<string, string> = {
    pending: "Waiting for Accept",
    confirmed: "Accepted – Head to Pickup",
    preparing: "Vendor Preparing",
    out_for_delivery: "Picked Up – Delivering",
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-green-600 text-white px-4 py-4 safe-area-pt">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center">
              <Bike className="w-5 h-5" />
            </div>
            <div>
              <p className="font-bold text-sm">{session.name}</p>
              <p className="text-[11px] text-white/70">Rider</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2 bg-white/20 rounded-full px-3 py-1.5">
              <span className="text-xs font-medium">{isOnline ? "Online" : "Offline"}</span>
              <Switch checked={isOnline} onCheckedChange={toggleOnline} className="data-[state=checked]:bg-green-300" />
            </div>
            <button onClick={handleLogout} className="p-2 hover:bg-white/10 rounded-full">
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-3 mt-4">
          <div className="bg-white/15 rounded-xl p-3 text-center">
            <Wallet className="w-4 h-4 mx-auto mb-1" />
            <p className="text-lg font-bold">₦{walletBalance.toLocaleString()}</p>
            <p className="text-[10px] text-white/70">Wallet</p>
          </div>
          <div className="bg-white/15 rounded-xl p-3 text-center">
            <Package className="w-4 h-4 mx-auto mb-1" />
            <p className="text-lg font-bold">{totalDeliveries}</p>
            <p className="text-[10px] text-white/70">Deliveries</p>
          </div>
          <div className="bg-white/15 rounded-xl p-3 text-center">
            <Clock className="w-4 h-4 mx-auto mb-1" />
            <p className="text-lg font-bold">{availableOrders.length}</p>
            <p className="text-[10px] text-white/70">Pending</p>
          </div>
        </div>
      </header>

      <div className="p-4 space-y-4 pb-24">
        {/* Current Order */}
        {currentOrder && (
          <div className="bg-white rounded-2xl shadow-sm border p-4">
            <div className="flex items-center gap-2 mb-3">
              <div className="w-2 h-2 bg-orange-500 rounded-full animate-pulse" />
              <h2 className="font-bold text-sm">Current Delivery</h2>
            </div>

            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-500">Order ID</span>
                <span className="font-mono text-xs">{currentOrder.id.slice(0, 8)}...</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Amount</span>
                <span className="font-bold">₦{Number(currentOrder.total_amount).toLocaleString()}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Status</span>
                <span className="text-orange-600 font-medium text-xs">
                  {statusLabel[currentOrder.status] || currentOrder.status}
                </span>
              </div>
            </div>

            <div className="mt-4 space-y-2">
              {currentOrder.status === "confirmed" || currentOrder.status === "preparing" ? (
                <Button onClick={pickupOrder} className="w-full bg-blue-600 hover:bg-blue-700">
                  <MapPin className="w-4 h-4 mr-2" /> Mark as Picked Up
                </Button>
              ) : currentOrder.status === "out_for_delivery" ? (
                <Button onClick={deliverOrder} className="w-full bg-green-600 hover:bg-green-700">
                  <CheckCircle2 className="w-4 h-4 mr-2" /> Mark as Delivered
                </Button>
              ) : null}
            </div>
          </div>
        )}

        {/* Available Orders */}
        {!currentOrder && availableOrders.length > 0 && (
          <div>
            <h2 className="font-bold text-sm mb-3">Available Orders</h2>
            <div className="space-y-3">
              {availableOrders.map((order) => (
                <div key={order.id} className="bg-white rounded-2xl shadow-sm border p-4">
                  <div className="flex justify-between items-start mb-2">
                    <div>
                      <p className="font-mono text-xs text-gray-500">{order.id.slice(0, 8)}...</p>
                      <p className="font-bold text-sm">₦{Number(order.total_amount).toLocaleString()}</p>
                    </div>
                    <span className="text-[10px] bg-yellow-100 text-yellow-700 px-2 py-0.5 rounded-full font-medium">
                      Pending
                    </span>
                  </div>
                  <Button
                    onClick={() => acceptOrder(order.id)}
                    size="sm"
                    className="w-full bg-green-600 hover:bg-green-700 mt-2"
                  >
                    Accept Order
                  </Button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* No orders state */}
        {!currentOrder && availableOrders.length === 0 && !loading && (
          <div className="text-center py-12">
            <Bike className="w-12 h-12 text-gray-300 mx-auto mb-3" />
            <p className="text-gray-500 font-medium">No orders right now</p>
            <p className="text-gray-400 text-sm mt-1">
              {isOnline ? "You'll be notified when orders come in" : "Go online to receive orders"}
            </p>
          </div>
        )}

        {/* Quick Links */}
        <div className="grid grid-cols-2 gap-3">
          <button
            onClick={() => navigate("/rider/history")}
            className="bg-white rounded-2xl p-4 shadow-sm border flex items-center gap-3 hover:bg-gray-50 transition"
          >
            <History className="w-5 h-5 text-green-600" />
            <span className="text-sm font-medium">History</span>
          </button>
          <button
            onClick={() => navigate("/rider/earnings")}
            className="bg-white rounded-2xl p-4 shadow-sm border flex items-center gap-3 hover:bg-gray-50 transition"
          >
            <DollarSign className="w-5 h-5 text-green-600" />
            <span className="text-sm font-medium">Earnings</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default RiderDashboard;
