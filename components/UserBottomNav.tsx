"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, ShoppingCart, Search, Settings, Store } from "lucide-react";

const navItems = [
  { href: "/user", label: "Food", icon: Home },
  { href: "/user/grocery", label: "Grocery", icon: Store },
  { href: "/user/search", label: "Search", icon: Search },
  { href: "/user/cart", label: "Cart", icon: ShoppingCart },
  { href: "/user/settings", label: "Settings", icon: Settings },
];

export default function UserBottomNav() {
  const pathname = usePathname();

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-white border-t z-50">
      <div className="flex justify-around items-center h-16">
        {navItems.map(({ href, label, icon: Icon }) => {
          const active = pathname === href;
          return (
            <Link
              key={href}
              href={href}
              className={`flex flex-col items-center text-xs ${
                active ? "text-orange-600" : "text-gray-500"
              }`}
            >
              <Icon size={22} />
              <span>{label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
