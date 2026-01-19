"use client";

import { supabase } from "@/lib/supabase";
import { useRouter } from "next/navigation";
import { useState } from "react";
import Link from "next/link";

export default function LoginPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    const form = e.target as HTMLFormElement;
    const email = (form.email as HTMLInputElement).value;
    const password = (form.password as HTMLInputElement).value;

    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      alert(error.message);
      setLoading(false);
      return;
    }

    // Fetch role
    const { data: profile } = await supabase
      .from("profiles")
      .select("role")
      .eq("id", data.user.id)
      .single();

    if (profile?.role === "admin") router.push("/admin");
    else if (profile?.role === "rider") router.push("/rider");
    else router.push("/user");

    setLoading(false);
  };

  return (
    <div className="w-full max-w-md bg-white rounded-2xl shadow-xl p-6 sm:p-8">
      <h1 className="text-center text-2xl sm:text-3xl font-bold mb-6">
        <span className="text-red-600">JOLO</span>
        <span className="text-black">RIDE</span>
      </h1>

      <form onSubmit={handleLogin} className="space-y-4">
        <input name="email" type="email" placeholder="Email" className="input" />
        <input name="password" type="password" placeholder="Password" className="input" />

       <button
  type="submit"
  className="w-full bg-black text-white py-3 rounded-xl text-base font-medium active:scale-95 transition"
>
  Login
</button>

      </form>

      <p className="text-center text-sm mt-6">
        Don’t have an account?{" "}
        <Link href="/register" className="text-orange-600 font-semibold">
          Register
        </Link>
      </p>
    </div>
  );
}
