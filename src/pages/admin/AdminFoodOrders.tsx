// src/pages/admin/AdminFoodOrders.tsx
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/lib/supabase';
import { toast } from 'sonner';
import { useAdmin } from '@/hooks/useAdmin';

const STATUS_COLORS: Record<string, { bg: string; color: string }> = {
  pending: { bg: "#fff8e1", color: "#e08b00" },
  confirmed: { bg: "#e3f2fd", color: "#1565c0" },
  preparing: { bg: "#f3e5f5", color: "#6a1b9a" },
  ready: { bg: "#fff3e0", color: "#e65100" },
  out_for_delivery: { bg: "#e0f7fa", color: "#006064" },
  delivered: { bg: "#f0faf4", color: "#1a6b3c" },
  cancelled: { bg: "#ffebee", color: "#b71c1c" },
};

const ALL_STATUSES = ["pending", "confirmed", "preparing", "ready", "out_for_delivery", "delivered", "cancelled"];

export default function AdminFoodOrders() {
  const navigate = useNavigate();
  const { isAdmin, loading: adminLoading } = useAdmin();
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState("all");
  const [selectedOrder, setSelectedOrder] = useState<any>(null);
  const [updatingStatus, setUpdatingStatus] = useState("");

  useEffect(() => {
    if (!adminLoading && !isAdmin) {
      toast.error("Access denied. Admin only.");
      navigate("/");
    }
  }, [isAdmin, adminLoading, navigate]);

  useEffect(() => {
    if (!isAdmin) return;

    fetchOrders();

    const channel = supabase
      .channel("admin-food-orders")
      .on("postgres_changes", { event: "*", schema: "public", table: "orders" }, (payload) => {
        if (payload.eventType === "INSERT") {
          setOrders((prev) => [payload.new, ...prev]);
          toast.success("🆕 New order received!");
        } else if (payload.eventType === "UPDATE") {
          setOrders((prev) => prev.map((o) => o.id === payload.new.id ? payload.new : o));
        }
      })
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, [isAdmin]);

  const fetchOrders = async () => {
    const { data, error } = await supabase
      .from("orders")
      .select(`
        id,
        created_at,
        total_amount,
        status,
        payment_status,
        delivery_address,
        customer_name,
        customer_phone,
        customer_email,
        vendor_id,
        vendors (store_name)
      `)
      .order("created_at", { ascending: false });

    if (error) toast.error("Could not load orders");
    else setOrders(data || []);
    setLoading(false);
  };

  const handleUpdateStatus = async (orderId: string, newStatus: string) => {
    const { error } = await supabase
      .from("orders")
      .update({ status: newStatus })
      .eq("id", orderId);

    if (error) toast.error("Could not update status");
    else {
      toast.success(`Order status updated to ${newStatus}`);
      setSelectedOrder(null);
    }
  };

  const filtered = filterStatus === "all"
    ? orders
    : orders.filter((o) => o.status === filterStatus);

  const counts = orders.reduce((acc, o) => {
    acc[o.status] = (acc[o.status] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  if (adminLoading || loading) {
    return <div style={{ padding: 40, textAlign: "center", color: "#888" }}>Loading orders...</div>;
  }

  if (!isAdmin) return null;

  return (
    <div style={S.page}>
      <div style={S.header}>
        <h1 style={S.title}>🍔 Food & Beauty Orders</h1>
        <p style={S.sub}>{orders.length} total · {counts["pending"] || 0} pending</p>
      </div>

      <div style={S.summaryRow}>
        {[
          { label: "Pending", key: "pending", color: "#e08b00" },
          { label: "Confirmed", key: "confirmed", color: "#1565c0" },
          { label: "Preparing", key: "preparing", color: "#6a1b9a" },
          { label: "Delivered", key: "delivered", color: "#1a6b3c" },
        ].map((s) => (
          <div key={s.key} style={S.summaryCard} onClick={() => setFilterStatus(s.key)}>
            <p style={{ ...S.summaryCount, color: s.color }}>{counts[s.key] || 0}</p>
            <p style={S.summaryLabel}>{s.label}</p>
          </div>
        ))}
      </div>

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

      {filtered.length === 0 ? (
        <div style={S.empty}>
          <p style={{ fontSize: 40 }}>🍽️</p>
          <p style={{ color: "#888", fontSize: 14 }}>No orders yet</p>
        </div>
      ) : (
        <div style={S.list}>
          {filtered.map((order) => {
            const sc = STATUS_COLORS[order.status] || { bg: "#f5f5f5", color: "#555" };
            return (
              <div key={order.id} style={S.card}>
                <div style={S.cardTop}>
                  <div>
                    <p style={S.trackingNum}>Order #{order.id.slice(0, 8)}</p>
                    <p style={S.cardDate}>{new Date(order.created_at).toLocaleString("en-NG")}</p>
                  </div>
                  <div style={{ display: "flex", gap: 6 }}>
                    <span style={{ ...S.badge, background: sc.bg, color: sc.color }}>
                      {order.status.replace("_", " ")}
                    </span>
                    <span style={{
                      ...S.badge,
                      background: order.payment_status === "paid" ? "#f0faf4" : "#fff8e1",
                      color: order.payment_status === "paid" ? "#1a6b3c" : "#e08b00",
                    }}>
                      {order.payment_status}
                    </span>
                  </div>
                </div>

                <div style={S.detailRow}>
                  <span style={S.detail}>🏪 {order.vendors?.store_name || "Unknown"}</span>
                  <span style={S.detail}>👤 {order.customer_name}</span>
                  <span style={S.detail}>📞 {order.customer_phone}</span>
                </div>

                <div style={S.detailRow}>
                  <span style={S.detail}>📍 {order.delivery_address || "Pickup"}</span>
                  <span style={{ ...S.detail, fontWeight: 700, color: "#1a6b3c" }}>₦{order.total_amount?.toLocaleString()}</span>
                </div>

                <div style={S.actions}>
                  <button style={S.actionBtn} onClick={() => setSelectedOrder(order)}>
                    Update Status
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {selectedOrder && (
        <div style={S.overlay} onClick={() => setSelectedOrder(null)}>
          <div style={S.modal} onClick={(e) => e.stopPropagation()}>
            <div style={S.modalHandle} />
            <h3 style={S.modalTitle}>Update Order #{selectedOrder.id.slice(0, 8)}</h3>
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
                      background: selectedOrder.status === status ? sc.color : sc.bg,
                      color: selectedOrder.status === status ? "#fff" : sc.color,
                    }}
                    onClick={() => handleUpdateStatus(selectedOrder.id, status)}
                  >
                    {status.replace("_", " ")}
                  </button>
                );
              })}
            </div>
            <button style={{ ...S.modalBtn, background: "#f3f4f6", color: "#333", marginTop: 20 }} onClick={() => setSelectedOrder(null)}>
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
  detailRow: { display: "flex", gap: 10, flexWrap: "wrap", marginBottom: 8 },
  detail: { fontSize: 11, color: "#555", background: "#f5f5f5", padding: "3px 8px", borderRadius: 20 },
  actions: { display: "flex", gap: 8 },
  actionBtn: { flex: 1, background: "#1a6b3c", color: "#fff", border: "none", borderRadius: 10, padding: "8px", fontSize: 12, fontWeight: 700, cursor: "pointer" },
  empty: { textAlign: "center", padding: "60px 20px" },
  overlay: { position: "fixed", inset: 0, background: "rgba(0,0,0,0.5)", zIndex: 50, display: "flex", alignItems: "flex-end", justifyContent: "center" },
  modal: { width: "100%", maxWidth: 500, background: "#fff", borderRadius: "20px 20px 0 0", padding: "20px 16px 40px" },
  modalHandle: { width: 36, height: 4, borderRadius: 99, background: "#ddd", margin: "0 auto 16px" },
  modalTitle: { fontSize: 15, fontWeight: 900, color: "#111", marginBottom: 16 },
  modalBtn: { width: "100%", padding: "12px", borderRadius: 12, border: "none", fontSize: 13, fontWeight: 700, cursor: "pointer", color: "#fff" },
};