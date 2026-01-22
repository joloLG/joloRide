"use client";

import { useState, useEffect } from "react";
import OSMMap from "@/components/OSMMap";
import { 
  Package, 
  Clock, 
  CheckCircle, 
  Truck, 
  MapPin, 
  Phone, 
  Navigation,
  Timer
} from "lucide-react";

interface Order {
  id: string;
  status: string;
  total_amount: number;
  delivery_fee: number;
  payment_method: string;
  created_at: string;
  dropoff_address?: string;
  dropoff_lat?: number;
  dropoff_lng?: number;
  landmark?: string;
  user: {
    full_name?: string;
    mobile?: string;
    address?: string;
  };
  order_items: {
    id: string;
    product: {
      name: string;
      price: number;
    };
    quantity: number;
  }[];
  rider?: {
    id: string;
    full_name: string;
    mobile: string;
  };
}

interface RiderLocation {
  lat: number;
  lng: number;
  timestamp: number;
}

interface OrderTrackingProps {
  order: Order;
}

export default function OrderTracking({ order }: OrderTrackingProps) {
  const [riderLocation, setRiderLocation] = useState<RiderLocation | null>(null);
  const [estimatedTime, setEstimatedTime] = useState<number | null>(null);
  const [distance, setDistance] = useState<number | null>(null);

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

  // Fetch rider location every 5 seconds
  useEffect(() => {
    if (!order.rider?.id || order.status !== 'delivering') return;

    const fetchRiderLocation = async () => {
      try {
        const response = await fetch(`/api/riders/update-location?riderId=${order.rider!.id}`);
        
        if (response.ok) {
          const data = await response.json();
          if (data.location) {
            setRiderLocation({
              lat: data.location.lat,
              lng: data.location.lng,
              timestamp: data.location.timestamp || Date.now()
            });

            // Calculate distance and ETA if we have both locations
            if (order.dropoff_lat && order.dropoff_lng) {
              calculateDistanceAndETA(
                data.location.lat,
                data.location.lng,
                order.dropoff_lat,
                order.dropoff_lng
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
  }, [order.rider?.id, order.status, order.dropoff_lat, order.dropoff_lng]);

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'pending': return 'text-yellow-600 bg-yellow-50';
      case 'confirmed': return 'text-blue-600 bg-blue-50';
      case 'preparing': return 'text-purple-600 bg-purple-50';
      case 'picked_up': return 'text-indigo-600 bg-indigo-50';
      case 'delivering': return 'text-orange-600 bg-orange-50';
      case 'delivered': return 'text-green-600 bg-green-50';
      case 'cancelled': return 'text-red-600 bg-red-50';
      default: return 'text-gray-600 bg-gray-50';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status.toLowerCase()) {
      case 'pending': return <Clock className="w-4 h-4" />;
      case 'confirmed': return <Package className="w-4 h-4" />;
      case 'preparing': return <Package className="w-4 h-4" />;
      case 'picked_up': return <Truck className="w-4 h-4" />;
      case 'delivering': return <Navigation className="w-4 h-4" />;
      case 'delivered': return <CheckCircle className="w-4 h-4" />;
      case 'cancelled': return <Package className="w-4 h-4" />;
      default: return <Clock className="w-4 h-4" />;
    }
  };

  const getStatusText = (status: string) => {
    switch (status.toLowerCase()) {
      case 'pending': return 'Order Pending';
      case 'confirmed': return 'Order Confirmed';
      case 'preparing': return 'Preparing Your Order';
      case 'picked_up': return 'Order Picked Up';
      case 'delivering': return 'On the Way';
      case 'delivered': return 'Delivered';
      case 'cancelled': return 'Order Cancelled';
      default: return status;
    }
  };

  return (
    <div className="space-y-6">
      {/* Live Tracking Map */}
      {(order.status === 'delivering' || order.status === 'picked_up') && 
       riderLocation && order.dropoff_lat && order.dropoff_lng && (
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
          <div className="p-4 border-b bg-gray-50">
            <h3 className="font-semibold text-gray-900 flex items-center gap-2">
              <Navigation className="w-5 h-5 text-orange-600" />
              Live Rider Tracking
            </h3>
          </div>
          <div className="h-64">
            <OSMMap
              riderLocation={riderLocation}
              destinationLocation={{
                lat: order.dropoff_lat,
                lng: order.dropoff_lng,
                address: order.dropoff_address || order.user?.address || 'Delivery Location',
              }}
              isRider={false}
              orderStatus={order.status}
            />
          </div>
          
          {/* Distance and ETA */}
          {distance !== null && estimatedTime !== null && (
            <div className="p-4 bg-orange-50 border-t border-orange-100">
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div className="flex items-center gap-2">
                  <MapPin className="w-4 h-4 text-orange-600" />
                  <div>
                    <p className="font-medium text-gray-900">Distance</p>
                    <p className="text-orange-600">{distance} km away</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Timer className="w-4 h-4 text-orange-600" />
                  <div>
                    <p className="font-medium text-gray-900">ETA</p>
                    <p className="text-orange-600">{estimatedTime} mins</p>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Order Status */}
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <h3 className="font-semibold text-gray-900 mb-4">Order Status</h3>
        <div className="flex items-center gap-3">
          <div className={`p-2 rounded-full ${getStatusColor(order.status)}`}>
            {getStatusIcon(order.status)}
          </div>
          <div>
            <p className="font-medium text-gray-900">{getStatusText(order.status)}</p>
            <p className="text-sm text-gray-500">
              {new Date(order.created_at).toLocaleString()}
            </p>
          </div>
        </div>
      </div>

      {/* Rider Information */}
      {order.rider && (order.status === 'delivering' || order.status === 'picked_up') && (
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <h3 className="font-semibold text-gray-900 mb-4">Delivery Rider</h3>
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium text-gray-900">{order.rider.full_name}</p>
                <p className="text-sm text-gray-500">Your delivery partner</p>
              </div>
              <div className="flex gap-2">
                <button className="p-2 bg-green-100 text-green-600 rounded-lg hover:bg-green-200">
                  <Phone className="w-4 h-4" />
                </button>
                <button className="p-2 bg-blue-100 text-blue-600 rounded-lg hover:bg-blue-200">
                  <Navigation className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Delivery Address */}
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <h3 className="font-semibold text-gray-900 mb-4">Delivery Address</h3>
        <div className="space-y-2">
          <div className="flex items-start gap-2">
            <MapPin className="w-4 h-4 text-gray-400 mt-0.5" />
            <div>
              <p className="text-gray-900">{order.dropoff_address || order.user?.address}</p>
              {order.landmark && (
                <p className="text-sm text-orange-600 mt-1">📍 {order.landmark}</p>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Order Items */}
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <h3 className="font-semibold text-gray-900 mb-4">Order Items</h3>
        <div className="space-y-3">
          {order.order_items.map((item) => (
            <div key={item.id} className="flex justify-between items-center">
              <div>
                <p className="font-medium text-gray-900">{item.product.name}</p>
                <p className="text-sm text-gray-500">₱{item.product.price.toFixed(2)} each</p>
              </div>
              <div className="text-right">
                <p className="font-medium text-gray-900">×{item.quantity}</p>
                <p className="text-sm font-semibold text-orange-600">
                  ₱{(item.product.price * item.quantity).toFixed(2)}
                </p>
              </div>
            </div>
          ))}
        </div>
        
        <div className="mt-4 pt-4 border-t">
          <div className="space-y-2 text-sm">
            <div className="flex justify-between text-gray-600">
              <span>Subtotal</span>
              <span>₱{(order.total_amount - order.delivery_fee).toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-gray-600">
              <span>Delivery Fee</span>
              <span>₱{order.delivery_fee.toFixed(2)}</span>
            </div>
            <div className="flex justify-between font-bold text-lg pt-2 border-t text-gray-900">
              <span>Total</span>
              <span className="text-orange-600">₱{order.total_amount.toFixed(2)}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
