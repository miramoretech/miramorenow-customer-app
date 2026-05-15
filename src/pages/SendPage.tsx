import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { supabase } from "@/lib/supabase";
import { useFlutterwavePayment } from "@/hooks/useFlutterwavePayment";

const VEHICLE_TYPES = [
  {
    id: "bike",
    label: "Bike",
    icon: "🏍️",
    desc: "Small parcels, docs",
    maxKg: "5kg",
    eta: "15–25 min",
    basePrice: 800,
  },
  {
    id: "car",
    label: "Car",
    icon: "🚗",
    desc: "Medium packages",
    maxKg: "20kg",
    eta: "20–35 min",
    basePrice: 1500,
  },
  {
    id: "van",
    label: "Van",
    icon: "🚐",
    desc: "Large or bulk items",
    maxKg: "100kg",
    eta: "30–50 min",
    basePrice: 3500,
  },
];

const PACKAGE_TYPES = [
  { id: "document", label: "Document", icon: "📄" },
  { id: "food", label: "Food / Fragile", icon: "🥡" },
  { id: "clothing", label: "Clothing", icon: "👕" },
  { id: "electronics", label: "Electronics", icon: "📱" },
  { id: "parcel", label: "General Parcel", icon: "📦" },
  { id: "other", label: "Other", icon: "🎁" },
];

const STEPS = ["Details", "Package", "Summary"];

