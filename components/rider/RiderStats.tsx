"use client";

import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/lib/supabase";

interface RiderStats {
  todayRides: number;
  completedRides: number;
  totalEarnings: number;
  averageRating: number;
  currentStatus: boolean;
}

interface RecentRide {
  id: string;
  created_at: string;
  status: string;
  total_amount: number;
  user: {
    full_name: string;
  };
}

interface RiderStatsProps {
  riderId: string;
}

export default function RiderStats({ riderId }: RiderStatsProps) {
  const [stats, setStats] = useState<RiderStats>({
    todayRides: 0,
    completedRides: 0,
    totalEarnings: 0,
    averageRating: 0,
    currentStatus: false,
  });
  const [recentRides, setRecentRides] = useState<RecentRide[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchRiderStats = useCallback(async () => {
    try {
      setIsLoading(true);
      // Get today's rides
      const today = new Date().toISOString().split('T')[0];
      const { data: todayRidesData } = await supabase
        .from("orders")
        .select("*")
        .eq("rider_id", riderId)
        .gte("created_at", today);

      // Get completed rides and earnings
      const { data: completedRidesData } = await supabase
        .from("orders")
        .select("total_amount, delivery_fee")
        .eq("rider_id", riderId)
        .eq("status", "delivered");

      // Get recent rides
      const { data: recentRidesData } = await supabase
        .from("orders")
        .select(`
          *,
          user:profiles!orders_user_id_fkey (
            full_name
          )
        `)
        .eq("rider_id", riderId)
        .order("created_at", { ascending: false })
        .limit(5);

      // Get rider profile for status
      const { data: profileData } = await supabase
        .from("profiles")
        .select("is_active")
        .or(`id.eq.${riderId},user_id.eq.${riderId}`)
        .single();

      // Calculate stats
      const todayRides = todayRidesData?.length || 0;
      const completedRides = completedRidesData?.length || 0;
      const totalEarnings = completedRidesData?.reduce(
        (sum, ride) => sum + (ride.delivery_fee || 0),
        0
      ) || 0;

      setStats({
        todayRides,
        completedRides,
        totalEarnings,
        averageRating: 4.8, // Placeholder - would come from ratings table
        currentStatus: profileData?.is_active || false,
      });

      setRecentRides(recentRidesData || []);
    } catch (error) {
      console.error("Error fetching rider stats:", error);
    } finally {
      setIsLoading(false);
    }
  }, [riderId]);

  useEffect(() => {
    fetchRiderStats();
  }, [fetchRiderStats]);

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="bg-white p-6 rounded-lg shadow">
            <div className="animate-pulse">
              <div className="h-4 bg-gray-200 rounded mb-2"></div>
              <div className="h-8 bg-gray-200 rounded"></div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white p-6 rounded-lg shadow">
          <div className="flex items-center">
            <div className="shrink-0 bg-blue-100 rounded-lg p-3">
              <div className="text-2xl">📅</div>
            </div>
            <div className="ml-4">
              <h3 className="text-sm font-medium text-gray-500">Today&apos;s Rides</h3>
              <p className="text-2xl font-bold text-blue-600">{stats.todayRides}</p>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow">
          <div className="flex items-center">
            <div className="shrink-0 bg-green-100 rounded-lg p-3">
              <div className="text-2xl">✅</div>
            </div>
            <div className="ml-4">
              <h3 className="text-sm font-medium text-gray-500">Completed Rides</h3>
              <p className="text-2xl font-bold text-green-600">{stats.completedRides}</p>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow">
          <div className="flex items-center">
            <div className="shrink-0 bg-amber-100 rounded-lg p-3">
              <div className="text-2xl">💰</div>
            </div>
            <div className="ml-4">
              <h3 className="text-sm font-medium text-gray-500">Total Earnings</h3>
              <p className="text-2xl font-bold text-amber-600">
                ₱{stats.totalEarnings.toFixed(2)}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow">
          <div className="flex items-center">
            <div className="shrink-0 bg-purple-100 rounded-lg p-3">
              <div className="text-2xl">⭐</div>
            </div>
            <div className="ml-4">
              <h3 className="text-sm font-medium text-gray-500">Average Rating</h3>
              <p className="text-2xl font-bold text-purple-600">{stats.averageRating}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Recent Rides */}
      <div className="bg-white shadow rounded-lg overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-medium text-gray-900">Recent Rides</h3>
        </div>
        <div className="overflow-x-auto">
          {recentRides.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <div className="text-gray-400 text-4xl mb-2">📦</div>
              <p>No rides completed yet</p>
            </div>
          ) : (
            <div className="min-w-full inline-block align-middle">
              <div className="overflow-hidden">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-4 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Customer
                      </th>
                      <th className="px-4 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Amount
                      </th>
                      <th className="hidden sm:table-cell px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Status
                      </th>
                      <th className="px-4 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Date
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {recentRides.map((ride) => (
                      <tr key={ride.id}>
                        <td className="px-4 sm:px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                          <div className="flex flex-col">
                            <span>{ride.user?.full_name || "Unknown"}</span>
                            <span className="sm:hidden text-xs text-gray-500 capitalize">{ride.status}</span>
                          </div>
                        </td>
                        <td className="px-4 sm:px-6 py-4 whitespace-nowrap text-sm text-gray-900 font-semibold">
                          ₱{ride.total_amount.toFixed(2)}
                        </td>
                        <td className="hidden sm:table-cell px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          <span
                            className={`px-2 py-1 text-xs rounded-full ${
                              ride.status === "delivered"
                                ? "bg-green-100 text-green-800"
                                : ride.status === "confirmed"
                                ? "bg-blue-100 text-blue-800"
                                : ride.status === "delivering"
                                ? "bg-purple-100 text-purple-800"
                                : "bg-gray-100 text-gray-800"
                            }`}
                          >
                            {ride.status}
                          </span>
                        </td>
                        <td className="px-4 sm:px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {new Date(ride.created_at).toLocaleDateString()}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
