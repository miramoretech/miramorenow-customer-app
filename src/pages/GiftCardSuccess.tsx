import { useLocation, useNavigate } from "react-router-dom";
import { CheckCircle } from "lucide-react";

export default function GiftCardSuccess() {
  const location = useLocation();
  const navigate = useNavigate();
  const { giftCard } = location.state || {};

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-6 bg-white">
      <CheckCircle className="w-16 h-16 text-green-500 mb-4" />
      <h1 className="text-2xl font-bold text-gray-800">Purchase Successful! 🎉</h1>
      <p className="text-gray-600 mt-2 text-center">
        Your {giftCard?.category} gift card of ₦{giftCard?.amount?.toLocaleString()} has been purchased.
      </p>
      <button
        onClick={() => navigate("/home")}
        className="mt-6 px-6 py-2 rounded-xl bg-brand-red text-white font-semibold"
      >
        Back to Home
      </button>
    </div>
  );
}