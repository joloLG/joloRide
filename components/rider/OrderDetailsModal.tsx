"use client";

import { useState } from "react";

interface Order {
  id: string;
  created_at: string;
  status: string;
  total_amount: number;
  delivery_fee: number;
  dropoff_address?: string;
  dropoff_lat?: number;
  dropoff_lng?: number;
  user: {
    full_name: string;
    mobile: string;
    address: string;
  };
  order_items: {
    id: string;
    product: {
      name: string;
      price: number;
    };
    quantity: number;
  }[];
}

interface OrderDetailsModalProps {
  order: Order;
  onClose: () => void;
  onConfirm: () => void;
  onPass: () => void;
  onCancel: () => void;
  onUpdateStatus?: (nextStatus: string) => void;
}

export default function OrderDetailsModal({
  order,
  onClose,
  onConfirm,
  onPass,
  onCancel,
  onUpdateStatus,
}: OrderDetailsModalProps) {
  const [showRoute, setShowRoute] = useState(false);

  const getNextStatus = (currentStatus: string) => {
    switch (currentStatus) {
      case 'confirmed': return 'preparing';
      case 'preparing': return 'picked_up';
      case 'picked_up': return 'delivering';
      case 'delivering': return 'delivered';
      default: return null;
    }
  };

  const getStatusButtonLabel = (currentStatus: string) => {
    switch (currentStatus) {
      case 'confirmed': return 'Start Preparing';
      case 'preparing': return 'Mark as Picked Up';
      case 'picked_up': return 'Start Delivery';
      case 'delivering': return 'Mark as Delivered';
      default: return null;
    }
  };

  const nextStatus = getNextStatus(order.status);
  const statusButtonLabel = getStatusButtonLabel(order.status);

  const handleGetRoute = () => {
    setShowRoute(true);
    const destination =
      order.dropoff_lat != null && order.dropoff_lng != null
        ? `${order.dropoff_lat},${order.dropoff_lng}`
        : encodeURIComponent(order.dropoff_address || order.user.address);

    const url =
      order.dropoff_lat != null && order.dropoff_lng != null
        ? `https://www.google.com/maps/dir/?api=1&destination=${destination}`
        : `https://www.google.com/maps/dir/?api=1&destination=${destination}`;

    window.open(url, "_blank");
  };

  return (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50 flex items-end sm:items-center justify-center p-0 sm:p-4">
      <div className="relative w-full sm:max-w-2xl bg-white rounded-t-2xl sm:rounded-lg shadow-xl overflow-hidden max-h-[95vh] flex flex-col">
        <div className="flex justify-between items-center p-4 border-b bg-white sticky top-0 z-10">
          <h3 className="text-xl font-bold text-gray-900">Order Details</h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 p-2"
          >
            <span className="text-2xl leading-none">×</span>
          </button>
        </div>

        <div className="p-4 overflow-y-auto">
          {/* Customer Information */}
          <div className="bg-gray-50 rounded-xl p-4 mb-4">
            <h4 className="font-semibold text-gray-900 mb-3 text-sm uppercase tracking-wider">Customer</h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <p className="text-xs text-gray-500 uppercase">Name</p>
                <p className="font-medium text-gray-900">{order.user.full_name}</p>
              </div>
              <div>
                <p className="text-xs text-gray-500 uppercase">Mobile</p>
                <p className="font-medium text-gray-900">{order.user.mobile}</p>
              </div>
              <div className="sm:col-span-2">
                <p className="text-xs text-gray-500 uppercase">Address</p>
                <p className="font-medium text-gray-900">{order.user.address}</p>
                <button
                  onClick={handleGetRoute}
                  className="mt-3 w-full sm:w-auto px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 flex items-center justify-center gap-2"
                >
                  <span>🗺️</span> Get Route
                </button>
              </div>
            </div>
          </div>

          {/* Order Items */}
          <div className="bg-gray-50 rounded-xl p-4 mb-4">
            <h4 className="font-semibold text-gray-900 mb-3 text-sm uppercase tracking-wider">Items</h4>
            <div className="space-y-3">
              {order.order_items.map((item) => (
                <div key={item.id} className="flex justify-between items-start gap-4">
                  <div className="flex-1">
                    <p className="font-medium text-gray-900">{item.product.name}</p>
                    <p className="text-xs text-gray-500">₱{item.product.price.toFixed(2)} each</p>
                  </div>
                  <div className="text-right whitespace-nowrap">
                    <p className="font-medium text-gray-900">×{item.quantity}</p>
                    <p className="text-sm font-semibold text-orange-600">
                      ₱{(item.product.price * item.quantity).toFixed(2)}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Order Summary */}
          <div className="bg-gray-50 rounded-xl p-4 mb-4">
            <h4 className="font-semibold text-gray-900 mb-3 text-sm uppercase tracking-wider">Summary</h4>
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

          {/* Route Information */}
          {showRoute && (
            <div className="bg-blue-50 border border-blue-100 rounded-xl p-4 mb-4">
              <h4 className="font-semibold text-blue-900 mb-2 flex items-center gap-2 text-sm">
                <span>🗺️</span> Route Info
              </h4>
              <p className="text-blue-800 text-xs">
                <strong>Destination:</strong> {order.user.address}
              </p>
            </div>
          )}
        </div>

        {/* Action Buttons */}
        <div className="p-4 border-t bg-white safe-bottom grid grid-cols-1 gap-2 sm:flex sm:justify-end">
          {order.status === 'pending' ? (
            <>
              <button
                onClick={onPass}
                className="w-full sm:w-auto px-4 py-3 sm:py-2 bg-yellow-100 text-yellow-800 rounded-xl sm:rounded-lg hover:bg-yellow-200 font-bold text-sm transition-colors order-2 sm:order-1"
              >
                ⏭️ Pass
              </button>
              <button
                onClick={onCancel}
                className="w-full sm:w-auto px-4 py-3 sm:py-2 bg-red-100 text-red-800 rounded-xl sm:rounded-lg hover:bg-red-200 font-bold text-sm transition-colors order-3 sm:order-2"
              >
                ❌ Cancel
              </button>
              <button
                onClick={onConfirm}
                className="w-full sm:w-auto px-6 py-4 sm:py-2 bg-green-600 text-white rounded-xl sm:rounded-lg hover:bg-green-700 font-bold text-base sm:text-sm transition-colors order-1 sm:order-3 shadow-lg shadow-green-200 sm:shadow-none"
              >
                ✅ Confirm Order
              </button>
            </>
          ) : (
            <>
              <button
                onClick={onClose}
                className="w-full sm:w-auto px-4 py-3 sm:py-2 bg-gray-100 text-gray-800 rounded-xl sm:rounded-lg hover:bg-gray-200 font-bold text-sm transition-colors"
              >
                Close
              </button>
              {nextStatus && statusButtonLabel && onUpdateStatus && (
                <button
                  onClick={() => onUpdateStatus(nextStatus)}
                  className="w-full sm:w-auto px-6 py-4 sm:py-2 bg-orange-600 text-white rounded-xl sm:rounded-lg hover:bg-orange-700 font-bold text-base sm:text-sm transition-colors shadow-lg shadow-orange-100"
                >
                  {statusButtonLabel}
                </button>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}
