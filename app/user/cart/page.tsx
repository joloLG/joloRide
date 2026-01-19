"use client";

import { useCartStore } from "@/store/cartStore";
import Link from "next/link";
import Image from "next/image";

export default function CartPage() {
  const { items, removeItem } = useCartStore();

  const total = items.reduce<number>(
    (sum: number, i: { price: number; quantity: number }) => sum + i.price * i.quantity,
    0
  );

  if (!items.length) {
    return (
      <div className="h-screen flex items-center justify-center text-gray-500">
        Your cart is empty
      </div>
    );
  }

  return (
    <div className="p-4 pb-24">
      <h1 className="text-lg font-bold mb-4">Your Cart</h1>

      <div className="space-y-4">
        {items.map((item) => (
          <div key={item.id} className="flex gap-3 bg-white p-3 rounded-xl shadow">
            <Image
              src={item.image}
              alt={item.name}
              width={64}
              height={64}
              className="w-16 h-16 rounded object-cover"
            />
            <div className="flex-1">
              <p className="font-medium">{item.name}</p>
              <p className="text-sm text-gray-600">
                ₱{item.price} × {item.quantity}
              </p>
            </div>
            <button
              onClick={() => removeItem(item.id)}
              className="text-red-500 text-sm"
            >
              Remove
            </button>
          </div>
        ))}
      </div>

      {/* CHECKOUT */}
      <div className="fixed bottom-0 left-0 right-0 bg-white p-4 border-t">
        <div className="flex justify-between mb-2">
          <span>Total</span>
          <span className="font-bold">₱{total}</span>
        </div>
        <Link
          href="/user/checkout"
          className="block bg-black text-white text-center py-3 rounded-xl"
        >
          Checkout
        </Link>
      </div>
    </div>
  );
}
