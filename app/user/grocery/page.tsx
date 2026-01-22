"use client";

import { useCallback, useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import StoresCarousel from "@/components/StoresCarousel";
import ProductCard from "@/components/ProductCard";
import StoreHeader from "@/components/StoreHeader";
import ProductList from "@/components/ProductList";

interface Store {
  id: string;
  name: string;
  description: string;
  cover_image: string;
  is_featured: boolean;
}

interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  image_url: string;
  store_id: string;
  store_name?: string;
  created_at: string;
  updated_at: string;
}

export default function GroceryPage() {
  const [stores, setStores] = useState<Store[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [selectedStore, setSelectedStore] = useState<Store | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [sort, setSort] = useState<"name" | "price_low" | "price_high">("name");

  const fetchGroceryStores = useCallback(async () => {
    try {
      const { data, error } = await supabase
        .from("stores")
        .select("*")
        .eq("is_featured", true)
        .order("created_at", { ascending: false })
        .limit(10);

      if (error) throw error;
      setStores(data || []);
    } catch (err) {
      console.error("Error fetching grocery stores:", err);
      setError("Failed to load grocery stores");
    }
  }, []);

  const fetchGroceryProducts = useCallback(async () => {
    try {
      const { data, error } = await supabase
        .from("products")
        .select(`
          *,
          stores(name)
        `)
        .eq("is_available", true)
        .order("created_at", { ascending: false })
        .limit(20);

      if (error) throw error;
      
      const productsWithStoreNames = data?.map(product => ({
        ...product,
        store_name: product.stores?.name || 'Unknown Store'
      })) || [];
      
      setProducts(productsWithStoreNames);
    } catch (err) {
      console.error("Error fetching grocery products:", err);
      setError("Failed to load grocery products");
    }
  }, []);

  useEffect(() => {
    const loadData = async () => {
      setIsLoading(true);
      await Promise.all([fetchGroceryStores(), fetchGroceryProducts()]);
      setIsLoading(false);
    };

    loadData();
  }, [fetchGroceryStores, fetchGroceryProducts]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-4 text-center">
        <p className="text-red-500 mb-4">{error}</p>
        <button
          onClick={() => {
            setError(null);
            fetchGroceryStores();
            fetchGroceryProducts();
          }}
          className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
        >
          Retry
        </button>
      </div>
    );
  }

  if (selectedStore) {
    return (
      <div className="pb-16">
        <StoreHeader
          store={selectedStore}
          sort={sort}
          setSort={setSort}
        />
        <ProductList products={products.filter(p => p.store_id === selectedStore.id)} storeId={selectedStore.id} />
      </div>
    );
  }

  return (
    <div className="space-y-8 pb-24 sm:pb-12">
      {/* HEADER */}
      <div className="px-4 pt-4">
        <div className="flex items-center gap-3 mb-1">
          <div className="bg-orange-100 p-2 rounded-xl">
            <span className="text-xl">🛒</span>
          </div>
          <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight">Grocery</h1>
        </div>
        <p className="text-gray-500 font-medium ml-12">Fresh essentials delivered to your door</p>
      </div>

      {/* FEATURED GROCERY STORES */}
      {stores.length > 0 && (
        <section className="px-4">
          <h2 className="text-lg font-bold text-gray-900 mb-4">Featured Stores</h2>
          <StoresCarousel stores={stores} />
        </section>
      )}

      {/* GROCERY PRODUCTS */}
      <section className="px-4">
        <div className="flex justify-between items-center mb-4 px-1">
          <h2 className="text-xl font-bold text-gray-900">Daily Essentials</h2>
          <span className="bg-gray-100 text-gray-500 px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider">
            {products.length} Items
          </span>
        </div>
        
        {products.length > 0 ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
            {products.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        ) : (
          <div className="bg-white rounded-3xl border border-dashed border-gray-200 py-12 text-center">
            <div className="text-4xl mb-3">🧊</div>
            <p className="text-gray-400 font-medium">No grocery items found</p>
          </div>
        )}
      </section>
    </div>
  );
}
