"use client";

import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { useUser } from "@/hooks/useUser";
import StoreManagement from "@/components/admin/StoreManagement";
import ProductManagement from "@/components/admin/ProductManagement";
import RiderManagement from "@/components/admin/RiderManagement";
import DeliveryFeeManagement from "@/components/admin/DeliveryFeeManagement";
import HeroSettingsManagement from "@/components/admin/HeroSettingsManagement";
import DashboardStats from "@/components/admin/DashboardStats";
import { LayoutDashboard, Store, Package, Bike, Banknote, Palette, LogOut, Menu, X } from "lucide-react";

type TabType = "dashboard" | "stores" | "products" | "riders" | "delivery-fees" | "hero-settings";

export default function AdminPage() {
  const { user, profile, isLoading: isUserLoading } = useUser();
  const [activeTab, setActiveTab] = useState<TabType>("dashboard");
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);

  useEffect(() => {
    if (!isUserLoading && profile && profile.role !== "admin") {
      window.location.href = "/";
    }
  }, [profile, isUserLoading]);

  if (isUserLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-white">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-orange-600"></div>
      </div>
    );
  }

  if (!user || !profile || profile.role !== "admin") {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-white p-4">
        <div className="text-6xl mb-4">🚫</div>
        <h2 className="text-2xl font-black text-gray-900 mb-2">Access Denied</h2>
        <p className="text-gray-500 font-medium">You don&apos;t have permission to access the Admin Panel.</p>
      </div>
    );
  }

  const tabs = [
    { id: "dashboard", label: "Dashboard", icon: LayoutDashboard },
    { id: "stores", label: "Stores", icon: Store },
    { id: "products", label: "Products", icon: Package },
    { id: "riders", label: "Riders", icon: Bike },
    { id: "delivery-fees", label: "Delivery Fees", icon: Banknote },
    { id: "hero-settings", label: "Hero Settings", icon: Palette },
  ];

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    window.location.href = "/login";
  };

  const renderContent = () => {
    switch (activeTab) {
      case "dashboard":
        return <DashboardStats />;
      case "stores":
        return <StoreManagement />;
      case "products":
        return <ProductManagement />;
      case "riders":
        return <RiderManagement />;
      case "delivery-fees":
        return <DeliveryFeeManagement />;
      case "hero-settings":
        return <HeroSettingsManagement />;
      default:
        return <DashboardStats />;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* Mobile Header */}
      <header className="lg:hidden bg-white border-b px-4 h-16 flex items-center justify-between sticky top-0 z-50 shadow-sm shadow-gray-100/50">
        <div className="flex items-center gap-2">
          <button 
            onClick={() => setIsSidebarOpen(!isSidebarOpen)}
            className="p-2 rounded-xl bg-gray-50 text-gray-600"
          >
            {isSidebarOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
          <span className="text-xl font-black text-gray-900 tracking-tighter">Admin Panel</span>
        </div>
        <div className="w-8 h-8 rounded-full bg-orange-100 flex items-center justify-center text-orange-600 font-black text-xs">
          {profile.full_name?.[0] || "A"}
        </div>
      </header>

      <div className="flex flex-1 relative">
        {/* Sidebar */}
        <aside className={`
          fixed lg:sticky top-16 lg:top-0 h-[calc(100vh-4rem)] lg:h-screen w-72 bg-white border-r border-gray-100 z-40 transition-transform duration-300 ease-in-out
          ${isSidebarOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"}
        `}>
          <div className="p-6 h-full flex flex-col">
            <div className="hidden lg:flex items-center gap-2 mb-10">
              <div className="w-10 h-10 bg-orange-600 rounded-2xl flex items-center justify-center shadow-lg shadow-orange-100">
                <span className="text-white text-xl">🛡️</span>
              </div>
              <span className="text-2xl font-black text-gray-900 tracking-tighter">JoloRide <span className="text-orange-600">Admin</span></span>
            </div>

            <nav className="flex-1 space-y-1">
              {tabs.map((tab) => {
                const Icon = tab.icon;
                const isActive = activeTab === tab.id;
                return (
                  <button
                    key={tab.id}
                    onClick={() => {
                      setActiveTab(tab.id as TabType);
                      if (window.innerWidth < 1024) setIsSidebarOpen(false);
                    }}
                    className={`
                      w-full flex items-center gap-3 px-4 py-3.5 rounded-2xl text-sm font-bold tracking-tight transition-all active:scale-[0.98]
                      ${isActive 
                        ? "bg-orange-600 text-white shadow-lg shadow-orange-100" 
                        : "text-gray-500 hover:bg-gray-50 hover:text-gray-900"}
                    `}
                  >
                    <Icon size={20} strokeWidth={isActive ? 3 : 2} />
                    {tab.label}
                  </button>
                );
              })}
            </nav>

            <div className="mt-auto pt-6 border-t border-gray-50">
              <div className="flex items-center gap-3 px-4 py-3 mb-4 bg-gray-50 rounded-2xl border border-gray-100">
                <div className="w-10 h-10 rounded-xl bg-white border-2 border-white shadow-sm flex items-center justify-center text-orange-600 font-black">
                  {profile.full_name?.[0] || "A"}
                </div>
                <div className="min-w-0">
                  <p className="text-sm font-black text-gray-900 truncate">{profile.full_name}</p>
                  <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Administrator</p>
                </div>
              </div>
              <button
                onClick={handleSignOut}
                className="w-full flex items-center gap-3 px-4 py-3.5 rounded-2xl text-sm font-bold text-red-500 hover:bg-red-50 transition-colors active:scale-[0.98]"
              >
                <LogOut size={20} strokeWidth={2.5} />
                Sign Out
              </button>
            </div>
          </div>
        </aside>

        {/* Backdrop for mobile */}
        {isSidebarOpen && (
          <div 
            className="fixed inset-0 bg-black/20 backdrop-blur-sm z-30 lg:hidden"
            onClick={() => setIsSidebarOpen(false)}
          />
        )}

        {/* Main Content */}
        <main className="flex-1 p-4 sm:p-8 lg:p-10 max-w-7xl mx-auto w-full">
          <div className="mb-8 hidden lg:block">
            <h2 className="text-3xl font-black text-gray-900 tracking-tight capitalize">
              {activeTab.replace('-', ' ')}
            </h2>
            <p className="text-gray-500 font-medium mt-1">Manage your platform data and settings from here.</p>
          </div>
          
          <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
            {renderContent()}
          </div>
        </main>
      </div>
    </div>
  );
}
