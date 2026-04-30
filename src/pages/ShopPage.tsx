// src/pages/ShopPage.tsx
import { useNavigate } from "react-router-dom";
import { ArrowLeft, ShoppingBag } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";
import VendorCard from "@/components/VendorCard";

const fetchShopVendors = async () => {
  const { data, error } = await supabase
    .from("vendors")
    .select("*")
    .eq("is_active", true)
    .in("store_category", ["beauty", "retail"]); // adjust to your actual category names
  if (error) throw error;
  return data || [];
};

export default function ShopPage() {
  const navigate = useNavigate();
  const { data: vendors = [], isLoading } = useQuery({
    queryKey: ["shop-vendors"],
    queryFn: fetchShopVendors,
  });

  return (
    <div className="min-h-screen bg-[#FAFDF6] pb-6">
      <header className="sticky top-0 z-30 bg-[#2E7D32] text-white px-4 py-3 flex items-center gap-3 shadow-md">
        <button onClick={() => navigate(-1)} className="p-2.5 active:scale-95 transition-transform">
          <ArrowLeft className="w-5 h-5" />
        </button>
        <h1 className="font-bold text-lg">Shops 🛍️</h1>
      </header>

      <div className="p-4">
        {isLoading ? (
          <div className="flex justify-center py-10">
            <div className="w-6 h-6 border-2 border-[#2E7D32] border-t-transparent rounded-full animate-spin" />
          </div>
        ) : vendors.length === 0 ? (
          <div className="text-center py-10 text-gray-500">
            <ShoppingBag className="w-12 h-12 mx-auto mb-3 opacity-40" />
            <p>No shops available at the moment.</p>
            <p className="text-sm">Check back soon!</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-4">
            {vendors.map((vendor, idx) => (
              <VendorCard
                key={vendor.id}
                vendor={vendor}
                index={idx}
                onClick={() => navigate(`/vendor/${vendor.id}`)}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}