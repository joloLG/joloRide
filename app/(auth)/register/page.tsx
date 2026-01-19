"use client";

import { supabase } from "@/lib/supabase";
import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function RegisterPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    const form = e.target as HTMLFormElement;
    const mobile = (form.mobile as HTMLInputElement).value;
    const email = (form.email as HTMLInputElement).value;
    const password = (form.password as HTMLInputElement).value;

    const { data, error } = await supabase.auth.signUp({
      email,
      password,
    });

    if (error) {
      alert(error.message);
      setLoading(false);
      return;
    }

    // Create profile
    await supabase.from("profiles").insert({
      id: data.user?.id,
      mobile,
      role: "user",
    });

    router.push("/login");
  };

  return (
   <div className="w-full max-w-md bg-white rounded-2xl shadow-xl p-6 sm:p-8">
      <h1 className="text-center text-2xl sm:text-3xl font-bold mb-6">
        <span className="text-red-600">JOLO</span>
        <span className="text-black">RIDE</span>
      </h1>

      <form onSubmit={handleRegister} className="space-y-4">
        <input name="mobile" placeholder="Mobile Number" className="input" />
        <input name="email" type="email" placeholder="Email" className="input" />
        <input name="password" type="password" placeholder="Password" className="input" />

        <button disabled={loading} className="w-full bg-black text-white py-2 rounded-lg">
          {loading ? "Registering..." : "Register"}
        </button>
      </form>

      <p className="text-center text-sm mt-6">
        Already have an account?{" "}
        <Link href="/login" className="text-orange-600 font-semibold">
          Login
        </Link>
      </p>
    </div>
  );
}
