"use client";

import { useState, useEffect } from "react";
import { Navigation, Timer, MapPin } from "lucide-react";

interface OrderLivePreviewProps {
  orderId: string;
  riderId: string;
  status: string;
  dropoffLat?: number;
  dropoffLng?: number;
}

interface RiderLocation {
  lat: number;
  lng: number;
  timestamp: number;
}

export default function OrderLivePreview({ 
  orderId, 
  riderId, 
  status, 
  dropoffLat, 
  dropoffLng 
}: OrderLivePreviewProps) {
  const [riderLocation, setRiderLocation] = useState<RiderLocation | null>(null);
  const [distance, setDistance] = useState<number | null>(null);
  const [estimatedTime, setEstimatedTime] = useState<number | null>(null);

  // Calculate distance and estimated time
  const calculateDistanceAndETA = (riderLat: number, riderLng: number, destLat: number, destLng: number) => {
    // Simple distance calculation (Haversine formula)
    const R = 6371; // Earth's radius in kilometers
    const dLat = (destLat - riderLat) * Math.PI / 180;
    const dLng = (destLng - riderLng) * Math.PI / 180;
    const a = 
      Math.sin(dLat/2) * Math.sin(dLat/2) +
      Math.cos(riderLat * Math.PI / 180) * Math.cos(destLat * Math.PI / 180) * 
      Math.sin(dLng/2) * Math.sin(dLng/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    const distance = R * c;

    // Estimate time (assuming average speed of 30 km/h for delivery)
    const avgSpeed = 30; // km/h
    const estimatedMinutes = (distance / avgSpeed) * 60;

    setDistance(Math.round(distance * 100) / 100); // Round to 2 decimal places
    setEstimatedTime(Math.round(estimatedMinutes));
  };

  // Only track for active orders
  useEffect(() => {
    if (!riderId || status !== 'delivering') return;

    const fetchRiderLocation = async () => {
      try {
        const response = await fetch(`/api/riders/update-location?riderId=${riderId}`);
        
        if (response.ok) {
          const data = await response.json();
          if (data.location) {
            setRiderLocation({
              lat: data.location.lat,
              lng: data.location.lng,
              timestamp: data.location.timestamp || Date.now()
            });

            // Calculate distance and ETA if we have both locations
            if (dropoffLat && dropoffLng) {
              calculateDistanceAndETA(
                data.location.lat,
                data.location.lng,
                dropoffLat,
                dropoffLng
              );
            }
          }
        }
      } catch (error) {
        console.error("Error fetching rider location:", error);
      }
    };

    // Initial fetch
    fetchRiderLocation();

    // Set up interval for real-time updates
    const interval = setInterval(fetchRiderLocation, 5000);

    return () => clearInterval(interval);
  }, [riderId, status, dropoffLat, dropoffLng]);

  // Only show for delivering orders with rider location
  if (status !== 'delivering' || !riderLocation) {
    return null;
  }

  return (
    <div className="bg-gradient-to-r from-orange-50 to-yellow-50 border border-orange-100 rounded-2xl p-3 mb-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
          <span className="text-xs font-black text-orange-600 uppercase tracking-widest">Live Tracking</span>
        </div>
        <div className="flex items-center gap-1 text-xs text-gray-600">
          <Navigation className="w-3 h-3" />
          <span>Rider on the way</span>
        </div>
      </div>
      
      {(distance !== null || estimatedTime !== null) && (
        <div className="grid grid-cols-2 gap-3 mt-2">
          {distance !== null && (
            <div className="flex items-center gap-1.5">
              <MapPin className="w-3 h-3 text-orange-600" />
              <div>
                <p className="text-[10px] font-bold text-gray-500 uppercase">Distance</p>
                <p className="text-sm font-black text-orange-600">{distance} km</p>
              </div>
            </div>
          )}
          {estimatedTime !== null && (
            <div className="flex items-center gap-1.5">
              <Timer className="w-3 h-3 text-orange-600" />
              <div>
                <p className="text-[10px] font-bold text-gray-500 uppercase">ETA</p>
                <p className="text-sm font-black text-orange-600">{estimatedTime} mins</p>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
