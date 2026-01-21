"use client";

import { useCallback, useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { useUser } from "@/hooks/useUser";
import { 
  Package, 
  Clock, 
  CheckCircle, 
  XCircle, 
  Truck, 
  MapPin, 
  Phone, 
  MessageCircle,
  ArrowLeft,
  User
} from "lucide-react";
import Image from "next/image";

interface Order {
  id: string;
  status: 'PENDING' | 'ASSIGNED' | 'DELIVERING' | 'COMPLETED' | 'CANCELLED';
  total: number;
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
    product: {
      id: string;
      name: string;
      image_url: string;
      store_name?: string;
    };
  }>;
  rider?: {
    full_name: string;
    mobile: string;
  };
}

const statusConfig = {
  PENDING: { 
    icon: Clock, 
    color: 'text-yellow-600', 
    bg: 'bg-yellow-100', 
    label: 'Pending',
    description: 'Looking for a rider...'
  },
  ASSIGNED: { 
    icon: Package, 
    color: 'text-blue-600', 
    bg: 'bg-blue-100', 
    label: 'Assigned',
    description: 'Rider assigned to your order'
  },
  DELIVERING: { 
    icon: Truck, 
    color: 'text-purple-600', 
    bg: 'bg-purple-100', 
    label: 'On the way',
    description: 'Your order is being delivered'
  },
  COMPLETED: { 
    icon: CheckCircle, 
    color: 'text-green-600', 
    bg: 'bg-green-100', 
    label: 'Completed',
    description: 'Order delivered successfully'
  },
  CANCELLED: { 
    icon: XCircle, 
    color: 'text-red-600', 
    bg: 'bg-red-100', 
    label: 'Cancelled',
    description: 'Order was cancelled'
  },
};

