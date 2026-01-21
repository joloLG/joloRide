"use client";

import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/lib/supabase";
import { Users, Bike, Store, ShoppingBag, Banknote, TrendingUp, Calendar } from "lucide-react";

interface DashboardStats {
  totalUsers: number;
  totalRiders: number;
  totalStores: number;
  totalProducts: number;
  totalOrders: number;
  activeRiders: number;
  todayOrders: number;
  todayRevenue: number;
  monthlyRevenue: number;
}

interface RecentOrder {
  id: string;
  created_at: string;
  status: string;
  total_amount: number;
  user: {
    full_name: string;
  };
  rider?: {
    full_name: string;
  };
}

export default function DashboardStats() {
  const [stats, setStats] = useState<DashboardStats>({
    totalUsers: 0,
    totalRiders: 0,
    totalStores: 0,
    totalProducts: 0,
    totalOrders: 0,
    activeRiders: 0,
    todayOrders: 0,
    todayRevenue: 0,
    monthlyRevenue: 0,
  });
  const [recentOrders, setRecentOrders] = useState<RecentOrder[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchDashboardData = useCallback(async () => {
    try {
      setIsLoading(true);
      // Get basic counts
      const [
        { count: totalUsers },
        { count: totalRiders },
        { count: totalStores },
        { count: totalProducts },
        { count: totalOrders },
      ] = await Promise.all([
        supabase.from("profiles").select("*", { count: "exact", head: true }).eq("role", "user"),
        supabase.from("profiles").select("*", { count: "exact", head: true }).eq("role", "rider"),
        supabase.from("stores").select("*", { count: "exact", head: true }),
        supabase.from("products").select("*", { count: "exact", head: true }),
        supabase.from("orders").select("*", { count: "exact", head: true }),
      ]);

      // Get active riders
      const { data: activeRidersData } = await supabase
        .from("profiles")
        .select("*")
        .eq("role", "rider")
        .eq("is_active", true);

      // Get today's orders
      const today = new Date().toISOString().split('T')[0];
      const { data: todayOrdersData } = await supabase
        .from("orders")
        .select("*")
        .gte("created_at", today);

      // Get monthly revenue
      const currentMonth = new Date().toISOString().slice(0, 7);
      const { data: monthlyOrdersData } = await supabase
        .from("orders")
        .select("total_amount")
        .gte("created_at", `${currentMonth}-01`)
        .eq("status", "delivered");

      // Get recent orders with user and rider info
      const { data: recentOrdersData } = await supabase
        .from("orders")
        .select(`
          *,
          user:profiles!orders_user_id_fkey (
            full_name
          ),
          rider:profiles!orders_rider_id_fkey (
            full_name
          )
        `)
        .order("created_at", { ascending: false })
        .limit(10);

      // Calculate stats
      const todayRevenue = todayOrdersData?.reduce((sum, order) => sum + (order.total_amount || 0), 0) || 0;
      const monthlyRevenue = monthlyOrdersData?.reduce((sum, order) => sum + (order.total_amount || 0), 0) || 0;

      setStats({
        totalUsers: totalUsers || 0,
        totalRiders: totalRiders || 0,
        totalStores: totalStores || 0,
        totalProducts: totalProducts || 0,
        totalOrders: totalOrders || 0,
        activeRiders: activeRidersData?.length || 0,
        todayOrders: todayOrdersData?.length || 0,
        todayRevenue,
        monthlyRevenue,
      });

      setRecentOrders(recentOrdersData || []);
    } catch (error) {
      console.error("Error fetching dashboard data:", error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchDashboardData();
  }, [fetchDashboardData]);

  const getStatusColor = (status: string) => {
    const s = status.toLowerCase();
    switch (s) {
      case "pending":
        return "bg-yellow-50 text-yellow-600 border-yellow-100";
      case "confirmed":
        return "bg-blue-50 text-blue-600 border-blue-100";
      case "delivering":
        return "bg-purple-50 text-purple-600 border-purple-100";
      case "delivered":
        return "bg-green-50 text-green-600 border-green-100";
      case "cancelled":
        return "bg-red-50 text-red-600 border-red-100";
      default:
        return "bg-gray-50 text-gray-600 border-gray-100";
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="space-y-10">
      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {[
          { label: "Total Users", value: stats.totalUsers, icon: Users, color: "blue" },
          { label: "Active Riders", value: `${stats.activeRiders} / ${stats.totalRiders}`, icon: Bike, color: "green" },
          { label: "Stores & Items", value: `${stats.totalStores} / ${stats.totalProducts}`, icon: Store, color: "orange" },
          { label: "Total Orders", value: stats.totalOrders, icon: ShoppingBag, color: "purple" },
        ].map((item, i) => (
          <div key={i} className="bg-white p-6 rounded-[2rem] border border-gray-100 shadow-sm hover:shadow-md transition-all group">
            <div className="flex items-center gap-4">
              <div className={`w-14 h-14 rounded-2xl flex items-center justify-center text-xl transition-transform group-hover:scale-110 ${
                item.color === 'blue' ? 'bg-blue-50 text-blue-600' :
                item.color === 'green' ? 'bg-green-50 text-green-600' :
                item.color === 'orange' ? 'bg-orange-50 text-orange-600' :
                'bg-purple-50 text-purple-600'
              }`}>
                <item.icon size={24} strokeWidth={2.5} />
              </div>
              <div>
                <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">{item.label}</p>
                <p className="text-2xl font-black text-gray-900 tracking-tight">{item.value}</p>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Revenue Stats */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {[
          { label: "Today's Orders", value: stats.todayOrders, icon: Calendar, color: "indigo" },
          { label: "Today's Revenue", value: `₱${stats.todayRevenue.toLocaleString()}`, icon: Banknote, color: "emerald" },
          { label: "Monthly Revenue", value: `₱${stats.monthlyRevenue.toLocaleString()}`, icon: TrendingUp, color: "orange" },
        ].map((item, i) => (
          <div key={i} className="bg-white p-8 rounded-[2.5rem] border border-gray-100 shadow-sm relative overflow-hidden group">
            <div className={`absolute -right-6 -top-6 w-32 h-32 rounded-full opacity-5 transition-transform group-hover:scale-125 ${
              item.color === 'indigo' ? 'bg-indigo-600' :
              item.color === 'emerald' ? 'bg-emerald-600' :
              'bg-orange-600'
            }`} />
            
            <div className="relative z-10">
              <div className={`w-12 h-12 rounded-xl flex items-center justify-center mb-4 ${
                item.color === 'indigo' ? 'bg-indigo-50 text-indigo-600' :
                item.color === 'emerald' ? 'bg-emerald-50 text-emerald-600' :
                'bg-orange-50 text-orange-600'
              }`}>
                <item.icon size={24} strokeWidth={2.5} />
              </div>
              <p className="text-xs font-black text-gray-400 uppercase tracking-[0.2em] mb-1">{item.label}</p>
              <p className={`text-3xl font-black tracking-tighter ${
                item.color === 'indigo' ? 'text-indigo-600' :
                item.color === 'emerald' ? 'text-emerald-600' :
                'text-orange-600'
              }`}>
                {item.value}
              </p>
            </div>
          </div>
        ))}
      </div>

      {/* Recent Orders */}
      <div className="bg-white rounded-[2.5rem] border border-gray-100 shadow-sm overflow-hidden">
        <div className="px-8 py-6 border-b border-gray-50 flex items-center justify-between">
          <div>
            <h3 className="text-xl font-black text-gray-900 tracking-tight">Recent Orders</h3>
            <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mt-1">Real-time update</p>
          </div>
          <button className="px-4 py-2 bg-gray-50 text-gray-600 rounded-xl text-xs font-black uppercase tracking-widest hover:bg-gray-100 transition-colors">
            View All
          </button>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-50">
            <thead>
              <tr className="bg-gray-50/50">
                {["Order ID", "Customer", "Rider", "Amount", "Status", "Date"].map((head) => (
                  <th key={head} className="px-8 py-4 text-left text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">
                    {head}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50 bg-white">
              {recentOrders.map((order) => (
                <tr key={order.id} className="hover:bg-gray-50/50 transition-colors group">
                  <td className="px-8 py-5 whitespace-nowrap">
                    <span className="text-sm font-black text-gray-900 group-hover:text-orange-600 transition-colors">
                      #{order.id.slice(-8).toUpperCase()}
                    </span>
                  </td>
                  <td className="px-8 py-5 whitespace-nowrap">
                    <p className="text-sm font-bold text-gray-700">{order.user?.full_name || "Unknown"}</p>
                  </td>
                  <td className="px-8 py-5 whitespace-nowrap">
                    <p className="text-sm font-bold text-gray-500 italic">{order.rider?.full_name || "Unassigned"}</p>
                  </td>
                  <td className="px-8 py-5 whitespace-nowrap">
                    <p className="text-sm font-black text-gray-900">₱{(order.total_amount || 0).toLocaleString()}</p>
                  </td>
                  <td className="px-8 py-5 whitespace-nowrap">
                    <span className={`px-3 py-1 text-[10px] font-black uppercase tracking-widest rounded-lg border ${getStatusColor(order.status)}`}>
                      {order.status}
                    </span>
                  </td>
                  <td className="px-8 py-5 whitespace-nowrap">
                    <p className="text-xs font-bold text-gray-400 uppercase">
                      {new Date(order.created_at).toLocaleDateString([], { month: 'short', day: 'numeric' })}
                    </p>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {recentOrders.length === 0 && (
            <div className="py-20 text-center">
              <div className="text-4xl mb-4 grayscale opacity-20">🧊</div>
              <p className="text-gray-400 font-bold text-xs uppercase tracking-widest">No recent orders found</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