export default function SendPage() {
  const navigate = useNavigate();
  const { initiatePayment, paymentLoading } = useFlutterwavePayment();
  const [userEmail, setUserEmail] = useState("");
  const [recentDeliveries, setRecentDeliveries] = useState<any[]>([]);

  const [step, setStep] = useState(0);
  const [vehicle, setVehicle] = useState("bike");
  const [packageType, setPackageType] = useState("parcel");
  const [fragile, setFragile] = useState(false);
  const [scheduledTime, setScheduledTime] = useState("");
  const [isScheduled, setIsScheduled] = useState(false);
  const [note, setNote] = useState("");
  const [form, setForm] = useState({
    pickupAddress: "",
    pickupName: "",
    pickupPhone: "",
    dropoffAddress: "",
    dropoffName: "",
    dropoffPhone: "",
  });

  const selectedVehicle = VEHICLE_TYPES.find((v) => v.id === vehicle);
  const estimatedFee = selectedVehicle.basePrice + (fragile ? 300 : 0);

  const handleFormChange = (field: string, value: string) =>
    setForm((prev) => ({ ...prev, [field]: value }));

  const canProceedStep0 =
    form.pickupAddress &&
    form.pickupName &&
    form.pickupPhone &&
    form.dropoffAddress &&
    form.dropoffName &&
    form.dropoffPhone;

  const progressPercent = ((step + 1) / STEPS.length) * 100;

  // Load user & recent deliveries
  useEffect(() => {
    const getUserAndDeliveries = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (user?.email) setUserEmail(user.email);
      if (user?.id) {
        const { data } = await supabase
          .from("deliveries")
          .select("*")
          .eq("customer_id", user.id)
          .order("created_at", { ascending: false })
          .limit(3);
        if (data) setRecentDeliveries(data);
      }
    };
    getUserAndDeliveries();
  }, []);

  const goBack = () => navigate(-1);

  const handlePlaceOrder = async () => {
    if (!canProceedStep0) {
      toast.error("Please fill all pickup and dropoff details");
      return;
    }

    const trackingNumber = "MIR" + Date.now() + Math.random().toString(36).slice(2, 8).toUpperCase();

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      toast.error("You must be logged in to send a package");
      return;
    }

    // 1. Insert delivery record with pending payment
    const deliveryData = {
      customer_id: user.id,
      vehicle,
      package_type: packageType,
      fragile,
      pickup_address: form.pickupAddress,
      pickup_name: form.pickupName,
      pickup_phone: form.pickupPhone,
      dropoff_address: form.dropoffAddress,
      dropoff_name: form.dropoffName,
      dropoff_phone: form.dropoffPhone,
      scheduled_time: isScheduled ? scheduledTime : null,
      note: note || null,
      fee: estimatedFee,
      payment_status: "pending",
      tracking_number: trackingNumber,
      status: "pending",
    };

    const { data: inserted, error: insertError } = await supabase
      .from("deliveries")
      .insert(deliveryData)
      .select("id")
      .single();

    if (insertError) {
      toast.error("Could not save delivery. Please try again.");
      console.error(insertError);
      return;
    }

    const deliveryId = inserted.id;

    // 2. Initiate Flutterwave payment
    try {
      await initiatePayment({
        amount: estimatedFee,
        email: userEmail || form.pickupPhone + "@delivery.miramore.com",
        phone: form.pickupPhone,
        name: form.pickupName,
        txRef: `DEL-${deliveryId}-${Date.now()}`,
        meta: {
          delivery_id: deliveryId,
          tracking_number: trackingNumber,
          pickup: form.pickupAddress,
          dropoff: form.dropoffAddress,
        },
        onSuccess: async (response) => {
          const { error: updateError } = await supabase
            .from("deliveries")
            .update({
              payment_status: "paid",
              payment_reference: response.transaction_id,
              status: "paid",
            })
            .eq("id", deliveryId);

          if (updateError) {
            toast.error("Payment recorded but order update failed. Contact support.");
            console.error(updateError);
          } else {
            toast.success("Payment successful! Your delivery is confirmed.");
            navigate(`/delivery-tracking/${trackingNumber}`);
          }
        },
      });
    } catch (err: any) {
      await supabase.from("deliveries").delete().eq("id", deliveryId);
      toast.error(err.message);
    }
  };

  return (
    <div style={styles.page}>
      {/* Header */}
      <div style={styles.header}>
        <button style={styles.backBtn} onClick={goBack}>←</button>
        <div>
          <h1 style={styles.headerTitle}>Send a Package</h1>
          <p style={styles.headerSub}>Fast delivery across Lagos</p>
        </div>
        <div style={styles.headerBadge}>
          <span style={styles.headerBadgeDot} />
          Live
        </div>
      </div>

      {/* Progress bar */}
      <div style={styles.progressWrap}>
        <div style={styles.progressTrack}>
          <div style={{ ...styles.progressFill, width: `${progressPercent}%` }} />
        </div>
        <div style={styles.stepLabels}>
          {STEPS.map((s, i) => (
            <span
              key={s}
              style={{
                ...styles.stepLabel,
                color: i <= step ? "#1a6b3c" : "#aaa",
                fontWeight: i === step ? "700" : "400",
              }}
            >
              {s}
            </span>
          ))}
        </div>
      </div>

      <div style={styles.body}>
        {/* STEP 0: Addresses */}
        {step === 0 && (
          <div style={styles.card}>
            <div style={styles.sectionHead}>
              <div style={styles.dotGreen} />
              <span style={styles.sectionTitle}>Pickup details</span>
            </div>
            <div style={styles.inputGroup}>
              <input
                style={styles.input}
                placeholder="Pickup address (e.g. 12 Allen Ave, Ikeja)"
                value={form.pickupAddress}
                onChange={(e) => handleFormChange("pickupAddress", e.target.value)}
              />
              <div style={styles.row}>
                <input
                  style={{ ...styles.input, flex: 1 }}
                  placeholder="Sender name"
                  value={form.pickupName}
                  onChange={(e) => handleFormChange("pickupName", e.target.value)}
                />
                <input
                  style={{ ...styles.input, flex: 1 }}
                  placeholder="Phone number"
                  value={form.pickupPhone}
                  onChange={(e) => handleFormChange("pickupPhone", e.target.value)}
                />
              </div>
            </div>

            <div style={styles.routeLine}>
              <div style={styles.routeDash} />
              <span style={styles.routeLabel}>delivery route</span>
              <div style={styles.routeDash} />
            </div>

            <div style={styles.sectionHead}>
              <div style={styles.dotRed} />
              <span style={styles.sectionTitle}>Dropoff details</span>
            </div>
            <div style={styles.inputGroup}>
              <input
                style={styles.input}
                placeholder="Dropoff address (e.g. 5 Admiralty Way, Lekki)"
                value={form.dropoffAddress}
                onChange={(e) => handleFormChange("dropoffAddress", e.target.value)}
              />
              <div style={styles.row}>
                <input
                  style={{ ...styles.input, flex: 1 }}
                  placeholder="Recipient name"
                  value={form.dropoffName}
                  onChange={(e) => handleFormChange("dropoffName", e.target.value)}
                />
                <input
                  style={{ ...styles.input, flex: 1 }}
                  placeholder="Phone number"
                  value={form.dropoffPhone}
                  onChange={(e) => handleFormChange("dropoffPhone", e.target.value)}
                />
              </div>
            </div>

            <div style={styles.scheduleBox}>
              <div style={styles.scheduleRow}>
                <div>
                  <p style={styles.scheduleTitle}>Schedule for later</p>
                  <p style={styles.scheduleSub}>Set a future pickup time</p>
                </div>
                <button
                  style={{
                    ...styles.toggle,
                    background: isScheduled ? "#1a6b3c" : "#ddd",
                  }}
                  onClick={() => setIsScheduled((p) => !p)}
                >
                  <div
                    style={{
                      ...styles.toggleThumb,
                      transform: isScheduled ? "translateX(20px)" : "translateX(2px)",
                    }}
                  />
                </button>
              </div>
              {isScheduled && (
                <input
                  type="datetime-local"
                  style={{ ...styles.input, marginTop: 10 }}
                  value={scheduledTime}
                  onChange={(e) => setScheduledTime(e.target.value)}
                />
              )}
            </div>
          </div>
        )}

        {/* STEP 1: Package */}
        {step === 1 && (
          <div style={styles.card}>
            <p style={styles.sectionTitle}>Choose vehicle</p>
            <div style={styles.vehicleGrid}>
              {VEHICLE_TYPES.map((v) => (
                <button
                  key={v.id}
                  style={{
                    ...styles.vehicleCard,
                    borderColor: vehicle === v.id ? "#1a6b3c" : "#eee",
                    background: vehicle === v.id ? "#f0faf4" : "#fff",
                  }}
                  onClick={() => setVehicle(v.id)}
                >
                  <span style={styles.vehicleIcon}>{v.icon}</span>
                  <p style={styles.vehicleLabel}>{v.label}</p>
                  <p style={styles.vehicleDesc}>{v.desc}</p>
                  <p style={styles.vehicleMeta}>{v.maxKg} · {v.eta}</p>
                  <p style={styles.vehiclePrice}>
                    from ₦{v.basePrice.toLocaleString()}
                  </p>
                </button>
              ))}
            </div>

            <p style={{ ...styles.sectionTitle, marginTop: 20 }}>What are you sending?</p>
            <div style={styles.pkgGrid}>
              {PACKAGE_TYPES.map((p) => (
                <button
                  key={p.id}
                  style={{
                    ...styles.pkgChip,
                    borderColor: packageType === p.id ? "#1a6b3c" : "#eee",
                    background: packageType === p.id ? "#f0faf4" : "#fafafa",
                    color: packageType === p.id ? "#1a6b3c" : "#333",
                  }}
                  onClick={() => setPackageType(p.id)}
                >
                  <span>{p.icon}</span> {p.label}
                </button>
              ))}
            </div>

            <div style={styles.scheduleBox}>
              <div style={styles.scheduleRow}>
                <div>
                  <p style={styles.scheduleTitle}>⚠️ Fragile item</p>
                  <p style={styles.scheduleSub}>Rider will handle with extra care (+₦300)</p>
                </div>
                <button
                  style={{
                    ...styles.toggle,
                    background: fragile ? "#1a6b3c" : "#ddd",
                  }}
                  onClick={() => setFragile((p) => !p)}
                >
                  <div
                    style={{
                      ...styles.toggleThumb,
                      transform: fragile ? "translateX(20px)" : "translateX(2px)",
                    }}
                  />
                </button>
              </div>
            </div>

            <p style={{ ...styles.sectionTitle, marginTop: 16 }}>Note to rider (optional)</p>
            <textarea
              style={styles.textarea}
              placeholder="e.g. Call before arriving, package is at the gate..."
              value={note}
              onChange={(e) => setNote(e.target.value)}
              rows={3}
            />
          </div>
        )}

        {/* STEP 2: Summary */}
        {step === 2 && (
          <div style={styles.card}>
            <p style={styles.sectionTitle}>Order summary</p>

            <div style={styles.routeCard}>
              <div style={styles.routeRow}>
                <div style={styles.dotGreen} />
                <div>
                  <p style={styles.routeAddr}>{form.pickupAddress}</p>
                  <p style={styles.routeName}>{form.pickupName} · {form.pickupPhone}</p>
                </div>
              </div>
              <div style={styles.routeConnector} />
              <div style={styles.routeRow}>
                <div style={styles.dotRed} />
                <div>
                  <p style={styles.routeAddr}>{form.dropoffAddress}</p>
                  <p style={styles.routeName}>{form.dropoffName} · {form.dropoffPhone}</p>
                </div>
              </div>
            </div>

            <div style={styles.summaryGrid}>
              <SummaryRow label="Vehicle" value={`${selectedVehicle.icon} ${selectedVehicle.label}`} />
              <SummaryRow
                label="Package type"
                value={PACKAGE_TYPES.find((p) => p.id === packageType)?.label}
              />
              <SummaryRow label="Fragile" value={fragile ? "Yes (+₦300)" : "No"} />
              <SummaryRow
                label="Pickup time"
                value={
                  isScheduled && scheduledTime
                    ? new Date(scheduledTime).toLocaleString("en-NG", {
                        dateStyle: "medium",
                        timeStyle: "short",
                      })
                    : "Now (ASAP)"
                }
              />
              {note ? <SummaryRow label="Rider note" value={note} /> : null}
            </div>

            <div style={styles.feeBox}>
              <p style={styles.feeLabel}>Estimated delivery fee</p>
              <p style={styles.feeAmount}>₦{estimatedFee.toLocaleString()}</p>
              <p style={styles.feeSub}>Final price confirmed after rider accepts</p>
            </div>

            <p style={{ ...styles.sectionTitle, marginTop: 16 }}>Pay with</p>
            <div style={styles.payRow}>
              {["Card", "Bank Transfer", "USSD"].map((pm) => (
                <button key={pm} style={styles.payChip}>{pm}</button>
              ))}
            </div>

            <div style={styles.trustRow}>
              <TrustBadge icon="🔒" text="Secure payment" />
              <TrustBadge icon="📍" text="Live tracking" />
              <TrustBadge icon="🛡️" text="Item protection" />
            </div>
          </div>
        )}

        {/* Bottom CTA */}
        <div style={styles.ctaWrap}>
          {step > 0 && (
            <button style={styles.backStep} onClick={() => setStep((s) => s - 1)}>
              ← Back
            </button>
          )}
          <button
            style={{
              ...styles.cta,
              opacity: (step === 0 && !canProceedStep0) || paymentLoading ? 0.45 : 1,
            }}
            disabled={(step === 0 && !canProceedStep0) || paymentLoading}
            onClick={() => {
              if (step < STEPS.length - 1) {
                setStep((s) => s + 1);
              } else {
                handlePlaceOrder();
              }
            }}
          >
            {paymentLoading
              ? "Processing payment..."
              : step === STEPS.length - 1
              ? "Place Order"
              : "Continue →"}
          </button>
        </div>

        {/* Recent deliveries (real data from Supabase) */}
        {step === 0 && (
          <div style={styles.recentWrap}>
            <p style={styles.recentTitle}>Your recent deliveries</p>
            {recentDeliveries.length === 0 ? (
              <p style={{ fontSize: 12, color: "#888", textAlign: "center", padding: 16 }}>
                No deliveries yet. Send one!
              </p>
            ) : (
              recentDeliveries.map((del) => (
                <div key={del.id} style={styles.recentItem}>
                  <div>
                    <p style={styles.recentTo}>📍 {del.dropoff_address.split(",")[0]}</p>
                    <p style={styles.recentDate}>
                      {new Date(del.created_at).toLocaleDateString("en-NG")}
                    </p>
                  </div>
                  <span style={styles.recentStatus}>{del.status}</span>
                </div>
              ))
            )}
          </div>
        )}
      </div>
    </div>
  );
}

