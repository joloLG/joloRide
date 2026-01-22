"use client";

import { useCallback, useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { useCartStore } from "@/store/cartStore";
import AccountCompletionModal from "@/components/AccountCompletionModal";
import AddressSelector from "@/components/AddressSelector";
import AddressMapPin from "@/components/AddressMapPin";

type Profile = {
  id: string;
  full_name: string;
  mobile: string;
  address: string;
  // Add other profile fields as needed
};

type Location = {
  lat: number;
  lng: number;
  address: string;
  landmark?: string;
};

export default function CheckoutPage() {
  const { items, clearCart } = useCartStore();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [location, setLocation] = useState<Location | null>(null);
  const [payment, setPayment] = useState<"COD" | "QRPH">("COD");
  interface User {
    id: string;
    email?: string;
    // Add other user properties as needed
  }

  const [user, setUser] = useState<User | null>(null);

  const fetchProfile = useCallback(async (id: string) => {
    if (!id) return;
    
    const { data } = await supabase
      .from("profiles")
      .select("*")
      .or(`id.eq.${id},user_id.eq.${id}`)
      .single();

    setProfile(data);
  }, []);

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      if (data.user) {
        setUser(data.user);
        fetchProfile(data.user.id);
      }
    });
  }, [fetchProfile]);

  const placeOrder = async () => {
    if (!user?.id) {
      alert('Please log in to place an order');
      return;
    }

    if (!location) {
      alert('Please select a delivery location');
      return;
    }

    try {
      // Ensure user has a profile entry and get the profile ID
      let profileId: string;
      
      const { data: existingProfile } = await supabase
        .from("profiles")
        .select("id")
        .eq("user_id", user.id)
        .single();

      if (existingProfile) {
        profileId = existingProfile.id;
      } else {
        // Create profile if it doesn't exist
        const { data: newProfile, error: profileError } = await supabase.from("profiles").insert({
          user_id: user.id,
          email: user.email,
          role: "user",
          full_name: user.email?.split('@')[0] || "User",
        }).select("id").single();
        
        if (profileError) {
          console.error('Error creating user profile:', profileError);
          throw profileError;
        }
        
        profileId = newProfile.id;
      }

      // Calculate total amount
      const totalAmount = items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
      
      // Create order using the profile ID
      const { data: order, error: orderError } = await supabase.from("orders").insert({
        user_id: profileId, // Use profile ID, not auth user ID
        status: "pending",
        payment_method: payment,
        total_amount: totalAmount,
        delivery_fee: 0, // Free delivery for now
        dropoff_address: location.address,
        dropoff_lat: location.lat,
        dropoff_lng: location.lng,
        landmark: location.landmark || null,
      }).select().single();

      if (orderError) throw orderError;

      // Create order items
      const orderItems = items.map(item => ({
        order_id: order.id,
        product_id: item.id,
        quantity: item.quantity,
        price_at_time: item.price
      }));

      const { error: itemsError } = await supabase.from("order_items").insert(orderItems);
      if (itemsError) throw itemsError;

      clearCart();
      alert("Order placed successfully");
      // Redirect to orders page to see the new order
      window.location.href = '/user/orders';
    } catch (error) {
      console.error('Error placing order:', error);
      alert('Failed to place order. Please try again.');
    }
  };

  if (!user) {
    return (
      <div className="p-4">
        <p>Please log in to proceed with checkout.</p>
      </div>
    );
  }

  if (!profile?.full_name || !profile?.mobile || !profile?.address) {
    return (
      <AccountCompletionModal
        userId={user.id}
        onComplete={() => fetchProfile(user.id)}
      />
    );
  }

  return (
    <div className="max-w-2xl mx-auto p-4 pb-32 sm:pb-12">
      <div className="flex items-center gap-3 mb-8 px-1">
        <div className="bg-orange-100 p-2 rounded-xl">
          <span className="text-xl">💳</span>
        </div>
        <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight">Checkout</h1>
      </div>

      <div className="space-y-6">
        {/* DELIVERY SECTION */}
        <section className="bg-white rounded-3xl border border-gray-100 p-6 shadow-sm">
          <h2 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-4 flex items-center gap-2">
            <span>📍</span> Delivery Location
          </h2>
          <AddressSelector onLocationSelect={setLocation} />
          {location && (
            <>
              <div className="mt-4">
                <AddressMapPin location={location} />
              </div>
              <div className="mt-4 p-3 bg-gray-50 rounded-2xl border border-gray-100">
                <p className="text-sm font-bold text-gray-900">{location.address}</p>
                {location.landmark && (
                  <p className="text-xs text-orange-600 font-medium mt-1">📍 {location.landmark}</p>
                )}
                <p className="text-[10px] text-gray-400 font-medium uppercase mt-1">Pinned automatically via GPS</p>
              </div>
            </>
          )}
        </section>

        {/* PAYMENT SECTION */}
        <section className="bg-white rounded-3xl border border-gray-100 p-6 shadow-sm">
          <h2 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-4 flex items-center gap-2">
            <span>💰</span> Payment Method
          </h2>
          <div className="grid grid-cols-1 gap-3">
            <button
              onClick={() => setPayment("COD")}
              className={`flex items-center justify-between p-4 rounded-2xl border-2 transition-all ${
                payment === "COD"
                  ? "border-orange-500 bg-orange-50/50"
                  : "border-gray-100 bg-white hover:border-orange-200"
              }`}
            >
              <div className="flex items-center gap-3">
                <div className={`p-2 rounded-xl ${payment === "COD" ? "bg-orange-100" : "bg-gray-100"}`}>
                  💵
                </div>
                <div className="text-left">
                  <p className="font-bold text-sm text-gray-900">Cash on Delivery</p>
                  <p className="text-[10px] text-gray-500 font-medium">Pay when you receive</p>
                </div>
              </div>
              <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                payment === "COD" ? "border-orange-500 bg-orange-500" : "border-gray-200"
              }`}>
                {payment === "COD" && <div className="w-2 h-2 bg-white rounded-full" />}
              </div>
            </button>

            <button
              onClick={() => setPayment("QRPH")}
              className={`flex items-center justify-between p-4 rounded-2xl border-2 transition-all ${
                payment === "QRPH"
                  ? "border-orange-500 bg-orange-50/50"
                  : "border-gray-100 bg-white hover:border-orange-200"
              }`}
            >
              <div className="flex items-center gap-3">
                <div className={`p-2 rounded-xl ${payment === "QRPH" ? "bg-orange-100" : "bg-gray-100"}`}>
                  📲
                </div>
                <div className="text-left">
                  <p className="font-bold text-sm text-gray-900">QRPH Payment</p>
                  <p className="text-[10px] text-gray-500 font-medium">Scan any banking app</p>
                </div>
              </div>
              <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                payment === "QRPH" ? "border-orange-500 bg-orange-500" : "border-gray-200"
              }`}>
                {payment === "QRPH" && <div className="w-2 h-2 bg-white rounded-full" />}
              </div>
            </button>
          </div>

          {payment === "QRPH" && (
            <div className="mt-4 p-4 bg-blue-50 rounded-2xl border border-blue-100 flex gap-3 items-start">
              <span className="text-lg">ℹ️</span>
              <p className="text-xs text-blue-700 font-medium leading-relaxed">
                A QRPH code will be generated instantly after you confirm the order. You can pay using GCash, Maya, or any bank app.
              </p>
            </div>
          )}
        </section>

        {/* ORDER SUMMARY */}
        <section className="bg-white rounded-3xl border border-gray-100 p-6 shadow-sm">
          <h2 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-4 flex items-center gap-2">
            <span>📦</span> Order Summary
          </h2>
          <div className="space-y-3 mb-4">
            {items.map((item) => (
              <div key={item.id} className="flex justify-between items-center text-sm">
                <span className="text-gray-600 font-medium">
                  {item.quantity}x {item.name}
                </span>
                <span className="font-bold text-gray-900">₱{(item.price * item.quantity).toLocaleString()}</span>
              </div>
            ))}
          </div>
          <div className="border-t border-dashed border-gray-200 pt-4 space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-gray-500">Subtotal</span>
              <span className="font-bold text-gray-700">₱{items.reduce((sum, i) => sum + i.price * i.quantity, 0).toLocaleString()}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-500">Delivery Fee</span>
              <span className="font-bold text-gray-700 text-green-600">FREE</span>
            </div>
            <div className="flex justify-between items-end pt-2">
              <span className="text-sm font-bold text-gray-900 uppercase">Total Amount</span>
              <span className="text-2xl font-black text-orange-600 tracking-tighter">
                ₱{items.reduce((sum, i) => sum + i.price * i.quantity, 0).toLocaleString()}
              </span>
            </div>
          </div>
        </section>
      </div>

      {/* CONFIRM BAR */}
      <div className="fixed bottom-16 left-0 right-0 bg-white/80 backdrop-blur-lg border-t border-gray-100 p-4 pb-6 z-40">
        <div className="max-w-7xl mx-auto">
          <button
            onClick={placeOrder}
            className="w-full bg-orange-600 text-white py-4 rounded-2xl font-black text-sm uppercase tracking-widest shadow-lg shadow-orange-100 transition-all hover:bg-orange-700 active:scale-95 flex items-center justify-center gap-3"
          >
            <span>Confirm & Place Order</span>
            <span className="text-xl">🚀</span>
          </button>
        </div>
      </div>
    </div>
  );
}
