// src/pages/LocalMarketsPage.tsx
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Store, Construction } from "lucide-react";

export default function LocalMarketsPage() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-[#FAFDF6]">
      <header className="sticky top-0 z-30 bg-[#2E7D32] text-white px-4 py-3 flex items-center gap-3 shadow-md">
        <button onClick={() => navigate(-1)} className="p-2.5 active:scale-95 transition-transform">
          <ArrowLeft className="w-5 h-5" />
        </button>
        <h1 className="font-bold text-lg">Local Markets 🛒</h1>
      </header>

      <div className="flex flex-col items-center justify-center py-20 px-6 text-center">
        <div className="w-24 h-24 bg-[#E8F5E9] rounded-full flex items-center justify-center mx-auto mb-6">
          <Store className="w-12 h-12 text-[#2E7D32]" />
        </div>
        <h2 className="text-xl font-bold text-gray-800 mb-2">Coming Soon!</h2>
        <p className="text-gray-500 max-w-xs mx-auto">
          We're connecting you with the best local markets in your area. Fresh produce, groceries & more are on the way! 🥬
        </p>
        <div className="mt-8 flex items-center gap-2 text-sm text-amber-600 bg-amber-50 px-4 py-2 rounded-full">
          <Construction className="w-4 h-4" />
          <span>Opening soon</span>
        </div>
      </div>
    </div>
  );
}