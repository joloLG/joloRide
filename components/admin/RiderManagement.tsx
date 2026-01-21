"use client";

import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/lib/supabase";
import { 
  Plus, 
  Edit2, 
  Trash2, 
  User as UserIcon, 
  Phone, 
  Mail, 
  CheckCircle, 
  XCircle, 
  TrendingUp, 
  Bike, 
  Wallet,
  X,
  LucideIcon
} from "lucide-react";

interface Rider {
  id: string;
  full_name: string;
  mobile: string;
  email: string;
  is_active: boolean;
  daily_quota: number;
  total_deliveries: number;
  total_earnings: number;
  created_at: string;
}

interface RiderStats {
  total_riders: number;
  active_riders: number;
  total_deliveries: number;
  total_earnings: number;
}

export default function RiderManagement() {
  const [riders, setRiders] = useState<Rider[]>([]);
  const [stats, setStats] = useState<RiderStats>({
    total_riders: 0,
    active_riders: 0,
    total_deliveries: 0,
    total_earnings: 0,
  });
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingRider, setEditingRider] = useState<Rider | null>(null);
  const [formData, setFormData] = useState({
    full_name: "",
    mobile: "",
    email: "",
    daily_quota: 10,
  });

  const fetchRiders = useCallback(async () => {
    try {
      setIsLoading(true);
      const { data, error } = await supabase
        .from("profiles")
        .select("*")
        .eq("role", "rider")
        .order("created_at", { ascending: false });

      if (error) throw error;

      const ridersData = data || [];
      setRiders(ridersData);

      // Calculate stats
      const riderStats = ridersData.reduce(
        (acc, rider) => {
          acc.total_riders++;
          if (rider.is_active) acc.active_riders++;
          acc.total_deliveries += rider.total_deliveries || 0;
          acc.total_earnings += rider.total_earnings || 0;
          return acc;
        },
        {
          total_riders: 0,
          active_riders: 0,
          total_deliveries: 0,
          total_earnings: 0,
        }
      );

      setStats(riderStats);
    } catch (error) {
      console.error("Error fetching riders:", error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchRiders();
  }, [fetchRiders]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingRider) {
        // Update existing rider
        const { error } = await supabase
          .from("profiles")
          .update({
            full_name: formData.full_name,
            mobile: formData.mobile,
            daily_quota: formData.daily_quota,
          })
          .eq("id", editingRider.id);
        if (error) throw error;
      } else {
        // Create new rider (this would typically involve creating an auth user first)
        const { error } = await supabase.from("profiles").insert({
          full_name: formData.full_name,
          mobile: formData.mobile,
          email: formData.email,
          role: "rider",
          daily_quota: formData.daily_quota,
          is_active: true,
          total_deliveries: 0,
          total_earnings: 0,
        });
        if (error) throw error;
      }

      await fetchRiders();
      setIsModalOpen(false);
      setEditingRider(null);
      setFormData({
        full_name: "",
        mobile: "",
        email: "",
        daily_quota: 10,
      });
    } catch (error) {
      console.error("Error saving rider:", error);
    }
  };

  const handleEdit = (rider: Rider) => {
    setEditingRider(rider);
    setFormData({
      full_name: rider.full_name,
      mobile: rider.mobile,
      email: rider.email,
      daily_quota: rider.daily_quota || 10,
    });
    setIsModalOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (confirm("Are you sure you want to delete this rider?")) {
      try {
        const { error } = await supabase.from("profiles").delete().eq("id", id);
        if (error) throw error;
        await fetchRiders();
      } catch (error) {
        console.error("Error deleting rider:", error);
      }
    }
  };

  const toggleActiveStatus = async (id: string, isActive: boolean) => {
    try {
      const { error } = await supabase
        .from("profiles")
        .update({ is_active: !isActive })
        .eq("id", id);
      if (error) throw error;
      await fetchRiders();
    } catch (error) {
      console.error("Error updating rider:", error);
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
          <h2 className="text-2xl font-black text-gray-900 tracking-tight">Riders</h2>
          <p className="text-sm font-medium text-gray-500">Manage and monitor delivery personnel</p>
        </div>
        <button
          onClick={() => {
            setEditingRider(null);
            setFormData({
              full_name: "",
              mobile: "",
              email: "",
              daily_quota: 10,
            });
            setIsModalOpen(true);
          }}
          className="w-full sm:w-auto px-6 py-3 bg-orange-600 text-white rounded-2xl font-bold text-sm shadow-lg shadow-orange-100 hover:bg-orange-700 transition-all active:scale-95 flex items-center justify-center gap-2"
        >
          <Plus size={18} strokeWidth={3} />
          <span>Add New Rider</span>
        </button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {[
          { label: "Total Riders", value: stats.total_riders, icon: Bike, color: "blue" },
          { label: "Active Now", value: stats.active_riders, icon: CheckCircle, color: "green" },
          { label: "Total Deliveries", value: stats.total_deliveries, icon: TrendingUp, color: "purple" },
          { label: "Total Payouts", value: `₱${stats.total_earnings.toLocaleString()}`, icon: Wallet, color: "orange" },
        ].map((item: { label: string; value: string | number; icon: LucideIcon; color: string }, i) => (
          <div key={i} className="bg-white p-6 rounded-[2rem] border border-gray-100 shadow-sm group hover:shadow-md transition-all">
            <div className="flex items-center gap-4">
              <div className={`w-14 h-14 rounded-2xl flex items-center justify-center text-xl transition-transform group-hover:scale-110 ${
                item.color === 'blue' ? 'bg-blue-50 text-blue-600' :
                item.color === 'green' ? 'bg-green-50 text-green-600' :
                item.color === 'purple' ? 'bg-purple-50 text-purple-600' :
                'bg-orange-50 text-orange-600'
              }`}>
                <item.icon size={24} strokeWidth={2.5} />
              </div>
              <div>
                <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">{item.label}</p>
                <p className="text-2xl font-black text-gray-900 tracking-tight">{item.value}</p>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Riders List */}
      <div className="bg-white rounded-[2.5rem] border border-gray-100 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-50">
            <thead>
              <tr className="bg-gray-50/50">
                <th className="px-8 py-4 text-left text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">Rider Profile</th>
                <th className="px-8 py-4 text-left text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">Status</th>
                <th className="px-8 py-4 text-left text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">Quota</th>
                <th className="px-8 py-4 text-left text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">Stats</th>
                <th className="px-8 py-4 text-right text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50 bg-white">
              {riders.map((rider) => (
                <tr key={rider.id} className="hover:bg-gray-50/50 transition-colors group">
                  <td className="px-8 py-5 whitespace-nowrap">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 rounded-xl bg-orange-100 flex items-center justify-center text-xl text-orange-600 font-black border-2 border-white shadow-sm shrink-0">
                        {rider.full_name[0].toUpperCase()}
                      </div>
                      <div className="min-w-0">
                        <p className="text-sm font-black text-gray-900 group-hover:text-orange-600 transition-colors truncate">{rider.full_name}</p>
                        <div className="flex items-center gap-3 mt-0.5">
                          <p className="flex items-center gap-1 text-[10px] font-bold text-gray-400 uppercase tracking-widest">
                            <Phone size={10} /> {rider.mobile}
                          </p>
                          <div className="w-1 h-1 bg-gray-200 rounded-full" />
                          <p className="flex items-center gap-1 text-[10px] font-bold text-gray-400 uppercase tracking-widest">
                            <Mail size={10} /> {rider.email}
                          </p>
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-8 py-5 whitespace-nowrap">
                    <button
                      onClick={() => toggleActiveStatus(rider.id, rider.is_active)}
                      className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all border ${
                        rider.is_active
                          ? "bg-green-50 text-green-600 border-green-100 shadow-sm shadow-green-50"
                          : "bg-gray-50 text-gray-400 border-gray-100 hover:border-gray-200"
                      }`}
                    >
                      {rider.is_active ? (
                        <><CheckCircle size={12} strokeWidth={3} /><span>Online</span></>
                      ) : (
                        <><XCircle size={12} strokeWidth={3} /><span>Offline</span></>
                      )}
                    </button>
                  </td>
                  <td className="px-8 py-5 whitespace-nowrap">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-1.5 bg-gray-100 rounded-full overflow-hidden">
                        <div 
                          className="h-full bg-orange-500 rounded-full" 
                          style={{ width: `${Math.min((rider.total_deliveries / (rider.daily_quota || 10)) * 100, 100)}%` }} 
                        />
                      </div>
                      <span className="text-xs font-bold text-gray-700">{rider.daily_quota || 10}</span>
                    </div>
                  </td>
                  <td className="px-8 py-5 whitespace-nowrap">
                    <div className="space-y-0.5">
                      <p className="text-sm font-black text-gray-900">{rider.total_deliveries || 0} Rides</p>
                      <p className="text-[10px] font-bold text-orange-600 uppercase tracking-widest">₱{(rider.total_earnings || 0).toLocaleString()}</p>
                    </div>
                  </td>
                  <td className="px-8 py-5 whitespace-nowrap text-right">
                    <div className="flex justify-end gap-2">
                      <button
                        onClick={() => handleEdit(rider)}
                        className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-xl transition-all active:scale-90"
                        title="Edit Rider"
                      >
                        <Edit2 size={18} strokeWidth={2.5} />
                      </button>
                      <button
                        onClick={() => handleDelete(rider.id)}
                        className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-xl transition-all active:scale-90"
                        title="Delete Rider"
                      >
                        <Trash2 size={18} strokeWidth={2.5} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {riders.length === 0 && (
            <div className="py-20 text-center">
              <div className="text-4xl mb-4 grayscale opacity-20 text-center">🏍️</div>
              <p className="text-gray-400 font-bold text-xs uppercase tracking-widest">No riders found</p>
            </div>
          )}
        </div>
      </div>

      {/* Add/Edit Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/20 backdrop-blur-sm z-60 flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-md rounded-[2.5rem] shadow-2xl border border-gray-100 overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            <div className="px-8 pt-8 pb-4 flex justify-between items-center">
              <div>
                <h3 className="text-xl font-black text-gray-900 tracking-tight">
                  {editingRider ? "Edit Rider" : "New Rider"}
                </h3>
                <p className="text-xs font-medium text-gray-500 mt-1">Personnel details & configuration</p>
              </div>
              <button 
                onClick={() => setIsModalOpen(false)}
                className="p-2 rounded-2xl bg-gray-50 text-gray-400 hover:text-gray-600 transition-colors"
              >
                <X size={20} strokeWidth={3} />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-8 pt-4 space-y-6">
              <div className="space-y-5">
                <div>
                  <label className="block text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] mb-2 ml-1">
                    Full Name
                  </label>
                  <div className="relative">
                    <UserIcon className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
                    <input
                      type="text"
                      required
                      value={formData.full_name}
                      onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
                      placeholder="e.g. Juan Dela Cruz"
                      className="w-full pl-11 pr-4 py-3 bg-gray-50 border-none rounded-2xl text-sm font-bold placeholder:text-gray-400 focus:ring-2 focus:ring-orange-500 transition-all"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] mb-2 ml-1">
                      Mobile Number
                    </label>
                    <div className="relative">
                      <Phone className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
                      <input
                        type="tel"
                        required
                        value={formData.mobile}
                        onChange={(e) => setFormData({ ...formData, mobile: e.target.value })}
                        placeholder="09XXXXXXXXX"
                        className="w-full pl-11 pr-4 py-3 bg-gray-50 border-none rounded-2xl text-sm font-bold placeholder:text-gray-400 focus:ring-2 focus:ring-orange-500 transition-all"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] mb-2 ml-1">
                      Daily Quota
                    </label>
                    <div className="relative">
                      <TrendingUp className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
                      <input
                        type="number"
                        min="1"
                        required
                        value={formData.daily_quota}
                        onChange={(e) => setFormData({ ...formData, daily_quota: parseInt(e.target.value) })}
                        className="w-full pl-11 pr-4 py-3 bg-gray-50 border-none rounded-2xl text-sm font-bold focus:ring-2 focus:ring-orange-500 transition-all"
                      />
                    </div>
                  </div>
                </div>

                {!editingRider && (
                  <div>
                    <label className="block text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] mb-2 ml-1">
                      Email Address
                    </label>
                    <div className="relative">
                      <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
                      <input
                        type="email"
                        required
                        value={formData.email}
                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                        placeholder="rider@example.com"
                        className="w-full pl-11 pr-4 py-3 bg-gray-50 border-none rounded-2xl text-sm font-bold placeholder:text-gray-400 focus:ring-2 focus:ring-orange-500 transition-all"
                      />
                    </div>
                  </div>
                )}
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="flex-1 px-6 py-4 bg-gray-100 text-gray-600 rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-gray-200 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-2 px-6 py-4 bg-orange-600 text-white rounded-2xl font-black text-xs uppercase tracking-widest shadow-lg shadow-orange-100 hover:bg-orange-700 transition-all active:scale-95"
                >
                  {editingRider ? "Update Rider" : "Add Personnel"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
