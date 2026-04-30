import { useState } from "react";
import { MapPin } from "lucide-react";
import { LAGOS_AREAS, detectZone } from "@/lib/deliveryPricing";

interface LocationSelectorProps {
  deliveryLocation: string;
  onSelectLocation: (location: string) => void;
  deliveryFee: number;
}

const LocationSelector = ({ deliveryLocation, onSelectLocation, deliveryFee }: LocationSelectorProps) => {
  const [locationSearch, setLocationSearch] = useState(deliveryLocation);
  const [showDropdown, setShowDropdown] = useState(false);
  const zone = deliveryLocation ? detectZone(deliveryLocation) : null;

  const filteredAreas = locationSearch.trim()
    ? LAGOS_AREAS.filter((a) => a.toLowerCase().includes(locationSearch.toLowerCase()))
    : LAGOS_AREAS;

  const selectArea = (area: string) => {
    onSelectLocation(area);
    setLocationSearch(area);
    setShowDropdown(false);
  };

  return (
    <div className="bg-card rounded-2xl border border-border p-4 space-y-2">
      <p className="text-xs font-bold text-foreground flex items-center gap-1.5">
        <MapPin className="w-3.5 h-3.5 text-primary" /> Delivery Location
      </p>
      <div className="relative">
        <input
          type="text"
          placeholder="Search your area in Lagos..."
          value={locationSearch}
          onChange={(e) => { setLocationSearch(e.target.value); setShowDropdown(true); }}
          onFocus={() => setShowDropdown(true)}
          className="w-full border border-border rounded-xl px-3 py-2.5 text-sm bg-muted/50 outline-none focus:border-primary"
        />
        {showDropdown && filteredAreas.length > 0 && (
          <div className="absolute top-full left-0 right-0 mt-1 bg-card border border-border rounded-xl shadow-lg max-h-40 overflow-y-auto z-20">
            {filteredAreas.map((area) => (
              <button
                key={area}
                onClick={() => selectArea(area)}
                className="w-full text-left px-3 py-2 text-sm hover:bg-muted transition-colors first:rounded-t-xl last:rounded-b-xl"
              >
                {area}
              </button>
            ))}
          </div>
        )}
      </div>
      {deliveryLocation && (
        <div className="flex items-center justify-between text-xs mt-1">
          <span className="text-muted-foreground">
            📍 {deliveryLocation} ({zone === "mainland" ? "Mainland" : zone === "island" ? "Island" : zone === "extended" ? "Extended Lagos" : zone === "greater_lagos" ? "Greater Lagos" : "Lagos"})
          </span>
          <div className="flex flex-col items-end">
            <span className="font-bold text-primary">₦{deliveryFee.toLocaleString()}</span>
            <span className="text-[8px] text-muted-foreground/60 italic">Adjusted for fuel costs</span>
          </div>
        </div>
      )}
    </div>
  );
};

export default LocationSelector;
