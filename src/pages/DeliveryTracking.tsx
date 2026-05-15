import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { supabase } from "@/lib/supabase";
import { ArrowLeft, MapPin, CheckCircle, Clock, Truck } from "lucide-react";

const statusSteps = [
  { key: "pending", label: "Order placed", icon: Clock },
  { key: "paid", label: "Payment confirmed", icon: CheckCircle },
  { key: "assigned", label: "Rider assigned", icon: Truck },
  { key: "picked_up", label: "Picked up", icon: Truck },
  { key: "in_transit", label: "In transit", icon: Truck },
  { key: "delivered", label: "Delivered", icon: CheckCircle },
];

export default function DeliveryTracking() {
  const { trackingNumber } = useParams();
  const navigate = useNavigate();
  const [delivery, setDelivery] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!trackingNumber) return;
    const fetchDelivery = async () => {
      const { data, error } = await supabase
        .from("deliveries")
        .select("*")
        .eq("tracking_number", trackingNumber)
        .maybeSingle();
      if (error || !data) {
        setLoading(false);
      } else {
        setDelivery(data);
        setLoading(false);
      }
    };
    fetchDelivery();

    // Optional: subscribe to realtime updates
    const channel = supabase
      .channel(`delivery-${trackingNumber}`)
      .on(
        "postgres_changes",
        { event: "UPDATE", schema: "public", table: "deliveries", filter: `tracking_number=eq.${trackingNumber}` },
        (payload) => setDelivery(payload.new)
      )
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, [trackingNumber]);

  if (loading) return <div style={{ padding: 20, textAlign: "center" }}>Loading...</div>;
  if (!delivery) return <div style={{ padding: 20, textAlign: "center" }}>Delivery not found</div>;

  const currentStatusIndex = statusSteps.findIndex(s => s.key === delivery.status);

  return (
    <div style={{ maxWidth: 480, margin: "0 auto", background: "#f6f7f9", minHeight: "100vh" }}>
      <div style={{ background: "#1a6b3c", padding: "16px", display: "flex", alignItems: "center", gap: 12 }}>
        <button onClick={() => navigate(-1)} style={{ background: "none", border: "none", color: "white" }}>
          <ArrowLeft size={24} />
        </button>
        <h2 style={{ color: "white", margin: 0, fontSize: 18 }}>Delivery Tracking</h2>
      </div>

      <div style={{ padding: 16 }}>
        <div style={{ background: "white", borderRadius: 16, padding: 16, marginBottom: 16 }}>
          <p style={{ fontWeight: 700, marginBottom: 4 }}>Tracking #{delivery.tracking_number}</p>
          <p style={{ fontSize: 12, color: "#666" }}>Status: <strong>{delivery.status.replace("_", " ")}</strong></p>
        </div>

        <div style={{ background: "white", borderRadius: 16, padding: 16, marginBottom: 16 }}>
          <h3 style={{ fontSize: 14, marginBottom: 12 }}>Delivery progress</h3>
          {statusSteps.map((step, idx) => {
            const isCompleted = idx <= currentStatusIndex;
            const Icon = step.icon;
            return (
              <div key={step.key} style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 12 }}>
                <div style={{ width: 28, height: 28, borderRadius: 14, background: isCompleted ? "#1a6b3c" : "#e0e0e0", display: "flex", alignItems: "center", justifyContent: "center" }}>
                  <Icon size={14} color={isCompleted ? "white" : "#aaa"} />
                </div>
                <div>
                  <p style={{ fontWeight: isCompleted ? 700 : 400, margin: 0 }}>{step.label}</p>
                  {idx === currentStatusIndex && delivery.updated_at && (
                    <p style={{ fontSize: 10, color: "#888", margin: 0 }}>{new Date(delivery.updated_at).toLocaleString()}</p>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        <div style={{ background: "white", borderRadius: 16, padding: 16 }}>
          <h3 style={{ fontSize: 14, marginBottom: 8 }}>Route details</h3>
          <div style={{ display: "flex", gap: 8, marginBottom: 8 }}>
            <MapPin size={16} color="#1a6b3c" />
            <p style={{ fontSize: 12, margin: 0 }}><strong>Pickup:</strong> {delivery.pickup_address}</p>
          </div>
          <div style={{ display: "flex", gap: 8 }}>
            <MapPin size={16} color="#ef4444" />
            <p style={{ fontSize: 12, margin: 0 }}><strong>Dropoff:</strong> {delivery.dropoff_address}</p>
          </div>
        </div>
      </div>
    </div>
  );
}