// Helper components
function SummaryRow({ label, value }: { label: string; value?: string }) {
  return (
    <div style={styles.summaryRow}>
      <span style={styles.summaryLabel}>{label}</span>
      <span style={styles.summaryValue}>{value || "—"}</span>
    </div>
  );
}

function TrustBadge({ icon, text }: { icon: string; text: string }) {
  return (
    <div style={styles.trustBadge}>
      <span>{icon}</span>
      <span style={styles.trustText}>{text}</span>
    </div>
  );
}

const styles = {
  page: {
    fontFamily: "'DM Sans', sans-serif",
    background: "#f6f7f9",
    minHeight: "100vh",
    maxWidth: 480,
    margin: "0 auto",
  },
  header: {
    background: "#1a6b3c",
    padding: "20px 16px 16px",
    display: "flex",
    alignItems: "center",
    gap: 12,
  },
  backBtn: {
    background: "rgba(255,255,255,0.15)",
    border: "none",
    color: "#fff",
    fontSize: 18,
    borderRadius: 8,
    width: 36,
    height: 36,
    cursor: "pointer",
    flexShrink: 0,
  },
  headerTitle: {
    color: "#fff",
    fontSize: 18,
    fontWeight: 700,
    margin: 0,
  },
  headerSub: {
    color: "rgba(255,255,255,0.7)",
    fontSize: 12,
    margin: 0,
  },
  headerBadge: {
    marginLeft: "auto",
    background: "rgba(255,255,255,0.15)",
    color: "#fff",
    fontSize: 11,
    fontWeight: 600,
    padding: "4px 10px",
    borderRadius: 20,
    display: "flex",
    alignItems: "center",
    gap: 5,
  },
  headerBadgeDot: {
    width: 6,
    height: 6,
    borderRadius: "50%",
    background: "#4ade80",
  },
  progressWrap: {
    background: "#fff",
    padding: "12px 16px 8px",
    borderBottom: "1px solid #eee",
  },
  progressTrack: {
    height: 4,
    background: "#eee",
    borderRadius: 4,
    overflow: "hidden",
  },
  progressFill: {
    height: "100%",
    background: "#1a6b3c",
    borderRadius: 4,
    transition: "width 0.3s ease",
  },
  stepLabels: {
    display: "flex",
    justifyContent: "space-between",
    marginTop: 6,
  },
  stepLabel: {
    fontSize: 11,
    transition: "all 0.2s",
  },
  body: {
    padding: "12px 12px 100px",
  },
  card: {
    background: "#fff",
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    boxShadow: "0 1px 8px rgba(0,0,0,0.06)",
  },
  sectionHead: {
    display: "flex",
    alignItems: "center",
    gap: 8,
    marginBottom: 10,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: 700,
    color: "#111",
    margin: "0 0 10px",
  },
  dotGreen: {
    width: 10,
    height: 10,
    borderRadius: "50%",
    background: "#1a6b3c",
    flexShrink: 0,
  },
  dotRed: {
    width: 10,
    height: 10,
    borderRadius: "50%",
    background: "#ef4444",
    flexShrink: 0,
  },
  inputGroup: {
    display: "flex",
    flexDirection: "column",
    gap: 8,
  },
  input: {
    border: "1.5px solid #e5e7eb",
    borderRadius: 10,
    padding: "11px 13px",
    fontSize: 13,
    outline: "none",
    width: "100%",
    boxSizing: "border-box",
    fontFamily: "inherit",
    color: "#111",
  },
  row: {
    display: "flex",
    gap: 8,
  },
  routeLine: {
    display: "flex",
    alignItems: "center",
    gap: 8,
    margin: "14px 0",
  },
  routeDash: {
    flex: 1,
    height: 1,
    borderTop: "1.5px dashed #ddd",
  },
  routeLabel: {
    fontSize: 10,
    color: "#aaa",
    textTransform: "uppercase",
    letterSpacing: 0.8,
    whiteSpace: "nowrap",
  },
  scheduleBox: {
    background: "#f8fafb",
    borderRadius: 12,
    padding: 12,
    marginTop: 14,
  },
  scheduleRow: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
  },
  scheduleTitle: {
    fontSize: 13,
    fontWeight: 600,
    color: "#111",
    margin: 0,
  },
  scheduleSub: {
    fontSize: 11,
    color: "#888",
    margin: "2px 0 0",
  },
  toggle: {
    width: 44,
    height: 24,
    borderRadius: 12,
    border: "none",
    cursor: "pointer",
    position: "relative",
    flexShrink: 0,
    transition: "background 0.2s",
  },
  toggleThumb: {
    position: "absolute",
    top: 2,
    width: 20,
    height: 20,
    borderRadius: "50%",
    background: "#fff",
    transition: "transform 0.2s",
    boxShadow: "0 1px 4px rgba(0,0,0,0.2)",
  },
  vehicleGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(3, 1fr)",
    gap: 8,
  },
  vehicleCard: {
    border: "2px solid",
    borderRadius: 12,
    padding: "10px 6px",
    cursor: "pointer",
    textAlign: "center",
    transition: "all 0.15s",
  },
  vehicleIcon: {
    fontSize: 24,
    display: "block",
    marginBottom: 4,
  },
  vehicleLabel: {
    fontWeight: 700,
    fontSize: 13,
    color: "#111",
    margin: 0,
  },
  vehicleDesc: {
    fontSize: 10,
    color: "#888",
    margin: "2px 0",
  },
  vehicleMeta: {
    fontSize: 10,
    color: "#666",
    margin: "2px 0",
  },
  vehiclePrice: {
    fontSize: 11,
    fontWeight: 700,
    color: "#1a6b3c",
    margin: 0,
  },
  pkgGrid: {
    display: "flex",
    flexWrap: "wrap",
    gap: 8,
  },
  pkgChip: {
    border: "1.5px solid",
    borderRadius: 20,
    padding: "7px 12px",
    fontSize: 12,
    fontWeight: 600,
    cursor: "pointer",
    display: "flex",
    alignItems: "center",
    gap: 5,
    transition: "all 0.15s",
    fontFamily: "inherit",
  },
  textarea: {
    border: "1.5px solid #e5e7eb",
    borderRadius: 10,
    padding: "10px 13px",
    fontSize: 13,
    width: "100%",
    boxSizing: "border-box",
    fontFamily: "inherit",
    resize: "none",
    outline: "none",
    color: "#111",
  },
  routeCard: {
    background: "#f8fafb",
    borderRadius: 12,
    padding: 14,
    marginBottom: 14,
  },
  routeRow: {
    display: "flex",
    alignItems: "flex-start",
    gap: 10,
  },
  routeConnector: {
    width: 2,
    height: 16,
    background: "#ddd",
    marginLeft: 4,
    marginTop: 4,
    marginBottom: 4,
  },
  routeAddr: {
    fontSize: 13,
    fontWeight: 600,
    color: "#111",
    margin: 0,
  },
  routeName: {
    fontSize: 11,
    color: "#888",
    margin: "2px 0 0",
  },
  summaryGrid: {
    borderTop: "1px solid #f0f0f0",
    borderBottom: "1px solid #f0f0f0",
    paddingTop: 10,
    paddingBottom: 10,
    marginBottom: 14,
  },
  summaryRow: {
    display: "flex",
    justifyContent: "space-between",
    padding: "5px 0",
  },
  summaryLabel: {
    fontSize: 12,
    color: "#888",
  },
  summaryValue: {
    fontSize: 12,
    fontWeight: 600,
    color: "#111",
  },
  feeBox: {
    background: "#f0faf4",
    borderRadius: 12,
    padding: 14,
    textAlign: "center",
  },
  feeLabel: {
    fontSize: 12,
    color: "#666",
    margin: "0 0 4px",
  },
  feeAmount: {
    fontSize: 26,
    fontWeight: 800,
    color: "#1a6b3c",
    margin: 0,
  },
  feeSub: {
    fontSize: 10,
    color: "#999",
    margin: "4px 0 0",
  },
  payRow: {
    display: "flex",
    gap: 8,
    flexWrap: "wrap",
  },
  payChip: {
    border: "1.5px solid #1a6b3c",
    borderRadius: 20,
    padding: "7px 14px",
    fontSize: 12,
    fontWeight: 600,
    color: "#1a6b3c",
    background: "#fff",
    cursor: "pointer",
    fontFamily: "inherit",
  },
  trustRow: {
    display: "flex",
    justifyContent: "space-between",
    marginTop: 16,
    padding: "12px 0 0",
    borderTop: "1px solid #f0f0f0",
  },
  trustBadge: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    gap: 3,
    flex: 1,
  },
  trustText: {
    fontSize: 10,
    color: "#888",
    textAlign: "center",
  },
  ctaWrap: {
    position: "fixed",
    bottom: 0,
    left: "50%",
    transform: "translateX(-50%)",
    width: "100%",
    maxWidth: 480,
    background: "#fff",
    padding: "12px 16px",
    borderTop: "1px solid #eee",
    display: "flex",
    gap: 10,
    boxSizing: "border-box",
  },
  cta: {
    flex: 1,
    background: "#1a6b3c",
    color: "#fff",
    border: "none",
    borderRadius: 12,
    padding: "14px",
    fontSize: 15,
    fontWeight: 700,
    cursor: "pointer",
    fontFamily: "inherit",
    transition: "opacity 0.2s",
  },
  backStep: {
    background: "#f3f4f6",
    color: "#333",
    border: "none",
    borderRadius: 12,
    padding: "14px 18px",
    fontSize: 14,
    fontWeight: 600,
    cursor: "pointer",
    fontFamily: "inherit",
  },
  recentWrap: {
    background: "#fff",
    borderRadius: 16,
    padding: 16,
    boxShadow: "0 1px 8px rgba(0,0,0,0.06)",
  },
  recentTitle: {
    fontSize: 14,
    fontWeight: 700,
    color: "#111",
    margin: "0 0 12px",
  },
  recentItem: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    padding: "10px 0",
    borderBottom: "1px solid #f5f5f5",
  },
  recentTo: {
    fontSize: 13,
    fontWeight: 600,
    color: "#111",
    margin: 0,
  },
  recentDate: {
    fontSize: 11,
    color: "#999",
    margin: "2px 0 0",
  },
  recentStatus: {
    fontSize: 11,
    fontWeight: 700,
    color: "#1a6b3c",
    background: "#f0faf4",
    padding: "3px 10px",
    borderRadius: 20,
  },
};