import { Check } from "lucide-react";

interface PartyExtraCardProps {
  extra: {
    id: string;
    name: string;
    price: number;
    icon: string;
    description: string;
  };
  isSelected: boolean;
  onToggle: () => void;
}

const PartyExtraCard = ({ extra, isSelected, onToggle }: PartyExtraCardProps) => {
  return (
    <div
      onClick={onToggle}
      className={`bg-white rounded-2xl p-4 shadow-sm border-2 cursor-pointer transition-all ${
        isSelected ? "border-brand-red bg-brand-red/5" : "border-gray-100"
      }`}
    >
      <div className="flex items-center gap-3">
        <div className="text-3xl">{extra.icon}</div>
        <div className="flex-1">
          <div className="flex justify-between items-center">
            <h4 className="font-bold text-gray-800">{extra.name}</h4>
            <span className="font-bold text-brand-red">₦{extra.price.toLocaleString()}</span>
          </div>
          <p className="text-xs text-gray-500 mt-1">{extra.description}</p>
        </div>
        {isSelected && <Check className="w-5 h-5 text-brand-red" />}
      </div>
    </div>
  );
};

export default PartyExtraCard;