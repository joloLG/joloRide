"use client";

import { useEffect } from "react";

type Location = {
  lat: number;
  lng: number;
  address: string;
};

export default function LocationPicker({
  setLocation,
}: {
  setLocation: (loc: Location) => void;
}) {
  useEffect(() => {
    navigator.geolocation.getCurrentPosition(async (pos) => {
      // In a real app, you would reverse geocode the coordinates to get an address
      // For now, we'll use a placeholder address
      setLocation({
        lat: pos.coords.latitude,
        lng: pos.coords.longitude,
        address: 'Location selected on map',
      });
    });
  }, []);

  return (
    <div className="bg-gray-100 p-3 rounded-xl text-sm">
      Location pinned automatically. You can adjust in next phase.
    </div>
  );
}
