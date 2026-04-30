import { motion } from "framer-motion";
import { Check, Star } from "lucide-react";

interface PartyPackageCardProps {
  pkg: {
    id: string;
    name: string;
    description: string;
    image: string;
    minGuests: number;
    maxGuests: number;
    pricePerPerson: number;
    popular?: boolean;
    includes: string[];
    vendors: string[];
  };
  isSelected: boolean;
  onSelect: () => void;
  index: number;
}

const PartyPackageCard = ({ pkg, isSelected, onSelect, index }: PartyPackageCardProps) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.1 }}
      onClick={onSelect}
      className={`bg-white rounded-2xl overflow-hidden shadow-sm border-2 transition-all cursor-pointer ${
        isSelected ? "border-brand-red shadow-md" : "border-gray-100"
      }`}
    >
      <div className="relative h-36">
        <img src={pkg.image} alt={pkg.name} className="w-full h-full object-cover" />
        {pkg.popular && (
          <div className="absolute top-2 right-2 bg-brand-red text-white text-xs font-bold px-2 py-1 rounded-full">
            🔥 Popular
          </div>
        )}
      </div>
      <div className="p-4">
        <div className="flex justify-between items-start mb-2">
          <h4 className="font-bold text-gray-800">{pkg.name}</h4>
          <div className="text-right">
            <span className="text-sm text-gray-500">from</span>
            <span className="text-lg font-bold text-brand-red"> ₦{pkg.pricePerPerson.toLocaleString()}</span>
            <span className="text-xs text-gray-500">/person</span>
          </div>
        </div>
        <p className="text-xs text-gray-500 mb-3">{pkg.description}</p>
        <div className="flex flex-wrap gap-1 mb-3">
          {pkg.includes.slice(0, 3).map((item, i) => (
            <span key={i} className="text-[10px] bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full">
              {item}
            </span>
          ))}
          {pkg.includes.length > 3 && (
            <span className="text-[10px] text-gray-400">+{pkg.includes.length - 3} more</span>
          )}
        </div>
        <div className="flex items-center justify-between text-xs text-gray-500">
          <span>👥 {pkg.minGuests}-{pkg.maxGuests} guests</span>
          <span>🏪 {pkg.vendors.length} vendor{pkg.vendors.length > 1 ? 's' : ''}</span>
          {isSelected && (
            <span className="text-brand-red font-medium flex items-center gap-1">
              <Check className="w-3 h-3" /> Selected
            </span>
          )}
        </div>
      </div>
    </motion.div>
  );
};

export default PartyPackageCard;