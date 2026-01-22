"use client";

import { useEffect, useRef, useState } from "react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

// Fix for default markers
(L.Icon.Default.prototype as unknown as { _getIconUrl?: () => void })._getIconUrl?.();
L.Icon.Default.mergeOptions({
  iconRetinaUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png",
  iconUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png",
  shadowUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png",
});

interface Location {
  lat: number;
  lng: number;
  address?: string;
}

interface OSMMapProps {
  riderLocation?: Location;
  userLocation?: Location;
  destinationLocation?: Location;
  isRider?: boolean;
  orderStatus?: string;
  className?: string;
}

export default function OSMMap({ 
  riderLocation, 
  userLocation, 
  destinationLocation, 
  isRider = false, 
  orderStatus,
  className = "h-96 w-full" 
}: OSMMapProps) {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const markersRef = useRef<{
    rider?: L.Marker;
    user?: L.Marker;
    destination?: L.Marker;
    route?: L.Polyline;
  }>({});
  const [mapReady, setMapReady] = useState(false);

  // Initialize map
  useEffect(() => {
    if (!mapRef.current || mapInstanceRef.current) return;

    const map = L.map(mapRef.current).setView([14.5995, 120.9842], 13); // Manila default

    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
      attribution: '© OpenStreetMap contributors',
      maxZoom: 19,
    }).addTo(map);

    mapInstanceRef.current = map;
    
    // Set map ready state asynchronously to avoid cascading renders
    setTimeout(() => setMapReady(true), 0);

    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, []);

  // Custom icons
  const createRiderIcon = () => {
    return L.divIcon({
      html: `
        <div class="relative">
          <div class="absolute inset-0 bg-blue-500 rounded-full animate-ping"></div>
          <div class="relative bg-blue-600 rounded-full w-8 h-8 flex items-center justify-center border-2 border-white shadow-lg">
            <svg class="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
              <path d="M8 16.5a1.5 1.5 0 11-3 0 1.5 1.5 0 013 0zM15 16.5a1.5 1.5 0 11-3 0 1.5 1.5 0 013 0z"/>
              <path d="M3 4a1 1 0 00-1 1v10a1 1 0 001 1h1.05a2.5 2.5 0 014.9 0H10a1 1 0 001-1V5a1 1 0 00-1-1H3zM14 7a1 1 0 00-1 1v6.05A2.5 2.5 0 0115.95 16H17a1 1 0 001-1v-5a1 1 0 00-.293-.707l-2-2A1 1 0 0015 7h-1z"/>
            </svg>
          </div>
        </div>
      `,
      className: "custom-div-icon",
      iconSize: [32, 32],
      iconAnchor: [16, 16],
    });
  };

  const createUserIcon = () => {
    return L.divIcon({
      html: `
        <div class="bg-green-500 rounded-full w-6 h-6 flex items-center justify-center border-2 border-white shadow-lg">
          <svg class="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
            <path fill-rule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clip-rule="evenodd"/>
          </svg>
        </div>
      `,
      className: "custom-div-icon",
      iconSize: [24, 24],
      iconAnchor: [12, 12],
    });
  };

  const createDestinationIcon = () => {
    return L.divIcon({
      html: `
        <div class="bg-red-500 rounded-full w-6 h-6 flex items-center justify-center border-2 border-white shadow-lg">
          <svg class="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
            <path fill-rule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clip-rule="evenodd"/>
          </svg>
        </div>
      `,
      className: "custom-div-icon",
      iconSize: [24, 24],
      iconAnchor: [12, 12],
    });
  };

  // Update rider location (real-time)
  useEffect(() => {
    if (!mapReady || !mapInstanceRef.current || !riderLocation) return;

    const map = mapInstanceRef.current;

    // Update or create rider marker
    if (markersRef.current.rider) {
      markersRef.current.rider.setLatLng([riderLocation.lat, riderLocation.lng]);
    } else {
      markersRef.current.rider = L.marker([riderLocation.lat, riderLocation.lng], {
        icon: createRiderIcon(),
      }).addTo(map);
    }

    // Update map bounds if rider is the main focus
    if (isRider) {
      map.setView([riderLocation.lat, riderLocation.lng], 15);
    }
  }, [riderLocation, mapReady, isRider]);

  // Update user location
  useEffect(() => {
    if (!mapReady || !mapInstanceRef.current || !userLocation) return;

    const map = mapInstanceRef.current;

    if (markersRef.current.user) {
      markersRef.current.user.setLatLng([userLocation.lat, userLocation.lng]);
    } else {
      markersRef.current.user = L.marker([userLocation.lat, userLocation.lng], {
        icon: createUserIcon(),
      }).addTo(map);
    }
  }, [userLocation, mapReady]);

  // Update destination location
  useEffect(() => {
    if (!mapReady || !mapInstanceRef.current || !destinationLocation) return;

    const map = mapInstanceRef.current;

    if (markersRef.current.destination) {
      markersRef.current.destination.setLatLng([destinationLocation.lat, destinationLocation.lng]);
    } else {
      markersRef.current.destination = L.marker([destinationLocation.lat, destinationLocation.lng], {
        icon: createDestinationIcon(),
      }).addTo(map);
    }
  }, [destinationLocation, mapReady]);

  // Draw route between rider and destination
  useEffect(() => {
    if (!mapReady || !mapInstanceRef.current || !riderLocation || !destinationLocation) return;

    const map = mapInstanceRef.current;

    // Remove existing route
    if (markersRef.current.route) {
      map.removeLayer(markersRef.current.route);
    }

    // Draw new route
    const routePoints = [
      [riderLocation.lat, riderLocation.lng],
      [destinationLocation.lat, destinationLocation.lng],
    ];

    markersRef.current.route = L.polyline(routePoints as [number, number][], {
      color: "#3B82F6",
      weight: 3,
      opacity: 0.7,
      dashArray: "10, 10",
    }).addTo(map);

    // Fit map to show both points
    const bounds = L.latLngBounds(routePoints as [number, number][]);
    map.fitBounds(bounds, { padding: [50, 50] });
  }, [riderLocation, destinationLocation, mapReady]);

  // Update map view based on order status
  useEffect(() => {
    if (!mapReady || !mapInstanceRef.current) return;

    const map = mapInstanceRef.current;

    if (orderStatus === "delivering" && riderLocation && destinationLocation) {
      // Show route from rider to destination
      const bounds = L.latLngBounds([
        [riderLocation.lat, riderLocation.lng],
        [destinationLocation.lat, destinationLocation.lng],
      ]);
      map.fitBounds(bounds, { padding: [50, 50] });
    } else if (orderStatus === "delivered") {
      // Focus on destination
      if (destinationLocation) {
        map.setView([destinationLocation.lat, destinationLocation.lng], 16);
      }
    }
  }, [orderStatus, riderLocation, destinationLocation, mapReady]);

  return (
    <div className={`relative ${className}`}>
      <div ref={mapRef} className="h-full w-full rounded-lg overflow-hidden" />
      
      {/* Map Legend */}
      <div className="absolute top-4 right-4 bg-white rounded-lg shadow-lg p-3 z-1000">
        <div className="text-xs font-semibold text-gray-700 mb-2">Live Tracking</div>
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-blue-600 rounded-full"></div>
            <span className="text-xs text-gray-600">Rider</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-green-500 rounded-full"></div>
            <span className="text-xs text-gray-600">User</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-red-500 rounded-full"></div>
            <span className="text-xs text-gray-600">Destination</span>
          </div>
        </div>
      </div>

      {/* Status Indicator */}
      {orderStatus && (
        <div className="absolute top-4 left-4 bg-white rounded-lg shadow-lg px-3 py-2 z-1000">
          <div className="flex items-center gap-2">
            <div className={`w-2 h-2 rounded-full ${
              orderStatus === "delivering" ? "bg-blue-500 animate-pulse" : 
              orderStatus === "delivered" ? "bg-green-500" : 
              "bg-gray-400"
            }`}></div>
            <span className="text-xs font-medium text-gray-700 capitalize">
              {orderStatus === "delivering" ? "On the way" : 
               orderStatus === "delivered" ? "Delivered" : 
               orderStatus}
            </span>
          </div>
        </div>
      )}
    </div>
  );
}
