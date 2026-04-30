import { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Phone, MessageCircle, CheckCircle } from 'lucide-react';
import { supabase } from '@/lib/supabase';

export default function OrderSuccess() {
  const [searchParams] = useSearchParams();
  const reference = searchParams.get('reference');
  const orderId = searchParams.get('order_id');
  const [order, setOrder] = useState<any>(null);
  const [rider, setRider] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!orderId) {
      setLoading(false);
      return;
    }
    const fetchOrder = async () => {
      const { data, error } = await supabase
        .from('orders')
        .select('*, rider:rider_id(*)')
        .eq('id', orderId)
        .single();
      if (data) {
        setOrder(data);
        if (data.rider_id) setRider(data.rider);
      }
      setLoading(false);
    };
    fetchOrder();
  }, [orderId]);

  if (loading) {
    return <div className="flex justify-center items-center min-h-screen">Loading...</div>;
  }

  if (!order) {
    return <div className="p-4 text-center">Order not found</div>;
  }

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="max-w-md mx-auto bg-white rounded-2xl shadow-sm p-6 text-center">
        <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
        <h1 className="text-2xl font-bold mb-2">Payment Successful!</h1>
        <p className="text-gray-600 mb-4">Your order has been placed.</p>
        <p className="text-sm text-gray-500 mb-6">Order ID: {order.id?.slice(0,8)}</p>

        {rider && (
          <div className="border-t pt-4 mt-4">
            <p className="font-semibold mb-2">Your Rider:</p>
            <div className="flex justify-center gap-4">
              <a
                href={`tel:${rider.phone}`}
                className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center active:scale-90 transition-transform"
              >
                <Phone className="w-4 h-4 text-primary" />
              </a>
              <a
                href={`https://wa.me/${rider.phone?.replace(/\D/g, '')}`}
                target="_blank"
                rel="noopener noreferrer"
                className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center active:scale-90 transition-transform"
              >
                <MessageCircle className="w-4 h-4 text-primary" />
              </a>
            </div>
          </div>
        )}

        <button
          onClick={() => window.location.href = '/'}
          className="mt-6 bg-primary text-white px-6 py-2 rounded-full"
        >
          Continue Shopping
        </button>
      </div>
    </div>
  );
}