"use client";

import { useCallback, useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { useCartStore } from "@/store/cartStore";
import AccountCompletionModal from "@/components/AccountCompletionModal";
import LocationPicker from "@/components/LocationPicker";

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
      .eq("id", id)
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
      const { error } = await supabase.from("orders").insert({
        user_id: user.id,
        items,
        payment_method: payment,
        dropoff_location: location,
        status: "PENDING",
      });

      if (error) throw error;

      clearCart();
      alert("Order placed successfully");
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
    <div className="p-4 space-y-4">
      <h1 className="font-bold text-lg">Checkout</h1>

      <LocationPicker setLocation={setLocation} />

      {/* PAYMENT */}
      <div className="space-y-2">
        <label className="flex gap-2 items-center">
          <input
            type="radio"
            checked={payment === "COD"}
            onChange={() => setPayment("COD")}
          />
          Cash on Delivery
        </label>

        <label className="flex gap-2 items-center">
          <input
            type="radio"
            checked={payment === "QRPH"}
            onChange={() => setPayment("QRPH")}
          />
          QRPH Online Payment
        </label>
      </div>

      {payment === "QRPH" && (
        <div className="bg-gray-100 p-3 rounded-xl text-sm">
          QRPH code will be generated after order confirmation.
        </div>
      )}

      <button
        onClick={placeOrder}
        className="w-full bg-black text-white py-3 rounded-xl"
      >
        Confirm Order
      </button>
    </div>
  );
}
