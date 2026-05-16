// src/pages/admin/AdminDeliveries.tsx
// Shows all package deliveries placed via Send feature
// Admin can assign riders and update delivery status
// ✅ Only users with is_admin = true can see this page

import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/lib/supabase";
import { toast } from "sonner";
import { useAdmin } from "@/hooks/useAdmin";

const STATUS_COLORS: Record<string, { bg: string; color: string }> = {
  pending:    { bg: "#fff8e1", color: "#e08b00" },
  paid:       { bg: "#e3f2fd", color: "#1565c0" },
  assigned:   { bg: "#f3e5f5", color: "#6a1b9a" },
  picked_up:  { bg: "#fff3e0", color: "#e65100" },
  in_transit: { bg: "#e0f7fa", color: "#006064" },
  delivered:  { bg: "#f0faf4", color: "#1a6b3c" },
  cancelled:  { bg: "#ffebee", color: "#b71c1c" },
};

const ALL_STATUSES = ["pending", "paid", "assigned", "picked_up", "in_transit", "delivered", "cancelled"];

export default function AdminDeliveries() {
  const navigate = useNavigate();
  const { isAdmin, loading: adminLoading } = useAdmin();
  const [deliveries, setDeliveries] = useState<any[]>([]);
  const [riders, setRiders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState("all");
  const [selectedDelivery, setSelectedDelivery] = useState<any>(null);
  const [assigningRider, setAssigningRider] = useState("");

  // Redirect if not admin
  useEffect(() => {
    if (!adminLoading && !isAdmin) {
      toast.error("Access denied. Admin only.");
      navigate("/");
    }
  }, [isAdmin, adminLoading, navigate]);

  useEffect(() => {
    if (!isAdmin) return;

    fetchDeliveries();
    fetchRiders();

    const channel = supabase
      .channel("admin-deliveries")
      .on("postgres_changes", {
        event: "*",
        schema: "public",
        table: "deliveries",
      }, (payload) => {
        if (payload.eventType === "INSERT") {
          setDeliveries((prev) => [payload.new, ...prev]);
          toast.success("📦 New delivery order received!");
        } else if (payload.eventType === "UPDATE") {
          setDeliveries((prev) =>
            prev.map((d) => d.id === payload.new.id ? payload.new : d)
          );
        }
      })
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, [isAdmin]);

  const fetchDeliveries = async () => {
    const { data, error } = await supabase
      .from("deliveries")
      .select("id, tracking_number, status, payment_status, vehicle, package_type, fragile, pickup_address, pickup_name, pickup_phone, dropoff_address, dropoff_name, dropoff_phone, fee, note, rider_id, created_at, scheduled_time")
      .order("created_at", { ascending: false });

    if (error) toast.error("Could not load deliveries");
    else setDeliveries(data || []);
    setLoading(false);
  };

  const fetchRiders = async () => {
    const { data } = await supabase
      .from("riders")
      .select("id, full_name, phone")
      .order("full_name");
    if (data) setRiders(data);
  };

  const handleAssignRider = async (deliveryId: string, riderId: string) => {
    if (!riderId) return;
    const { error } = await supabase
      .from("deliveries")
      .update({ rider_id: riderId, status: "assigned" })
      .eq("id", deliveryId);

    if (error) toast.error("Could not assign rider");
    else {
      toast.success("Rider assigned successfully!");
      setSelectedDelivery(null);
    }
  };

  const handleUpdateStatus = async (deliveryId: string, newStatus: string) => {
    const { error } = await supabase
      .from("deliveries")
      .update({ status: newStatus })
      .eq("id", deliveryId);

    if (error) toast.error("Could not update status");
    else {
      toast.success(`Status updated to ${newStatus}`);
      setSelectedDelivery(null);
    }
  };

  const filtered = filterStatus === "all"
    ? deliveries
    : deliveries.filter((d) => d.status === filterStatus);

  const counts = deliveries.reduce((acc, d) => {
    acc[d.status] = (acc[d.status] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  if (adminLoading || loading) {
    return <div style={{ padding: 40, textAlign: "center", color: "#888" }}>Loading...</div>;
  }

  if (!isAdmin) return null; // Already redirecting, but safe fallback

  return (
    <div style={S.page}>
      <div style={S.header}>
        <h1 style={S.title}>📦 Package Deliveries</h1>
        <p style={S.sub}>{deliveries.length} total · {counts["paid"] || 0} awaiting rider</p>
      </div>

      {/* Summary cards */}
      <div style={S.summaryRow}>
        {[
          { label: "New", key: "paid", color: "#1565c0" },
          { label: "Assigned", key: "assigned", color: "#6a1b9a" },
          { label: "In Transit", key: "in_transit", color: "#006064" },
          { label: "Delivered", key: "delivered", color: "#1a6b3c" },
        ].map((s) => (
          <div key={s.key} style={S.summaryCard} onClick={() => setFilterStatus(s.key)}>
            <p style={{ ...S.summaryCount, color: s.color }}>{counts[s.key] || 0}</p>
            <p style={S.summaryLabel}>{s.label}</p>
          </div>
        ))}
      </div>

      {/* Filter tabs */}
      <div style={S.filterRow}>
        {["all", ...ALL_STATUSES].map((status) => (
          <button
            key={status}
            onClick={() => setFilterStatus(status)}
            style={{
              ...S.filterBtn,
              background: filterStatus === status ? "#1a6b3c" : "#f5f5f5",
              color: filterStatus === status ? "#fff" : "#555",
            }}
          >
            {status === "all" ? "All" : status.replace("_", " ")}
            {status !== "all" && counts[status] ? ` (${counts[status]})` : ""}
          </button>
        ))}
      </div>

      {/* Deliveries list */}
      {filtered.length === 0 ? (
        <div style={S.empty}>
          <p style={{ fontSize: 40 }}>📦</p>
          <p style={{ color: "#888", fontSize: 14 }}>No deliveries yet</p>
        </div>
      ) : (
        <div style={S.list}>
          {filtered.map((del) => {
            const sc = STATUS_COLORS[del.status] || { bg: "#f5f5f5", color: "#555" };
            const assignedRider = riders.find((r) => r.id === del.rider_id);
            return (
              <div key={del.id} style={S.card}>
                {/* Top row */}
                <div style={S.cardTop}>
                  <div>
                    <p style={S.trackingNum}>#{del.tracking_number}</p>
                    <p style={S.cardDate}>
                      {new Date(del.created_at).toLocaleString("en-NG")}
                      {del.scheduled_time ? ` · Scheduled: ${new Date(del.scheduled_time).toLocaleString("en-NG")}` : ""}
                    </p>
                  </div>
                  <div style={{ display: "flex", gap: 6, alignItems: "center" }}>
                    <span style={{ ...S.badge, background: sc.bg, color: sc.color }}>
                      {del.status.replace("_", " ")}
                    </span>
                    <span style={{
                      ...S.badge,
                      background: del.payment_status === "paid" ? "#f0faf4" : "#fff8e1",
                      color: del.payment_status === "paid" ? "#1a6b3c" : "#e08b00",
                    }}>
                      {del.payment_status}
                    </span>
                  </div>
                </div>

                {/* Route */}
                <div style={S.route}>
                  <div style={S.routeItem}>
                    <div style={S.dotGreen} />
                    <div>
                      <p style={S.routeName}>{del.pickup_name} · {del.pickup_phone}</p>
                      <p style={S.routeAddr}>{del.pickup_address}</p>
                    </div>
                  </div>
                  <div style={S.routeConnector} />
                  <div style={S.routeItem}>
                    <div style={S.dotRed} />
                    <div>
                      <p style={S.routeName}>{del.dropoff_name} · {del.dropoff_phone}</p>
                      <p style={S.routeAddr}>{del.dropoff_address}</p>
                    </div>
                  </div>
                </div>

                {/* Details row */}
                <div style={S.detailRow}>
                  <span style={S.detail}>🚗 {del.vehicle}</span>
                  <span style={S.detail}>📦 {del.package_type}</span>
                  {del.fragile && <span style={{ ...S.detail, color: "#e65100" }}>⚠️ Fragile</span>}
                  <span style={{ ...S.detail, fontWeight: 700, color: "#1a6b3c" }}>₦{(del.fee || 0).toLocaleString()}</span>
                </div>

                {del.note && <p style={S.note}>💬 {del.note}</p>}

                {assignedRider && (
                  <div style={S.riderTag}>
                    🏍️ Assigned to: <strong>{assignedRider.full_name}</strong> · {assignedRider.phone}
                  </div>
                )}

                {/* Actions */}
                <div style={S.actions}>
                  <button style={S.actionBtn} onClick={() => setSelectedDelivery(del)}>
                    Manage
                  </button>
                  <a
                    href={`/delivery-tracking/${del.tracking_number}`}
                    target="_blank"
                    rel="noreferrer"
                    style={S.trackLink}
                  >
                    Track →
                  </a>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Management modal */}
      {selectedDelivery && (
        <div style={S.overlay} onClick={() => setSelectedDelivery(null)}>
          <div style={S.modal} onClick={(e) => e.stopPropagation()}>
            <div style={S.modalHandle} />
            <h3 style={S.modalTitle}>Manage #{selectedDelivery.tracking_number}</h3>

            <p style={S.modalSection}>Assign Rider</p>
            <select
              style={S.select}
              value={assigningRider}
              onChange={(e) => setAssigningRider(e.target.value)}
            >
              <option value="">Select a rider...</option>
              {riders.map((r) => (
                <option key={r.id} value={r.id}>{r.full_name} · {r.phone}</option>
              ))}
            </select>
            <button
              style={{ ...S.modalBtn, background: assigningRider ? "#1a6b3c" : "#ccc" }}
              disabled={!assigningRider}
              onClick={() => handleAssignRider(selectedDelivery.id, assigningRider)}
            >
              Assign Rider
            </button>

            <p style={{ ...S.modalSection, marginTop: 20 }}>Update Status</p>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
              {ALL_STATUSES.map((status) => {
                const sc = STATUS_COLORS[status] || { bg: "#f5f5f5", color: "#555" };
                return (
                  <button
                    key={status}
                    style={{
                      padding: "6px 12px",
                      borderRadius: 20,
                      border: "none",
                      cursor: "pointer",
                      fontSize: 12,
                      fontWeight: 700,
                      background: selectedDelivery.status === status ? sc.color : sc.bg,
                      color: selectedDelivery.status === status ? "#fff" : sc.color,
                    }}
                    onClick={() => handleUpdateStatus(selectedDelivery.id, status)}
                  >
                    {status.replace("_", " ")}
                  </button>
                );
              })}
            </div>

            <button
              style={{ ...S.modalBtn, background: "#f3f4f6", color: "#333", marginTop: 20 }}
              onClick={() => setSelectedDelivery(null)}
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

const S: Record<string, React.CSSProperties> = {
  page: { padding: "16px", maxWidth: 800, margin: "0 auto", fontFamily: "inherit" },
  header: { marginBottom: 16 },
  title: { fontSize: 20, fontWeight: 900, color: "#111", margin: 0 },
  sub: { fontSize: 12, color: "#888", margin: "4px 0 0" },
  summaryRow: { display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 10, marginBottom: 16 },
  summaryCard: { background: "#fff", borderRadius: 12, padding: "12px 10px", textAlign: "center", boxShadow: "0 1px 6px rgba(0,0,0,0.06)", cursor: "pointer" },
  summaryCount: { fontSize: 24, fontWeight: 900, margin: 0 },
  summaryLabel: { fontSize: 11, color: "#888", margin: "2px 0 0" },
  filterRow: { display: "flex", gap: 6, flexWrap: "wrap", marginBottom: 16 },
  filterBtn: { padding: "6px 12px", borderRadius: 20, border: "none", fontSize: 11, fontWeight: 700, cursor: "pointer", whiteSpace: "nowrap" },
  list: { display: "flex", flexDirection: "column", gap: 12 },
  card: { background: "#fff", borderRadius: 16, padding: 16, boxShadow: "0 1px 8px rgba(0,0,0,0.06)" },
  cardTop: { display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 12 },
  trackingNum: { fontSize: 13, fontWeight: 800, color: "#111", margin: 0 },
  cardDate: { fontSize: 11, color: "#aaa", margin: "2px 0 0" },
  badge: { fontSize: 10, fontWeight: 700, padding: "3px 8px", borderRadius: 20 },
  route: { background: "#f8fafb", borderRadius: 12, padding: 12, marginBottom: 10 },
  routeItem: { display: "flex", alignItems: "flex-start", gap: 8 },
  routeConnector: { width: 2, height: 12, background: "#ddd", marginLeft: 4, marginTop: 3, marginBottom: 3 },
  dotGreen: { width: 8, height: 8, borderRadius: "50%", background: "#1a6b3c", flexShrink: 0, marginTop: 3 },
  dotRed: { width: 8, height: 8, borderRadius: "50%", background: "#ef4444", flexShrink: 0, marginTop: 3 },
  routeName: { fontSize: 12, fontWeight: 700, color: "#111", margin: 0 },
  routeAddr: { fontSize: 11, color: "#888", margin: "1px 0 0" },
  detailRow: { display: "flex", gap: 10, flexWrap: "wrap", marginBottom: 8 },
  detail: { fontSize: 11, color: "#555", background: "#f5f5f5", padding: "3px 8px", borderRadius: 20 },
  note: { fontSize: 11, color: "#555", background: "#f0f4ff", padding: "6px 10px", borderRadius: 8, margin: "4px 0 8px" },
  riderTag: { fontSize: 11, color: "#1a6b3c", background: "#f0faf4", padding: "5px 10px", borderRadius: 8, marginBottom: 8 },
  actions: { display: "flex", gap: 8 },
  actionBtn: { flex: 1, background: "#1a6b3c", color: "#fff", border: "none", borderRadius: 10, padding: "8px", fontSize: 12, fontWeight: 700, cursor: "pointer" },
  trackLink: { padding: "8px 14px", borderRadius: 10, background: "#f0faf4", color: "#1a6b3c", fontSize: 12, fontWeight: 700, textDecoration: "none", display: "flex", alignItems: "center" },
  empty: { textAlign: "center", padding: "60px 20px" },
  overlay: { position: "fixed", inset: 0, background: "rgba(0,0,0,0.5)", zIndex: 50, display: "flex", alignItems: "flex-end", justifyContent: "center" },
  modal: { width: "100%", maxWidth: 500, background: "#fff", borderRadius: "20px 20px 0 0", padding: "20px 16px 40px" },
  modalHandle: { width: 36, height: 4, borderRadius: 99, background: "#ddd", margin: "0 auto 16px" },
  modalTitle: { fontSize: 15, fontWeight: 900, color: "#111", marginBottom: 16 },
  modalSection: { fontSize: 12, fontWeight: 700, color: "#555", margin: "0 0 8px" },
  select: { width: "100%", padding: "10px 12px", borderRadius: 10, border: "1.5px solid #e5e7eb", fontSize: 13, outline: "none", marginBottom: 10, fontFamily: "inherit" },
  modalBtn: { width: "100%", padding: "12px", borderRadius: 12, border: "none", fontSize: 13, fontWeight: 700, cursor: "pointer", color: "#fff" },
};