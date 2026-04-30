import { useEffect, useState } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { ArrowLeft, User, Store, Bike, Package, CreditCard } from "lucide-react";
import { toast } from "sonner";

const statusOptions = ["pending", "confirmed", "preparing", "out_for_delivery", "delivered", "cancelled"];

const AdminOrderDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [order, setOrder] = useState<any>(null);
  const [riders, setRiders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchOrder();
    fetchRiders();
  }, [id]);

  const fetchOrder = async () => {
    const { data } = await supabase
      .from("orders")
      .select("*, customers(*), vendors(*), riders(*)")
      .eq("id", id)
      .single();
    setOrder(data);
    setLoading(false);
  };

  const fetchRiders = async () => {
    const { data } = await supabase.from("riders").select("*").eq("is_active", true);
    setRiders(data || []);
  };

  const updateStatus = async (newStatus: string) => {
    const updateData: any = { status: newStatus };
    if (newStatus === "delivered") updateData.delivered_at = new Date().toISOString();
    await supabase.from("orders").update(updateData).eq("id", id);
    toast.success(`Order status updated to ${newStatus}`);
    fetchOrder();
  };

  const assignRider = async (riderId: string) => {
    await supabase.from("orders").update({ rider_id: riderId || null }).eq("id", id);
    if (riderId) {
      await supabase.from("delivery_jobs").insert({
        order_id: id,
        rider_id: riderId,
        earnings: Number(order.delivery_fee) * 0.7,
        status: "assigned",
      });
    }
    toast.success(riderId ? "Rider assigned" : "Rider unassigned");
    fetchOrder();
  };

  if (loading) return <div className="space-y-4"><Skeleton className="h-12" /><Skeleton className="h-64" /></div>;
  if (!order) return <div className="text-center py-12"><p>Order not found</p><Link to="/admin/orders"><Button className="mt-4">Back to Orders</Button></Link></div>;

  const items = Array.isArray(order.items) ? order.items : [];

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <Button variant="ghost" size="icon" onClick={() => navigate("/admin/orders")}>
          <ArrowLeft className="w-5 h-5" />
        </Button>
        <div>
          <h1 className="text-xl font-bold text-gray-900">Order #{order.id.slice(0, 8)}</h1>
          <p className="text-sm text-gray-500">{new Date(order.created_at).toLocaleString()}</p>
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-4">
        {/* Order Info */}
        <Card className="border-0 shadow-sm">
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2"><Package className="w-4 h-4" /> Order Details</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex justify-between"><span className="text-gray-500">Category</span><span className="capitalize font-medium">{order.category}</span></div>
            <div className="flex justify-between"><span className="text-gray-500">Status</span>
              <select value={order.status} onChange={(e) => updateStatus(e.target.value)} className="border rounded-lg px-2 py-1 text-sm">
                {statusOptions.map(s => <option key={s} value={s}>{s.replace(/_/g, ' ')}</option>)}
              </select>
            </div>
            <div className="border-t pt-3 mt-3">
              <p className="text-sm font-medium mb-2">Items</p>
              {items.map((item: any, i: number) => (
                <div key={i} className="flex justify-between text-sm py-1">
                  <span>{item.name} × {item.quantity}</span>
                  <span>₦{(item.price * item.quantity).toLocaleString()}</span>
                </div>
              ))}
              <div className="border-t mt-2 pt-2 flex justify-between text-sm"><span>Delivery Fee</span><span>₦{Number(order.delivery_fee).toLocaleString()}</span></div>
              <div className="flex justify-between font-bold mt-1"><span>Total</span><span>₦{(Number(order.total_amount) + Number(order.delivery_fee)).toLocaleString()}</span></div>
            </div>
          </CardContent>
        </Card>

        {/* Customer, Vendor, Rider */}
        <div className="space-y-4">
          <Card className="border-0 shadow-sm">
            <CardHeader className="pb-3">
              <CardTitle className="text-base flex items-center gap-2"><User className="w-4 h-4" /> Customer</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="font-medium">{(order.customers as any)?.name}</p>
              <p className="text-sm text-gray-500">{(order.customers as any)?.email}</p>
              <p className="text-sm text-gray-500">{(order.customers as any)?.phone}</p>
            </CardContent>
          </Card>
          <Card className="border-0 shadow-sm">
            <CardHeader className="pb-3">
              <CardTitle className="text-base flex items-center gap-2"><Store className="w-4 h-4" /> Vendor</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="font-medium">{(order.vendors as any)?.name}</p>
              <p className="text-sm text-gray-500">{(order.vendors as any)?.address}</p>
            </CardContent>
          </Card>
          <Card className="border-0 shadow-sm">
            <CardHeader className="pb-3">
              <CardTitle className="text-base flex items-center gap-2"><Bike className="w-4 h-4" /> Rider Assignment</CardTitle>
            </CardHeader>
            <CardContent>
              <select
                value={order.rider_id || ""}
                onChange={(e) => assignRider(e.target.value)}
                className="w-full border rounded-lg px-3 py-2 text-sm"
              >
                <option value="">Unassigned</option>
                {riders.map(r => <option key={r.id} value={r.id}>{r.name} ({r.vehicle_type})</option>)}
              </select>
            </CardContent>
          </Card>
          <Card className="border-0 shadow-sm">
            <CardHeader className="pb-3">
              <CardTitle className="text-base flex items-center gap-2"><CreditCard className="w-4 h-4" /> Payment</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex justify-between text-sm"><span className="text-gray-500">Method</span><span className="capitalize">{order.payment_method}</span></div>
              <div className="flex justify-between text-sm mt-1"><span className="text-gray-500">Status</span>
                <span className={`px-2 py-0.5 rounded-full text-xs ${order.payment_status === 'paid' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'}`}>{order.payment_status}</span>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default AdminOrderDetail;
