import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { ArrowLeft, Bike, Wallet, Package, Plus } from "lucide-react";
import { toast } from "sonner";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";

const AdminRiderDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [rider, setRider] = useState<any>(null);
  const [jobs, setJobs] = useState<any[]>([]);
  const [payouts, setPayouts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddFunds, setShowAddFunds] = useState(false);
  const [addAmount, setAddAmount] = useState("");

  useEffect(() => {
    fetchData();
  }, [id]);

  const fetchData = async () => {
    const [riderRes, jobsRes, payoutsRes] = await Promise.all([
      supabase.from("riders").select("*").eq("id", id).single(),
      supabase.from("delivery_jobs").select("*, orders(id, category, total_amount, created_at)").eq("rider_id", id).order("assigned_at", { ascending: false }),
      supabase.from("payouts").select("*").eq("rider_id", id).order("period_end", { ascending: false }),
    ]);
    setRider(riderRes.data);
    setJobs(jobsRes.data || []);
    setPayouts(payoutsRes.data || []);
    setLoading(false);
  };

  const addToWallet = async () => {
    const amt = Number(addAmount);
    if (!amt || amt <= 0) return;
    await supabase.from("riders").update({ wallet_balance: Number(rider.wallet_balance) + amt }).eq("id", id);
    toast.success(`₦${amt.toLocaleString()} added to wallet`);
    setShowAddFunds(false);
    setAddAmount("");
    fetchData();
  };

  const markPayoutPaid = async (payoutId: string) => {
    await supabase.from("payouts").update({ status: "paid", paid_at: new Date().toISOString() }).eq("id", payoutId);
    toast.success("Payout marked as paid");
    fetchData();
  };

  const toggleActive = async () => {
    await supabase.from("riders").update({ is_active: !rider.is_active }).eq("id", id);
    toast.success(rider.is_active ? "Rider deactivated" : "Rider activated");
    fetchData();
  };

  if (loading) return <div className="space-y-4"><Skeleton className="h-12" /><Skeleton className="h-64" /></div>;
  if (!rider) return <p>Rider not found</p>;

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <Button variant="ghost" size="icon" onClick={() => navigate("/admin/riders")}><ArrowLeft className="w-5 h-5" /></Button>
        <div>
          <h1 className="text-xl font-bold text-gray-900">{rider.name}</h1>
          <p className="text-sm text-gray-500">{rider.email}</p>
        </div>
        <div className="ml-auto flex gap-2">
          <Button variant="outline" size="sm" onClick={toggleActive}>{rider.is_active ? "Deactivate" : "Activate"}</Button>
          <Button size="sm" onClick={() => setShowAddFunds(true)} className="bg-green-600 hover:bg-green-700"><Plus className="w-4 h-4 mr-1" /> Add to Wallet</Button>
        </div>
      </div>

      <div className="grid md:grid-cols-3 gap-4">
        <Card className="border-0 shadow-sm">
          <CardContent className="p-4 text-center">
            <Bike className="w-8 h-8 mx-auto text-amber-500 mb-2" />
            <p className="text-2xl font-bold">{rider.total_deliveries}</p>
            <p className="text-xs text-gray-500">Total Deliveries</p>
          </CardContent>
        </Card>
        <Card className="border-0 shadow-sm">
          <CardContent className="p-4 text-center">
            <Wallet className="w-8 h-8 mx-auto text-green-500 mb-2" />
            <p className="text-2xl font-bold text-green-700">₦{Number(rider.wallet_balance).toLocaleString()}</p>
            <p className="text-xs text-gray-500">Wallet Balance</p>
          </CardContent>
        </Card>
        <Card className="border-0 shadow-sm">
          <CardContent className="p-4 text-center">
            <Package className="w-8 h-8 mx-auto text-blue-500 mb-2" />
            <p className="text-2xl font-bold">{rider.vehicle_type}</p>
            <p className="text-xs text-gray-500">{rider.license_plate}</p>
          </CardContent>
        </Card>
      </div>

      {/* Delivery History */}
      <Card className="border-0 shadow-sm">
        <CardHeader className="pb-2"><CardTitle className="text-base">Delivery History</CardTitle></CardHeader>
        <CardContent>
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-100"><th className="text-left py-2 text-gray-500">Order</th><th className="text-left py-2 text-gray-500">Category</th><th className="text-left py-2 text-gray-500">Earnings</th><th className="text-left py-2 text-gray-500">Status</th><th className="text-left py-2 text-gray-500">Date</th></tr>
            </thead>
            <tbody>
              {jobs.map(j => (
                <tr key={j.id} className="border-b border-gray-50">
                  <td className="py-2 font-mono text-xs text-amber-600">{j.order_id?.slice(0, 8)}...</td>
                  <td className="py-2 capitalize">{(j.orders as any)?.category}</td>
                  <td className="py-2 text-green-700 font-medium">₦{Number(j.earnings).toLocaleString()}</td>
                  <td className="py-2"><span className={`px-2 py-0.5 rounded-full text-xs ${j.status === 'delivered' ? 'bg-green-100 text-green-700' : 'bg-amber-100 text-amber-700'}`}>{j.status}</span></td>
                  <td className="py-2 text-gray-500">{new Date(j.assigned_at).toLocaleDateString()}</td>
                </tr>
              ))}
              {jobs.length === 0 && <tr><td colSpan={5} className="py-8 text-center text-gray-400">No deliveries yet</td></tr>}
            </tbody>
          </table>
        </CardContent>
      </Card>

      {/* Payouts */}
      <Card className="border-0 shadow-sm">
        <CardHeader className="pb-2"><CardTitle className="text-base">Payouts</CardTitle></CardHeader>
        <CardContent>
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-100"><th className="text-left py-2 text-gray-500">Period</th><th className="text-left py-2 text-gray-500">Amount</th><th className="text-left py-2 text-gray-500">Status</th><th className="text-left py-2 text-gray-500">Actions</th></tr>
            </thead>
            <tbody>
              {payouts.map(p => (
                <tr key={p.id} className="border-b border-gray-50">
                  <td className="py-2">{p.period_start} → {p.period_end}</td>
                  <td className="py-2 font-medium">₦{Number(p.amount).toLocaleString()}</td>
                  <td className="py-2"><span className={`px-2 py-0.5 rounded-full text-xs ${p.status === 'paid' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'}`}>{p.status}</span></td>
                  <td className="py-2">{p.status === 'pending' && <Button size="sm" variant="outline" onClick={() => markPayoutPaid(p.id)}>Mark Paid</Button>}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </CardContent>
      </Card>

      {/* Add Funds Dialog */}
      <Dialog open={showAddFunds} onOpenChange={setShowAddFunds}>
        <DialogContent>
          <DialogHeader><DialogTitle>Add to {rider.name}'s Wallet</DialogTitle></DialogHeader>
          <div className="space-y-3 py-4">
            <label className="text-sm font-medium">Amount (₦)</label>
            <Input type="number" placeholder="Enter amount" value={addAmount} onChange={(e) => setAddAmount(e.target.value)} />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowAddFunds(false)}>Cancel</Button>
            <Button onClick={addToWallet} className="bg-green-600 hover:bg-green-700">Add Funds</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AdminRiderDetail;
