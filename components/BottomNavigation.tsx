"use client";

import { usePathname } from "next/navigation";
import Link from "next/link";
import { Home, ShoppingCart, Search, Settings, Utensils } from "lucide-react";

export default function BottomNavigation() {
  const pathname = usePathname();

  const navItems = [
    {
      href: "/user",
      label: "Food",
      icon: Utensils,
      active: pathname === "/user" || pathname === "/",
    },
    {
      href: "/user/stores",
      label: "Grocery",
      icon: Home,
      active: pathname === "/user/stores",
    },
    {
      href: "/user/search",
      label: "Search",
      icon: Search,
      active: pathname === "/user/search",
    },
    {
      href: "/user/cart",
      label: "Cart",
      icon: ShoppingCart,
      active: pathname === "/user/cart",
    },
    {
      href: "/user/settings",
      label: "Settings",
      icon: Settings,
      active: pathname === "/user/settings",
    },
  ];

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-white border-t z-50">
      <div className="flex justify-around items-center py-2">
        {navItems.map((item) => {
          const Icon = item.icon;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex flex-col items-center p-2 rounded-lg transition-colors ${
                item.active
                  ? "text-orange-600"
                  : "text-gray-400 hover:text-gray-600"
              }`}
            >
              <Icon size={20} />
              <span className="text-xs mt-1">{item.label}</span>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
