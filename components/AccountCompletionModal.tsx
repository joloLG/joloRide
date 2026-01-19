"use client";

import { useState } from "react";
import { supabase } from "@/lib/supabase";

export default function AccountCompletionModal({
  userId,
  onComplete,
}: {
  userId: string;
  onComplete: () => void;
}) {
  const [form, setForm] = useState({
    full_name: "",
    mobile: "",
    address: "",
  });

  const saveProfile = async () => {
    await supabase.from("profiles").update(form).eq("id", userId);
    onComplete();
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-xl p-4 w-full max-w-md">
        <h2 className="font-bold mb-2">
          Complete Account Information
        </h2>

        <input
          placeholder="Full Name"
          className="input"
          onChange={(e) => setForm({ ...form, full_name: e.target.value })}
        />
        <input
          placeholder="Mobile Number"
          className="input mt-2"
          onChange={(e) => setForm({ ...form, mobile: e.target.value })}
        />
        <textarea
          placeholder="Complete Address"
          className="input mt-2"
          onChange={(e) => setForm({ ...form, address: e.target.value })}
        />

        <button
          onClick={saveProfile}
          className="w-full bg-black text-white py-3 rounded-xl mt-4"
        >
          Save Information
        </button>
      </div>
    </div>
  );
}
