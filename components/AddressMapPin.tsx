"use client";

import { MapPin } from "lucide-react";

interface Location {
  lat: number;
  lng: number;
  address: string;
  landmark?: string;
}

interface AddressMapPinProps {
  location: Location | null;
  className?: string;
}

export default function AddressMapPin({ location, className = "" }: AddressMapPinProps) {
  if (!location) {
    return (
      <div className={`bg-gray-100 border border-gray-200 rounded-xl p-4 text-center ${className}`}>
        <MapPin className="w-8 h-8 text-gray-400 mx-auto mb-2" />
        <p className="text-sm text-gray-500">No location selected</p>
      </div>
    );
  }

  // Create a simple static map URL using OpenStreetMap
  const mapUrl = `https://www.openstreetmap.org/export/embed.html?bbox=${location.lng - 0.002},${location.lat - 0.002},${location.lng + 0.002},${location.lat + 0.002}&layer=mapnik&marker=${location.lat},${location.lng}`;

  return (
    <div className={`bg-white border border-gray-200 rounded-xl overflow-hidden ${className}`}>
      <div className="relative">
        {/* Static Map */}
        <div className="h-48 bg-gray-100 relative">
          <iframe
            src={mapUrl}
            className="w-full h-full border-0"
            title="Delivery Location Map"
          />
          <div className="absolute top-2 right-2 bg-white px-2 py-1 rounded-lg shadow-md">
            <div className="flex items-center gap-1">
              <MapPin className="w-3 h-3 text-red-500" />
              <span className="text-xs font-medium text-gray-700">Delivery</span>
            </div>
          </div>
        </div>
        
        {/* Location Details */}
        <div className="p-4 bg-gray-50">
          <div className="flex items-start gap-3">
            <MapPin className="w-5 h-5 text-orange-600 mt-0.5 flex-shrink-0" />
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-gray-900 leading-tight">
                {location.address}
              </p>
              {location.landmark && (
                <p className="text-xs text-orange-600 mt-1">
                  📍 {location.landmark}
                </p>
              )}
              <p className="text-xs text-gray-500 mt-2">
                📍 {location.lat.toFixed(6)}, {location.lng.toFixed(6)}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
