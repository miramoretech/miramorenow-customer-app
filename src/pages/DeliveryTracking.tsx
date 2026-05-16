// src/pages/DeliveryTracking.tsx
// Full delivery tracking page — real-time Supabase updates, clean UI
import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { supabase } from "@/lib/supabase";
import { ArrowLeft, MapPin, CheckCircle, Clock, Truck, Package, Phone } from "lucide-react";

const STATUS_STEPS = [
  { key: "pending",   label: "Order placed",       icon: Clock,       desc: "We received your request" },
  { key: "paid",      label: "Payment confirmed",   icon: CheckCircle, desc: "Payment verified" },
  { key: "assigned",  label: "Rider assigned",      icon: Truck,       desc: "A rider is on the way to pick up" },
  { key: "picked_up", label: "Package picked up",   icon: Package,     desc: "Rider has your package" },
  { key: "in_transit",label: "In transit",          icon: Truck,       desc: "On the way to recipient" },
  { key: "delivered", label: "Delivered",           icon: CheckCircle, desc: "Package delivered successfully" },
];

const STATUS_COLOR: Record<string, string> = {
  pending:    "#f59e0b",
  paid:       "#3b82f6",
  assigned:   "#8b5cf6",
  picked_up:  "#f97316",
  in_transit: "#06b6d4",
  delivered:  "#1a6b3c",
  cancelled:  "#ef4444",
};

