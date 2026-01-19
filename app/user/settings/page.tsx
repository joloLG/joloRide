// app/user/settings/page.tsx
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useUser } from "@/hooks/useUser";
import { updateUserProfile } from "@/lib/supabase";
import { toast } from "react-hot-toast";

export default function SettingsPage() {
  const { user, profile, isLoading } = useUser();
  const router = useRouter();
  const [isSaving, setIsSaving] = useState(false);
  const [formData, setFormData] = useState({
    full_name: profile?.full_name || "",
    phone: profile?.phone || "",
    email: user?.email || "",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    setIsSaving(true);
    try {
      await updateUserProfile(user.id, {
        full_name: formData.full_name,
        phone: formData.phone,
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

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto p-4">
      <h1 className="text-2xl font-bold mb-6">Account Settings</h1>
      
      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <h2 className="text-lg font-medium mb-4">Profile Information</h2>
          <div className="bg-white shadow rounded-lg p-6 space-y-4">
            <div>
              <label htmlFor="full_name" className="block text-sm font-medium text-gray-700">
                Full Name
              </label>
              <input
                type="text"
                id="full_name"
                name="full_name"
                value={formData.full_name}
                onChange={handleChange}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              />
            </div>

            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                Email
              </label>
              <input
                type="email"
                id="email"
                name="email"
                value={formData.email}
                disabled
                className="mt-1 block w-full rounded-md border-gray-300 bg-gray-100 shadow-sm"
              />
              <p className="mt-1 text-sm text-gray-500">Contact support to change your email</p>
            </div>

            <div>
              <label htmlFor="phone" className="block text-sm font-medium text-gray-700">
                Phone Number
              </label>
              <input
                type="tel"
                id="phone"
                name="phone"
                value={formData.phone}
                onChange={handleChange}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              />
            </div>
          </div>
        </div>

        <div className="pt-4">
          <button
            type="submit"
            disabled={isSaving}
            className="inline-flex justify-center rounded-md border border-transparent bg-blue-600 py-2 px-4 text-sm font-medium text-white shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50"
          >
            {isSaving ? "Saving..." : "Save Changes"}
          </button>
        </div>
      </form>

      <div className="mt-10">
        <h2 className="text-lg font-medium mb-4">Account Actions</h2>
        <div className="bg-white shadow rounded-lg p-6 space-y-4">
          <div>
            <h3 className="text-md font-medium text-gray-900">Change Password</h3>
            <p className="text-sm text-gray-500 mt-1">
              Update your password for enhanced security
            </p>
            <button
              onClick={() => router.push("/user/change-password")}
              className="mt-2 text-sm text-blue-600 hover:text-blue-800"
            >
              Change Password
            </button>
          </div>

          <div className="pt-4 border-t border-gray-200">
            <h3 className="text-md font-medium text-gray-900">Delete Account</h3>
            <p className="text-sm text-gray-500 mt-1">
              Permanently delete your account and all associated data
            </p>
            <button
              onClick={() => router.push("/user/delete-account")}
              className="mt-2 text-sm text-red-600 hover:text-red-800"
            >
              Delete Account
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}