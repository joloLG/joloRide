"use client";

import { useState } from "react";
import { MapPin, AlertCircle } from "lucide-react";

interface Location {
  lat: number;
  lng: number;
  address: string;
  landmark?: string;
}

interface AddressSelectorProps {
  onLocationSelect: (location: Location) => void;
  initialLocation?: Location | null;
}

// Define the available municipalities and their barangays
const AVAILABLE_MUNICIPALITIES = {
  "Irosin": {
    coordinates: { lat: 12.9917, lng: 124.0167 },
    barangays: [
      "Bagacay", "Balete", "Bato-Bato", "Bulawan", "Cagbacong", "Calanagaan",
      "Caloocan", "Carriedo", "Casiguran", "Cawayan", "Cogon", "Gabao",
      "Gadbo", "Ginablan", "Guinlajon", "Juban", "Lisap", "Madlawon",
      "Monbon", "Pamplona", "Panikihan", "Poblacion", "Potol", "San Antonio",
      "San Benon", "San Isidro", "San Juan", "San Rafael", "San Roque",
      "Santa Cruz", "Tabi", "Talisay", "Tampi", "Tigkiw", "Tinampo"
    ]
  },
  "Bulan": {
    coordinates: { lat: 12.6789, lng: 123.8567 },
    barangays: [
      "Aguada", "Aserda", "Bacao", "Bagacay", "Balaogan", "Barangay Zone 1 (Pob.)",
      "Barangay Zone 2 (Pob.)", "Barangay Zone 3 (Pob.)", "Barangay Zone 4 (Pob.)",
      "Barangay Zone 5 (Pob.)", "Barangay Zone 6 (Pob.)", "Barangay Zone 7 (Pob.)",
      "Bulusan", "Buyo", "Cadagdagan", "Cagpo", "Calagi", "Calaylayan",
      "Camcaman", "Cawayan", "Central", "Cogon", "Daganas", "Dancalan",
      "Del Rosario", "Denic", "Duran", "Gadgaron", "Gatbo", "Imelda",
      "J. P. Laurel", "Layuan", "Lomban", "Mabini", "Marinab", "Masaroy",
      "Monreal", "Naburan", "Padre Diaz", "Palomas", "Paris", "Poblacion",
      "Rizal", "Sabang", "San Francisco", "San Isidro", "San Jose",
      "San Juan (Bagong Silang)", "San Rafael", "San Ramon", "San Vicente",
      "Santa Cruz", "Santa Remedios", "Santo Cristo", "Santo Niño",
      "Santor", "Tagalog", "Talistayon", "Talisay", "Tapon", "Tigbon",
      "Tubod"
    ]
  }
};

