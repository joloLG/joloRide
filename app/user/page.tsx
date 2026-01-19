"use client";

import { useCallback, useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import StoresCarousel from "@/components/StoresCarousel";
import ProductCard from "@/components/ProductCard";

interface HeroSettings {
  id: string;
  background_color: string;
  background_image?: string;
  title?: string;
  subtitle?: string;
}

interface Store {
  id: string;
  name: string;
  image?: string;
  is_featured: boolean;
}

interface Product {
  id: string;
  name: string;
  price: number;
  image?: string;
  store_id: string;
}

export default function UserHome() {
  const [hero, setHero] = useState<HeroSettings | null>(null);
  const [stores, setStores] = useState<Store[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchHomeData = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      // Fetch all data in parallel
      const [
        { data: heroData },
        { data: storeData },
        { data: productData },
      ] = await Promise.all([
        supabase.from("hero_settings").select("*").single(),
        supabase
          .from("stores")
          .select("*")
          .eq("is_featured", true)
          .limit(10),
        supabase
          .from("products")
          .select("*")
          .order("created_at", { ascending: false })
          .limit(10),
      ]);

      setHero(heroData);
      setStores(storeData || []);
      setProducts(productData || []);
    } catch (err) {
      console.error('Error fetching home data:', err);
      setError('Failed to load data. Please try again.');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchHomeData();
  }, [fetchHomeData]);

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
          onClick={fetchHomeData}
          className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
        >
          Retry
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6 pb-4">
      {/* HERO */}
      {hero && (
        <div
          className="h-44 rounded-b-3xl flex flex-col justify-center px-6 text-white"
          style={{
            backgroundColor: hero.background_color,
            backgroundImage: hero.background_image ? `url(${hero.background_image})` : 'none',
            backgroundSize: 'cover',
            backgroundPosition: 'center',
          }}
        >
          {hero.title && <h1 className="text-2xl font-bold">{hero.title}</h1>}
          {hero.subtitle && <p className="text-sm opacity-90">{hero.subtitle}</p>}
        </div>
      )}

      {/* STORES */}
      <section className="px-4">
        <h2 className="font-semibold mb-2">Featured Stores</h2>
        <StoresCarousel stores={stores} />
      </section>

      {/* PRODUCTS */}
      <section className="px-4">
        <h2 className="font-semibold mb-2">Recommended For You</h2>
        <div className="grid grid-cols-2 gap-4">
          {products.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      </section>
    </div>
  );
}
