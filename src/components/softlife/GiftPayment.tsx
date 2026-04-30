import { useState } from "react";
import { CreditCard, Banknote } from "lucide-react";
import { toast } from "sonner";
import type { GiftRecipient, GiftCartItem, PaymentMode } from "./types";

declare global {
  interface Window {
    FlutterwaveCheckout: (config: Record<string, unknown>) => void;
  }
}

const FLW_PUBLIC_KEY = "FLWPUBK-a4dc9522e8b015ae0f4ae2f39b05be30-X";

interface Props {
  giftCart: GiftCartItem[];
  recipient: GiftRecipient;
  onSuccess: () => void;
}

const DELIVERY_FEE = 1500;

const GiftPayment = ({ giftCart, recipient, onSuccess }: Props) => {
  const [mode, setMode] = useState<PaymentMode>("full");
  const [paying, setPaying] = useState(false);
  const foodTotal = giftCart.reduce((s, i) => s + i.product.price * i.quantity, 0);
  const senderTotal = mode === "full" ? foodTotal + DELIVERY_FEE : foodTotal;

  const handlePay = () => {
    if (!window.FlutterwaveCheckout) {
      toast.error("Payment system is loading. Please try again.");
      return;
    }

    setPaying(true);

    window.FlutterwaveCheckout({
      public_key: FLW_PUBLIC_KEY,
      tx_ref: "MRN-GIFT-" + Date.now() + "-" + Math.random().toString(36).slice(2, 8),
      amount: senderTotal,
      currency: "NGN",
      payment_options: "card, banktransfer, ussd",
      customer: {
        email: recipient.name ? `${recipient.name.replace(/\s+/g, '').toLowerCase()}@gift.miramorenow.com` : "gift@miramorenow.com",
        phone_number: recipient.phone,
        name: recipient.name || "Gift Sender",
      },
      meta: {
        type: "gift_order",
        recipient_name: recipient.name,
        recipient_phone: recipient.phone,
        relationship: recipient.relationship,
        occasion: recipient.occasion,
        payment_mode: mode,
        delivery_fee: mode === "full" ? DELIVERY_FEE : 0,
        items: giftCart.map((i) => `${i.product.name} x${i.quantity}`).join(", "),
      },
      customizations: {
        title: "MiramoreNow — Send Food ❤️",
        description: `Gift for ${recipient.name || "someone special"} (${giftCart.length} item${giftCart.length > 1 ? "s" : ""})`,
        logo: "https://id-preview--47eebcb8-3c8f-44ed-aed1-85139916fac7.lovable.app/lovable-uploads/miramore-logo.png",
      },
      callback: (data: { status: string; transaction_id: string }) => {
        setPaying(false);
        if (data.status === "successful") {
          onSuccess();
        } else {
          toast.error("Payment was not successful. Please try again.");
        }
      },
      onclose: () => setPaying(false),
    });
  };

  return (
    <div className="space-y-4">
      <div className="text-center space-y-1">
        <h3 className="font-bold text-foreground font-display">Payment</h3>
        <p className="text-xs text-muted-foreground">Choose how to pay for {recipient.name || "your recipient"}'s gift</p>
      </div>

      {/* Payment mode toggle */}
      <div className="grid grid-cols-2 gap-2">
        <button
          onClick={() => setMode("full")}
          className={`p-3 rounded-2xl border text-left transition-all press-scale ${
            mode === "full"
              ? "border-primary bg-primary/5 shadow-md"
              : "border-border bg-card"
          }`}
        >
          <CreditCard className={`w-5 h-5 mb-1.5 ${mode === "full" ? "text-primary" : "text-muted-foreground"}`} />
          <p className="text-xs font-bold text-foreground">I'll pay everything</p>
          <p className="text-[10px] text-muted-foreground">Food + delivery</p>
        </button>
        <button
          onClick={() => setMode("assist")}
          className={`p-3 rounded-2xl border text-left transition-all press-scale ${
            mode === "assist"
              ? "border-primary bg-primary/5 shadow-md"
              : "border-border bg-card"
          }`}
        >
          <Banknote className={`w-5 h-5 mb-1.5 ${mode === "assist" ? "text-primary" : "text-muted-foreground"}`} />
          <p className="text-xs font-bold text-foreground">Soft Life Assist</p>
          <p className="text-[10px] text-muted-foreground">You pay food, they pay delivery cash</p>
        </button>
      </div>

      {/* Summary */}
      <div className="bg-muted/40 rounded-2xl p-3 space-y-2 border border-border">
        <div className="flex justify-between text-xs">
          <span className="text-muted-foreground">Food ({giftCart.reduce((s, i) => s + i.quantity, 0)} items)</span>
          <span className="font-bold text-foreground">₦{foodTotal.toLocaleString()}</span>
        </div>
        <div className="flex justify-between text-xs">
          <span className="text-muted-foreground">Delivery</span>
          <span className="font-bold text-foreground">
            {mode === "full" ? `₦${DELIVERY_FEE.toLocaleString()}` : "Recipient pays cash"}
          </span>
        </div>
        <div className="border-t border-border pt-2 flex justify-between">
          <span className="text-sm font-bold text-foreground">You pay</span>
          <span className="price-amount text-sm font-bold">₦{senderTotal.toLocaleString()}</span>
        </div>
      </div>

      <button
        onClick={handlePay}
        disabled={paying}
        className="w-full py-3 rounded-2xl bg-primary text-primary-foreground font-bold text-sm press-scale hover:bg-primary/90 transition-colors shadow-md disabled:opacity-50"
      >
        {paying ? "Processing..." : "Pay with Flutterwave 💳"}
      </button>
    </div>
  );
};

export default GiftPayment;
