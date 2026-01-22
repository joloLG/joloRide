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
      <div className="h-screen flex flex-col items-center justify-center text-gray-500 p-4">
        <div className="text-6xl mb-4 grayscale opacity-20">🛒</div>
        <p className="text-xl font-bold mb-6">Your cart is empty</p>
        <div className="flex flex-col gap-3 w-full max-w-[200px]">
          <Link
            href="/user"
            className="bg-orange-600 text-white text-center py-3 rounded-2xl font-bold text-sm uppercase tracking-widest shadow-lg shadow-orange-100 transition-all hover:bg-orange-700 active:scale-95"
          >
            Start Shopping
          </Link>
          <Link
            href="/user/orders"
            className="bg-gray-100 text-gray-700 text-center py-3 rounded-2xl font-bold text-sm uppercase tracking-widest border border-gray-200 transition-all hover:bg-gray-200 active:scale-95"
          >
            My Orders
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 pb-32">
      <div className="flex items-center justify-between mb-6 px-1">
        <h1 className="text-3xl font-extrabold text-gray-900">Your Cart</h1>
        <span className="bg-orange-100 text-orange-600 px-3 py-1 rounded-full text-xs font-bold">
          {items.length} {items.length === 1 ? 'Item' : 'Items'}
        </span>
      </div>

      <div className="space-y-4">
        {items.map((item) => (
          <div key={item.id} className="flex gap-4 bg-white p-4 rounded-3xl shadow-sm border border-gray-100 group transition-all active:scale-[0.98]">
            <div className="relative w-20 h-20 shrink-0">
              <Image
                src={item.image}
                alt={item.name}
                fill
                className="rounded-2xl object-cover"
              />
            </div>
            <div className="flex-1 flex flex-col justify-between py-0.5">
              <div>
                <p className="font-bold text-gray-900 leading-tight mb-1">{item.name}</p>
                <p className="text-sm font-bold text-orange-600">
                  ₱{item.price.toLocaleString()}
                </p>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">Qty:</span>
                <span className="text-sm font-bold text-gray-700">{item.quantity}</span>
              </div>
            </div>
            <div className="flex flex-col justify-center">
              <button
                onClick={() => removeItem(item.id)}
                className="p-2 text-red-400 hover:text-red-600 hover:bg-red-50 rounded-xl transition-colors"
                aria-label="Remove item"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* CHECKOUT BAR */}
      <div className="fixed bottom-16 left-0 right-0 bg-white/80 backdrop-blur-lg border-t border-gray-100 p-4 pb-6 z-40">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-between gap-6 mb-4">
            <div>
              <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-0.5">Total Amount</p>
              <p className="text-2xl font-black text-gray-900">₱{total.toLocaleString()}</p>
            </div>
            <Link
              href="/user/checkout"
              className="flex-1 max-w-[200px] bg-orange-600 text-white text-center py-4 rounded-2xl font-black text-sm uppercase tracking-widest shadow-lg shadow-orange-100 transition-all hover:bg-orange-700 active:scale-95"
            >
              Checkout
            </Link>
          </div>
          
          {/* MY ORDERS BUTTON */}
          <div className="flex justify-center">
            <Link
              href="/user/orders"
              className="inline-flex items-center gap-2 px-6 py-3 bg-gray-100 text-gray-700 rounded-2xl font-bold text-sm uppercase tracking-widest border border-gray-200 transition-all hover:bg-gray-200 active:scale-95"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
              </svg>
              My Orders
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
