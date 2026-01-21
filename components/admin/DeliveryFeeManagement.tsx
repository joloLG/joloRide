"use client";

import { 
  Plus, 
  Edit2, 
  Trash2, 
  MapPin, 
  Banknote, 
  Layers, 
  X,
  Check,
  LucideIcon
} from "lucide-react";
import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/lib/supabase";
import { toast } from "react-hot-toast";

interface DeliveryFee {
  id: string;
  barangay: string;
  fee: number;
  created_at: string;
}

// Bulan, Sorsogon barangays list
const bulanBarangays = [
  "Aguada",
  "Asoo",
  "Bagacay",
  "Bano-Banon",
  "Bariis",
  "Beguin",
  "Buhangin",
  "Calog Norte",
  "Calog Sur",
  "Cagbiga",
  "Cagbiga",
  "Camcaman",
  "Combado",
  "Danlog",
  "Del Rosario",
  "Denug",
  "Eraña",
  "Gabon",
  "Gadgaron",
  "Ginangca",
  "Habag",
  "Imelda",
  "J. M. Guillen",
  "Ladgarao",
  "Lagundi",
  "Layuan",
  "Lomboy",
  "Mabini",
  "Magallanes",
  "Mahayahay",
  "Malbog",
  "Managa-naga",
  "Mapapak",
  "Marinab",
  "Masalongsalong",
  "Matanda",
  "Mercado",
  "Namo",
  "Nazareth",
  "Otog",
  "P. Magallanes",
  "Pag-asa",
  "Palomtas",
  "Panan-awan",
  "Poblacion Central",
  "Poblacion East",
  "Poblacion West",
  "Poropandaya",
  "Poropandac",
  "Sabang",
  "San Antonio",
  "San Francisco",
  "San Isidro",
  "San Juan",
  "San Nicolas",
  "San Ramon",
  "San Roque",
  "San Vicente",
  "Santa Cruz",
  "Santa Elena",
  "Santo Cristo",
  "Santo Niño",
  "Siclong",
  "Tagalog",
  "Talabiga",
  "Talisay",
  "Tanawan",
  "Tapaan",
  "Tarosanan",
  "Tizon",
  "Tugas",
  "V. A. Herrera",
  "Zone I",
  "Zone II",
  "Zone III",
  "Zone IV",
  "Zone V",
  "Zone VI",
  "Zone VII",
  "Zone VIII"
];

