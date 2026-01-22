"use client";

import { useCallback, useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { useParams } from "next/navigation";
import StoreHeader from "@/components/StoreHeader";
import ProductList from "@/components/ProductList";

interface Store {
  id: string;
  name: string;
  description?: string;
  image_url?: string;
  created_at: string;
  updated_at: string;
}

interface Product {
  id: string;
  name: string;
  description?: string;
  price: number;
  image_url?: string;
  store_id: string;
  created_at: string;
  updated_at: string;
}

type SortOption = "name" | "price_low" | "price_high";

export default function StorePage() {
  const { id } = useParams<{ id: string }>();
  const [store, setStore] = useState<Store | null>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const [sort, setSort] = useState<SortOption>("name");
  const [priceRange, setPriceRange] = useState<[number, number]>([0, 10000]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchStore = useCallback(async () => {
    try {
      const { data, error: storeError } = await supabase
        .from("stores")
        .select("*")
        .eq("id", id)
        .single();

      if (storeError) throw storeError;
      setStore(data);
    } catch (err) {
      console.error('Error fetching store:', err);
      setError('Failed to load store data');
    }
  }, [id]);

  const fetchProducts = useCallback(async () => {
    try {
      setIsLoading(true);
      let query = supabase
        .from("products")
        .select("*")
        .eq("store_id", id)
        .gte("price", priceRange[0])
        .lte("price", priceRange[1]);

      if (sort === "price_low") query = query.order("price", { ascending: true });
      if (sort === "price_high") query = query.order("price", { ascending: false });
      if (sort === "name") query = query.order("name");

      const { data, error: productsError } = await query;
      
      if (productsError) throw productsError;
      setProducts(data || []);
    } catch (err) {
      console.error('Error fetching products:', err);
      setError('Failed to load products');
    } finally {
      setIsLoading(false);
    }
  }, [id, sort, priceRange]);

  useEffect(() => {
    const loadData = async () => {
      await Promise.all([fetchStore(), fetchProducts()]);
    };
    
    loadData();
  }, [fetchStore, fetchProducts]);

  if (isLoading && !store) {
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
            fetchStore();
            fetchProducts();
          }}
          className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
        >
          Retry
        </button>
      </div>
    );
  }

  if (!store) {
    return (
      <div className="p-4 text-center">
        <p>Store not found</p>
      </div>
    );
  }

  return (
    <div className="pb-16">
      <StoreHeader
        store={store}
        sort={sort}
        setSort={setSort}
      />
      {isLoading ? (
        <div className="flex justify-center p-8">
          <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500"></div>
        </div>
      ) : (
        <ProductList products={products} storeId={id} />
      )}
    </div>
  );
}
