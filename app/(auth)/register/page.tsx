"use client";

import { supabase } from "@/lib/supabase";
import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function RegisterPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const [formData, setFormData] = useState({
    full_name: "",
    email: "",
    password: "",
    confirmPassword: "",
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Validate inputs
      if (!formData.full_name || !formData.email || !formData.password) {
        alert("Please fill in all fields");
        return;
      }

      if (formData.password.length < 6) {
        alert("Password must be at least 6 characters long");
        return;
      }

      if (formData.password !== formData.confirmPassword) {
        alert("Passwords do not match");
        return;
      }

      // Validate email format
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(formData.email)) {
        alert("Please enter a valid email address");
        return;
      }

      // Create auth user
      const { data, error } = await supabase.auth.signUp({
        email: formData.email,
        password: formData.password,
      });

      if (error) {
        alert(`Registration failed: ${error.message}`);
        return;
      }

      if (!data.user) {
        alert("Registration failed. Please try again.");
        return;
      }

      // Create user profile with basic information
      const { error: profileError } = await supabase.from("profiles").insert({
        user_id: data.user.id,
        email: data.user.email,
        full_name: formData.full_name,
        role: "user", // Automatically assigned as user
        is_active: true,
      });

      if (profileError) {
        console.error("Profile creation error:", profileError);
        alert("Account created but profile setup failed. Please contact support.");
        return;
      }

      alert("Registration successful! Please login to continue.");
      router.push("/login");
    } catch (error) {
      console.error("Registration error:", error);
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

      <form onSubmit={handleRegister} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Full Name
          </label>
          <input
            type="text"
            name="full_name"
            value={formData.full_name}
            onChange={handleInputChange}
            placeholder="Juan Dela Cruz"
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Email Address
          </label>
          <input
            type="email"
            name="email"
            value={formData.email}
            onChange={handleInputChange}
            placeholder="juan@example.com"
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Password
          </label>
          <div className="relative">
            <input
              type={showPassword ? "text" : "password"}
              name="password"
              value={formData.password}
              onChange={handleInputChange}
              placeholder="Min. 6 characters"
              className="w-full px-3 py-2 pr-10 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              required
              minLength={6}
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700"
            >
              {showPassword ? "👁️" : "🙈"}
            </button>
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Confirm Password
          </label>
          <div className="relative">
            <input
              type={showConfirmPassword ? "text" : "password"}
              name="confirmPassword"
              value={formData.confirmPassword}
              onChange={handleInputChange}
              placeholder="Re-enter password"
              className="w-full px-3 py-2 pr-10 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              required
              minLength={6}
            />
            <button
              type="button"
              onClick={() => setShowConfirmPassword(!showConfirmPassword)}
              className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700"
            >
              {showConfirmPassword ? "👁️" : "🙈"}
            </button>
          </div>
        </div>

        <button 
          disabled={loading} 
          className="w-full bg-black text-white py-3 rounded-xl text-base font-medium active:scale-95 transition disabled:opacity-50"
        >
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