export default function DeliveryFeeManagement() {
  const [deliveryFees, setDeliveryFees] = useState<DeliveryFee[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingFee, setEditingFee] = useState<DeliveryFee | null>(null);
  const [formData, setFormData] = useState({
    barangay: "",
    fee: "",
  });

  const fetchDeliveryFees = useCallback(async () => {
    try {
      setIsLoading(true);
      const { data, error } = await supabase
        .from("delivery_fees")
        .select("*")
        .order("barangay", { ascending: true });

      if (error) throw error;
      setDeliveryFees(data || []);
    } catch (error) {
      console.error("Error fetching delivery fees:", error);
      toast.error("Failed to load delivery fees");
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchDeliveryFees();
  }, [fetchDeliveryFees]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const feeData = {
        barangay: formData.barangay,
        fee: parseFloat(formData.fee),
      };

      if (editingFee) {
        const { error } = await supabase
          .from("delivery_fees")
          .update(feeData)
          .eq("id", editingFee.id);
        if (error) throw error;
        toast.success("Delivery fee updated");
      } else {
        const { error } = await supabase.from("delivery_fees").insert(feeData);
        if (error) throw error;
        toast.success("Delivery fee added");
      }

      await fetchDeliveryFees();
      setIsModalOpen(false);
      setEditingFee(null);
      setFormData({ barangay: "", fee: "" });
    } catch (error) {
      console.error("Error saving delivery fee:", error);
      toast.error("Failed to save delivery fee");
    }
  };

  const handleEdit = (fee: DeliveryFee) => {
    setEditingFee(fee);
    setFormData({
      barangay: fee.barangay,
      fee: fee.fee.toString(),
    });
    setIsModalOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (confirm("Are you sure you want to delete this delivery fee?")) {
      try {
        const { error } = await supabase.from("delivery_fees").delete().eq("id", id);
        if (error) throw error;
        toast.success("Delivery fee deleted");
        await fetchDeliveryFees();
      } catch (error) {
        console.error("Error deleting delivery fee:", error);
        toast.error("Failed to delete delivery fee");
      }
    }
  };

  const handleBulkSet = async () => {
    const defaultFee = prompt("Enter default delivery fee for all barangays:");
    if (defaultFee && !isNaN(parseFloat(defaultFee))) {
      try {
        // First, delete all existing fees
        await supabase.from("delivery_fees").delete().neq("id", "");

        // Then insert new fees for all barangays
        const newFees = bulanBarangays.map(barangay => ({
          barangay,
          fee: parseFloat(defaultFee),
        }));

        const { error } = await supabase.from("delivery_fees").insert(newFees);
        if (error) throw error;

        toast.success(`Standardized fee set to ₱${defaultFee} for all areas`);
        await fetchDeliveryFees();
      } catch (error) {
        console.error("Error setting bulk delivery fees:", error);
        toast.error("Failed to set bulk delivery fees");
      }
    }
  };

  const getAvailableBarangays = () => {
    const usedBarangays = deliveryFees.map(fee => fee.barangay);
    return bulanBarangays.filter(barangay => !usedBarangays.includes(barangay));
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
          <h2 className="text-2xl font-black text-gray-900 tracking-tight">Delivery Fees</h2>
          <p className="text-sm font-medium text-gray-500">Configure logistics costs by area</p>
        </div>
        <div className="flex gap-2 w-full sm:w-auto">
          <button
            onClick={handleBulkSet}
            className="flex-1 sm:flex-none px-6 py-3 bg-green-50 text-green-600 rounded-2xl font-bold text-sm border border-green-100 hover:bg-green-100 transition-all active:scale-95 flex items-center justify-center gap-2"
          >
            <Check size={18} strokeWidth={3} />
            <span>Set All</span>
          </button>
          <button
            onClick={() => {
              setEditingFee(null);
              setFormData({ barangay: "", fee: "" });
              setIsModalOpen(true);
            }}
            className="flex-1 sm:flex-none px-6 py-3 bg-orange-600 text-white rounded-2xl font-bold text-sm shadow-lg shadow-orange-100 hover:bg-orange-700 transition-all active:scale-95 flex items-center justify-center gap-2"
          >
            <Plus size={18} strokeWidth={3} />
            <span>Add Fee</span>
          </button>
        </div>
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
        {[
          { label: "Total Barangays", value: bulanBarangays.length, icon: MapPin, color: "blue" },
          { label: "Configured Areas", value: deliveryFees.length, icon: Layers, color: "green" },
          { label: "Average Delivery", value: `₱${deliveryFees.length > 0 
            ? (deliveryFees.reduce((sum, fee) => sum + fee.fee, 0) / deliveryFees.length).toFixed(2)
            : "0.00"}`, icon: Banknote, color: "orange" },
        ].map((item: { label: string; value: string | number; icon: LucideIcon; color: string }, i) => (
          <div key={i} className="bg-white p-6 rounded-[2rem] border border-gray-100 shadow-sm group hover:shadow-md transition-all">
            <div className="flex items-center gap-4">
              <div className={`w-14 h-14 rounded-2xl flex items-center justify-center text-xl transition-transform group-hover:scale-110 ${
                item.color === 'blue' ? 'bg-blue-50 text-blue-600' :
                item.color === 'green' ? 'bg-green-50 text-green-600' :
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

      {/* Delivery Fees List */}
      <div className="bg-white rounded-[2.5rem] border border-gray-100 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-50">
            <thead>
              <tr className="bg-gray-50/50">
                <th className="px-8 py-4 text-left text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">Barangay Name</th>
                <th className="px-8 py-4 text-left text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">Fee Amount</th>
                <th className="px-8 py-4 text-left text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">Last Updated</th>
                <th className="px-8 py-4 text-right text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50 bg-white">
              {deliveryFees.map((fee) => (
                <tr key={fee.id} className="hover:bg-gray-50/50 transition-colors group">
                  <td className="px-8 py-5 whitespace-nowrap">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-lg bg-orange-100 flex items-center justify-center text-orange-600 font-black text-xs">
                        {fee.barangay[0].toUpperCase()}
                      </div>
                      <p className="text-sm font-black text-gray-900 group-hover:text-orange-600 transition-colors">{fee.barangay}</p>
                    </div>
                  </td>
                  <td className="px-8 py-5 whitespace-nowrap">
                    <div className="inline-flex items-center px-3 py-1 bg-green-50 text-green-600 rounded-lg text-sm font-black border border-green-100">
                      ₱{fee.fee.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                    </div>
                  </td>
                  <td className="px-8 py-5 whitespace-nowrap">
                    <p className="text-xs font-bold text-gray-500 uppercase tracking-wider">
                      {new Date(fee.created_at).toLocaleDateString([], { month: 'short', day: 'numeric', year: 'numeric' })}
                    </p>
                  </td>
                  <td className="px-8 py-5 whitespace-nowrap text-right">
                    <div className="flex justify-end gap-2">
                      <button
                        onClick={() => handleEdit(fee)}
                        className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-xl transition-all active:scale-90"
                        title="Edit Fee"
                      >
                        <Edit2 size={18} strokeWidth={2.5} />
                      </button>
                      <button
                        onClick={() => handleDelete(fee.id)}
                        className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-xl transition-all active:scale-90"
                        title="Delete Fee"
                      >
                        <Trash2 size={18} strokeWidth={2.5} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {deliveryFees.length === 0 && (
            <div className="py-20 text-center">
              <div className="text-4xl mb-4 grayscale opacity-20 text-center">🚚</div>
              <p className="text-gray-400 font-bold text-xs uppercase tracking-widest">No fees configured yet</p>
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
                  {editingFee ? "Edit Fee" : "New Fee"}
                </h3>
                <p className="text-xs font-medium text-gray-500 mt-1">Configure area logistics cost</p>
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
                    Barangay / Area
                  </label>
                  {editingFee ? (
                    <div className="w-full px-4 py-3 bg-gray-100 text-gray-500 rounded-2xl text-sm font-bold border border-gray-200">
                      {formData.barangay}
                    </div>
                  ) : (
                    <div className="relative">
                      <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
                      <select
                        required
                        value={formData.barangay}
                        onChange={(e) => setFormData({ ...formData, barangay: e.target.value })}
                        className="w-full pl-11 pr-4 py-3 bg-gray-50 border-none rounded-2xl text-sm font-bold text-gray-900 focus:ring-2 focus:ring-orange-500 transition-all appearance-none cursor-pointer"
                      >
                        <option value="">Select a barangay</option>
                        {getAvailableBarangays().map((barangay) => (
                          <option key={barangay} value={barangay}>
                            {barangay}
                          </option>
                        ))}
                      </select>
                    </div>
                  )}
                </div>

                <div>
                  <label className="block text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] mb-2 ml-1">
                    Delivery Fee (₱)
                  </label>
                  <div className="relative">
                    <Banknote className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
                    <input
                      type="number"
                      step="0.01"
                      min="0"
                      required
                      value={formData.fee}
                      onChange={(e) => setFormData({ ...formData, fee: e.target.value })}
                      placeholder="0.00"
                      className="w-full pl-11 pr-4 py-3 bg-gray-50 border-none rounded-2xl text-sm font-bold placeholder:text-gray-400 focus:ring-2 focus:ring-orange-500 transition-all"
                    />
                  </div>
                </div>
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
                  {editingFee ? "Update Cost" : "Add Logistic Cost"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
