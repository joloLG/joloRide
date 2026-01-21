"use client";

import Link from "next/link";
import { Search, User } from "lucide-react";
import { useUser } from "@/hooks/useUser";

export default function UserHeader() {
  const { profile } = useUser();

  return (
    <header className="sticky top-0 z-40 bg-white/80 backdrop-blur-md border-b border-gray-100">
      <div className="max-w-7xl mx-auto px-4 py-3">
        <div className="flex items-center justify-between gap-4 mb-3">
          <Link href="/user" className="flex items-center gap-1">
            <span className="text-2xl">⚡</span>
            <span className="text-xl font-black text-gray-900 tracking-tighter">JoloRide</span>
          </Link>
          
          <Link 
            href="/user/settings" 
            className="w-10 h-10 rounded-full bg-orange-50 border border-orange-100 flex items-center justify-center text-orange-600 hover:bg-orange-100 transition-colors"
          >
            {profile?.full_name ? (
              <span className="font-bold text-sm">{profile.full_name[0].toUpperCase()}</span>
            ) : (
              <User size={20} />
            )}
          </Link>
        </div>

        <div className="relative">
          <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none text-gray-400">
            <Search size={18} />
          </div>
          <input
            type="text"
            placeholder="Search for food, groceries..."
            className="w-full pl-11 pr-4 py-2.5 bg-gray-100 border-none rounded-2xl focus:ring-2 focus:ring-orange-500 text-sm font-medium placeholder:text-gray-500 transition-all"
          />
        </div>
      </div>
    </header>
  );
}
