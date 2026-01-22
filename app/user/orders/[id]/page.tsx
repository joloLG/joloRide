"use client";

import { useCallback, useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { useUser } from "@/hooks/useUser";
import OrderTracking from "@/components/OrderTracking";
import { ArrowLeft } from "lucide-react";

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

export default function OrderDetailPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const { user, profile } = useUser();
  const [order, setOrder] = useState<Order | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchOrder = useCallback(async () => {
    if (!id || !user || !profile) return;

    try {
      setIsLoading(true);
      setError(null);

      const { data, error: fetchError } = await supabase
        .from("orders")
        .select(`
          *,
          order_items(
            *,
            product:products(
              id,
              name,
              price,
              image_url
            )
          ),
          rider:profiles!orders_rider_id_fkey(
            id,
            full_name,
            mobile
          ),
          user:profiles!orders_user_id_fkey(
            full_name,
            mobile,
            address
          )
        `)
        .eq("id", id)
        .eq("user_id", profile.id) // Use profile ID, not auth user ID
        .single();

      if (fetchError) throw fetchError;
      setOrder(data);
    } catch (err) {
      console.error("Error fetching order:", err);
      setError("Order not found");
    } finally {
      setIsLoading(false);
    }
  }, [id, user, profile]);

  useEffect(() => {
    fetchOrder();
  }, [fetchOrder]);

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (error || !order) {
    return (
      <div className="text-center py-12">
        <h2 className="text-xl font-semibold text-gray-800 mb-2">Order not found</h2>
        <p className="text-gray-600 mb-4">{error || "The order you're looking for doesn't exist."}</p>
        <button
          onClick={() => router.back()}
          className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
        >
          Go Back
        </button>
      </div>
    );
  }

  return (
    <div className="pb-24 sm:pb-12 bg-gray-50 min-h-screen">
      {/* HEADER */}
      <div className="bg-white/80 backdrop-blur-md border-b border-gray-100 sticky top-0 z-30 shadow-sm shadow-gray-100/50">
        <div className="flex items-center p-4 max-w-7xl mx-auto">
          <button
            onClick={() => router.back()}
            className="p-2.5 rounded-2xl bg-gray-100 hover:bg-gray-200 transition-all active:scale-95 text-gray-600"
          >
            <ArrowLeft size={20} strokeWidth={3} />
          </button>
          <div className="ml-4">
            <h1 className="text-xl font-black text-gray-900 tracking-tight leading-none">Order Details</h1>
            <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mt-1.5">#{order.id.slice(-8).toUpperCase()}</p>
          </div>
        </div>
      </div>

      <div className="max-w-3xl mx-auto p-4">
        <OrderTracking order={order} />
      </div>
    </div>
  );
}
