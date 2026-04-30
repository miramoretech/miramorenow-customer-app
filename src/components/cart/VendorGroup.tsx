import { Minus, Plus, Trash2, MessageSquare } from "lucide-react";
import type { CartItem } from "@/stores/cartStore";
import { getVendorByName } from "@/data/vendors";
import { calculateDeliveryFee } from "@/lib/deliveryPricing";
import { useState } from "react";

interface VendorGroupProps {
  vendorName: string;
  items: CartItem[];
  deliveryLocation: string;
  onUpdateQuantity: (productId: string, quantity: number, sizeId?: string) => void;
  onRemoveItem: (productId: string, sizeId?: string) => void;
  onUpdateNote: (productId: string, note: string, sizeId?: string) => void;
}

const VendorGroup = ({ vendorName, items, deliveryLocation, onUpdateQuantity, onRemoveItem, onUpdateNote }: VendorGroupProps) => {
  const vendorInfo = getVendorByName(vendorName);
  const vendorSubtotal = items.reduce((sum, i) => sum + i.product.price * i.quantity, 0);
  const deliveryInfo = deliveryLocation ? calculateDeliveryFee(deliveryLocation, vendorName) : null;

  return (
    <div className="bg-card rounded-2xl border border-border shadow-sm overflow-hidden">
      {/* Vendor Header */}
      <div className="flex items-center gap-3 px-4 py-3 bg-muted/40 border-b border-border">
        {vendorInfo?.logo ? (
          <img src={vendorInfo.logo} alt={vendorName} className="w-8 h-8 rounded-xl object-cover border border-border" />
        ) : (
          <div className="w-8 h-8 rounded-xl bg-primary/10 flex items-center justify-center text-sm">🏪</div>
        )}
        <div className="flex-1 min-w-0">
          <h3 className="font-bold text-sm text-foreground truncate">From {vendorName}</h3>
          <p className="text-[11px] text-muted-foreground">{items.length} Item{items.length > 1 ? "s" : ""}</p>
        </div>
      </div>

      {/* Items */}
      <div className="divide-y divide-border">
        {items.map((item) => (
          <CartItemRow
            key={`${item.product.id}-${item.sizeId || 'default'}`}
            item={item}
            onUpdateQuantity={onUpdateQuantity}
            onRemoveItem={onRemoveItem}
            onUpdateNote={onUpdateNote}
          />
        ))}
      </div>

      {/* Vendor subtotal */}
      <div className="px-4 py-3 bg-muted/20 border-t border-border flex justify-between items-center">
        <span className="text-xs text-muted-foreground">Subtotal</span>
        <span className="price-pill">₦{vendorSubtotal.toLocaleString()}</span>
      </div>
    </div>
  );
};

function CartItemRow({ item, onUpdateQuantity, onRemoveItem, onUpdateNote }: {
  item: CartItem;
  onUpdateQuantity: (id: string, qty: number, sizeId?: string) => void;
  onRemoveItem: (id: string, sizeId?: string) => void;
  onUpdateNote: (id: string, note: string, sizeId?: string) => void;
}) {
  const [showNote, setShowNote] = useState(!!item.note);

  // Get display name with size if available
  const getDisplayName = () => {
    if (item.size) {
      return `${item.product.name} (${item.size})`;
    }
    return item.product.name;
  };

  return (
    <div className="p-4 space-y-2">
      <div className="flex gap-3">
        {item.product.image ? (
          <img src={item.product.image} alt={item.product.name} className="w-16 h-16 rounded-xl object-cover" />
        ) : (
          <div className="w-16 h-16 rounded-xl bg-muted flex items-center justify-center text-2xl">
            {item.product.category === "food" ? "🍽️" : "💇‍♀️"}
          </div>
        )}
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2">
            <div>
              <h4 className="font-semibold text-sm line-clamp-1">{getDisplayName()}</h4>
              {/* ✅ Show size badge if selected */}
              {item.size && (
                <span className="inline-block text-[10px] bg-primary/10 text-primary px-1.5 py-0.5 rounded-full mt-0.5">
                  {item.size}
                </span>
              )}
            </div>
            <button 
              onClick={() => onRemoveItem(item.product.id, item.sizeId)} 
              className="p-1 text-destructive opacity-50 hover:opacity-100 shrink-0"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
          <span className="price-pill mt-1">₦{(item.product.price * item.quantity).toLocaleString()}</span>
          <div className="flex items-center gap-2 mt-2">
            <button 
              onClick={() => onUpdateQuantity(item.product.id, item.quantity - 1, item.sizeId)} 
              className="w-7 h-7 rounded-full bg-muted flex items-center justify-center active:scale-90"
            >
              <Minus className="w-3.5 h-3.5" />
            </button>
            <span className="text-sm font-bold w-6 text-center">{item.quantity}</span>
            <button 
              onClick={() => onUpdateQuantity(item.product.id, item.quantity + 1, item.sizeId)} 
              className="w-7 h-7 rounded-full bg-secondary flex items-center justify-center active:scale-90"
            >
              <Plus className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>

      {/* Note to vendor */}
      {!showNote ? (
        <button
          onClick={() => setShowNote(true)}
          className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors pl-1"
        >
          <MessageSquare className="w-3.5 h-3.5" /> Add a note for the vendor
        </button>
      ) : (
        <div className="border-t border-border pt-2">
          <input
            type="text"
            placeholder="e.g. no onions, extra spicy..."
            value={item.note || ""}
            onChange={(e) => onUpdateNote(item.product.id, e.target.value, item.sizeId)}
            className="w-full text-xs bg-muted/50 border border-border rounded-xl px-3 py-2 outline-none focus:border-primary"
          />
        </div>
      )}
    </div>
  );
}

export default VendorGroup;