export default function AddressSelector({ onLocationSelect, initialLocation }: AddressSelectorProps) {
  const [selectedMunicipality, setSelectedMunicipality] = useState<string>("");
  const [selectedBarangay, setSelectedBarangay] = useState<string>("");
  const [landmark, setLandmark] = useState<string>("");
  const [noDelivery, setNoDelivery] = useState<boolean>(false);

  const handleMunicipalityChange = (municipality: string) => {
    setSelectedMunicipality(municipality);
    setSelectedBarangay(""); // Reset barangay when municipality changes
    setNoDelivery(false);

    if (municipality && AVAILABLE_MUNICIPALITIES[municipality as keyof typeof AVAILABLE_MUNICIPALITIES]) {
      const coords = AVAILABLE_MUNICIPALITIES[municipality as keyof typeof AVAILABLE_MUNICIPALITIES].coordinates;
      
      // Update location with municipality coordinates (will be refined when barangay is selected)
      onLocationSelect({
        lat: coords.lat,
        lng: coords.lng,
        address: `${municipality}, Sorsogon, Philippines`,
        landmark: landmark || undefined
      });
    }
  };

  const handleBarangayChange = (barangay: string) => {
    setSelectedBarangay(barangay);
    
    if (selectedMunicipality && barangay) {
      const fullAddress = `${barangay}, ${selectedMunicipality}, Sorsogon, Philippines`;
      const coords = AVAILABLE_MUNICIPALITIES[selectedMunicipality as keyof typeof AVAILABLE_MUNICIPALITIES].coordinates;
      
      // In a real implementation, you'd have specific coordinates for each barangay
      // For now, we'll use the municipality coordinates with a small offset
      const barangayOffset = Math.random() * 0.01 - 0.005; // Small random offset
      
      onLocationSelect({
        lat: coords.lat + barangayOffset,
        lng: coords.lng + barangayOffset,
        address: fullAddress,
        landmark: landmark || undefined
      });
    }
  };

  const handleLandmarkChange = (value: string) => {
    setLandmark(value);
    
    if (selectedMunicipality && selectedBarangay) {
      const fullAddress = `${selectedBarangay}, ${selectedMunicipality}, Sorsogon, Philippines${value ? `, Near: ${value}` : ''}`;
      const coords = AVAILABLE_MUNICIPALITIES[selectedMunicipality as keyof typeof AVAILABLE_MUNICIPALITIES].coordinates;
      
      onLocationSelect({
        lat: coords.lat,
        lng: coords.lng,
        address: fullAddress,
        landmark: value || undefined
      });
    }
  };

  return (
    <div className="space-y-4">
      <div className="space-y-3">
        {/* Municipality Selection */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            <MapPin className="inline w-4 h-4 mr-1" />
            Municipality *
          </label>
          <select
            value={selectedMunicipality}
            onChange={(e) => handleMunicipalityChange(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
            required
          >
            <option value="">Select Municipality</option>
            {Object.keys(AVAILABLE_MUNICIPALITIES).map((municipality) => (
              <option key={municipality} value={municipality}>
                {municipality}, Sorsogon
              </option>
            ))}
          </select>
        </div>

        {/* Barangay Selection */}
        {selectedMunicipality && (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Barangay *
            </label>
            <select
              value={selectedBarangay}
              onChange={(e) => handleBarangayChange(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
              required
            >
              <option value="">Select Barangay</option>
              {AVAILABLE_MUNICIPALITIES[selectedMunicipality as keyof typeof AVAILABLE_MUNICIPALITIES].barangays.map((barangay) => (
                <option key={barangay} value={barangay}>
                  {barangay}
                </option>
              ))}
            </select>
          </div>
        )}

        {/* Landmark (Optional) */}
        {selectedBarangay && (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Landmark (Optional)
            </label>
            <input
              type="text"
              value={landmark}
              onChange={(e) => handleLandmarkChange(e.target.value)}
              placeholder="e.g., Near the church, beside the school, etc."
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
            />
          </div>
        )}
      </div>

      {/* Delivery Service Notice */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
        <div className="flex items-start gap-2">
          <MapPin className="w-4 h-4 text-blue-600 mt-0.5" />
          <div className="text-sm text-blue-800">
            <p className="font-medium mb-1">Delivery Service Areas</p>
            <p>We currently deliver only to:</p>
            <ul className="list-disc list-inside mt-1 space-y-1">
              <li>Irosin, Sorsogon</li>
              <li>Bulan, Sorsogon</li>
            </ul>
            <p className="text-xs mt-2 text-blue-600">
              Other municipalities are not yet covered by our delivery service.
            </p>
          </div>
        </div>
      </div>

      {/* Selected Address Display */}
      {selectedMunicipality && selectedBarangay && (
        <div className="bg-green-50 border border-green-200 rounded-lg p-3">
          <div className="flex items-start gap-2">
            <MapPin className="w-4 h-4 text-green-600 mt-0.5" />
            <div className="text-sm text-green-800">
              <p className="font-medium mb-1">Delivery Address</p>
              <p>{selectedBarangay}, {selectedMunicipality}, Sorsogon, Philippines</p>
              {landmark && <p className="text-xs mt-1">Near: {landmark}</p>}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
