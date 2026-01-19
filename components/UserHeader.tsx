"use client";

export default function UserHeader() {
  return (
    <header className="sticky top-0 z-40 bg-white border-b px-4 py-3">
      <input
        type="text"
        placeholder="Search stores or items..."
        className="w-full px-4 py-2 border rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500"
      />
    </header>
  );
}
