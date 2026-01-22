"use client";

import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { useUser } from "@/hooks/useUser";
import { useRiderLocationTracking } from "@/hooks/useLocationTracking";
import OSMMap from "@/components/OSMMap";
import { Package, MapPin, Clock, DollarSign, Navigation } from "lucide-react";

interface Order {
  id: string;
  status: string;
  total_amount: number;
  delivery_fee: number;
  dropoff_address: string;
  dropoff_lat: number;
  dropoff_lng: number;
  landmark?: string;
  created_at: string;
  user: {
    full_name: string;
    mobile: string;
  };
}

interface RiderStats {
  active_orders: number;
  completed_today: number;
  earnings_today: number;
  total_earnings: number;
}

export default function RiderDashboard() {
  const { user } = useUser();
  const [orders, setOrders] = useState<Order[]>([]);
  const [activeOrder, setActiveOrder] = useState<Order | null>(null);
  const [stats, setStats] = useState<RiderStats>({
    active_orders: 0,
    completed_today: 0,
    earnings_today: 0,
    total_earnings: 0,
  });
  const [loading, setLoading] = useState(true);
  const [locationPermission, setLocationPermission] = useState<'granted' | 'denied' | 'prompt'>('prompt');

  // Request location permission on component mount
  useEffect(() => {
    const requestLocationPermission = async () => {
      if ('geolocation' in navigator) {
        try {
          const permission = await navigator.permissions.query({ name: 'geolocation' as PermissionName });
          setLocationPermission(permission.state as 'granted' | 'denied' | 'prompt');
          
          if (permission.state === 'prompt') {
            // Request permission
            navigator.geolocation.getCurrentPosition(
              () => setLocationPermission('granted'),
              () => setLocationPermission('denied'),
              { enableHighAccuracy: true }
            );
          }
        } catch (error) {
          console.error('Error checking location permission:', error);
          // Fallback: try to get location directly
          navigator.geolocation.getCurrentPosition(
            () => setLocationPermission('granted'),
            () => setLocationPermission('denied'),
            { enableHighAccuracy: true }
          );
        }
      } else {
        console.error('Geolocation is not supported by this browser');
        setLocationPermission('denied');
      }
    };

    requestLocationPermission();
  }, []);

  // Start location tracking for riders
  const locationTracking = useRiderLocationTracking(user?.id, activeOrder?.id);

  // Fetch rider stats
  const fetchRiderStats = async () => {
    if (!user?.id) return;

    try {
      const { data: profile } = await supabase
        .from("profiles")
        .select("total_deliveries, total_earnings")
        .eq("user_id", user.id)
        .single();

      // Get today's completed orders
      const today = new Date().toISOString().split('T')[0];
      const { data: todayOrders } = await supabase
        .from("orders")
        .select("id, delivery_fee")
        .eq("rider_id", user.id)
        .eq("status", "delivered")
        .gte("updated_at", today)
        .lt("updated_at", `${today}T23:59:59`);

      // Get active orders
      const { data: activeOrders } = await supabase
        .from("orders")
        .select("id")
        .eq("rider_id", user.id)
        .in("status", ["confirmed", "delivering"]);

      setStats({
        active_orders: activeOrders?.length || 0,
        completed_today: todayOrders?.length || 0,
        earnings_today: todayOrders?.reduce((sum, order) => sum + (order.delivery_fee || 0), 0) || 0,
        total_earnings: profile?.total_earnings || 0,
      });
    } catch (error) {
      console.error("Error fetching rider stats:", error);
    }
  };

  // Fetch available orders
  const fetchAvailableOrders = async () => {
    try {
      const { data } = await supabase
        .from("orders")
        .select(`
          *,
          user:profiles!orders_user_id_fkey (
            full_name,
            mobile
          )
        `)
        .eq("status", "pending")
        .is("rider_id", null)
        .order("created_at", { ascending: false })
        .limit(10);

      setOrders(data || []);
    } catch (error) {
      console.error("Error fetching orders:", error);
    }
  };

  // Fetch active order
  const fetchActiveOrder = async () => {
    if (!user?.id) return;

    try {
      const { data } = await supabase
        .from("orders")
        .select(`
          *,
          user:profiles!orders_user_id_fkey (
            full_name,
            mobile
          )
        `)
        .eq("rider_id", user.id)
        .in("status", ["confirmed", "delivering"])
        .single();

      setActiveOrder(data);
    } catch (error) {
      // No active order
      setActiveOrder(null);
    }
  };

  // Accept order
  const acceptOrder = async (orderId: string) => {
    try {
      const { error } = await supabase
        .from("orders")
        .update({
          rider_id: user?.id,
          status: "confirmed",
        })
        .eq("id", orderId);

      if (error) throw error;

      // Refresh data
      await Promise.all([
        fetchAvailableOrders(),
        fetchActiveOrder(),
        fetchRiderStats(),
      ]);
    } catch (error) {
      console.error("Error accepting order:", error);
      alert("Failed to accept order");
    }
  };

  // Update order status
  const updateOrderStatus = async (newStatus: string) => {
    if (!activeOrder) return;

    try {
      const { error } = await supabase
        .from("orders")
        .update({ status: newStatus })
        .eq("id", activeOrder.id);

      if (error) throw error;

      // Update local state
      setActiveOrder({ ...activeOrder, status: newStatus });

      // Refresh stats if completed
      if (newStatus === "delivered") {
        await fetchRiderStats();
        setActiveOrder(null);
      }
    } catch (error) {
      console.error("Error updating order status:", error);
      alert("Failed to update order status");
    }
  };

  // Load data
  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      await Promise.all([
        fetchAvailableOrders(),
        fetchActiveOrder(),
        fetchRiderStats(),
      ]);
      setLoading(false);
    };

    if (user) {
      loadData();
    }
  }, [user]);

  // Real-time subscription for order updates
  useEffect(() => {
    if (!user) return;

    const subscription = supabase
      .channel("orders")
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "orders",
        },
        async (payload) => {
          // Refresh data when orders change
          await Promise.all([
            fetchAvailableOrders(),
            fetchActiveOrder(),
            fetchRiderStats(),
          ]);
        }
      )
      .subscribe();

    return () => {
      subscription.unsubscribe();
    };
  }, [user]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6 pb-20">
      {/* Location Permission Alert */}
      {locationPermission === 'denied' && (
        <div className="mx-4 bg-red-50 border border-red-200 rounded-xl p-4">
          <div className="flex items-start gap-3">
            <Navigation className="text-red-600 mt-1" size={20} />
            <div>
              <h3 className="font-semibold text-red-900 mb-1">Location Access Required</h3>
              <p className="text-red-800 text-sm mb-3">
                Location access is required for live tracking and accurate delivery updates. Please enable location permissions in your browser settings.
              </p>
              <button
                onClick={() => {
                  // Request permission again
                  navigator.geolocation.getCurrentPosition(
                    () => setLocationPermission('granted'),
                    () => setLocationPermission('denied'),
                    { enableHighAccuracy: true }
                  );
                }}
                className="bg-red-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-red-700"
              >
                Enable Location
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Header Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 px-4">
        <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
          <div className="flex items-center gap-3">
            <div className="bg-blue-100 p-2 rounded-lg">
              <Package className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <div className="text-2xl font-bold text-gray-900">{stats.active_orders}</div>
              <div className="text-xs text-gray-500">Active Orders</div>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
          <div className="flex items-center gap-3">
            <div className="bg-green-100 p-2 rounded-lg">
              <Package className="w-5 h-5 text-green-600" />
            </div>
            <div>
              <div className="text-2xl font-bold text-gray-900">{stats.completed_today}</div>
              <div className="text-xs text-gray-500">Completed Today</div>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
          <div className="flex items-center gap-3">
            <div className="bg-yellow-100 p-2 rounded-lg">
              <DollarSign className="w-5 h-5 text-yellow-600" />
            </div>
            <div>
              <div className="text-2xl font-bold text-gray-900">₱{stats.earnings_today}</div>
              <div className="text-xs text-gray-500">Today&apos;s Earnings</div>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
          <div className="flex items-center gap-3">
            <div className="bg-purple-100 p-2 rounded-lg">
              <DollarSign className="w-5 h-5 text-purple-600" />
            </div>
            <div>
              <div className="text-2xl font-bold text-gray-900">₱{stats.total_earnings}</div>
              <div className="text-xs text-gray-500">Total Earnings</div>
            </div>
          </div>
        </div>
      </div>

      {/* Active Order with Map */}
      {activeOrder ? (
        <div className="px-4">
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
            <div className="p-4 border-b border-gray-100">
              <div className="flex items-center justify-between mb-2">
                <h3 className="font-bold text-gray-900">Active Delivery</h3>
                <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                  activeOrder.status === "delivering" 
                    ? "bg-blue-100 text-blue-700" 
                    : "bg-yellow-100 text-yellow-700"
                }`}>
                  {activeOrder.status === "delivering" ? "On the way" : "Confirmed"}
                </span>
              </div>
              
              <div className="space-y-2 text-sm">
                <div className="flex items-center gap-2 text-gray-600">
                  <MapPin className="w-4 h-4" />
                  <span>{activeOrder.dropoff_address}</span>
                </div>
                {activeOrder.landmark && (
                  <div className="flex items-center gap-2 text-gray-600">
                    <Navigation className="w-4 h-4" />
                    <span>Landmark: {activeOrder.landmark}</span>
                  </div>
                )}
                <div className="flex items-center gap-2 text-gray-600">
                  <Clock className="w-4 h-4" />
                  <span>Order #{activeOrder.id.slice(-8)}</span>
                </div>
                <div className="flex items-center gap-2 text-gray-600">
                  <DollarSign className="w-4 h-4" />
                  <span>₱{activeOrder.delivery_fee} delivery fee</span>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-2 mt-4">
                {activeOrder.status === "confirmed" && (
                  <button
                    onClick={() => updateOrderStatus("delivering")}
                    className="flex-1 bg-blue-600 text-white py-2 rounded-lg font-medium hover:bg-blue-700 transition-colors"
                  >
                    Start Delivery
                  </button>
                )}
                {activeOrder.status === "delivering" && (
                  <button
                    onClick={() => updateOrderStatus("delivered")}
                    className="flex-1 bg-green-600 text-white py-2 rounded-lg font-medium hover:bg-green-700 transition-colors"
                  >
                    Mark as Delivered
                  </button>
                )}
              </div>
            </div>

            {/* Map */}
            <div className="h-80">
              <OSMMap
                riderLocation={locationTracking.location || undefined}
                destinationLocation={{
                  lat: activeOrder.dropoff_lat,
                  lng: activeOrder.dropoff_lng,
                  address: activeOrder.dropoff_address,
                }}
              />
            </div>
          </div>
        </div>
      ) : (
        /* Available Orders */
        <div className="px-4">
          <h3 className="font-bold text-gray-900 mb-4">Available Orders</h3>
          
          {orders.length > 0 ? (
            <div className="space-y-3">
              {orders.map((order) => (
                <div key={order.id} className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <div className="font-medium text-gray-900">Order #{order.id.slice(-8)}</div>
                      <div className="text-sm text-gray-600">₱{order.total_amount} total</div>
                    </div>
                    <div className="text-sm font-medium text-green-600">
                      ₱{order.delivery_fee} delivery
                    </div>
                  </div>

                  <div className="space-y-1 text-sm text-gray-600 mb-3">
                    <div className="flex items-center gap-2">
                      <MapPin className="w-4 h-4" />
                      <span>{order.dropoff_address}</span>
                    </div>
                    {order.landmark && (
                      <div className="flex items-center gap-2">
                        <Navigation className="w-4 h-4" />
                        <span>Landmark: {order.landmark}</span>
                      </div>
                    )}
                    <div className="flex items-center gap-2">
                      <Clock className="w-4 h-4" />
                      <span>{new Date(order.created_at).toLocaleTimeString()}</span>
                    </div>
                  </div>

                  <button
                    onClick={() => acceptOrder(order.id)}
                    className="w-full bg-blue-600 text-white py-2 rounded-lg font-medium hover:bg-blue-700 transition-colors"
                  >
                    Accept Order
                  </button>
                </div>
              ))}
            </div>
          ) : (
            <div className="bg-white rounded-xl p-8 text-center border border-gray-100">
              <Package className="w-12 h-12 text-gray-400 mx-auto mb-3" />
              <p className="text-gray-500 font-medium">No available orders</p>
              <p className="text-sm text-gray-400 mt-1">Check back later for new delivery opportunities</p>
            </div>
          )}
        </div>
      )}

      {/* Location Status */}
      {locationTracking.error && (
        <div className="px-4">
          <div className="bg-red-50 border border-red-200 rounded-lg p-3">
            <p className="text-sm text-red-700">{locationTracking.error}</p>
          </div>
        </div>
      )}
    </div>
  );
}
