"use client";

import { useMemo } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { useUser } from "@/hooks/useUser";

export default function RiderSettingsPage() {
  const router = useRouter();
  const { user, profile, isLoading } = useUser();

  const displayName = useMemo(() => {
    return profile?.full_name || user?.email || "Rider";
  }, [profile?.full_name, user?.email]);

  const signOut = async () => {
    await supabase.auth.signOut();
    router.push("/login");
  };

  if (isLoading) return null;
  if (!user || !profile) return null;

  return (
    <div className="space-y-6 max-w-lg mx-auto pb-20 sm:pb-0">
      <div className="flex items-center justify-between px-1">
        <h2 className="text-2xl font-bold text-gray-900">Settings</h2>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border p-6">
        <div className="flex items-center gap-4 mb-6">
          <div className="w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center text-2xl border-2 border-white shadow-sm">
            {profile.full_name?.[0]?.toUpperCase() || "R"}
          </div>
          <div>
            <p className="text-sm text-gray-500 font-medium">Signed in as</p>
            <p className="text-xl font-bold text-gray-900">{displayName}</p>
          </div>
        </div>

        <div className="space-y-4">
          <div className="flex items-center justify-between p-3 bg-gray-50 rounded-xl">
            <span className="text-sm text-gray-600">Account Role</span>
            <span className="text-sm font-bold text-gray-900 capitalize px-3 py-1 bg-white rounded-lg border">{profile.role}</span>
          </div>
          
          <div className="flex items-center justify-between p-3 bg-gray-50 rounded-xl">
            <span className="text-sm text-gray-600">Current Status</span>
            <span className={`text-sm font-bold px-3 py-1 rounded-lg border ${
              profile.is_active ? "bg-green-50 text-green-700 border-green-100" : "bg-gray-100 text-gray-700 border-gray-200"
            }`}>
              {profile.is_active ? "🟢 Active" : "🔴 Inactive"}
            </span>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border p-6">
        <h3 className="text-sm font-bold text-gray-400 uppercase tracking-wider mb-4 px-1">Contact Details</h3>
        <div className="space-y-4">
          <div className="flex items-start gap-3">
            <span className="text-lg">📧</span>
            <div>
              <p className="text-xs text-gray-500 font-medium uppercase">Email Address</p>
              <p className="text-gray-900 font-semibold">{user.email}</p>
            </div>
          </div>
          
          <div className="flex items-start gap-3">
            <span className="text-lg">📱</span>
            <div>
              <p className="text-xs text-gray-500 font-medium uppercase">Mobile Number</p>
              <p className="text-gray-900 font-semibold">{profile.mobile || "Not set"}</p>
            </div>
          </div>
        </div>
      </div>

      <div className="px-1 pt-2">
        <button
          onClick={signOut}
          className="w-full bg-red-50 text-red-600 py-4 rounded-2xl text-base font-bold transition-all hover:bg-red-100 active:scale-[0.98] border border-red-100 flex items-center justify-center gap-2"
        >
          <span>🚪</span> Sign Out
        </button>
        <p className="text-center text-xs text-gray-400 mt-6">App Version 1.0.0 (Beta)</p>
      </div>
    </div>
  );
}
