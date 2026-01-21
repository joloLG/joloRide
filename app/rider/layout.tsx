"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { useUser } from "@/hooks/useUser";
import RiderBottomNav from "@/components/rider/RiderBottomNav";

export default function RiderLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const { user, profile, isLoading } = useUser();
  const [isToggling, setIsToggling] = useState(false);

  useEffect(() => {
    if (isLoading) return;

    if (!user) {
      router.push("/login");
      return;
    }

    if (profile && profile.role !== "rider") {
      router.push("/");
      return;
    }
  }, [isLoading, user, profile, router]);

  const toggleRiderStatus = async () => {
    if (!user || !profile) return;

    try {
      setIsToggling(true);
      const { error } = await supabase
        .from("profiles")
        .update({ is_active: !profile.is_active })
        .or(`id.eq.${user.id},user_id.eq.${user.id}`);

      if (error) throw error;

      window.location.reload();
    } catch (e) {
      console.error(e);
      alert("Failed to update status. Please try again.");
    } finally {
      setIsToggling(false);
    }
  };

  const signOut = async () => {
    await supabase.auth.signOut();
    router.push("/login");
  };

  if (isLoading) return null;
  if (!user || !profile || profile.role !== "rider") return null;

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <header className="bg-white shadow-sm border-b sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16 sm:h-20">
            <div className="flex flex-col">
              <h1 className="text-lg sm:text-2xl font-black text-gray-900 leading-tight">
                Hi, {profile.full_name?.split(' ')[0] || "Rider"}!
              </h1>
              <div className="flex items-center gap-1.5">
                <div className={`w-2 h-2 rounded-full ${profile.is_active ? 'bg-green-500 animate-pulse' : 'bg-gray-400'}`} />
                <p className="text-[10px] sm:text-xs font-bold text-gray-500 uppercase tracking-widest">
                  {profile.is_active ? "Receiving Orders" : "Offline"}
                </p>
              </div>
            </div>
            
            <div className="flex items-center gap-2 sm:gap-3">
              <button
                onClick={toggleRiderStatus}
                disabled={isToggling}
                className={`flex items-center gap-2 px-3 py-2 sm:px-4 sm:py-2.5 rounded-2xl text-xs sm:text-sm font-bold transition-all active:scale-95 disabled:opacity-50 ${
                  profile.is_active
                    ? "bg-orange-50 text-orange-600 border border-orange-100"
                    : "bg-gray-100 text-gray-600 border border-gray-200"
                }`}
              >
                <span className="text-base sm:text-lg">{profile.is_active ? "🟢" : "🔴"}</span>
                <span className="hidden xs:inline">{profile.is_active ? "Active" : "Inactive"}</span>
              </button>
              
              <div className="w-px h-8 bg-gray-200 mx-1 hidden sm:block" />
              
              <button
                onClick={signOut}
                className="p-2 sm:px-4 sm:py-2.5 text-xs sm:text-sm font-bold text-gray-500 hover:text-red-600 hover:bg-red-50 rounded-2xl transition-colors flex items-center gap-2"
              >
                <span className="text-xl sm:text-lg">🚪</span>
                <span className="hidden sm:inline">Sign Out</span>
              </button>
            </div>
          </div>
        </div>
      </header>

      <main className="flex-1 max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-6 pb-24 sm:pb-8">
        {children}
      </main>

      <RiderBottomNav />
    </div>
  );
}
