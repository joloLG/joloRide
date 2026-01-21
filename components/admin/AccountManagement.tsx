"use client";

import { useState, useCallback } from "react";
import { createRiderAccount, createAdminAccount, changeUserRole, getAllUsers } from "@/lib/admin-accounts";
import { 
  UserPlus, 
  Users, 
  Shield, 
  Bike, 
  User as UserIcon, 
  Mail, 
  Phone, 
  TrendingUp, 
  Key,
  CheckCircle,
  XCircle, 
  X
} from "lucide-react";
import { toast } from "react-hot-toast";

interface User {
  user_id: string;
  email: string;
  full_name: string;
  mobile: string;
  role: string;
  is_active: boolean;
  created_at: string;
  daily_quota?: number;
  total_deliveries?: number;
  total_earnings?: number;
}

export default function AccountManagement() {
  const [activeTab, setActiveTab] = useState<"create" | "manage">("create");
  const [accountType, setAccountType] = useState<"rider" | "admin">("rider");
  const [users, setUsers] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    full_name: "",
    mobile: "",
    daily_quota: "10",
  });

  const fetchUsers = useCallback(async () => {
    setIsLoading(true);
    try {
      const result = await getAllUsers();
      if (result.success) {
        setUsers(result.users);
      } else {
        toast.error(result.message || "Failed to fetch users");
      }
    } catch (error) {
      console.error("Error fetching users:", error);
      toast.error("Failed to fetch users");
    } finally {
      setIsLoading(false);
    }
  }, []);

  const handleCreateAccount = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      let result;
      if (accountType === "rider") {
        result = await createRiderAccount({
          email: formData.email,
          password: formData.password,
          full_name: formData.full_name,
          mobile: formData.mobile,
          daily_quota: parseInt(formData.daily_quota),
        });
      } else {
        result = await createAdminAccount({
          email: formData.email,
          password: formData.password,
          full_name: formData.full_name,
          mobile: formData.mobile,
        });
      }

      if (result.success) {
        toast.success(result.message);
        setFormData({
          email: "",
          password: "",
          full_name: "",
          mobile: "",
          daily_quota: "10",
        });
        if (activeTab === "manage") {
          await fetchUsers();
        }
      } else {
        toast.error(result.message);
      }
    } catch (error) {
      console.error("Error creating account:", error);
      toast.error("Failed to create account");
    } finally {
      setIsLoading(false);
    }
  };

  const handleRoleChange = async (userId: string, newRole: "user" | "rider" | "admin") => {
    if (!confirm(`Are you sure you want to change this user's role to ${newRole}?`)) {
      return;
    }

    setIsLoading(true);
    try {
      const result = await changeUserRole(userId, newRole);
      if (result.success) {
        toast.success(result.message);
        await fetchUsers();
      } else {
        toast.error(result.message);
      }
    } catch (error) {
      console.error("Error changing role:", error);
      toast.error("Failed to change user role");
    } finally {
      setIsLoading(false);
    }
  };

  const handleTabChange = async (tab: "create" | "manage") => {
    setActiveTab(tab);
    if (tab === "manage") {
      await fetchUsers();
    }
  };

  return (
    <div className="space-y-8">
      <div className="px-1">
        <h2 className="text-2xl font-black text-gray-900 tracking-tight">Access Control</h2>
        <p className="text-sm font-medium text-gray-500">Manage administrative and operational accounts</p>
      </div>

      <div className="bg-gray-100 p-1.5 rounded-2xl inline-flex w-full sm:w-auto">
        {[
          { id: "create", label: "Create Account", icon: UserPlus },
          { id: "manage", label: "Manage Users", icon: Users }
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => handleTabChange(tab.id as "create" | "manage")}
            className={`
              flex-1 sm:flex-none flex items-center justify-center gap-2 px-6 py-2.5 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${
                activeTab === tab.id
                  ? "bg-white text-orange-600 shadow-sm"
                  : "text-gray-500 hover:text-gray-700"
              }`}
          >
            <tab.icon size={14} strokeWidth={3} />
            {tab.label}
          </button>
        ))}
      </div>

      {/* Create Account Tab */}
      {activeTab === "create" && (
        <div className="bg-white rounded-[2.5rem] border border-gray-100 p-8 shadow-sm">
          <div className="mb-10">
            <label className="block text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] mb-4 ml-1">
              Account Type
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <button
                type="button"
                onClick={() => setAccountType("rider")}
                className={`flex items-center gap-4 p-5 rounded-3xl border-2 transition-all ${
                  accountType === "rider"
                    ? "border-orange-500 bg-orange-50/50"
                    : "border-gray-100 bg-white hover:border-orange-200"
                }`}
              >
                <div className={`w-12 h-12 rounded-2xl flex items-center justify-center text-xl transition-colors ${accountType === 'rider' ? 'bg-orange-600 text-white shadow-lg shadow-orange-100' : 'bg-gray-100 text-gray-400'}`}>
                  <Bike size={24} />
                </div>
                <div className="text-left">
                  <p className="font-black text-gray-900 leading-tight">Rider Account</p>
                  <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mt-0.5">Operational Access</p>
                </div>
                <div className={`ml-auto w-6 h-6 rounded-full border-2 flex items-center justify-center ${accountType === 'rider' ? 'border-orange-600 bg-orange-600' : 'border-gray-200'}`}>
                  {accountType === "rider" && <div className="w-2.5 h-2.5 bg-white rounded-full" />}
                </div>
              </button>

              <button
                type="button"
                onClick={() => setAccountType("admin")}
                className={`flex items-center gap-4 p-5 rounded-3xl border-2 transition-all ${
                  accountType === "admin"
                    ? "border-orange-500 bg-orange-50/50"
                    : "border-gray-100 bg-white hover:border-orange-200"
                }`}
              >
                <div className={`w-12 h-12 rounded-2xl flex items-center justify-center text-xl transition-colors ${accountType === 'admin' ? 'bg-orange-600 text-white shadow-lg shadow-orange-100' : 'bg-gray-100 text-gray-400'}`}>
                  <Shield size={24} />
                </div>
                <div className="text-left">
                  <p className="font-black text-gray-900 leading-tight">Admin Account</p>
                  <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mt-0.5">Management Access</p>
                </div>
                <div className={`ml-auto w-6 h-6 rounded-full border-2 flex items-center justify-center ${accountType === 'admin' ? 'border-orange-600 bg-orange-600' : 'border-gray-200'}`}>
                  {accountType === "admin" && <div className="w-2.5 h-2.5 bg-white rounded-full" />}
                </div>
              </button>
            </div>
          </div>

          <form onSubmit={handleCreateAccount} className="max-w-xl space-y-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <div className="sm:col-span-2">
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
                    placeholder="user@example.com"
                    className="w-full pl-11 pr-4 py-3 bg-gray-50 border-none rounded-2xl text-sm font-bold placeholder:text-gray-400 focus:ring-2 focus:ring-orange-500 transition-all"
                  />
                </div>
              </div>

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
                  Temporary Password
                </label>
                <div className="relative">
                  <Key className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
                  <input
                    type="password"
                    required
                    minLength={6}
                    value={formData.password}
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                    placeholder="••••••••"
                    className="w-full pl-11 pr-4 py-3 bg-gray-50 border-none rounded-2xl text-sm font-bold placeholder:text-gray-400 focus:ring-2 focus:ring-orange-500 transition-all"
                  />
                </div>
              </div>

              {accountType === "rider" && (
                <div>
                  <label className="block text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] mb-2 ml-1">
                    Daily Ride Quota
                  </label>
                  <div className="relative">
                    <TrendingUp className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
                    <input
                      type="number"
                      min="1"
                      required
                      value={formData.daily_quota}
                      onChange={(e) => setFormData({ ...formData, daily_quota: e.target.value })}
                      className="w-full pl-11 pr-4 py-3 bg-gray-50 border-none rounded-2xl text-sm font-bold focus:ring-2 focus:ring-orange-500 transition-all"
                    />
                  </div>
                </div>
              )}
            </div>

            <div className="pt-4">
              <button
                type="submit"
                disabled={isLoading}
                className="w-full sm:w-auto px-10 py-4 bg-orange-600 text-white rounded-2xl font-black text-xs uppercase tracking-widest shadow-lg shadow-orange-100 hover:bg-orange-700 transition-all active:scale-95 disabled:opacity-50 flex items-center justify-center gap-3"
              >
                {isLoading ? (
                  <div className="animate-spin rounded-full h-4 w-4 border-2 border-white/30 border-t-white" />
                ) : (
                  <UserPlus size={18} strokeWidth={3} />
                )}
                <span>Create {accountType} Account</span>
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Manage Users Tab */}
      {activeTab === "manage" && (
        <div className="bg-white rounded-[2.5rem] border border-gray-100 shadow-sm overflow-hidden">
          <div className="px-8 py-6 border-b border-gray-50 flex items-center justify-between">
            <h3 className="text-xl font-black text-gray-900 tracking-tight">Platform Users</h3>
            <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest bg-gray-50 px-3 py-1 rounded-full">{users.length} Total</span>
          </div>
          
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-50">
              <thead>
                <tr className="bg-gray-50/50">
                  <th className="px-8 py-4 text-left text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">Profile</th>
                  <th className="px-8 py-4 text-left text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">Role</th>
                  <th className="px-8 py-4 text-left text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">Status</th>
                  <th className="px-8 py-4 text-left text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">Joined</th>
                  <th className="px-8 py-4 text-right text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">Change Role</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50 bg-white">
                {users.map((u: User) => (
                  <tr key={u.user_id} className="hover:bg-gray-50/50 transition-colors group">
                    <td className="px-8 py-5 whitespace-nowrap">
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-xl bg-orange-100 flex items-center justify-center text-xl text-orange-600 font-black border-2 border-white shadow-sm shrink-0">
                          {u.full_name[0].toUpperCase()}
                        </div>
                        <div className="min-w-0">
                          <p className="text-sm font-black text-gray-900 group-hover:text-orange-600 transition-colors truncate">{u.full_name}</p>
                          <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mt-0.5">{u.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-8 py-5 whitespace-nowrap">
                      <div className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-lg text-[10px] font-black uppercase tracking-widest border ${
                        u.role === 'admin' ? 'bg-purple-50 text-purple-600 border-purple-100' :
                        u.role === 'rider' ? 'bg-blue-50 text-blue-600 border-blue-100' :
                        'bg-gray-50 text-gray-600 border-gray-100'
                      }`}>
                        {u.role === 'admin' ? <Shield size={12} /> : u.role === 'rider' ? <Bike size={12} /> : <UserIcon size={12} />}
                        {u.role}
                      </div>
                    </td>
                    <td className="px-8 py-5 whitespace-nowrap">
                      <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-widest ${
                        u.is_active ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                      }`}>
                        <div className={`w-1.5 h-1.5 rounded-full ${u.is_active ? 'bg-green-500 animate-pulse' : 'bg-red-500'}`} />
                        {u.is_active ? "Active" : "Inactive"}
                      </span>
                    </td>
                    <td className="px-8 py-5 whitespace-nowrap">
                      <p className="text-xs font-bold text-gray-500 uppercase">
                        {new Date(u.created_at).toLocaleDateString([], { month: 'short', day: 'numeric', year: 'numeric' })}
                      </p>
                    </td>
                    <td className="px-8 py-5 whitespace-nowrap text-right">
                      <select
                        value={u.role}
                        onChange={(e) => handleRoleChange(u.user_id, e.target.value as "user" | "rider" | "admin")}
                        className="px-4 py-2 bg-gray-50 border border-gray-100 rounded-xl text-xs font-black uppercase tracking-widest text-gray-600 focus:ring-2 focus:ring-orange-500 outline-none cursor-pointer hover:bg-gray-100 transition-all"
                      >
                        <option value="user">USER</option>
                        <option value="rider">RIDER</option>
                        <option value="admin">ADMIN</option>
                      </select>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {users.length === 0 && (
              <div className="py-20 text-center">
                <div className="text-4xl mb-4 grayscale opacity-20 text-center">👥</div>
                <p className="text-gray-400 font-bold text-xs uppercase tracking-widest">No users found</p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
