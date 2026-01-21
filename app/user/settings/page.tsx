// app/user/settings/page.tsx
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useUser } from "@/hooks/useUser";
import { supabase, updateUserProfile } from "@/lib/supabase";
import { toast } from "react-hot-toast";

export default function SettingsPage() {
  const { user, profile, isLoading } = useUser();
  const router = useRouter();
  const [isSaving, setIsSaving] = useState(false);
  const [formData, setFormData] = useState({
    full_name: profile?.full_name || "",
    mobile: profile?.mobile || "",
    address: profile?.address || "",
    email: user?.email || "",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    setIsSaving(true);
    try {
      await updateUserProfile(user.id, {
        full_name: formData.full_name,
        mobile: formData.mobile,
        address: formData.address,
      });
      toast.success("Profile updated successfully");
      router.refresh();
    } catch (error) {
      console.error("Error updating profile:", error);
      toast.error("Failed to update profile");
    } finally {
      setIsSaving(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    router.push("/login");
    toast.success("Signed out successfully");
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto p-4 pb-20 sm:pb-8">
      <div className="flex items-center justify-between mb-8 px-1">
        <h1 className="text-3xl font-extrabold text-gray-900">Settings</h1>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="bg-white shadow-sm border border-gray-100 rounded-3xl overflow-hidden p-6 sm:p-8">
          <h2 className="text-sm font-bold text-gray-400 uppercase tracking-wider mb-6">Profile Information</h2>
          <div className="space-y-5">
            <div>
              <label htmlFor="full_name" className="block text-xs font-bold text-gray-500 uppercase mb-1 ml-1">
                Full Name
              </label>
              <input
                type="text"
                id="full_name"
                name="full_name"
                value={formData.full_name}
                onChange={handleChange}
                placeholder="Enter your full name"
                className="block w-full rounded-2xl border-gray-200 shadow-sm focus:border-orange-500 focus:ring-orange-500 bg-gray-50/50 py-3 px-4"
              />
            </div>

            <div>
              <label htmlFor="email" className="block text-xs font-bold text-gray-500 uppercase mb-1 ml-1">
                Email Address
              </label>
              <div className="relative">
                <input
                  type="email"
                  id="email"
                  name="email"
                  value={formData.email}
                  disabled
                  className="block w-full rounded-2xl border-gray-200 bg-gray-100/50 text-gray-500 py-3 px-4 cursor-not-allowed"
                />
                <span className="absolute right-4 top-1/2 -translate-y-1/2 text-[10px] font-bold text-gray-400 bg-white px-2 py-0.5 rounded-full border">READ ONLY</span>
              </div>
            </div>

            <div>
              <label htmlFor="mobile" className="block text-xs font-bold text-gray-500 uppercase mb-1 ml-1">
                Mobile Number
              </label>
              <input
                type="tel"
                id="mobile"
                name="mobile"
                value={formData.mobile}
                onChange={handleChange}
                placeholder="+63 9XX XXX XXXX"
                className="block w-full rounded-2xl border-gray-200 shadow-sm focus:border-orange-500 focus:ring-orange-500 bg-gray-50/50 py-3 px-4"
              />
            </div>

            <div>
              <label htmlFor="address" className="block text-xs font-bold text-gray-500 uppercase mb-1 ml-1">
                Home Address
              </label>
              <textarea
                id="address"
                name="address"
                value={formData.address}
                onChange={handleChange}
                rows={3}
                placeholder="Enter your complete address"
                className="block w-full rounded-2xl border-gray-200 shadow-sm focus:border-orange-500 focus:ring-orange-500 bg-gray-50/50 py-3 px-4"
              />
            </div>
          </div>

          <div className="mt-8">
            <button
              type="submit"
              disabled={isSaving}
              className="w-full sm:w-auto inline-flex justify-center items-center gap-2 rounded-2xl bg-orange-600 py-3 px-8 text-sm font-bold text-white shadow-lg shadow-orange-100 hover:bg-orange-700 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:ring-offset-2 disabled:opacity-50 transition-all active:scale-95"
            >
              {isSaving ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-2 border-white/30 border-t-white" />
                  Saving...
                </>
              ) : (
                "Save Changes"
              )}
            </button>
          </div>
        </div>
      </form>

      <div className="mt-8 space-y-4">
        <h2 className="text-sm font-bold text-gray-400 uppercase tracking-wider mb-4 ml-1">Account Actions</h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <button
            onClick={() => router.push("/user/change-password")}
            className="flex items-center gap-4 bg-white p-4 rounded-3xl border border-gray-100 shadow-sm hover:border-orange-200 transition-colors text-left group"
          >
            <div className="bg-blue-50 text-blue-600 p-3 rounded-2xl group-hover:bg-blue-100 transition-colors text-xl">
              🔐
            </div>
            <div>
              <p className="font-bold text-gray-900 text-sm">Change Password</p>
              <p className="text-xs text-gray-500">Update security settings</p>
            </div>
          </button>

          <button
            onClick={handleSignOut}
            className="flex items-center gap-4 bg-white p-4 rounded-3xl border border-gray-100 shadow-sm hover:border-orange-200 transition-colors text-left group"
          >
            <div className="bg-orange-50 text-orange-600 p-3 rounded-2xl group-hover:bg-orange-100 transition-colors text-xl">
              🚪
            </div>
            <div>
              <p className="font-bold text-gray-900 text-sm">Sign Out</p>
              <p className="text-xs text-gray-500">Logout from this device</p>
            </div>
          </button>
        </div>

        <button
          onClick={() => router.push("/user/delete-account")}
          className="w-full mt-2 flex items-center justify-between p-4 px-6 rounded-3xl bg-red-50 text-red-600 hover:bg-red-100 transition-colors group"
        >
          <div className="flex items-center gap-3">
            <span className="text-lg">⚠️</span>
            <span className="font-bold text-sm">Delete Account</span>
          </div>
          <span className="text-xs font-medium opacity-60 group-hover:opacity-100 transition-opacity italic">Permanently remove all data</span>
        </button>
      </div>

      <p className="text-center text-[10px] text-gray-400 font-medium mt-12 uppercase tracking-[0.2em]">
        JoloRide v1.0.0 &bull; &copy; 2026
      </p>
    </div>
  );
}