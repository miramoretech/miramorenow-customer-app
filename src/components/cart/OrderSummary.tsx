import type { CartItem } from "@/stores/cartStore";

interface OrderSummaryProps {
  items: CartItem[];
  deliveryLocation: string;
  totalDeliveryFee: number;
  subtotal: number;
  total: number;
  isPickup: boolean;
  tipAmount?: number;
}

const OrderSummary = ({ items, deliveryLocation, totalDeliveryFee, subtotal, total, isPickup, tipAmount = 0 }: OrderSummaryProps) => {
  return (
    <div className="bg-card rounded-2xl border border-border p-4 space-y-3">
      <div className="flex justify-between text-sm">
        <span className="text-muted-foreground">Subtotal</span>
        <span className="price-pill">₦{subtotal.toLocaleString()}</span>
      </div>
      {!isPickup && (
        <div className="flex justify-between text-sm">
          <span className="text-muted-foreground">Delivery fee</span>
          <span className="price-pill">{deliveryLocation ? `₦${totalDeliveryFee.toLocaleString()}` : "Select location"}</span>
        </div>
      )}
      {isPickup && (
        <div className="flex justify-between text-sm">
          <span className="text-muted-foreground">Pickup</span>
          <span className="text-xs font-semibold text-primary">FREE</span>
        </div>
      )}
      {tipAmount > 0 && (
        <div className="flex justify-between text-sm">
          <span className="text-muted-foreground">💝 Tip</span>
          <span className="price-pill">₦{tipAmount.toLocaleString()}</span>
        </div>
      )}
      <div className="border-t border-border pt-3 flex justify-between font-bold text-base">
        <span>Total</span>
        <span className="price-amount text-lg">₦{total.toLocaleString()}</span>
      </div>
    </div>
  );
};

export default OrderSummary;