"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { supabase } from "@/lib/supabase";
import { useUser } from "@/hooks/useUser";
import OrderDetailsModal from "@/components/rider/OrderDetailsModal";

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

export default function RiderAllRidesPage() {
  const { user, profile } = useUser();
  const [orders, setOrders] = useState<Order[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);

  const riderIds = useMemo(() => {
    return profile?.id ? [profile.id] : [];
  }, [user?.id, profile?.id]);

  const fetchAllRides = useCallback(async () => {
    if (!riderIds.length) return;

    try {
      setIsLoading(true);

      const { data, error } = await supabase
        .from("orders")
        .select(`
          *,
          user:profiles!orders_user_id_fkey (
            full_name,
            mobile,
            address
          ),
          order_items (
            id,
            product:products (
              name,
              price
            ),
            quantity
          )
        `)
        .in("rider_id", riderIds)
        .order("created_at", { ascending: false });

      if (error) throw error;
      setOrders((data || []) as Order[]);
    } catch (e) {
      console.error(e);
    } finally {
      setIsLoading(false);
    }
  }, [riderIds]);

  useEffect(() => {
    fetchAllRides();
  }, [fetchAllRides]);

  const handleCloseModal = () => setSelectedOrder(null);

  const noop = () => {};

  return (
    <div className="space-y-4 pb-20 sm:pb-0">
      <h2 className="text-xl font-bold text-gray-900 px-1">All Rides</h2>

      {isLoading ? (
        <div className="flex items-center justify-center h-40">
          <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-orange-600"></div>
        </div>
      ) : orders.length === 0 ? (
        <div className="bg-white rounded-2xl shadow-sm p-8 text-center border">
          <div className="text-gray-300 text-6xl mb-4">🧾</div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">No rides yet</h3>
          <p className="text-gray-500 text-sm">Your completed and active rides will show here.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-3 px-1">
          {orders.map((order) => (
            <button
              key={order.id}
              onClick={() => setSelectedOrder(order)}
              className="w-full text-left bg-white rounded-2xl shadow-sm border p-4 hover:shadow-md transition-all active:scale-[0.98]"
            >
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <p className="font-bold text-gray-900">{order.user.full_name}</p>
                    <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold uppercase tracking-wider ${
                      order.status === 'delivered' ? 'bg-green-100 text-green-700' :
                      order.status === 'cancelled' ? 'bg-red-100 text-red-700' :
                      'bg-orange-100 text-orange-700'
                    }`}>
                      {order.status}
                    </span>
                  </div>
                  <p className="text-xs text-gray-500 mb-2">{new Date(order.created_at).toLocaleString([], { dateStyle: 'medium', timeStyle: 'short' })}</p>
                  
                  <div className="flex items-center gap-3">
                    <div className="flex items-center gap-1 text-sm font-semibold text-gray-900">
                      <span>💰</span>
                      <span>₱{order.total_amount.toFixed(2)}</span>
                    </div>
                    <div className="w-1 h-1 bg-gray-300 rounded-full"></div>
                    <div className="text-xs text-gray-500">
                      {order.order_items.length} {order.order_items.length === 1 ? 'item' : 'items'}
                    </div>
                  </div>
                </div>
                <div className="text-gray-300 self-center">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="9 5l7 7-7 7" />
                  </svg>
                </div>
              </div>
            </button>
          ))}
        </div>
      )}

      {selectedOrder && (
        <OrderDetailsModal
          order={selectedOrder}
          onClose={handleCloseModal}
          onConfirm={noop}
          onPass={noop}
          onCancel={noop}
        />
      )}
    </div>
  );
}
