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
        { data: orderData },
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
          .eq("is_available", true)
          .order("created_at", { ascending: false })
          .limit(20),
        // Get user's order history for recommendations
        supabase
          .from("orders")
          .select(`
            order_items(
              product_id
            )
          `)
          .eq("user_id", (await supabase.auth.getUser()).data.user?.id)
          .order("created_at", { ascending: false })
          .limit(5)
      ]);

      setHero(heroData);
      setStores(storeData || []);

      // Implement recommendation algorithm
      let recommendedProducts = productData || [];
      
      if (orderData && orderData.length > 0) {
        // Get product IDs from user's order history
        const orderedProductIds = orderData
          .flatMap(order => order.order_items)
          .map(item => item.product_id);

        if (orderedProductIds.length > 0) {
          // Get products from same stores as previously ordered items
          const { data: storeProducts } = await supabase
            .from("products")
            .select("*")
            .in("store_id", 
              (await supabase
                .from("products")
                .select("store_id")
                .in("id", orderedProductIds)
              ).data?.map(p => p.store_id) || []
            )
            .eq("is_available", true)
            .not("id", "in", `(${orderedProductIds.join(',')})`)
            .order("created_at", { ascending: false })
            .limit(10);

          if (storeProducts && storeProducts.length > 0) {
            recommendedProducts = storeProducts;
          }
        }
      }

      // If no recommendations, use popular products (most recent)
      setProducts(recommendedProducts.slice(0, 10));
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
    <div className="space-y-8 pb-20 sm:pb-8">
      {/* HERO */}
      {hero && (
        <div className="px-4 pt-2">
          <div
            className="h-48 sm:h-64 rounded-[2rem] flex flex-col justify-center px-8 text-white relative overflow-hidden shadow-lg shadow-orange-100"
            style={{
              backgroundColor: hero.background_color,
              backgroundImage: hero.background_image ? `url(${hero.background_image})` : 'none',
              backgroundSize: 'cover',
              backgroundPosition: 'center',
            }}
          >
            {/* Overlay for better text readability if there's a background image */}
            {hero.background_image && <div className="absolute inset-0 bg-black/20" />}
            
            <div className="relative z-10">
              {hero.title && <h1 className="text-3xl sm:text-4xl font-extrabold mb-2 drop-shadow-md">{hero.title}</h1>}
              {hero.subtitle && <p className="text-base sm:text-lg opacity-95 max-w-[240px] leading-tight drop-shadow-sm">{hero.subtitle}</p>}
              
              <button className="mt-6 px-6 py-2 bg-white text-gray-900 rounded-full text-sm font-bold shadow-sm hover:bg-orange-50 transition-colors w-fit">
                Order Now
              </button>
            </div>
          </div>
        </div>
      )}

      {/* STORES */}
      <section className="px-4">
        <div className="flex items-center justify-between mb-4 px-1">
          <h2 className="text-xl font-bold text-gray-900">Featured Stores</h2>
          <button className="text-sm font-bold text-orange-600 hover:text-orange-700">View All</button>
        </div>
        <StoresCarousel stores={stores} />
      </section>

      {/* PRODUCTS */}
      <section className="px-4">
        <div className="flex items-center justify-between mb-4 px-1">
          <h2 className="text-xl font-bold text-gray-900">Recommended For You</h2>
          <button className="text-sm font-bold text-orange-600 hover:text-orange-700">See More</button>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
          {products.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      </section>
    </div>
  );
}