export default function DeliveryTracking() {
  const { trackingNumber } = useParams();
  const navigate = useNavigate();
  const [delivery, setDelivery] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    if (!trackingNumber) return;

    const fetchDelivery = async () => {
      const { data, error } = await supabase
        .from("deliveries")
        .select("*")
        .eq("tracking_number", trackingNumber)
        .maybeSingle();

      if (error || !data) {
        setNotFound(true);
      } else {
        setDelivery(data);
      }
      setLoading(false);
    };

    fetchDelivery();

    // Real-time updates
    const channel = supabase
      .channel(`delivery-track-${trackingNumber}`)
      .on(
        "postgres_changes",
        {
          event: "UPDATE",
          schema: "public",
          table: "deliveries",
          filter: `tracking_number=eq.${trackingNumber}`,
        },
        (payload) => {
          setDelivery(payload.new);
        }
      )
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, [trackingNumber]);

  if (loading) {
    return (
      <div style={styles.page}>
        <div style={styles.header}>
          <button onClick={() => navigate(-1)} style={styles.backBtn}>←</button>
          <h2 style={styles.headerTitle}>Tracking</h2>
        </div>
        <div style={styles.centerWrap}>
          <div style={styles.spinner} />
          <p style={styles.loadingText}>Finding your delivery...</p>
        </div>
      </div>
    );
  }

  if (notFound) {
    return (
      <div style={styles.page}>
        <div style={styles.header}>
          <button onClick={() => navigate(-1)} style={styles.backBtn}>←</button>
          <h2 style={styles.headerTitle}>Tracking</h2>
        </div>
        <div style={styles.centerWrap}>
          <p style={{ fontSize: 48, margin: "0 0 12px" }}>📦</p>
          <p style={styles.notFoundTitle}>Delivery not found</p>
          <p style={styles.notFoundSub}>Tracking number: {trackingNumber}</p>
          <button onClick={() => navigate("/send")} style={styles.retryBtn}>
            Send a new package
          </button>
        </div>
      </div>
    );
  }

  const currentStatusIndex = STATUS_STEPS.findIndex((s) => s.key === delivery.status);
  const statusColor = STATUS_COLOR[delivery.status] || "#1a6b3c";

  return (
    <div style={styles.page}>
      {/* Header */}
      <div style={{ ...styles.header, background: statusColor }}>
        <button onClick={() => navigate(-1)} style={styles.backBtn}>←</button>
        <div>
          <h2 style={styles.headerTitle}>Live Tracking</h2>
          <p style={styles.headerSub}>#{delivery.tracking_number}</p>
        </div>
        <div style={styles.statusBadge}>
          {delivery.status.replace("_", " ")}
        </div>
      </div>

      <div style={styles.body}>

        {/* Status card */}
        <div style={styles.card}>
          <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 4 }}>
            <div style={{ ...styles.statusDot, background: statusColor }} />
            <p style={{ fontSize: 16, fontWeight: 800, color: "#111", margin: 0 }}>
              {STATUS_STEPS[currentStatusIndex]?.label || delivery.status}
            </p>
          </div>
          <p style={{ fontSize: 12, color: "#888", margin: "0 0 0 22px" }}>
            {STATUS_STEPS[currentStatusIndex]?.desc || ""}
          </p>
          {delivery.updated_at && (
            <p style={{ fontSize: 11, color: "#bbb", margin: "6px 0 0 22px" }}>
              Last updated: {new Date(delivery.updated_at).toLocaleString("en-NG")}
            </p>
          )}
        </div>

        {/* Progress steps */}
        <div style={styles.card}>
          <p style={styles.cardTitle}>Delivery progress</p>
          {STATUS_STEPS.map((step, idx) => {
            const isCompleted = idx <= currentStatusIndex;
            const isCurrent = idx === currentStatusIndex;
            const Icon = step.icon;
            return (
              <div key={step.key} style={{ display: "flex", gap: 12, marginBottom: 0 }}>
                {/* Left: icon + connector */}
                <div style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
                  <div style={{
                    width: 32, height: 32, borderRadius: "50%",
                    background: isCompleted ? statusColor : "#f0f0f0",
                    display: "flex", alignItems: "center", justifyContent: "center",
                    boxShadow: isCurrent ? `0 0 0 4px ${statusColor}30` : "none",
                    transition: "all 0.3s",
                    flexShrink: 0,
                  }}>
                    <Icon size={14} color={isCompleted ? "white" : "#bbb"} />
                  </div>
                  {idx < STATUS_STEPS.length - 1 && (
                    <div style={{
                      width: 2, flex: 1, minHeight: 20,
                      background: idx < currentStatusIndex ? statusColor : "#eee",
                      transition: "background 0.3s",
                    }} />
                  )}
                </div>
                {/* Right: text */}
                <div style={{ paddingBottom: 16, paddingTop: 4 }}>
                  <p style={{
                    fontWeight: isCompleted ? 700 : 400,
                    fontSize: 13,
                    color: isCompleted ? "#111" : "#bbb",
                    margin: 0,
                  }}>
                    {step.label}
                  </p>
                  <p style={{ fontSize: 11, color: "#aaa", margin: "2px 0 0" }}>
                    {step.desc}
                  </p>
                </div>
              </div>
            );
          })}
        </div>

        {/* Route details */}
        <div style={styles.card}>
          <p style={styles.cardTitle}>Route details</p>
          <div style={{ display: "flex", gap: 10, marginBottom: 12, alignItems: "flex-start" }}>
            <MapPin size={16} color="#1a6b3c" style={{ flexShrink: 0, marginTop: 2 }} />
            <div>
              <p style={{ fontSize: 10, color: "#aaa", margin: "0 0 2px", fontWeight: 600, textTransform: "uppercase" }}>Pickup</p>
              <p style={{ fontSize: 13, fontWeight: 600, color: "#111", margin: 0 }}>{delivery.pickup_address}</p>
              {delivery.pickup_name && (
                <p style={{ fontSize: 11, color: "#888", margin: "2px 0 0" }}>{delivery.pickup_name} · {delivery.pickup_phone}</p>
              )}
            </div>
          </div>
          <div style={{ width: 2, height: 16, background: "#eee", marginLeft: 7, marginBottom: 12 }} />
          <div style={{ display: "flex", gap: 10, alignItems: "flex-start" }}>
            <MapPin size={16} color="#ef4444" style={{ flexShrink: 0, marginTop: 2 }} />
            <div>
              <p style={{ fontSize: 10, color: "#aaa", margin: "0 0 2px", fontWeight: 600, textTransform: "uppercase" }}>Dropoff</p>
              <p style={{ fontSize: 13, fontWeight: 600, color: "#111", margin: 0 }}>{delivery.dropoff_address}</p>
              {delivery.dropoff_name && (
                <p style={{ fontSize: 11, color: "#888", margin: "2px 0 0" }}>{delivery.dropoff_name} · {delivery.dropoff_phone}</p>
              )}
            </div>
          </div>
        </div>

        {/* Package details */}
        <div style={styles.card}>
          <p style={styles.cardTitle}>Package details</p>
          <div style={styles.detailRow}>
            <span style={styles.detailLabel}>Vehicle</span>
            <span style={styles.detailValue}>{delivery.vehicle || "Bike"}</span>
          </div>
          <div style={styles.detailRow}>
            <span style={styles.detailLabel}>Package type</span>
            <span style={styles.detailValue}>{delivery.package_type || "General"}</span>
          </div>
          <div style={styles.detailRow}>
            <span style={styles.detailLabel}>Fragile</span>
            <span style={styles.detailValue}>{delivery.fragile ? "Yes" : "No"}</span>
          </div>
          <div style={styles.detailRow}>
            <span style={styles.detailLabel}>Delivery fee</span>
            <span style={{ ...styles.detailValue, color: "#1a6b3c", fontWeight: 800 }}>
              ₦{(delivery.fee || 0).toLocaleString()}
            </span>
          </div>
          <div style={styles.detailRow}>
            <span style={styles.detailLabel}>Payment</span>
            <span style={{
              ...styles.detailValue,
              background: delivery.payment_status === "paid" ? "#f0faf4" : "#fff8e1",
              color: delivery.payment_status === "paid" ? "#1a6b3c" : "#e08b00",
              padding: "2px 8px",
              borderRadius: 20,
            }}>
              {delivery.payment_status || "pending"}
            </span>
          </div>
          {delivery.note && (
            <div style={{ ...styles.detailRow, flexDirection: "column", alignItems: "flex-start", gap: 4 }}>
              <span style={styles.detailLabel}>Rider note</span>
              <span style={{ fontSize: 12, color: "#555", background: "#f8fafb", padding: "6px 10px", borderRadius: 8, width: "100%", boxSizing: "border-box" }}>
                {delivery.note}
              </span>
            </div>
          )}
        </div>

        {/* Support */}
        <div style={styles.card}>
          <p style={styles.cardTitle}>Need help?</p>
          <button
            onClick={() => window.open("https://wa.me/2348000000000?text=Hi, I need help with delivery " + delivery.tracking_number)}
            style={styles.whatsappBtn}
          >
            <Phone size={14} /> Chat on WhatsApp
          </button>
        </div>

        {/* Send another */}
        <button onClick={() => navigate("/send")} style={styles.sendAnotherBtn}>
          + Send another package
        </button>
      </div>

      <style>{`@keyframes spin { to { transform: rotate(360deg) } }`}</style>
    </div>
  );
}

