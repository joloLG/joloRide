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

    try {
      console.log("Starting login process...");
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      console.log("Auth response:", { data, error });

      if (error) {
        console.error("Auth error:", error);
        alert(`Login failed: ${error.message}`);
        setLoading(false);
        return;
      }

      console.log("User authenticated:", data.user);

      // Fetch user profile with role
      const { data: profile, error: profileError } = await supabase
        .from("profiles")
        .select("role, is_active")
        .eq("user_id", data.user.id)
        .single();

      console.log("Profile response:", { profile, profileError });

      if (profileError || !profile) {
        // Create basic profile if it doesn't exist
        const { error: createProfileError } = await supabase.from("profiles").insert({
          user_id: data.user.id,
          email: data.user.email,
          full_name: data.user.email?.split('@')[0] || 'New User',
          role: "user",
          is_active: true,
        });

        if (createProfileError) {
          console.error("Failed to create profile:", createProfileError);
          alert("Login successful but profile setup failed. Please try again.");
          await supabase.auth.signOut();
          setLoading(false);
          return;
        }

        // Use default user role for newly created profile
        const role = "user" as "user" | "rider" | "admin";

        // Route based on role
        if (role === "admin") {
          router.push("/admin");
        } else if (role === "rider") {
          router.push("/rider");
        } else {
          router.push("/user");
        }
        return;
      }

      // Check if user account is active (for riders)
      if (profile.role === "rider" && !profile.is_active) {
        alert("Your rider account is currently inactive. Please contact admin.");
        await supabase.auth.signOut();
        setLoading(false);
        return;
      }

      // Route based on role
      switch (profile.role) {
        case "admin":
          router.push("/admin");
          break;
        case "rider":
          router.push("/rider");
          break;
        case "user":
        default:
          router.push("/user");
          break;
      }
    } catch (error) {
      console.error("Login error:", error);
      alert("An unexpected error occurred. Please try again.");
    } finally {
      setLoading(false);
    }
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
          disabled={loading}
          className="w-full bg-black text-white py-3 rounded-xl text-base font-medium active:scale-95 transition disabled:opacity-50"
        >
          {loading ? "Logging in..." : "Login"}
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
