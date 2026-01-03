"use client";

import Link from "next/link";

export default function RegisterPage() {
  return (
    <div className="w-full max-w-md bg-white rounded-2xl shadow-xl p-8">

      {/* TITLE */}
      <h1 className="text-center text-3xl font-bold mb-6">
        <span className="text-red-600">JOLO</span>
        <span className="text-black">RIDE</span>
      </h1>

      {/* FORM */}
      <form className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-black">
            Mobile Number
          </label>
          <input
            type="text"
            placeholder="09XXXXXXXXX"
            className="w-full mt-1 px-4 py-2 border rounded-lg focus:ring-orange-500 focus:outline-none"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-black">
            Email Address
          </label>
          <input
            type="email"
            className="w-full mt-1 px-4 py-2 border rounded-lg focus:ring-orange-500 focus:outline-none"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-black">
            Password
          </label>
          <input
            type="password"
            className="w-full mt-1 px-4 py-2 border rounded-lg focus:ring-orange-500 focus:outline-none"
          />
        </div>

        <button
          type="submit"
          className="w-full bg-black text-white py-2 rounded-lg hover:bg-gray-800 transition"
        >
          Register
        </button>
      </form>

      {/* LOGIN LINK */}
      <p className="text-center text-sm mt-6">
        Already have an account?{" "}
        <Link href="/login" className="text-orange-600 font-semibold">
          Login
        </Link>
      </p>
    </div>
  );
}
