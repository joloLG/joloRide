"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { toast } from "react-hot-toast";
import { ArrowLeft, AlertTriangle, Trash2 } from "lucide-react";

export default function DeleteAccountPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [confirmation, setConfirmation] = useState("");
  const [showConfirmation, setShowConfirmation] = useState(false);

  const handleDeleteAccount = async () => {
    if (confirmation !== "DELETE") {
      toast.error("Please type DELETE to confirm");
      return;
    }

    setIsLoading(true);

    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        throw new Error("User not found");
      }

      // Delete user's profile first
      const { error: profileError } = await supabase
        .from("profiles")
        .delete()
        .or(`id.eq.${user.id},user_id.eq.${user.id}`);

      if (profileError) {
        console.error("Error deleting profile:", profileError);
      }

      // Delete user's auth account
      const { error: authError } = await supabase.auth.admin.deleteUser(
        user.id
      );

      if (authError) {
        // If admin deletion fails, try regular sign out
        await supabase.auth.signOut();
        toast.warning("Account deletion initiated. Please contact support for complete removal.");
      } else {
        toast.success("Account deleted successfully");
      }

      // Redirect to home after deletion
      setTimeout(() => {
        router.push("/");
      }, 2000);

    } catch (error) {
      console.error("Error deleting account:", error);
      toast.error("Failed to delete account. Please contact support.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* HEADER */}
      <div className="bg-white border-b sticky top-0 z-10">
        <div className="flex items-center p-4">
          <button
            onClick={() => router.back()}
            className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
          >
            <ArrowLeft size={20} />
          </button>
          <h1 className="text-lg font-semibold ml-3 text-red-600">Delete Account</h1>
        </div>
      </div>

      {/* CONTENT */}
      <div className="p-4">
        <div className="max-w-md mx-auto">
          {/* WARNING CARD */}
          <div className="bg-red-50 border border-red-200 rounded-xl p-6 mb-6">
            <div className="flex items-start gap-3">
              <AlertTriangle className="text-red-600 mt-1 flex-shrink-0" size={24} />
              <div>
                <h2 className="text-lg font-semibold text-red-900 mb-2">
                  This action cannot be undone
                </h2>
                <p className="text-red-800 text-sm leading-relaxed">
                  Deleting your account will permanently remove:
                </p>
                <ul className="mt-3 space-y-1 text-sm text-red-800">
                  <li>• Your profile information</li>
                  <li>• Order history</li>
                  <li>• Saved addresses</li>
                  <li>• All account data</li>
                </ul>
              </div>
            </div>
          </div>

          {/* ALTERNATIVES */}
          <div className="bg-white rounded-xl shadow-sm p-6 mb-6">
            <h3 className="font-semibold text-gray-900 mb-3">Before you go...</h3>
            <div className="space-y-3">
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
                  <span className="text-blue-600 font-semibold text-sm">1</span>
                </div>
                <div>
                  <h4 className="font-medium text-gray-900">Having issues?</h4>
                  <p className="text-sm text-gray-600">
                    Contact our support team for help with any problems.
                  </p>
                </div>
              </div>
              
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
                  <span className="text-blue-600 font-semibold text-sm">2</span>
                </div>
                <div>
                  <h4 className="font-medium text-gray-900">Take a break</h4>
                  <p className="text-sm text-gray-600">
                    You can sign out and return anytime without losing your data.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
                  <span className="text-blue-600 font-semibold text-sm">3</span>
                </div>
                <div>
                  <h4 className="font-medium text-gray-900">Update preferences</h4>
                  <p className="text-sm text-gray-600">
                    Adjust your notification settings or profile information.
                  </p>
                </div>
              </div>
            </div>

            <div className="mt-4 pt-4 border-t">
              <button
                onClick={() => router.push("/user/settings")}
                className="w-full bg-blue-600 text-white py-2 rounded-lg font-medium hover:bg-blue-700 transition-colors"
              >
                Go to Settings Instead
              </button>
            </div>
          </div>

          {/* DELETE SECTION */}
          {!showConfirmation ? (
            <div className="bg-white rounded-xl shadow-sm p-6">
              <button
                onClick={() => setShowConfirmation(true)}
                className="w-full bg-red-600 text-white py-3 rounded-lg font-medium hover:bg-red-700 transition-colors flex items-center justify-center gap-2"
              >
                <Trash2 size={20} />
                Delete My Account
              </button>
            </div>
          ) : (
            <div className="bg-white rounded-xl shadow-sm p-6">
              <h3 className="font-semibold text-gray-900 mb-4">Final Confirmation</h3>
              
              <p className="text-sm text-gray-600 mb-4">
                To permanently delete your account, type <span className="font-bold">DELETE</span> in the box below:
              </p>

              <input
                type="text"
                value={confirmation}
                onChange={(e) => setConfirmation(e.target.value)}
                placeholder="Type DELETE"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 mb-4"
              />

              <div className="flex gap-3">
                <button
                  onClick={() => {
                    setShowConfirmation(false);
                    setConfirmation("");
                  }}
                  className="flex-1 bg-gray-200 text-gray-800 py-2 rounded-lg font-medium hover:bg-gray-300 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleDeleteAccount}
                  disabled={isLoading || confirmation !== "DELETE"}
                  className="flex-1 bg-red-600 text-white py-2 rounded-lg font-medium hover:bg-red-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  {isLoading ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-white"></div>
                      Deleting...
                    </>
                  ) : (
                    <>
                      <Trash2 size={16} />
                      Delete Forever
                    </>
                  )}
                </button>
              </div>
            </div>
          )}

          {/* FOOTER */}
          <div className="mt-6 text-center">
            <p className="text-xs text-gray-500">
              If you change your mind, you can always close this window.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
