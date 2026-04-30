import React, { useState, useRef, useEffect, useCallback } from 'react';
import { Search, MapPin, X, Loader2, Navigation } from 'lucide-react';
import { useLoadScript } from '@react-google-maps/api';

interface AddressAutocompleteProps {
  value: string;
  onChange: (address: string, addressDetails?: any) => void;
  placeholder?: string;
  className?: string;
}

const libraries: ("places")[] = ["places"];

const AddressAutocomplete: React.FC<AddressAutocompleteProps> = ({
  value,
  onChange,
  placeholder = "Enter your delivery address",
  className = ""
}) => {
  const [inputValue, setInputValue] = useState(value);
  const [suggestions, setSuggestions] = useState<any[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [loading, setLoading] = useState(false);
  const [isGettingLocation, setIsGettingLocation] = useState(false);
  
  const autocompleteService = useRef<any>(null);
  const geocoder = useRef<any>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const { isLoaded, loadError } = useLoadScript({
    googleMapsApiKey: import.meta.env.VITE_GOOGLE_MAPS_API_KEY || "",
    libraries,
  });

  // Initialize services when Google Maps loads
  useEffect(() => {
    if (isLoaded && window.google) {
      autocompleteService.current = new window.google.maps.places.AutocompleteService();
      geocoder.current = new window.google.maps.Geocoder();
    }
  }, [isLoaded]);

  // Fetch address suggestions
  const fetchSuggestions = useCallback(async (input: string) => {
    if (!input.trim() || input.length < 3 || !autocompleteService.current) {
      setSuggestions([]);
      setShowSuggestions(false);
      return;
    }

    setLoading(true);
    try {
      autocompleteService.current.getPlacePredictions(
        {
          input: input,
          componentRestrictions: { country: 'ng' },
          types: ['address']
        },
        (predictions: any[], status: string) => {
          setLoading(false);
          if (status === 'OK' && predictions) {
            setSuggestions(predictions);
            setShowSuggestions(true);
          } else {
            setSuggestions([]);
            setShowSuggestions(false);
          }
        }
      );
    } catch (error) {
      console.error('Error fetching suggestions:', error);
      setLoading(false);
    }
  }, []);

  // Debounced input change
  useEffect(() => {
    const debounceTimer = setTimeout(() => {
      if (inputValue !== value && inputValue.length > 2) {
        fetchSuggestions(inputValue);
      }
    }, 500);
    return () => clearTimeout(debounceTimer);
  }, [inputValue, value, fetchSuggestions]);

  // Get current location
  const getCurrentLocation = () => {
    if (!navigator.geolocation) {
      alert("Geolocation is not supported by your browser");
      return;
    }

    setIsGettingLocation(true);
    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { latitude, longitude } = position.coords;
        
        if (geocoder.current) {
          geocoder.current.geocode(
            { location: { lat: latitude, lng: longitude } },
            (results: any[], status: string) => {
              setIsGettingLocation(false);
              if (status === 'OK' && results[0]) {
                const address = results[0].formatted_address;
                setInputValue(address);
                handleAddressSelect(address, results[0].place_id);
              } else {
                alert("Could not get address from location");
              }
            }
          );
        }
      },
      (error) => {
        setIsGettingLocation(false);
        console.error("Geolocation error:", error);
        alert("Unable to get your location. Please enter address manually.");
      }
    );
  };

  // Handle address selection
  const handleAddressSelect = (address: string, placeId: string) => {
    if (geocoder.current && placeId) {
      geocoder.current.geocode(
        { placeId: placeId },
        (results: any[], status: string) => {
          if (status === 'OK' && results[0]) {
            const result = results[0];
            const addressComponents = result.address_components;
            
            let street = '';
            let city = '';
            let state = '';
            let postalCode = '';
            let country = '';
            
            for (const component of addressComponents) {
              if (component.types.includes('street_number')) {
                street = component.long_name + ' ' + street;
              }
              if (component.types.includes('route')) {
                street = street + component.long_name;
              }
              if (component.types.includes('locality')) {
                city = component.long_name;
              }
              if (component.types.includes('administrative_area_level_1')) {
                state = component.long_name;
              }
              if (component.types.includes('postal_code')) {
                postalCode = component.long_name;
              }
              if (component.types.includes('country')) {
                country = component.long_name;
              }
            }
            
            onChange(address, {
              street: street.trim(),
              city,
              state,
              postalCode,
              country,
              latitude: result.geometry.location.lat(),
              longitude: result.geometry.location.lng(),
              formattedAddress: result.formatted_address,
              placeId: placeId
            });
          } else {
            onChange(address);
          }
        }
      );
    } else {
      onChange(address);
    }
  };

  const handleSelectSuggestion = (suggestion: any) => {
    setInputValue(suggestion.description);
    setShowSuggestions(false);
    setSuggestions([]);
    handleAddressSelect(suggestion.description, suggestion.place_id);
  };

  const handleBlur = () => {
    setTimeout(() => {
      setShowSuggestions(false);
    }, 200);
  };

  const clearAddress = () => {
    setInputValue('');
    onChange('');
    setSuggestions([]);
    setShowSuggestions(false);
    inputRef.current?.focus();
  };

  if (loadError) {
    return (
      <div className="relative">
        <input
          type="text"
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          placeholder={placeholder}
          className={`w-full px-4 py-3 border border-gray-200 rounded-xl ${className}`}
        />
        <p className="text-xs text-red-500 mt-1">
          ⚠️ Address service unavailable. Please enter address manually.
        </p>
      </div>
    );
  }

  if (!isLoaded) {
    return (
      <div className="relative">
        <div className="w-full px-4 py-3 border border-gray-200 rounded-xl bg-gray-50">
          <Loader2 className="w-5 h-5 text-gray-400 animate-spin mx-auto" />
        </div>
      </div>
    );
  }

  return (
    <div className="relative w-full">
      <div className="relative">
        <div className="absolute left-3 top-1/2 -translate-y-1/2">
          <MapPin className="w-4 h-4 text-gray-400" />
        </div>
        <input
          ref={inputRef}
          type="text"
          value={inputValue}
          onChange={(e) => {
            setInputValue(e.target.value);
            if (e.target.value === '') {
              onChange('');
            }
          }}
          onBlur={handleBlur}
          placeholder={placeholder}
          className={`w-full pl-9 pr-24 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#E23744] focus:border-[#E23744] transition-all ${className}`}
        />
        <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-1">
          <button
            onClick={getCurrentLocation}
            disabled={isGettingLocation}
            className="p-1.5 rounded-full hover:bg-gray-100 transition-colors"
            title="Use current location"
          >
            {isGettingLocation ? (
              <Loader2 className="w-4 h-4 text-gray-400 animate-spin" />
            ) : (
              <Navigation className="w-4 h-4 text-gray-500" />
            )}
          </button>
          {inputValue && (
            <button
              onClick={clearAddress}
              className="p-1.5 rounded-full hover:bg-gray-100"
            >
              <X className="w-4 h-4 text-gray-400" />
            </button>
          )}
        </div>
      </div>
      
      {/* Suggestions Dropdown */}
      {showSuggestions && suggestions.length > 0 && (
        <div className="absolute z-50 w-full mt-1 bg-white border border-gray-200 rounded-xl shadow-lg max-h-60 overflow-y-auto">
          {suggestions.map((suggestion) => (
            <button
              key={suggestion.place_id}
              onClick={() => handleSelectSuggestion(suggestion)}
              className="w-full px-4 py-3 text-left hover:bg-gray-50 flex items-start gap-3 border-b border-gray-100 last:border-0 transition-colors"
            >
              <MapPin className="w-4 h-4 text-gray-400 mt-0.5 flex-shrink-0" />
              <div className="flex-1">
                <p className="text-sm text-gray-800">{suggestion.description}</p>
                <p className="text-xs text-gray-400 mt-0.5">Tap to select this address</p>
              </div>
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

export default AddressAutocomplete;