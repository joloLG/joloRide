"use client";

import { 
  Palette, 
  Image as ImageIcon, 
  Type, 
  AlignLeft, 
  RotateCcw, 
  Save, 
  Eye, 
  Sparkles, 
  Layout
} from "lucide-react";
import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/lib/supabase";
import { toast } from "react-hot-toast";

interface HeroSettings {
  id: string;
  background_color: string;
  background_image?: string;
  title?: string;
  subtitle?: string;
  created_at: string;
}

export default function HeroSettingsManagement() {
  const [heroSettings, setHeroSettings] = useState<HeroSettings | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [formData, setFormData] = useState({
    background_color: "#3B82F6",
    background_image: "",
    title: "",
    subtitle: "",
  });

  const fetchHeroSettings = useCallback(async () => {
    try {
      setIsLoading(true);
      const { data, error } = await supabase
        .from("hero_settings")
        .select("*")
        .single();

      if (error && error.code !== "PGRST116") {
        throw error;
      }

      if (data) {
        setHeroSettings(data);
        setFormData({
          background_color: data.background_color,
          background_image: data.background_image || "",
          title: data.title || "",
          subtitle: data.subtitle || "",
        });
      }
    } catch (error) {
      console.error("Error fetching hero settings:", error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchHeroSettings();
  }, [fetchHeroSettings]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    try {
      const settingsData = {
        background_color: formData.background_color,
        background_image: formData.background_image || null,
        title: formData.title || null,
        subtitle: formData.subtitle || null,
      };

      if (heroSettings) {
        // Update existing settings
        const { error } = await supabase
          .from("hero_settings")
          .update(settingsData)
          .eq("id", heroSettings.id);
        if (error) throw error;
        toast.success("Hero banner updated");
      } else {
        // Create new settings
        const { error } = await supabase.from("hero_settings").insert(settingsData);
        if (error) throw error;
        toast.success("Hero banner created");
      }

      await fetchHeroSettings();
    } catch (error) {
      console.error("Error saving hero settings:", error);
      toast.error("Failed to save settings");
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 px-1">
        <div>
          <h2 className="text-2xl font-black text-gray-900 tracking-tight">Hero Banner</h2>
          <p className="text-sm font-medium text-gray-500">Customize the welcome experience for users</p>
        </div>
        <div className="flex items-center gap-2 bg-orange-50 px-4 py-2 rounded-2xl border border-orange-100">
          <Sparkles size={16} className="text-orange-600" />
          <span className="text-xs font-black text-orange-600 uppercase tracking-widest">Global Branding</span>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
        {/* Settings Form */}
        <div className="bg-white rounded-[2.5rem] border border-gray-100 p-8 shadow-sm">
          <div className="flex items-center gap-3 mb-8">
            <div className="w-10 h-10 rounded-xl bg-orange-50 flex items-center justify-center text-orange-600">
              <Layout size={20} />
            </div>
            <h3 className="text-xl font-black text-gray-900 tracking-tight">Banner Content</h3>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-5">
              <div>
                <label className="block text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] mb-2 ml-1">
                  Main Title
                </label>
                <div className="relative">
                  <Type className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
                  <input
                    type="text"
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    className="w-full pl-11 pr-4 py-3 bg-gray-50 border-none rounded-2xl text-sm font-bold placeholder:text-gray-400 focus:ring-2 focus:ring-orange-500 transition-all"
                    placeholder="e.g. Delicious Food Delivered"
                    maxLength={100}
                  />
                </div>
                <div className="flex justify-end mt-1 px-1">
                  <span className={`text-[10px] font-bold ${formData.title.length > 90 ? 'text-red-500' : 'text-gray-400'}`}>
                    {formData.title.length}/100
                  </span>
                </div>
              </div>

              <div>
                <label className="block text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] mb-2 ml-1">
                  Subtitle / Description
                </label>
                <div className="relative">
                  <AlignLeft className="absolute left-4 top-4 text-gray-400" size={16} />
                  <textarea
                    value={formData.subtitle}
                    onChange={(e) => setFormData({ ...formData, subtitle: e.target.value })}
                    rows={3}
                    className="w-full pl-11 pr-4 py-3 bg-gray-50 border-none rounded-2xl text-sm font-bold placeholder:text-gray-400 focus:ring-2 focus:ring-orange-500 transition-all"
                    placeholder="e.g. Order from your favorite local stores"
                    maxLength={200}
                  />
                </div>
                <div className="flex justify-end mt-1 px-1">
                  <span className={`text-[10px] font-bold ${formData.subtitle.length > 180 ? 'text-red-500' : 'text-gray-400'}`}>
                    {formData.subtitle.length}/200
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div>
                  <label className="block text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] mb-2 ml-1">
                    Background Color
                  </label>
                  <div className="flex gap-2">
                    <input
                      type="color"
                      value={formData.background_color}
                      onChange={(e) => setFormData({ ...formData, background_color: e.target.value })}
                      className="h-[44px] w-14 bg-gray-50 border-none rounded-xl cursor-pointer p-1"
                    />
                    <div className="relative flex-1">
                      <Palette className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
                      <input
                        type="text"
                        value={formData.background_color}
                        onChange={(e) => setFormData({ ...formData, background_color: e.target.value })}
                        className="w-full pl-11 pr-4 py-3 bg-gray-50 border-none rounded-2xl text-sm font-bold focus:ring-2 focus:ring-orange-500 transition-all uppercase"
                        placeholder="#FFFFFF"
                      />
                    </div>
                  </div>
                </div>

                <div>
                  <label className="block text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] mb-2 ml-1">
                    Background Image URL
                  </label>
                  <div className="relative">
                    <ImageIcon className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
                    <input
                      type="url"
                      value={formData.background_image}
                      onChange={(e) => setFormData({ ...formData, background_image: e.target.value })}
                      className="w-full pl-11 pr-4 py-3 bg-gray-50 border-none rounded-2xl text-sm font-bold placeholder:text-gray-400 focus:ring-2 focus:ring-orange-500 transition-all"
                      placeholder="https://images.unsplash.com/..."
                    />
                  </div>
                </div>
              </div>
            </div>

            <div className="flex gap-3 pt-4">
              <button
                type="button"
                onClick={() => {
                  setFormData({
                    background_color: "#3B82F6",
                    background_image: "",
                    title: "",
                    subtitle: "",
                  });
                }}
                className="flex-1 px-6 py-4 bg-gray-100 text-gray-600 rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-gray-200 transition-all flex items-center justify-center gap-2"
              >
                <RotateCcw size={16} strokeWidth={3} />
                <span>Reset</span>
              </button>
              <button
                type="submit"
                disabled={isSaving}
                className="flex-2 px-6 py-4 bg-orange-600 text-white rounded-2xl font-black text-xs uppercase tracking-widest shadow-lg shadow-orange-100 hover:bg-orange-700 transition-all active:scale-95 flex items-center justify-center gap-2 disabled:opacity-50"
              >
                {isSaving ? (
                  <div className="animate-spin rounded-full h-4 w-4 border-2 border-white/30 border-t-white" />
                ) : (
                  <Save size={16} strokeWidth={3} />
                )}
                <span>Save Changes</span>
              </button>
            </div>
          </form>
        </div>

        {/* Live Preview */}
        <div className="space-y-6">
          <div className="flex items-center justify-between px-1">
            <h3 className="text-xl font-black text-gray-900 tracking-tight flex items-center gap-2">
              <Eye size={20} className="text-orange-600" />
              Live Preview
            </h3>
            <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest bg-white border border-gray-100 px-3 py-1 rounded-full">Device View</span>
          </div>

          <div className="bg-gray-900 rounded-[3rem] p-4 shadow-2xl border-8 border-gray-800 relative mx-auto max-w-[320px]">
            {/* Phone Speaker/Camera Notch */}
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-32 h-6 bg-gray-800 rounded-b-2xl z-20" />
            
            <div className="bg-white rounded-[2rem] overflow-hidden h-[560px] flex flex-col relative">
              {/* Fake App Bar */}
              <div className="h-12 flex items-center justify-between px-6 border-b border-gray-50 shrink-0">
                <div className="flex items-center gap-1">
                  <span className="text-xs">⚡</span>
                  <span className="text-[10px] font-black tracking-tighter">JoloRide</span>
                </div>
                <div className="w-6 h-6 rounded-full bg-orange-100" />
              </div>

              <div className="flex-1 overflow-y-auto overflow-x-hidden">
                {/* HERO PREVIEW */}
                <div
                  className="h-48 flex flex-col justify-center px-8 text-white relative transition-all duration-500"
                  style={{
                    backgroundColor: formData.background_color,
                    backgroundImage: formData.background_image
                      ? `url(${formData.background_image})`
                      : 'none',
                    backgroundSize: 'cover',
                    backgroundPosition: 'center',
                  }}
                >
                  {formData.background_image && (
                    <div className="absolute inset-0 bg-black/30 backdrop-blur-[1px]"></div>
                  )}
                  <div className="relative z-10 animate-in fade-in slide-in-from-left-4 duration-700">
                    <h1 className="text-2xl font-black leading-tight mb-1 drop-shadow-md">
                      {formData.title || "Your Title Here"}
                    </h1>
                    <p className="text-[10px] font-bold opacity-90 leading-tight drop-shadow-sm max-w-[160px]">
                      {formData.subtitle || "Your subtitle will appear here briefly explaining your message."}
                    </p>
                    <div className="mt-4 px-4 py-1.5 bg-white text-gray-900 rounded-full text-[8px] font-black uppercase tracking-widest w-fit shadow-sm">
                      Order Now
                    </div>
                  </div>
                </div>

                {/* Fake Content Skeleton */}
                <div className="p-6 space-y-6">
                  <div className="space-y-3">
                    <div className="flex justify-between items-center px-1">
                      <div className="h-3 w-20 bg-gray-100 rounded-full" />
                      <div className="h-2 w-10 bg-gray-50 rounded-full" />
                    </div>
                    <div className="flex gap-3 overflow-hidden">
                      {[1, 2, 3].map(i => (
                        <div key={i} className="shrink-0 w-24 h-24 bg-gray-50 rounded-2xl border border-gray-100 p-2 flex flex-col gap-2">
                          <div className="flex-1 bg-white rounded-lg shadow-sm" />
                          <div className="h-2 w-12 bg-gray-100 rounded-full" />
                        </div>
                      ))}
                    </div>
                  </div>
                  
                  <div className="space-y-3">
                    <div className="flex justify-between items-center px-1">
                      <div className="h-3 w-24 bg-gray-100 rounded-full" />
                      <div className="h-2 w-10 bg-gray-50 rounded-full" />
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      {[1, 2].map(i => (
                        <div key={i} className="bg-gray-50 rounded-2xl border border-gray-100 p-2 h-28 flex flex-col gap-2">
                          <div className="flex-1 bg-white rounded-xl shadow-sm" />
                          <div className="h-2 w-16 bg-gray-100 rounded-full" />
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              {/* Fake Bottom Nav */}
              <div className="h-14 bg-white/80 backdrop-blur-md border-t border-gray-100 flex items-center justify-around px-4 shrink-0">
                {[1, 2, 3, 4].map(i => (
                  <div key={i} className={`w-6 h-6 rounded-lg ${i === 1 ? 'bg-orange-600' : 'bg-gray-100'}`} />
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Quick Templates */}
      <div className="bg-white rounded-[2.5rem] border border-gray-100 p-8 shadow-sm">
        <h3 className="text-xl font-black text-gray-900 tracking-tight mb-6">Quick Styles</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {[
            {
              id: "blue",
              label: "Default Blue",
              desc: "Professional & clean",
              color: "#3B82F6",
              title: "Welcome to JoloRide",
              subtitle: "Your favorite delivery service in Bulan, Sorsogon"
            },
            {
              id: "green",
              label: "Fresh Green",
              desc: "Healthy & organic",
              color: "#10B981",
              title: "Fast & Fresh Delivery",
              subtitle: "Fresh groceries delivered straight to your door"
            },
            {
              id: "orange",
              label: "Warm Amber",
              desc: "Appetizing & cozy",
              color: "#F59E0B",
              title: "Craving Something?",
              subtitle: "Best food in town at your fingertips"
            }
          ].map((tpl) => (
            <button
              key={tpl.id}
              onClick={() => setFormData({
                background_color: tpl.color,
                background_image: "",
                title: tpl.title,
                subtitle: tpl.subtitle,
              })}
              className="p-5 border border-gray-100 rounded-3xl text-left hover:border-orange-200 transition-all hover:shadow-md group active:scale-[0.98]"
            >
              <div className="flex items-center gap-3 mb-3">
                <div 
                  className="h-10 w-10 rounded-xl shadow-sm border-2 border-white"
                  style={{ backgroundColor: tpl.color }}
                />
                <div>
                  <h4 className="font-black text-gray-900 leading-tight">{tpl.label}</h4>
                  <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">{tpl.desc}</p>
                </div>
              </div>
              <div className="h-1.5 w-full bg-gray-50 rounded-full overflow-hidden">
                <div className="h-full bg-orange-100 w-0 group-hover:w-full transition-all duration-700" />
              </div>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
