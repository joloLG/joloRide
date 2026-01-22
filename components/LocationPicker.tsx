"use client";

import { useEffect, useState } from "react";
import { MapPin, Navigation } from "lucide-react";

type Location = {
  lat: number;
  lng: number;
  address: string;
  landmark?: string;
};

export default function LocationPicker({
  setLocation,
}: {
  setLocation: (loc: Location) => void;
}) {
  const [currentLocation, setCurrentLocation] = useState<Location | null>(null);
  const [landmark, setLandmark] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const getCurrentLocation = async () => {
    setIsLoading(true);
    try {
      const pos = await new Promise<GeolocationPosition>((resolve, reject) => {
        navigator.geolocation.getCurrentPosition(resolve, reject);
      });

      // In a real app, you would use a geocoding service to get the actual address
      // For now, we'll use a placeholder
      const location: Location = {
        lat: pos.coords.latitude,
        lng: pos.coords.longitude,
        address: `Location at ${pos.coords.latitude.toFixed(6)}, ${pos.coords.longitude.toFixed(6)}`,
      };

      setCurrentLocation(location);
      setLocation({ ...location, landmark: landmark || undefined });
    } catch (error) {
      console.error('Error getting location:', error);
      // Fallback location
      const fallbackLocation: Location = {
        lat: 12.8797,
        lng: 124.1423,
        address: 'Bulan, Sorsogon, Philippines',
      };
      setCurrentLocation(fallbackLocation);
      setLocation({ ...fallbackLocation, landmark: landmark || undefined });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    getCurrentLocation();
  }, []);

  useEffect(() => {
    if (currentLocation) {
      setLocation({ ...currentLocation, landmark: landmark || undefined });
    }
  }, [landmark]);

  return (
    <div className="space-y-4">
      {/* Current Location Display */}
      {currentLocation && (
        <div className="bg-gray-50 p-4 rounded-2xl border border-gray-100">
          <div className="flex items-start gap-3">
            <div className="p-2 bg-orange-100 rounded-xl">
              <MapPin size={16} className="text-orange-600" />
            </div>
            <div className="flex-1">
              <p className="text-sm font-bold text-gray-900">{currentLocation.address}</p>
              <p className="text-xs text-gray-400 mt-1">
                Coordinates: {currentLocation.lat.toFixed(6)}, {currentLocation.lng.toFixed(6)}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Landmark Input */}
      <div>
        <label className="block text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] mb-2 ml-1">
          Nearest Landmark (Optional)
        </label>
        <input
          type="text"
          value={landmark}
          onChange={(e) => setLandmark(e.target.value)}
          placeholder="e.g. Near Jollibee, beside Municipal Hall"
          className="w-full px-4 py-3 bg-gray-50 border-none rounded-2xl text-sm font-bold placeholder:text-gray-400 focus:ring-2 focus:ring-orange-500 transition-all"
        />
        <p className="text-xs text-gray-400 mt-1 px-1">
          Help riders find your location faster
        </p>
      </div>

      {/* Update Location Button */}
      <button
        onClick={getCurrentLocation}
        disabled={isLoading}
        className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-orange-50 text-orange-600 rounded-2xl font-bold text-sm border border-orange-100 hover:bg-orange-100 transition-all disabled:opacity-50"
      >
        <Navigation size={16} className={isLoading ? "animate-spin" : ""} />
        {isLoading ? "Getting Location..." : "Update Location"}
      </button>
    </div>
  );
}
