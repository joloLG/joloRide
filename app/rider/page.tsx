"use client";

import { useCallback, useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { useUser } from "@/hooks/useUser";
import OrderDetailsModal from "@/components/rider/OrderDetailsModal";
import RiderStats from "@/components/rider/RiderStats";

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

export default function RiderPage() {
  const { user, profile } = useUser();
  const [orders, setOrders] = useState<Order[]>([]);
  const [activeOrders, setActiveOrders] = useState<Order[]>([]);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const fetchOrders = useCallback(async () => {
    try {
      setIsLoading(true);

      if (!profile?.is_active || !profile?.id) {
        setOrders([]);
        setActiveOrders([]);
        return;
      }

      // 1. Fetch unassigned pending orders (New Orders)
      const { data: newOrders, error: newError } = await supabase
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
            quantity,
            price
          )
        `)
        .eq("status", "pending")
        .is("rider_id", null)
        .order("created_at", { ascending: false });

      if (newError) throw newError;
      setOrders(newOrders || []);

      // 2. Fetch orders assigned to this rider that are not yet delivered/cancelled
      const { data: riderActiveOrders, error: activeError } = await supabase
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
            quantity,
            price
          )
        `)
        .eq("rider_id", profile.id)
        .in("status", ["confirmed", "preparing", "picked_up", "delivering"])
        .order("created_at", { ascending: false });

      if (activeError) throw activeError;
      setActiveOrders(riderActiveOrders || []);

    } catch (error) {
      console.error("Error fetching orders:", error);
    } finally {
      setIsLoading(false);
    }
  }, [profile?.is_active, profile?.id]);

  useEffect(() => {
    if (profile?.role !== "rider") return;

    void fetchOrders();

    // Set up real-time subscription for new orders
    const subscription = supabase
      .channel("orders")
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "orders",
          filter: "status=eq.pending",
        },
        () => {
          void fetchOrders();
        }
      )
      .subscribe();

    return () => {
      void subscription.unsubscribe();
    };
  }, [profile?.role, fetchOrders]);

  const handleOrderAction = async (orderId: string, action: "confirm" | "pass" | "cancel" | "update_status", nextStatus?: string) => {
    try {
      const riderId = profile?.id;
      console.log("🔧 Debug - Profile:", profile);
      console.log("🔧 Debug - Rider ID:", riderId);
      console.log("🔧 Debug - Order ID:", orderId);
      console.log("🔧 Debug - Action:", action);
      
      if (!riderId) {
        console.error("❌ No rider ID found in profile");
        return;
      }

      if (action === "confirm") {
        console.log("🔧 Debug - Confirming order...");
        // Assign order to current rider
        const { data, error } = await supabase
          .from("orders")
          .update({
            rider_id: riderId,
            status: "confirmed",
            confirmed_at: new Date().toISOString(),
          })
          .eq("id", orderId)
          .select();

        console.log("🔧 Debug - Update result:", { data, error });

        if (error) {
          console.error("❌ Order update failed:", error);
          throw error;
        }

        console.log("✅ Order confirmed successfully");

        // Move rider to end of queue (if DB trigger exists, it will handle rider_queue)
        const profileUpdate = await supabase
          .from("profiles")
          .update({
            last_order_at: new Date().toISOString(),
          })
          .eq("id", riderId);

        console.log("🔧 Debug - Profile update result:", profileUpdate);
      } else if (action === "update_status" && nextStatus) {
        const { error } = await supabase
          .from("orders")
          .update({
            status: nextStatus,
            ...(nextStatus === 'delivered' ? { delivered_at: new Date().toISOString() } : {})
          })
          .eq("id", orderId);

        if (error) throw error;
      } else if (action === "pass") {
        // Pass to next rider (just mark as passed for this rider)
        const { error } = await supabase
          .from("orders")
          .update({
            status: "pending",
            rider_id: null,
          })
          .eq("id", orderId);

        if (error) throw error;
      } else if (action === "cancel") {
        const { error } = await supabase
          .from("orders")
          .update({
            status: "cancelled",
          })
          .eq("id", orderId);

        if (error) throw error;
      }

      await fetchOrders();
      setIsModalOpen(false);
      setSelectedOrder(null);
    } catch (error) {
      console.error("Error handling order:", error);
    }
  };

  if (!user || !profile || profile.role !== "rider") return null;

  return (
    <div className="space-y-8">
      <RiderStats riderId={profile?.id || ""} />

      {/* Active Orders Section */}
      {activeOrders.length > 0 && (
        <div>
          <h2 className="text-xl font-bold text-gray-900 mb-4 px-1 flex items-center gap-2">
            <span className="relative flex h-3 w-3">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-orange-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-3 w-3 bg-orange-500"></span>
            </span>
            Active Orders
          </h2>
          <div className="grid grid-cols-1 gap-4">
            {activeOrders.map((order) => (
              <div
                key={order.id}
                className="bg-white rounded-2xl shadow-md border-2 border-orange-200 p-4 sm:p-6 hover:shadow-lg transition-all"
              >
                <div className="flex flex-col gap-4">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      <div className="bg-green-100 p-2 rounded-xl">
                        <span className="text-xl">🚴</span>
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <h3 className="text-lg font-bold text-gray-900 leading-tight">Current Task</h3>
                          <span className="text-[10px] px-2 py-0.5 bg-orange-100 text-orange-700 rounded-full font-bold uppercase tracking-wider">
                            {order.status}
                          </span>
                        </div>
                        <p className="text-xs text-gray-500">Order ID: #{order.id.slice(0, 8)}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-bold text-orange-600">₱{order.total_amount.toFixed(2)}</p>
                    </div>
                  </div>

                  <div className="space-y-2 bg-orange-50/50 rounded-xl p-3 border border-orange-100">
                    <div className="flex items-center gap-2 text-sm text-gray-700">
                      <span className="text-gray-400">👤</span>
                      <p className="font-semibold">
                        {order.user?.full_name || 'Unknown Customer'}
                      </p>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <span className="text-gray-400">📍</span>
                      <p className="truncate">
                        {order.user?.address || 'Address not available'}
                      </p>
                    </div>
                  </div>

                  <div className="flex gap-2">
                    <button
                      onClick={() => {
                        setSelectedOrder(order);
                        setIsModalOpen(true);
                      }}
                      className="flex-1 px-4 py-3 bg-orange-600 text-white rounded-xl hover:bg-orange-700 text-sm font-bold transition-all shadow-lg shadow-orange-100 flex items-center justify-center gap-2"
                    >
                      Update Status
                    </button>
                    <button
                      onClick={() => {
                        setSelectedOrder(order);
                        setIsModalOpen(true);
                      }}
                      className="px-4 py-3 bg-white border border-gray-200 text-gray-600 rounded-xl hover:bg-gray-50 text-sm font-bold transition-colors"
                    >
                      Details
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* New Orders Section */}
      <div>
        <h2 className="text-xl font-bold text-gray-900 mb-4 px-1">New Customer Orders</h2>

        {!profile?.is_active ? (
          <div className="bg-white rounded-lg shadow p-8 text-center">
            <div className="text-gray-400 text-6xl mb-4">🛑</div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">You are inactive</h3>
            <p className="text-gray-600">Switch to Active to receive new orders.</p>
          </div>
        ) : isLoading ? (
          <div className="flex items-center justify-center h-32">
            <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500"></div>
          </div>
        ) : orders.length === 0 ? (
          <div className="bg-white rounded-lg shadow p-8 text-center">
            <div className="text-gray-400 text-6xl mb-4">📦</div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">No new orders</h3>
            <p className="text-gray-600">Waiting for new orders to come in...</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-4">
            {orders.map((order) => (
              <div
                key={order.id}
                className="bg-white rounded-2xl shadow-sm border p-4 sm:p-6 hover:shadow-md transition-all border-l-4 border-l-orange-500"
              >
                <div className="flex flex-col gap-4">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      <div className="bg-orange-100 p-2 rounded-xl">
                        <span className="text-xl">🆕</span>
                      </div>
                      <div>
                        <h3 className="text-lg font-bold text-gray-900 leading-tight">New Order!</h3>
                        <p className="text-xs text-gray-500">{new Date(order.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-bold text-orange-600">₱{order.total_amount.toFixed(2)}</p>
                      <p className="text-[10px] text-gray-400 uppercase tracking-wider">Total Amount</p>
                    </div>
                  </div>

                  <div className="space-y-2 bg-gray-50 rounded-xl p-3">
                    <div className="flex items-center gap-2 text-sm">
                      <span className="text-gray-400">👤</span>
                      <p className="text-gray-700 font-semibold">
                        {order.user?.full_name || 'Unknown User'}
                      </p>
                    </div>
                    <div className="flex items-center gap-2 text-sm">
                      <span className="text-gray-400">📍</span>
                      <p className="text-gray-600 truncate">
                        {order.user?.address || 'Address not available'}
                      </p>
                    </div>
                    <div className="flex items-center gap-2 text-sm">
                      <span className="text-gray-400">📱</span>
                      <p className="text-gray-600">{order.user?.mobile || 'No phone'}</p>
                    </div>
                  </div>

                  <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-gray-500 px-1">
                    <span className="flex items-center gap-1">📦 {order.order_items.length} items</span>
                    <span className="flex items-center gap-1">🚚 Fee: ₱{order.delivery_fee.toFixed(2)}</span>
                  </div>

                  <div className="grid grid-cols-2 gap-2 mt-2">
                    <button
                      onClick={() => {
                        setSelectedOrder(order);
                        setIsModalOpen(true);
                      }}
                      className="col-span-2 sm:col-span-1 px-4 py-3 bg-white border-2 border-orange-100 text-orange-600 rounded-xl hover:bg-orange-50 text-sm font-bold transition-colors flex items-center justify-center gap-2"
                    >
                      <span>👁️</span> Details
                    </button>
                    <button
                      onClick={() => handleOrderAction(order.id, "confirm")}
                      className="col-span-2 sm:col-span-1 px-4 py-3 bg-orange-600 text-white rounded-xl hover:bg-orange-700 text-sm font-bold transition-all shadow-lg shadow-orange-100 flex items-center justify-center gap-2 active:scale-95"
                    >
                      <span>✅</span> Confirm
                    </button>
                    <button
                      onClick={() => handleOrderAction(order.id, "pass")}
                      className="px-4 py-3 bg-gray-100 text-gray-600 rounded-xl hover:bg-gray-200 text-sm font-bold transition-colors flex items-center justify-center gap-2"
                    >
                      <span>⏭️</span> Pass
                    </button>
                    <button
                      onClick={() => {
                        setSelectedOrder(order);
                        setIsModalOpen(true);
                      }}
                      className="px-4 py-3 bg-red-50 text-red-600 rounded-xl hover:bg-red-100 text-sm font-bold transition-colors flex items-center justify-center gap-2"
                    >
                      <span>❌</span> Cancel
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Order Details Modal */}
      {isModalOpen && selectedOrder && (
        <OrderDetailsModal
          order={selectedOrder}
          onClose={() => {
            setIsModalOpen(false);
            setSelectedOrder(null);
          }}
          onConfirm={() => handleOrderAction(selectedOrder.id, "confirm")}
          onPass={() => handleOrderAction(selectedOrder.id, "pass")}
          onCancel={() => handleOrderAction(selectedOrder.id, "cancel")}
          onUpdateStatus={(nextStatus: string) => handleOrderAction(selectedOrder.id, "update_status", nextStatus)}
        />
      )}
    </div>
  );
}