const styles: Record<string, React.CSSProperties> = {
  page: { fontFamily: "'DM Sans', sans-serif", background: "#f6f7f9", minHeight: "100vh", maxWidth: 480, margin: "0 auto" },
  header: { background: "#1a6b3c", padding: "20px 16px 16px", display: "flex", alignItems: "center", gap: 12, transition: "background 0.5s" },
  backBtn: { background: "rgba(255,255,255,0.15)", border: "none", color: "#fff", fontSize: 18, borderRadius: 8, width: 36, height: 36, cursor: "pointer", flexShrink: 0 },
  headerTitle: { color: "#fff", fontSize: 18, fontWeight: 700, margin: 0 },
  headerSub: { color: "rgba(255,255,255,0.7)", fontSize: 11, margin: 0 },
  statusBadge: { marginLeft: "auto", background: "rgba(255,255,255,0.2)", color: "#fff", fontSize: 11, fontWeight: 700, padding: "4px 10px", borderRadius: 20, textTransform: "capitalize", whiteSpace: "nowrap" },
  body: { padding: "12px 12px 40px" },
  card: { background: "#fff", borderRadius: 16, padding: 16, marginBottom: 12, boxShadow: "0 1px 8px rgba(0,0,0,0.06)" },
  cardTitle: { fontSize: 13, fontWeight: 800, color: "#111", margin: "0 0 12px" },
  statusDot: { width: 10, height: 10, borderRadius: "50%", flexShrink: 0 },
  detailRow: { display: "flex", justifyContent: "space-between", alignItems: "center", padding: "6px 0", borderBottom: "1px solid #f5f5f5" },
  detailLabel: { fontSize: 12, color: "#888" },
  detailValue: { fontSize: 12, fontWeight: 600, color: "#111" },
  centerWrap: { display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: "80px 20px", textAlign: "center" },
  spinner: { width: 40, height: 40, borderRadius: "50%", border: "3px solid #e8f5e9", borderTopColor: "#1a6b3c", animation: "spin 0.8s linear infinite", marginBottom: 16 },
  loadingText: { fontSize: 13, color: "#888", fontWeight: 500 },
  notFoundTitle: { fontSize: 16, fontWeight: 700, color: "#111", margin: "0 0 8px" },
  notFoundSub: { fontSize: 12, color: "#888", margin: "0 0 20px" },
  retryBtn: { background: "#1a6b3c", color: "#fff", border: "none", borderRadius: 12, padding: "12px 24px", fontSize: 14, fontWeight: 700, cursor: "pointer" },
  whatsappBtn: { background: "#25D366", color: "#fff", border: "none", borderRadius: 12, padding: "12px 0", width: "100%", fontSize: 13, fontWeight: 700, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: 8 },
  sendAnotherBtn: { width: "100%", background: "#fff", border: "1.5px solid #1a6b3c", color: "#1a6b3c", borderRadius: 12, padding: "14px", fontSize: 14, fontWeight: 700, cursor: "pointer" },
};