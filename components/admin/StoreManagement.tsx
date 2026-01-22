"use client";

import Image from "next/image";
import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/lib/supabase";
import { ImageUploader } from "@/lib/storage";
import { Plus, Edit2, Trash2, Star, ImageIcon, X, Upload } from "lucide-react";
import { toast } from "react-hot-toast";

interface Store {
  id: string;
  name: string;
  image?: string;
  cover_image?: string;
  is_featured: boolean;
  created_at: string;
}

export default function StoreManagement() {
  const [stores, setStores] = useState<Store[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingStore, setEditingStore] = useState<Store | null>(null);
  const [formData, setFormData] = useState({
    name: "",
    image: "",
    cover_image: "",
    is_featured: false,
  });
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);

  const fetchStores = useCallback(async () => {
    try {
      setIsLoading(true);
      const { data, error } = await supabase
        .from("stores")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;
      setStores(data || []);
    } catch (error) {
      console.error("Error fetching stores:", error);
      toast.error("Failed to load stores");
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchStores();
  }, [fetchStores]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setIsUploading(true);
      let imageUrl = formData.image;

      // Upload new image if selected
      if (imageFile) {
        const validation = ImageUploader.validateImageFile(imageFile);
        if (!validation.valid) {
          toast.error(validation.error);
          setIsUploading(false);
          return;
        }

        const uploadResult = await ImageUploader.uploadImage(imageFile, 'stores');
        if (uploadResult.error) {
          toast.error(uploadResult.error);
          setIsUploading(false);
          return;
        }
        imageUrl = uploadResult.url;
      }

      const storeData = {
        name: formData.name,
        image: imageUrl,
        cover_image: imageUrl,
        is_featured: formData.is_featured,
      };

      if (editingStore) {
        // Update existing store
        const { error } = await supabase
          .from("stores")
          .update(storeData)
          .eq("id", editingStore.id);
        if (error) throw error;
        toast.success("Store updated successfully");
      } else {
        // Create new store
        const { error } = await supabase.from("stores").insert(storeData);
        if (error) throw error;
        toast.success("Store created successfully");
      }

      await fetchStores();
      setIsModalOpen(false);
      setEditingStore(null);
      setFormData({ name: "", image: "", cover_image: "", is_featured: false });
      setImageFile(null);
    } catch (error) {
      console.error("Error saving store:", error);
      toast.error("Failed to save store");
    } finally {
      setIsUploading(false);
    }
  };

  const handleEdit = (store: Store) => {
    setEditingStore(store);
    setFormData({
      name: store.name,
      image: store.image || store.cover_image || "",
      cover_image: store.cover_image || store.image || "",
      is_featured: store.is_featured,
    });
    setImageFile(null);
    setIsModalOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (confirm("Are you sure you want to delete this store?")) {
      try {
        const { error } = await supabase.from("stores").delete().eq("id", id);
        if (error) throw error;
        toast.success("Store deleted successfully");
        await fetchStores();
      } catch (error) {
        console.error("Error deleting store:", error);
        toast.error("Failed to delete store");
      }
    }
  };

  const toggleFeatured = async (id: string, isFeatured: boolean) => {
    try {
      const { error } = await supabase
        .from("stores")
        .update({ is_featured: !isFeatured })
        .eq("id", id);
      if (error) throw error;
      toast.success(isFeatured ? "Removed from featured" : "Set as featured");
      await fetchStores();
    } catch (error) {
      console.error("Error updating store:", error);
      toast.error("Failed to update featured status");
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
          <h2 className="text-2xl font-black text-gray-900 tracking-tight">Stores</h2>
          <p className="text-sm font-medium text-gray-500">Manage your partner establishments</p>
        </div>
        <button
          onClick={() => {
            setEditingStore(null);
            setFormData({ name: "", image: "", cover_image: "", is_featured: false });
            setImageFile(null);
            setIsModalOpen(true);
          }}
          className="w-full sm:w-auto px-6 py-3 bg-orange-600 text-white rounded-2xl font-bold text-sm shadow-lg shadow-orange-100 hover:bg-orange-700 transition-all active:scale-95 flex items-center justify-center gap-2"
        >
          <Plus size={18} strokeWidth={3} />
          <span>Add New Store</span>
        </button>
      </div>

      {/* Stores Grid/Table */}
      <div className="bg-white rounded-[2.5rem] border border-gray-100 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-50">
            <thead>
              <tr className="bg-gray-50/50">
                <th className="px-8 py-4 text-left text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">Store</th>
                <th className="px-8 py-4 text-left text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">Featured</th>
                <th className="px-8 py-4 text-left text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">Joined Date</th>
                <th className="px-8 py-4 text-right text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50 bg-white">
              {stores.map((store) => (
                <tr key={store.id} className="hover:bg-gray-50/50 transition-colors group">
                  <td className="px-8 py-5 whitespace-nowrap">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 rounded-xl bg-gray-100 overflow-hidden relative border border-gray-50 shrink-0">
                        {store.image ? (
                          <Image
                            src={store.image}
                            alt={store.name}
                            fill
                            className="object-cover"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-xl bg-orange-50 text-orange-600 font-black">
                            {store.name[0]}
                          </div>
                        )}
                      </div>
                      <div className="min-w-0">
                        <p className="text-sm font-black text-gray-900 group-hover:text-orange-600 transition-colors truncate">{store.name}</p>
                        <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mt-0.5">ID: #{store.id.slice(0, 8)}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-8 py-5 whitespace-nowrap">
                    <button
                      onClick={() => toggleFeatured(store.id, store.is_featured)}
                      className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all border ${
                        store.is_featured
                          ? "bg-orange-50 text-orange-600 border-orange-100 shadow-sm shadow-orange-50"
                          : "bg-gray-50 text-gray-400 border-gray-100 hover:border-gray-200"
                      }`}
                    >
                      <Star size={12} className={store.is_featured ? "fill-orange-600" : ""} />
                      {store.is_featured ? "Featured" : "Regular"}
                    </button>
                  </td>
                  <td className="px-8 py-5 whitespace-nowrap">
                    <p className="text-xs font-bold text-gray-500 uppercase">
                      {new Date(store.created_at).toLocaleDateString([], { month: 'short', day: 'numeric', year: 'numeric' })}
                    </p>
                  </td>
                  <td className="px-8 py-5 whitespace-nowrap text-right">
                    <div className="flex justify-end gap-2">
                      <button
                        onClick={() => handleEdit(store)}
                        className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-xl transition-all active:scale-90"
                        title="Edit Store"
                      >
                        <Edit2 size={18} strokeWidth={2.5} />
                      </button>
                      <button
                        onClick={() => handleDelete(store.id)}
                        className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-xl transition-all active:scale-90"
                        title="Delete Store"
                      >
                        <Trash2 size={18} strokeWidth={2.5} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {stores.length === 0 && (
            <div className="py-20 text-center">
              <div className="text-4xl mb-4 grayscale opacity-20 text-center">🏪</div>
              <p className="text-gray-400 font-bold text-xs uppercase tracking-widest">No stores found</p>
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
                  {editingStore ? "Edit Establishment" : "New Establishment"}
                </h3>
                <p className="text-xs font-medium text-gray-500 mt-1">Fill in the details below</p>
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
                    Store Name
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="e.g. Jolo's Burger Joint"
                    className="w-full px-4 py-3 bg-gray-50 border-none rounded-2xl text-sm font-bold placeholder:text-gray-400 focus:ring-2 focus:ring-orange-500 transition-all"
                  />
                </div>
                
                <div>
                  <label className="block text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] mb-2 ml-1">
                    Store Image
                  </label>
                  <div className="space-y-3">
                    {/* File Upload */}
                    <div className="relative">
                      <input
                        type="file"
                        accept="image/*"
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          if (file) {
                            const validation = ImageUploader.validateImageFile(file);
                            if (validation.valid) {
                              setImageFile(file);
                            } else {
                              toast.error(validation.error);
                            }
                          }
                        }}
                        className="hidden"
                        id="store-image-upload"
                      />
                      <label
                        htmlFor="store-image-upload"
                        className="flex items-center gap-3 w-full p-4 bg-gray-50 border-2 border-dashed border-gray-200 rounded-2xl cursor-pointer hover:border-orange-300 hover:bg-orange-50 transition-all"
                      >
                        <Upload size={20} className="text-gray-400" />
                        <div className="flex-1">
                          <p className="text-sm font-bold text-gray-700">
                            {imageFile ? imageFile.name : "Choose image file"}
                          </p>
                          <p className="text-xs text-gray-400">JPEG, PNG, GIF, WebP up to 5MB</p>
                        </div>
                      </label>
                    </div>

                    {/* Preview */}
                    {(imageFile || formData.image) && (
                      <div className="relative w-full h-32 bg-gray-100 rounded-xl overflow-hidden">
                        <img
                          src={imageFile ? URL.createObjectURL(imageFile) : formData.image}
                          alt="Store preview"
                          className="w-full h-full object-cover"
                        />
                      </div>
                    )}

                    {/* Or URL fallback */}
                    <div className="relative">
                      <ImageIcon className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
                      <input
                        type="url"
                        value={formData.image}
                        onChange={(e) => setFormData({ ...formData, image: e.target.value })}
                        placeholder="Or enter image URL"
                        className="w-full pl-11 pr-4 py-3 bg-gray-50 border-none rounded-2xl text-sm font-bold placeholder:text-gray-400 focus:ring-2 focus:ring-orange-500 transition-all"
                      />
                    </div>
                  </div>
                </div>

                <div className="pt-2">
                  <button
                    type="button"
                    onClick={() => setFormData({ ...formData, is_featured: !formData.is_featured })}
                    className={`flex items-center gap-3 w-full p-4 rounded-2xl border-2 transition-all ${
                      formData.is_featured 
                        ? "bg-orange-50 border-orange-500 text-orange-600" 
                        : "bg-white border-gray-100 text-gray-500 hover:border-orange-200"
                    }`}
                  >
                    <div className={`w-6 h-6 rounded-lg flex items-center justify-center transition-colors ${formData.is_featured ? 'bg-orange-600 text-white' : 'bg-gray-100 text-gray-400'}`}>
                      <Star size={14} className={formData.is_featured ? "fill-white" : ""} />
                    </div>
                    <span className="text-sm font-black uppercase tracking-widest">Feature this store</span>
                    <div className={`ml-auto w-5 h-5 rounded-full border-2 flex items-center justify-center ${formData.is_featured ? 'border-orange-600 bg-orange-600' : 'border-gray-200'}`}>
                      {formData.is_featured && <div className="w-2 h-2 bg-white rounded-full" />}
                    </div>
                  </button>
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
                  disabled={isUploading}
                  className="flex-2 px-6 py-4 bg-orange-600 text-white rounded-2xl font-black text-xs uppercase tracking-widest shadow-lg shadow-orange-100 hover:bg-orange-700 transition-all active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isUploading ? "Uploading..." : (editingStore ? "Update Details" : "Create Store")}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
