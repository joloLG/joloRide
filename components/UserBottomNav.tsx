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
    <nav className="fixed bottom-0 left-0 right-0 bg-white/80 backdrop-blur-lg border-t border-gray-100 z-50 safe-bottom">
      <div className="flex justify-around items-center h-16 max-w-7xl mx-auto">
        {navItems.map(({ href, label, icon: Icon }) => {
          const active = pathname === href;
          return (
            <Link
              key={href}
              href={href}
              className={`flex flex-col items-center justify-center w-full h-full gap-1 transition-all active:scale-90 ${
                active ? "text-orange-600" : "text-gray-400 hover:text-gray-600"
              }`}
            >
              <div className={`relative ${active ? "scale-110" : ""} transition-transform`}>
                <Icon size={20} strokeWidth={active ? 2.5 : 2} />
                {active && (
                  <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-1 h-1 bg-orange-600 rounded-full" />
                )}
              </div>
              <span className={`text-[10px] font-bold uppercase tracking-wider ${active ? "opacity-100" : "opacity-70"}`}>
                {label}
              </span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
