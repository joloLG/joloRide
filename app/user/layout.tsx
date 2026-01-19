"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import UserBottomNav from "@/components/UserBottomNav";
import UserHeader from "@/components/UserHeader";

export default function UserLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkAuth = async () => {
      const { data } = await supabase.auth.getUser();
      if (!data.user) {
        router.push("/login");
        return;
      }
      setLoading(false);
    };
    checkAuth();
  }, []);

  if (loading) return null;

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <UserHeader/>
      <main className="flex-1 pb-16">{children}</main>
      <UserBottomNav />
    </div>
  );
}
