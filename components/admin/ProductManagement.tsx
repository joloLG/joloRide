"use client";

import Image from "next/image";
import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/lib/supabase";
import { ImageUploader } from "@/lib/storage";
import { Plus, Edit2, Trash2, ImageIcon, CheckCircle, XCircle, Store as StoreIcon, X, Upload } from "lucide-react";
import { toast } from "react-hot-toast";

interface Store {
  id: string;
  name: string;
}

interface Product {
  id: string;
  name: string;
  price: number;
  image?: string;
  image_url?: string;
  store_id: string;
  is_available: boolean;
  created_at: string;
}

export default function ProductManagement() {
  const [products, setProducts] = useState<Product[]>([]);
  const [stores, setStores] = useState<Store[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [formData, setFormData] = useState({
    name: "",
    price: "",
    image: "",
    image_url: "",
    store_id: "",
    is_available: true,
  });
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);

  const fetchProducts = useCallback(async () => {
    try {
      setIsLoading(true);
      const { data, error } = await supabase
        .from("products")
        .select(`
          *,
          stores (
            name
          )
        `)
        .order("created_at", { ascending: false });

      if (error) throw error;
      setProducts(data || []);
    } catch (error) {
      console.error("Error fetching products:", error);
      toast.error("Failed to load products");
    } finally {
      setIsLoading(false);
    }
  }, []);

  const fetchStores = useCallback(async () => {
    try {
      const { data, error } = await supabase
        .from("stores")
        .select("id, name")
        .order("name");
      if (error) throw error;
      setStores(data || []);
    } catch (error) {
      console.error("Error fetching stores:", error);
      toast.error("Failed to load stores");
    }
  }, []);

  useEffect(() => {
    fetchProducts();
    fetchStores();
  }, [fetchProducts, fetchStores]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setIsUploading(true);
      let imageUrl = formData.image || formData.image_url;

      // Upload new image if selected
      if (imageFile) {
        const validation = ImageUploader.validateImageFile(imageFile);
        if (!validation.valid) {
          toast.error(validation.error);
          setIsUploading(false);
          return;
        }

        const uploadResult = await ImageUploader.uploadImage(imageFile, 'products');
        if (uploadResult.error) {
          toast.error(uploadResult.error);
          setIsUploading(false);
          return;
        }
        imageUrl = uploadResult.url;
      }

      const productData = {
        name: formData.name,
        price: parseFloat(formData.price),
        image: imageUrl,
        image_url: imageUrl,
        store_id: formData.store_id,
        is_available: formData.is_available,
      };

      if (editingProduct) {
        const { error } = await supabase
          .from("products")
          .update(productData)
          .eq("id", editingProduct.id);
        if (error) throw error;
        toast.success("Product updated successfully");
      } else {
        const { error } = await supabase.from("products").insert(productData);
        if (error) throw error;
        toast.success("Product created successfully");
      }

      await fetchProducts();
      setIsModalOpen(false);
      setEditingProduct(null);
      setFormData({
        name: "",
        price: "",
        image: "",
        image_url: "",
        store_id: "",
        is_available: true,
      });
      setImageFile(null);
    } catch (error) {
      console.error("Error saving product:", error);
      toast.error("Failed to save product");
    } finally {
      setIsUploading(false);
    }
  };

  const handleEdit = (product: Product) => {
    setEditingProduct(product);
    setFormData({
      name: product.name,
      price: product.price.toString(),
      image: product.image || product.image_url || "",
      image_url: product.image_url || product.image || "",
      store_id: product.store_id,
      is_available: product.is_available,
    });
    setImageFile(null);
    setIsModalOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (confirm("Are you sure you want to delete this product?")) {
      try {
        const { error } = await supabase.from("products").delete().eq("id", id);
        if (error) throw error;
        toast.success("Product deleted successfully");
        await fetchProducts();
      } catch (error) {
        console.error("Error deleting product:", error);
        toast.error("Failed to delete product");
      }
    }
  };

  const toggleAvailability = async (id: string, isAvailable: boolean) => {
    try {
      const { error } = await supabase
        .from("products")
        .update({ is_available: !isAvailable })
        .eq("id", id);
      if (error) throw error;
      toast.success(isAvailable ? "Product hidden" : "Product made available");
      await fetchProducts();
    } catch (error) {
      console.error("Error updating product:", error);
      toast.error("Failed to update availability");
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
          <h2 className="text-2xl font-black text-gray-900 tracking-tight">Products</h2>
          <p className="text-sm font-medium text-gray-500">Manage your items across all stores</p>
        </div>
        <button
          onClick={() => {
            setEditingProduct(null);
            setFormData({
              name: "",
              price: "",
              image: "",
              image_url: "",
              store_id: "",
              is_available: true,
            });
            setImageFile(null);
            setIsModalOpen(true);
          }}
          className="w-full sm:w-auto px-6 py-3 bg-orange-600 text-white rounded-2xl font-bold text-sm shadow-lg shadow-orange-100 hover:bg-orange-700 transition-all active:scale-95 flex items-center justify-center gap-2"
        >
          <Plus size={18} strokeWidth={3} />
          <span>Add New Product</span>
        </button>
      </div>

      {/* Products Grid/Table */}
      <div className="bg-white rounded-[2.5rem] border border-gray-100 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-50">
            <thead>
              <tr className="bg-gray-50/50">
                <th className="px-8 py-4 text-left text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">Product</th>
                <th className="px-8 py-4 text-left text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">Price</th>
                <th className="px-8 py-4 text-left text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">Store</th>
                <th className="px-8 py-4 text-left text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">Status</th>
                <th className="px-8 py-4 text-right text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50 bg-white">
              {products.map((product) => (
                <tr key={product.id} className="hover:bg-gray-50/50 transition-colors group">
                  <td className="px-8 py-5 whitespace-nowrap">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 rounded-xl bg-gray-100 overflow-hidden relative border border-gray-50 shrink-0">
                        {product.image ? (
                          <Image
                            src={product.image}
                            alt={product.name}
                            fill
                            className="object-cover"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-xl bg-orange-50 text-orange-600 font-black">
                            {product.name[0]}
                          </div>
                        )}
                      </div>
                      <div className="min-w-0">
                        <p className="text-sm font-black text-gray-900 group-hover:text-orange-600 transition-colors truncate">{product.name}</p>
                        <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mt-0.5">ID: #{product.id.slice(0, 8)}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-8 py-5 whitespace-nowrap">
                    <p className="text-sm font-black text-orange-600">₱{product.price.toLocaleString()}</p>
                  </td>
                  <td className="px-8 py-5 whitespace-nowrap">
                    <div className="flex items-center gap-2">
                      <div className="p-1 bg-gray-100 rounded-lg">
                        <StoreIcon size={12} className="text-gray-400" />
                      </div>
                      <p className="text-xs font-bold text-gray-600">
                        {(product as Product & { stores?: { name: string } }).stores?.name || "Unknown Store"}
                      </p>
                    </div>
                  </td>
                  <td className="px-8 py-5 whitespace-nowrap">
                    <button
                      onClick={() => toggleAvailability(product.id, product.is_available)}
                      className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all border ${
                        product.is_available
                          ? "bg-green-50 text-green-600 border-green-100"
                          : "bg-red-50 text-red-600 border-red-100"
                      }`}
                    >
                      {product.is_available ? (
                        <><CheckCircle size={12} strokeWidth={3} /><span>Available</span></>
                      ) : (
                        <><XCircle size={12} strokeWidth={3} /><span>Hidden</span></>
                      )}
                    </button>
                  </td>
                  <td className="px-8 py-5 whitespace-nowrap text-right">
                    <div className="flex justify-end gap-2">
                      <button
                        onClick={() => handleEdit(product)}
                        className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-xl transition-all active:scale-90"
                        title="Edit Product"
                      >
                        <Edit2 size={18} strokeWidth={2.5} />
                      </button>
                      <button
                        onClick={() => handleDelete(product.id)}
                        className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-xl transition-all active:scale-90"
                        title="Delete Product"
                      >
                        <Trash2 size={18} strokeWidth={2.5} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {products.length === 0 && (
            <div className="py-20 text-center">
              <div className="text-4xl mb-4 grayscale opacity-20 text-center">📦</div>
              <p className="text-gray-400 font-bold text-xs uppercase tracking-widest">No products found</p>
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
                  {editingProduct ? "Edit Product" : "New Product"}
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
                    Product Name
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="e.g. Classic Beef Burger"
                    className="w-full px-4 py-3 bg-gray-50 border-none rounded-2xl text-sm font-bold placeholder:text-gray-400 focus:ring-2 focus:ring-orange-500 transition-all"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] mb-2 ml-1">
                      Price (₱)
                    </label>
                    <input
                      type="number"
                      step="0.01"
                      min="0"
                      required
                      value={formData.price}
                      onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                      placeholder="0.00"
                      className="w-full px-4 py-3 bg-gray-50 border-none rounded-2xl text-sm font-bold placeholder:text-gray-400 focus:ring-2 focus:ring-orange-500 transition-all"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] mb-2 ml-1">
                      Status
                    </label>
                    <button
                      type="button"
                      onClick={() => setFormData({ ...formData, is_available: !formData.is_available })}
                      className={`w-full flex items-center justify-center gap-2 h-[44px] rounded-2xl border-2 transition-all ${
                        formData.is_available 
                          ? "bg-green-50 border-green-500 text-green-600" 
                          : "bg-red-50 border-red-500 text-red-600"
                      }`}
                    >
                      {formData.is_available ? <CheckCircle size={16} strokeWidth={3} /> : <XCircle size={16} strokeWidth={3} />}
                      <span className="text-[10px] font-black uppercase tracking-widest">{formData.is_available ? "Available" : "Hidden"}</span>
                    </button>
                  </div>
                </div>

                <div>
                  <label className="block text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] mb-2 ml-1">
                    Establishment / Store
                  </label>
                  <div className="relative">
                    <StoreIcon className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
                    <select
                      required
                      value={formData.store_id}
                      onChange={(e) => setFormData({ ...formData, store_id: e.target.value })}
                      className="w-full pl-11 pr-4 py-3 bg-gray-50 border-none rounded-2xl text-sm font-bold text-gray-900 focus:ring-2 focus:ring-orange-500 transition-all appearance-none cursor-pointer"
                    >
                      <option value="">Select a store</option>
                      {stores.map((store) => (
                        <option key={store.id} value={store.id}>
                          {store.name}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
                
                <div>
                  <label className="block text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] mb-2 ml-1">
                    Product Image
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
                        id="product-image-upload"
                      />
                      <label
                        htmlFor="product-image-upload"
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
                          alt="Product preview"
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
                  {isUploading ? "Uploading..." : (editingProduct ? "Update Item" : "Create Product")}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
