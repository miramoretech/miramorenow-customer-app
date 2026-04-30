import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { getRiderSession } from "@/lib/riderAuth";
import { ArrowLeft, Package } from "lucide-react";

interface DeliveryJob {
  id: string;
  order_id: string;
  earnings: number;
  delivered_at: string | null;
  status: string;
}

const RiderHistory = () => {
  const navigate = useNavigate();
  const session = getRiderSession();
  const [jobs, setJobs] = useState<DeliveryJob[]>([]);

  useEffect(() => {
    if (!session) { navigate("/rider/login"); return; }
    fetchHistory();
  }, []);

  const fetchHistory = async () => {
    if (!session) return;
    const { data } = await supabase
      .from("delivery_jobs")
      .select("*")
      .eq("rider_id", session.id)
      .eq("status", "delivered")
      .order("delivered_at", { ascending: false })
      .limit(50);
    setJobs(data || []);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-green-600 text-white px-4 py-4 flex items-center gap-3">
        <button onClick={() => navigate("/rider/dashboard")} className="p-1"><ArrowLeft className="w-5 h-5" /></button>
        <h1 className="font-bold">Delivery History</h1>
      </header>

      <div className="p-4 space-y-3">
        {jobs.length === 0 ? (
          <div className="text-center py-12">
            <Package className="w-12 h-12 text-gray-300 mx-auto mb-3" />
            <p className="text-gray-500">No deliveries yet</p>
          </div>
        ) : (
          jobs.map((job) => (
            <div key={job.id} className="bg-white rounded-xl p-4 shadow-sm border">
              <div className="flex justify-between items-center">
                <div>
                  <p className="font-mono text-xs text-gray-500">{job.order_id.slice(0, 8)}...</p>
                  <p className="text-xs text-gray-400 mt-0.5">
                    {job.delivered_at ? new Date(job.delivered_at).toLocaleDateString("en-NG", { day: "numeric", month: "short", year: "numeric" }) : "N/A"}
                  </p>
                </div>
                <span className="font-bold text-green-600">₦{Number(job.earnings).toLocaleString()}</span>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default RiderHistory;
