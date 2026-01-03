"use client";

import Link from "next/link";

export default function LoginPage() {
  return (
    <div className="w-full max-w-md bg-white rounded-2xl shadow-xl p-8">
      
      {/* LOGO / TITLE */}
      <h1 className="text-center text-3xl font-bold mb-6">
        <span className="text-red-600">JOLO</span>
        <span className="text-black">RIDE</span>
      </h1>

      {/* FORM */}
      <form className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-black">
            Email
          </label>
          <input
            type="email"
            placeholder="you@email.com"
            className="w-full mt-1 px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-black">
            Password
          </label>
          <input
            type="password"
            placeholder="••••••••"
            className="w-full mt-1 px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
          />
        </div>

        <button
          type="submit"
          className="w-full bg-black text-white py-2 rounded-lg hover:bg-gray-800 transition"
        >
          Login
        </button>
      </form>

      {/* REGISTER LINK */}
      <p className="text-center text-sm mt-6">
        Don’t have an account?{" "}
        <Link href="/register" className="text-orange-600 font-semibold">
          Register
        </Link>
      </p>
    </div>
  );
}
