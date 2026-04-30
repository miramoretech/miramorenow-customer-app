import { useState } from 'react';
import { supabase } from '@/lib/supabase';
import { toast } from 'sonner';

interface PromoCodeInputProps {
  onApply: (discount: number, promotionId: string, code: string) => void;
  onRemove: () => void;
  subtotal: number;
  appliedPromo: { code: string; discount: number } | null;
}

export default function PromoCodeInput({ onApply, onRemove, subtotal, appliedPromo }: PromoCodeInputProps) {
  const [code, setCode] = useState('');
  const [loading, setLoading] = useState(false);

  const handleApply = async () => {
    if (!code.trim()) return;
    setLoading(true);
    try {
      const { data: promo, error } = await supabase
        .from('promotions')
        .select('*')
        .eq('code', code.toUpperCase())
        .eq('is_active', true)
        .single();

      if (error || !promo) {
        toast.error('Invalid or expired promo code');
        return;
      }

      if (subtotal < promo.min_order_amount) {
        toast.error(`Minimum order of ₦${promo.min_order_amount.toLocaleString()} required`);
        return;
      }

      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const { count } = await supabase
          .from('user_promotion_usage')
          .select('*', { count: 'exact', head: true })
          .eq('user_id', user.id)
          .eq('promotion_id', promo.id);
        if (count && count >= promo.usage_limit_per_user) {
          toast.error('You have already used this promo code');
          return;
        }
      }

      let discount = 0;
      if (promo.discount_type === 'fixed_amount') {
        discount = promo.discount_value;
      } else if (promo.discount_type === 'percentage') {
        discount = (subtotal * promo.discount_value) / 100;
      }
      discount = Math.min(discount, subtotal);

      onApply(discount, promo.id, promo.code);
      toast.success(`Promo applied! You saved ₦${discount.toLocaleString()}`);
    } catch (err) {
      toast.error('Something went wrong');
    } finally {
      setLoading(false);
    }
  };

  if (appliedPromo) {
    return (
      <div className="flex items-center justify-between p-3 bg-green-50 rounded-xl">
        <span className="text-sm text-green-700">✅ {appliedPromo.code} applied – saved ₦{appliedPromo.discount.toLocaleString()}</span>
        <button onClick={onRemove} className="text-xs text-red-500">Remove</button>
      </div>
    );
  }

  return (
    <div className="flex gap-2">
      <input
        type="text"
        placeholder="Enter code (e.g., FREEMEAL)"
        value={code}
        onChange={(e) => setCode(e.target.value.toUpperCase())}
        className="flex-1 p-3 rounded-xl border border-border bg-card text-sm"
      />
      <button
        onClick={handleApply}
        disabled={loading}
        className="px-4 py-3 rounded-xl bg-primary text-white font-medium disabled:opacity-50"
      >
        {loading ? '...' : 'Apply'}
      </button>
    </div>
  );
}