export default function OrderDetailPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const { user } = useUser();
  const [order, setOrder] = useState<Order | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchOrder = useCallback(async () => {
    if (!id || !user) return;

    try {
      setIsLoading(true);
      setError(null);

      const { data, error: fetchError } = await supabase
        .from("orders")
        .select(`
          *,
          order_items(
            *,
            product:id(
              name,
              image_url,
              store_id,
              stores(
                name
              )
            )
          ),
          rider:profiles(
            full_name,
            mobile
          )
        `)
        .eq("id", id)
        .eq("user_id", user.id)
        .single();

      if (fetchError) throw fetchError;
      setOrder(data);
    } catch (err) {
      console.error("Error fetching order:", err);
      setError("Order not found");
    } finally {
      setIsLoading(false);
    }
  }, [id, user]);

  useEffect(() => {
    fetchOrder();
  }, [fetchOrder]);

  const getStatusIcon = (status: keyof typeof statusConfig) => {
    const config = statusConfig[status];
    const Icon = config.icon;
    return <Icon size={20} className={config.color} />;
  };

  const contactRider = () => {
    if (order?.rider?.mobile) {
      window.open(`tel:${order.rider.mobile}`);
    }
  };

  const messageRider = () => {
    if (order?.rider?.mobile) {
      window.open(`sms:${order.rider.mobile}`);
    }
  };

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

  const statusInfo = statusConfig[order.status];

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

      <div className="max-w-3xl mx-auto p-4 space-y-6">
        {/* STATUS CARD */}
        <div className={`rounded-[2rem] p-6 shadow-lg shadow-gray-100 border ${statusInfo.bg.replace('bg-', 'bg-').replace('100', '50')} border-white overflow-hidden relative`}>
          {/* Background Decoration */}
          <div className={`absolute -right-4 -top-4 w-24 h-24 rounded-full opacity-10 ${statusInfo.color.replace('text-', 'bg-')}`} />
          
          <div className="relative z-10">
            <div className="flex items-center gap-4 mb-4">
              <div className={`w-14 h-14 rounded-2xl flex items-center justify-center text-2xl shadow-sm ${statusInfo.bg} border-2 border-white`}>
                {getStatusIcon(order.status)}
              </div>
              <div>
                <h3 className={`text-lg font-black tracking-tight ${statusInfo.color}`}>{statusInfo.label}</h3>
                <p className="text-sm font-medium text-gray-600 leading-tight">{statusInfo.description}</p>
              </div>
            </div>
            
            <div className="flex items-center justify-between pt-4 border-t border-black/5">
              <div className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">
                {new Date(order.created_at).toLocaleDateString([], { month: 'long', day: 'numeric', year: 'numeric' })}
              </div>
              <div className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">
                {new Date(order.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </div>
            </div>
          </div>
        </div>

        {/* RIDER INFO */}
        {order.rider && order.status !== 'PENDING' && (
          <section className="bg-white rounded-[2rem] border border-gray-100 p-6 shadow-sm">
            <h4 className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] mb-4 flex items-center gap-2 px-1">
              <span>🚴</span> Delivery Rider
            </h4>
            <div className="flex items-center justify-between bg-gray-50/50 p-4 rounded-3xl border border-gray-50">
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 rounded-2xl bg-orange-100 border-2 border-white shadow-sm flex items-center justify-center text-orange-600 font-black text-xl">
                  {order.rider.full_name[0].toUpperCase()}
                </div>
                <div>
                  <p className="font-black text-gray-900 text-lg leading-tight">{order.rider.full_name}</p>
                  <p className="text-sm font-bold text-gray-500 mt-0.5">{order.rider.mobile}</p>
                </div>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={contactRider}
                  className="w-11 h-11 bg-green-500 text-white rounded-xl shadow-lg shadow-green-100 flex items-center justify-center transition-all hover:bg-green-600 active:scale-90"
                >
                  <Phone size={20} strokeWidth={2.5} />
                </button>
                <button
                  onClick={messageRider}
                  className="w-11 h-11 bg-blue-500 text-white rounded-xl shadow-lg shadow-blue-100 flex items-center justify-center transition-all hover:bg-blue-600 active:scale-90"
                >
                  <MessageCircle size={20} strokeWidth={2.5} />
                </button>
              </div>
            </div>
          </section>
        )}

        {/* DELIVERY INFO */}
        <section className="bg-white rounded-[2rem] border border-gray-100 p-6 shadow-sm">
          <h4 className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] mb-4 flex items-center gap-2 px-1">
            <span>📍</span> Delivery Info
          </h4>
          <div className="space-y-4">
            <div className="flex items-start gap-4 p-4 bg-gray-50 rounded-3xl">
              <div className="bg-white p-2.5 rounded-xl border border-gray-100 text-gray-400">
                <MapPin size={18} />
              </div>
              <div className="min-w-0">
                <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-0.5">Drop-off Address</p>
                <p className="text-sm font-bold text-gray-900 leading-snug">{order.barangay || 'Selected delivery location'}</p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="p-4 bg-gray-50 rounded-3xl">
                <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Payment</p>
                <p className="text-sm font-black text-orange-600">{order.payment_method}</p>
              </div>
              <div className="p-4 bg-gray-50 rounded-3xl">
                <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Fee</p>
                <p className="text-sm font-black text-green-600">₱{order.delivery_fee.toLocaleString()}</p>
              </div>
            </div>
          </div>
        </section>

        {/* ORDER ITEMS */}
        <section className="space-y-4 pb-12">
          <h4 className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] flex items-center gap-2 px-1">
            <span>📦</span> Order Items ({order.order_items.length})
          </h4>
          <div className="bg-white rounded-[2rem] border border-gray-100 overflow-hidden shadow-sm">
            <div className="divide-y divide-gray-50">
              {order.order_items.map((item) => (
                <div key={item.id} className="p-5 flex gap-4 group transition-colors hover:bg-gray-50/50">
                  <div className="w-20 h-20 bg-gray-100 rounded-2xl overflow-hidden flex-shrink-0 relative border border-gray-50">
                    {item.product?.image_url ? (
                      <Image
                        src={item.product.image_url}
                        alt={item.product.name}
                        fill
                        className="object-cover group-hover:scale-110 transition-transform duration-500"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-2xl bg-orange-50">🍔</div>
                    )}
                  </div>
                  <div className="flex-1 flex flex-col justify-center min-w-0">
                    <div className="flex justify-between items-start gap-2">
                      <h5 className="font-black text-gray-900 leading-tight truncate">{item.product?.name}</h5>
                      <p className="font-black text-gray-900">₱{(item.price * item.quantity).toLocaleString()}</p>
                    </div>
                    {item.product?.store_name && (
                      <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mt-1">{item.product.store_name}</p>
                    )}
                    <div className="flex items-center gap-2 mt-2">
                      <span className="text-[10px] font-black bg-gray-100 text-gray-500 px-2 py-0.5 rounded-lg uppercase">
                        Qty: {item.quantity}
                      </span>
                      <span className="text-[10px] font-black bg-orange-50 text-orange-600 px-2 py-0.5 rounded-lg uppercase">
                        ₱{item.price.toLocaleString()} each
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
            
            {/* TOTAL SUMMARY */}
            <div className="p-6 bg-orange-50/30 border-t border-orange-100">
              <div className="space-y-2">
                <div className="flex justify-between text-xs font-bold text-gray-500 uppercase tracking-widest">
                  <span>Subtotal</span>
                  <span className="text-gray-900">₱{(order.total - order.delivery_fee).toLocaleString()}</span>
                </div>
                <div className="flex justify-between text-xs font-bold text-gray-500 uppercase tracking-widest">
                  <span>Delivery Fee</span>
                  <span className="text-green-600 font-black">₱{order.delivery_fee.toLocaleString()}</span>
                </div>
                <div className="flex justify-between items-end pt-4 border-t border-orange-100">
                  <span className="text-sm font-black text-gray-900 uppercase tracking-[0.2em]">Total</span>
                  <span className="text-3xl font-black text-orange-600 tracking-tighter">₱{order.total.toLocaleString()}</span>
                </div>
              </div>
            </div>
          </div>
        </section>
      </div>

      {/* STICKY ACTIONS */}
      {order.status === 'DELIVERING' && (
        <div className="fixed bottom-16 left-0 right-0 bg-white/80 backdrop-blur-lg border-t border-gray-100 p-4 z-40">
          <div className="max-w-3xl mx-auto">
            <button
              onClick={contactRider}
              className="w-full bg-orange-600 text-white py-4 rounded-2xl font-black text-sm uppercase tracking-widest shadow-lg shadow-orange-100 transition-all hover:bg-orange-700 active:scale-95 flex items-center justify-center gap-3"
            >
              <Phone size={20} strokeWidth={3} />
              <span>Contact Rider Now</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
