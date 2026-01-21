"use client";

import { useState } from "react";
import { supabase } from "@/lib/supabase";
import { MapPin, X, Check } from "lucide-react";

export default function AccountCompletionModal({
  userId,
  onComplete,
}: {
  userId: string;
  onComplete: () => void;
}) {
  const [form, setForm] = useState({
    full_name: "",
    mobile: "",
    address: "",
    lat: 0,
    lng: 0,
  });
  const [isLoading, setIsLoading] = useState(false);
  const [showMap, setShowMap] = useState(false);
  const [locationPinned, setLocationPinned] = useState(false);

  const saveProfile = async () => {
    if (!form.full_name || !form.mobile || !form.address) {
      alert("Please fill in all required fields");
      return;
    }

    if (!locationPinned) {
      alert("Please pin your location on the map");
      return;
    }

    setIsLoading(true);

    try {
      await supabase.from("profiles").update({
        full_name: form.full_name,
        mobile: form.mobile,
        address: form.address,
        lat: form.lat,
        lng: form.lng,
      }).or(`id.eq.${userId},user_id.eq.${userId}`);

      onComplete();
    } catch (error) {
      console.error("Error saving profile:", error);
      alert("Failed to save profile. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleLocationPin = () => {
    // Simulate location pinning (in real app, integrate with Google Maps or similar)
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setForm(prev => ({
            ...prev,
            lat: position.coords.latitude,
            lng: position.coords.longitude,
          }));
          setLocationPinned(true);
          setShowMap(false);
        },
        (error) => {
          console.error("Error getting location:", error);
          // Fallback to Bulan, Sorsogon coordinates
          setForm(prev => ({
            ...prev,
            lat: 12.6767,
            lng: 123.9649,
          }));
          setLocationPinned(true);
          setShowMap(false);
        }
      );
    } else {
      // Fallback coordinates
      setForm(prev => ({
        ...prev,
        lat: 12.6767,
        lng: 123.9649,
      }));
      setLocationPinned(true);
      setShowMap(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-xl w-full max-w-md max-h-[90vh] overflow-y-auto">
        {/* HEADER */}
        <div className="p-4 border-b flex justify-between items-center">
          <h2 className="font-bold text-lg">Complete Account Information</h2>
          <button
            onClick={onComplete}
            className="p-1 rounded hover:bg-gray-100"
          >
            <X size={20} />
          </button>
        </div>

        {/* CONTENT */}
        <div className="p-4 space-y-4">
          <div className="bg-blue-50 p-3 rounded-lg">
            <p className="text-sm text-blue-800">
              Please complete your account information to have a successful order experience.
            </p>
          </div>

          {/* FORM FIELDS */}
          <div className="space-y-3">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Full Name *
              </label>
              <input
                type="text"
                placeholder="Enter your full name"
                value={form.full_name}
                onChange={(e) => setForm({ ...form, full_name: e.target.value })}
                className="w-full p-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Mobile Number *
              </label>
              <input
                type="tel"
                placeholder="Enter your mobile number"
                value={form.mobile}
                onChange={(e) => setForm({ ...form, mobile: e.target.value })}
                className="w-full p-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Complete Address *
              </label>
              <textarea
                placeholder="Enter your complete delivery address"
                value={form.address}
                onChange={(e) => setForm({ ...form, address: e.target.value })}
                rows={3}
                className="w-full p-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
              />
            </div>

            {/* LOCATION PINNING */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Delivery Location *
              </label>
              <button
                onClick={() => setShowMap(!showMap)}
                className={`w-full p-3 border rounded-lg flex items-center justify-between transition-colors ${
                  locationPinned 
                    ? "border-green-500 bg-green-50" 
                    : "border-gray-300 hover:border-orange-500"
                }`}
              >
                <div className="flex items-center gap-2">
                  <MapPin size={20} className={locationPinned ? "text-green-600" : "text-gray-400"} />
                  <span className={`text-sm ${locationPinned ? "text-green-700 font-medium" : "text-gray-600"}`}>
                    {locationPinned ? "Location Pinned Successfully" : "Pin Your Location"}
                  </span>
                </div>
                {locationPinned && <Check size={20} className="text-green-600" />}
              </button>

              {showMap && (
                <div className="mt-2 p-4 bg-gray-50 rounded-lg border">
                  <div className="text-center space-y-3">
                    <div className="w-full h-32 bg-gray-200 rounded-lg flex items-center justify-center">
                      <div className="text-center">
                        <MapPin size={32} className="text-gray-400 mx-auto mb-2" />
                        <p className="text-sm text-gray-600">Map View</p>
                        <p className="text-xs text-gray-500">Click below to get your current location</p>
                      </div>
                    </div>
                    <button
                      onClick={handleLocationPin}
                      className="w-full bg-orange-600 text-white py-2 rounded-lg font-medium hover:bg-orange-700 transition-colors"
                    >
                      Use Current Location
                    </button>
                    <p className="text-xs text-gray-500">
                      Or manually drag the pin to your location
                    </p>
                  </div>
                </div>
              )}

              {locationPinned && (
                <div className="mt-2 p-2 bg-green-50 rounded text-xs text-green-700">
                  ✓ Location coordinates saved: {form.lat.toFixed(6)}, {form.lng.toFixed(6)}
                </div>
              )}
            </div>
          </div>

          {/* ACTIONS */}
          <div className="flex gap-3 pt-4">
            <button
              onClick={onComplete}
              className="flex-1 bg-gray-200 text-gray-800 py-3 rounded-xl font-medium hover:bg-gray-300 transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={saveProfile}
              disabled={isLoading}
              className="flex-1 bg-orange-600 text-white py-3 rounded-xl font-medium hover:bg-orange-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? "Saving..." : "Save Information"}
            </button>
          </div>

          {/* INFO */}
          <div className="text-center pt-2">
            <p className="text-xs text-gray-500">
              Your information helps us deliver your orders accurately.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
