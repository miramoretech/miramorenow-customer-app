import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { getRiderSession } from "@/lib/riderAuth";
import { ArrowLeft, Wallet, TrendingUp, Calendar } from "lucide-react";

const RiderEarnings = () => {
  const navigate = useNavigate();
  const session = getRiderSession();
  const [walletBalance, setWalletBalance] = useState(0);
  const [todayEarnings, setTodayEarnings] = useState(0);
  const [weekEarnings, setWeekEarnings] = useState(0);
  const [totalEarnings, setTotalEarnings] = useState(0);

  useEffect(() => {
    if (!session) { navigate("/rider/login"); return; }
    fetchEarnings();
  }, []);

  const fetchEarnings = async () => {
    if (!session) return;

    const { data: rider } = await supabase
      .from("riders")
      .select("wallet_balance")
      .eq("id", session.id)
      .single();

    if (rider) setWalletBalance(Number(rider.wallet_balance));

    const { data: jobs } = await supabase
      .from("delivery_jobs")
      .select("earnings, delivered_at")
      .eq("rider_id", session.id)
      .eq("status", "delivered");

    if (jobs) {
      const now = new Date();
      const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate()).toISOString();
      const weekStart = new Date(now.getFullYear(), now.getMonth(), now.getDate() - now.getDay() + 1).toISOString();

      let today = 0, week = 0, total = 0;
      jobs.forEach((j) => {
        const e = Number(j.earnings);
        total += e;
        if (j.delivered_at && j.delivered_at >= todayStart) today += e;
        if (j.delivered_at && j.delivered_at >= weekStart) week += e;
      });

      setTodayEarnings(today);
      setWeekEarnings(week);
      setTotalEarnings(total);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-green-600 text-white px-4 py-4 flex items-center gap-3">
        <button onClick={() => navigate("/rider/dashboard")} className="p-1"><ArrowLeft className="w-5 h-5" /></button>
        <h1 className="font-bold">Earnings</h1>
      </header>

      <div className="p-4 space-y-4">
        {/* Wallet */}
        <div className="bg-gradient-to-br from-green-600 to-green-700 rounded-2xl p-5 text-white text-center">
          <Wallet className="w-8 h-8 mx-auto mb-2 opacity-80" />
          <p className="text-sm opacity-80">Wallet Balance</p>
          <p className="text-3xl font-bold mt-1">₦{walletBalance.toLocaleString()}</p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-3">
          <div className="bg-white rounded-xl p-4 text-center shadow-sm border">
            <TrendingUp className="w-4 h-4 text-green-600 mx-auto mb-1" />
            <p className="text-lg font-bold">₦{todayEarnings.toLocaleString()}</p>
            <p className="text-[10px] text-gray-500">Today</p>
          </div>
          <div className="bg-white rounded-xl p-4 text-center shadow-sm border">
            <Calendar className="w-4 h-4 text-blue-600 mx-auto mb-1" />
            <p className="text-lg font-bold">₦{weekEarnings.toLocaleString()}</p>
            <p className="text-[10px] text-gray-500">This Week</p>
          </div>
          <div className="bg-white rounded-xl p-4 text-center shadow-sm border">
            <Wallet className="w-4 h-4 text-orange-600 mx-auto mb-1" />
            <p className="text-lg font-bold">₦{totalEarnings.toLocaleString()}</p>
            <p className="text-[10px] text-gray-500">All Time</p>
          </div>
        </div>

        <p className="text-xs text-gray-400 text-center italic mt-4">
          Payouts are processed weekly by the admin team.
        </p>
      </div>
    </div>
  );
};

export default RiderEarnings;
