"use client";

import { useCallback, useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { useUser } from "@/hooks/useUser";
import { Package, Clock, CheckCircle, XCircle, Truck } from "lucide-react";
import Link from "next/link";
import OrderLivePreview from "@/components/OrderLivePreview";

interface Order {
  id: string;
  status: 'pending' | 'confirmed' | 'delivering' | 'completed' | 'cancelled';
  total_amount: number; // Changed from total to total_amount to match database
  delivery_fee: number;
  payment_method: 'COD' | 'QRPH';
  created_at: string;
  barangay: string;
  drop_lat: number;
  drop_lng: number;
  order_items: Array<{
    id: string;
    quantity: number;
    price: number;
  }>;
  rider?: {
    id: string;
    full_name: string;
    mobile: string;
  };
}

const statusConfig = {
  pending: { icon: Clock, color: 'text-yellow-600', bg: 'bg-yellow-100', label: 'Pending' },
  confirmed: { icon: Package, color: 'text-blue-600', bg: 'bg-blue-100', label: 'Assigned' },
  delivering: { icon: Truck, color: 'text-purple-600', bg: 'bg-purple-100', label: 'On the way' },
  completed: { icon: CheckCircle, color: 'text-green-600', bg: 'bg-green-100', label: 'Completed' },
  cancelled: { icon: XCircle, color: 'text-red-600', bg: 'bg-red-100', label: 'Cancelled' },
};

export default function OrdersPage() {
  const { user, profile } = useUser();
  const [orders, setOrders] = useState<Order[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filter, setFilter] = useState<'all' | 'active' | 'completed'>('all');

  const fetchOrders = useCallback(async () => {
    if (!user || !profile) return;

    try {
      setIsLoading(true);
      setError(null);

      let query = supabase
        .from("orders")
        .select(`
          *,
          order_items(*),
          rider:profiles!orders_rider_id_fkey(
            id,
            full_name,
            mobile
          )
        `)
        .eq("user_id", profile.id) // Use profile ID, not auth user ID
        .order("created_at", { ascending: false });

      if (filter === 'active') {
        query = query.in("status", ['pending', 'confirmed', 'delivering']);
      } else if (filter === 'completed') {
        query = query.in("status", ['completed', 'cancelled']);
      }

      const { data, error: fetchError } = await query;

      if (fetchError) throw fetchError;
      setOrders(data || []);
    } catch (err) {
      console.error("Error fetching orders:", err);
      setError("Failed to load orders");
    } finally {
      setIsLoading(false);
    }
  }, [user, profile, filter]);

  useEffect(() => {
    fetchOrders();
  }, [fetchOrders]);

  const getStatusIcon = (status: keyof typeof statusConfig) => {
    const config = statusConfig[status];
    const Icon = config.icon;
    return <Icon size={16} className={config.color} />;
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="pb-24 sm:pb-12 bg-gray-50 min-h-screen">
      {/* HEADER */}
      <div className="sticky top-0 bg-white/80 backdrop-blur-md z-30 border-b border-gray-100 shadow-sm shadow-gray-100/50">
        <div className="p-4 space-y-4 max-w-7xl mx-auto">
          <div className="flex items-center gap-3">
            <div className="bg-orange-100 p-2 rounded-xl">
              <span className="text-xl">📦</span>
            </div>
            <div>
              <h1 className="text-2xl font-black text-gray-900 tracking-tight leading-tight">My Orders</h1>
              <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Tracking your deliveries</p>
            </div>
          </div>

          {/* FILTER TABS */}
          <div className="flex gap-2 items-center overflow-x-auto scrollbar-hide pb-1">
            {[
              { key: 'all', label: 'All' },
              { key: 'active', label: 'Active' },
              { key: 'completed', label: 'Done' }
            ].map(({ key, label }) => (
              <button
                key={key}
                onClick={() => setFilter(key as typeof filter)}
                className={`px-6 py-2 rounded-full text-[10px] font-black uppercase tracking-widest transition-all whitespace-nowrap ${
                  filter === key
                    ? "bg-orange-600 text-white shadow-lg shadow-orange-100"
                    : "bg-white text-gray-500 border border-gray-100 hover:bg-gray-50"
                }`}
              >
                {label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* ORDERS LIST */}
      <div className="p-4 max-w-7xl mx-auto">
        {error ? (
          <div className="bg-red-50 border border-red-100 rounded-3xl p-8 text-center">
            <div className="text-3xl mb-3">⚠️</div>
            <p className="text-red-600 font-bold mb-4">{error}</p>
            <button
              onClick={fetchOrders}
              className="px-8 py-3 bg-red-600 text-white rounded-2xl font-bold text-sm shadow-lg shadow-red-100"
            >
              Retry
            </button>
          </div>
        ) : orders.length === 0 ? (
          <div className="py-20 text-center">
            <div className="text-6xl mb-6 grayscale opacity-20">🥡</div>
            <p className="text-gray-900 font-black text-xl mb-2">No orders found</p>
            <p className="text-gray-500 font-medium mb-8">Ready to start your first delivery?</p>
            <Link
              href="/user"
              className="inline-flex px-8 py-4 bg-orange-600 text-white rounded-2xl font-black text-sm uppercase tracking-widest shadow-lg shadow-orange-100 transition-all hover:bg-orange-700 active:scale-95"
            >
              Start Ordering
            </Link>
          </div>
        ) : (
          <div className="space-y-4">
            {orders.map((order) => (
              <Link
                key={order.id}
                href={`/user/orders/${order.id}`}
                className="block bg-white rounded-3xl border border-gray-100 shadow-sm hover:shadow-md hover:border-orange-200 transition-all group active:scale-[0.98]"
              >
                <div className="p-5">
                  {/* LIVE TRACKING PREVIEW FOR ACTIVE ORDERS */}
                  {(order.status === 'delivering' && order.rider?.id) && (
                    <OrderLivePreview
                      orderId={order.id}
                      riderId={order.rider.id}
                      status={order.status}
                      dropoffLat={order.drop_lat}
                      dropoffLng={order.drop_lng}
                    />
                  )}

                  {/* ORDER HEADER */}
                  <div className="flex justify-between items-start mb-4">
                    <div className="flex items-center gap-3">
                      <div className={`w-10 h-10 rounded-2xl flex items-center justify-center text-lg ${statusConfig[order.status].bg}`}>
                        {getStatusIcon(order.status)}
                      </div>
                      <div>
                        <div className="flex items-center gap-2 mb-0.5">
                          <span className="text-sm font-black text-gray-900">
                            #{order.id.slice(-8).toUpperCase()}
                          </span>
                          <span className={`text-[10px] font-black uppercase tracking-widest ${statusConfig[order.status].color}`}>
                            {statusConfig[order.status].label}
                          </span>
                        </div>
                        <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">
                          {new Date(order.created_at).toLocaleDateString([], { month: 'short', day: 'numeric' })} • {new Date(order.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-lg font-black text-gray-900 leading-none mb-1">₱{order.total_amount.toLocaleString()}</p>
                      <span className="text-[10px] font-black text-orange-600 uppercase tracking-widest bg-orange-50 px-2 py-0.5 rounded-lg border border-orange-100">
                        {order.payment_method}
                      </span>
                    </div>
                  </div>

                  {/* ORDER ITEMS MINI PREVIEW */}
                  <div className="flex items-center gap-2 mb-4 bg-gray-50/50 p-2 rounded-2xl border border-gray-100/50">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-xl bg-orange-100 flex items-center justify-center">
                        <span className="text-sm">📦</span>
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-bold text-gray-700">
                          {order.order_items.length} {order.order_items.length === 1 ? 'Item' : 'Items'}
                        </p>
                        <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">
                          Total: ₱{order.order_items.reduce((sum, item) => sum + (item.price * item.quantity), 0).toLocaleString()}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* DELIVERY INFO */}
                  <div className="flex items-center justify-between pt-1 border-t border-gray-50">
                    <div className="flex items-center gap-2 text-gray-500">
                      <div className="bg-gray-100 p-1.5 rounded-lg">
                        <Truck size={12} className="text-gray-400" />
                      </div>
                      <span className="text-xs font-bold text-gray-500 truncate max-w-[150px]">
                        {order.barangay || 'Delivery Address'}
                      </span>
                    </div>
                    
                    {order.rider && order.status !== 'pending' && (
                      <div className="flex items-center gap-2">
                        <div className="text-right hidden sm:block">
                          <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Rider</p>
                          <p className="text-xs font-black text-gray-900">{order.rider.full_name}</p>
                        </div>
                        <div className="w-8 h-8 rounded-full bg-orange-100 border-2 border-white shadow-sm flex items-center justify-center text-orange-600 font-black text-[10px]">
                          {order.rider.full_name[0].toUpperCase()}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
