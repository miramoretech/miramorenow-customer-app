import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { DollarSign, CheckCircle2, Clock, Trash2 } from "lucide-react";
import { toast } from "sonner";

const AdminPayouts = () => {
  const [riders, setRiders] = useState<any[]>([]);
  const [payouts, setPayouts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);

  useEffect(() => { fetchAll(); }, []);

  const fetchAll = async () => {
    const [ridersRes, payoutsRes] = await Promise.all([
      supabase.from("riders").select("*").order("name"),
      supabase.from("payouts").select("*, riders(name)").order("period_end", { ascending: false }),
    ]);
    setRiders(ridersRes.data || []);
    setPayouts(payoutsRes.data || []);
    setLoading(false);
  };

  const ridersWithBalance = riders.filter(r => Number(r.wallet_balance) > 0);
  const totalPending = ridersWithBalance.reduce((s, r) => s + Number(r.wallet_balance), 0);
  const pendingPayoutsCount = payouts.filter(p => p.status === "pending").length;

  const processWeeklyPayouts = async () => {
    if (ridersWithBalance.length === 0) {
      toast.info("No riders with positive balance");
      return;
    }
    setProcessing(true);

    const now = new Date();
    const dayOfWeek = now.getDay();
    const monday = new Date(now);
    monday.setDate(now.getDate() - (dayOfWeek === 0 ? 6 : dayOfWeek - 1));
    monday.setHours(0, 0, 0, 0);
    const sunday = new Date(monday);
    sunday.setDate(monday.getDate() + 6);

    const weekStart = monday.toISOString().split("T")[0];
    const weekEnd = sunday.toISOString().split("T")[0];

    for (const rider of ridersWithBalance) {
      await supabase.from("payouts").insert({
        rider_id: rider.id,
        amount: Number(rider.wallet_balance),
        period_start: weekStart,
        period_end: weekEnd,
        status: "pending",
      });
      // Reset wallet
      await supabase.from("riders").update({ wallet_balance: 0 }).eq("id", rider.id);
    }

    toast.success(`${ridersWithBalance.length} payouts created`);
    setProcessing(false);
    fetchAll();
  };

  const markPaid = async (payoutId: string) => {
    await supabase.from("payouts").update({ status: "paid", paid_at: new Date().toISOString() }).eq("id", payoutId);
    toast.success("Payout marked as paid");
    fetchAll();
  };

  const deletePayout = async (id: string) => {
    if (!confirm("Delete this payout record?")) return;
    await supabase.from("payouts").delete().eq("id", id);
    toast.success("Payout deleted");
    fetchAll();
  };

  if (loading) return <div className="space-y-4">{Array(4).fill(0).map((_, i) => <Skeleton key={i} className="h-16 rounded-xl" />)}</div>;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Payouts</h1>
        <Button
          onClick={processWeeklyPayouts}
          disabled={processing || ridersWithBalance.length === 0}
          className="bg-green-600 hover:bg-green-700"
        >
          <DollarSign className="w-4 h-4 mr-1" />
          {processing ? "Processing..." : "Process Weekly Payouts"}
        </Button>
      </div>

      {/* Summary */}
      <div className="grid grid-cols-3 gap-4">
        <Card className="border-0 shadow-sm">
          <CardContent className="p-4 text-center">
            <DollarSign className="w-6 h-6 mx-auto text-amber-500 mb-1" />
            <p className="text-xl font-bold text-amber-700">₦{totalPending.toLocaleString()}</p>
            <p className="text-xs text-gray-500">Pending Balance</p>
          </CardContent>
        </Card>
        <Card className="border-0 shadow-sm">
          <CardContent className="p-4 text-center">
            <Clock className="w-6 h-6 mx-auto text-yellow-500 mb-1" />
            <p className="text-xl font-bold">{pendingPayoutsCount}</p>
            <p className="text-xs text-gray-500">Pending Payouts</p>
          </CardContent>
        </Card>
        <Card className="border-0 shadow-sm">
          <CardContent className="p-4 text-center">
            <CheckCircle2 className="w-6 h-6 mx-auto text-green-500 mb-1" />
            <p className="text-xl font-bold">{payouts.filter(p => p.status === "paid").length}</p>
            <p className="text-xs text-gray-500">Completed</p>
          </CardContent>
        </Card>
      </div>

      {/* Riders with Balance */}
      {ridersWithBalance.length > 0 && (
        <Card className="border-0 shadow-sm">
          <CardHeader className="pb-2">
            <CardTitle className="text-base">Riders with Pending Balance</CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-100 bg-gray-50/50">
                  <th className="text-left py-3 px-4 text-gray-500 font-medium">Rider</th>
                  <th className="text-left py-3 px-4 text-gray-500 font-medium">Deliveries</th>
                  <th className="text-left py-3 px-4 text-gray-500 font-medium">Wallet Balance</th>
                </tr>
              </thead>
              <tbody>
                {ridersWithBalance.map(r => (
                  <tr key={r.id} className="border-b border-gray-50">
                    <td className="py-3 px-4 font-medium">{r.name}</td>
                    <td className="py-3 px-4">{r.total_deliveries}</td>
                    <td className="py-3 px-4 font-bold text-green-700">₦{Number(r.wallet_balance).toLocaleString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </CardContent>
        </Card>
      )}

      {/* Payout History */}
      <Card className="border-0 shadow-sm">
        <CardHeader className="pb-2">
          <CardTitle className="text-base">Payout History</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-100 bg-gray-50/50">
                <th className="text-left py-3 px-4 text-gray-500 font-medium">Rider</th>
                <th className="text-left py-3 px-4 text-gray-500 font-medium">Period</th>
                <th className="text-left py-3 px-4 text-gray-500 font-medium">Amount</th>
                <th className="text-left py-3 px-4 text-gray-500 font-medium">Status</th>
                <th className="text-left py-3 px-4 text-gray-500 font-medium">Actions</th>
              </tr>
            </thead>
            <tbody>
              {payouts.map(p => (
                <tr key={p.id} className="border-b border-gray-50">
                  <td className="py-3 px-4 font-medium">{(p.riders as any)?.name}</td>
                  <td className="py-3 px-4 text-gray-500">{p.period_start} → {p.period_end}</td>
                  <td className="py-3 px-4 font-bold">₦{Number(p.amount).toLocaleString()}</td>
                  <td className="py-3 px-4">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${p.status === "paid" ? "bg-green-100 text-green-700" : "bg-yellow-100 text-yellow-700"}`}>
                      {p.status}
                    </span>
                  </td>
                  <td className="py-3 px-4">
                    <div className="flex gap-1">
                      {p.status === "pending" && (
                        <Button size="sm" variant="outline" onClick={() => markPaid(p.id)}>Mark Paid</Button>
                      )}
                      <Button variant="ghost" size="sm" onClick={() => deletePayout(p.id)} className="text-red-500 hover:text-red-700"><Trash2 className="w-3.5 h-3.5" /></Button>
                    </div>
                  </td>
                </tr>
              ))}
              {payouts.length === 0 && <tr><td colSpan={5} className="py-8 text-center text-gray-400">No payouts yet</td></tr>}
            </tbody>
          </table>
        </CardContent>
      </Card>
    </div>
  );
};

export default AdminPayouts;
