"use client";

import { useCallback, useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { Search, Filter, X } from "lucide-react";
import ProductCard from "@/components/ProductCard";
import StoreHeader from "@/components/StoreHeader";

interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  image_url: string;
  store_id: string;
  store_name?: string;
  is_available: boolean;
}

interface Store {
  id: string;
  name: string;
  description: string;
  cover_image: string;
  is_featured: boolean;
}

type SearchType = "all" | "products" | "stores";
type SortOption = "relevance" | "name" | "price_low" | "price_high";

export default function SearchPage() {
  const [query, setQuery] = useState("");
  const [searchType, setSearchType] = useState<SearchType>("all");
  const [sort, setSort] = useState<SortOption>("relevance");
  const [products, setProducts] = useState<Product[]>([]);
  const [stores, setStores] = useState<Store[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showFilters, setShowFilters] = useState(false);
  const [priceRange, setPriceRange] = useState<[number, number]>([0, 10000]);

  const searchProducts = useCallback(async (searchQuery: string) => {
    if (!searchQuery.trim()) return [];

    try {
      let productQuery = supabase
        .from("products")
        .select(`
          *,
          stores(name)
        `)
        .eq("is_available", true)
        .or(`name.ilike.%${searchQuery}%,description.ilike.%${searchQuery}%`);

      // Apply price filter
      if (priceRange[0] > 0 || priceRange[1] < 10000) {
        productQuery = productQuery
          .gte("price", priceRange[0])
          .lte("price", priceRange[1]);
      }

      // Apply sorting
      if (sort === "name") productQuery = productQuery.order("name");
      else if (sort === "price_low") productQuery = productQuery.order("price", { ascending: true });
      else if (sort === "price_high") productQuery = productQuery.order("price", { ascending: false });
      else productQuery = productQuery.order("created_at", { ascending: false });

      const { data, error } = await productQuery.limit(50);

      if (error) throw error;

      return data?.map(product => ({
        ...product,
        store_name: product.stores?.name || 'Unknown Store'
      })) || [];
    } catch (err) {
      console.error("Error searching products:", err);
      return [];
    }
  }, [sort, priceRange]);

  const searchStores = useCallback(async (searchQuery: string) => {
    if (!searchQuery.trim()) return [];

    try {
      const { data, error } = await supabase
        .from("stores")
        .select("*")
        .or(`name.ilike.%${searchQuery}%,description.ilike.%${searchQuery}%`)
        .order("is_featured", { ascending: false })
        .order("name")
        .limit(20);

      if (error) throw error;
      return data || [];
    } catch (err) {
      console.error("Error searching stores:", err);
      return [];
    }
  }, []);

  const performSearch = useCallback(async () => {
    if (!query.trim()) {
      setProducts([]);
      setStores([]);
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const results = await Promise.all([
        searchType === "all" || searchType === "products" ? searchProducts(query) : [],
        searchType === "all" || searchType === "stores" ? searchStores(query) : []
      ]);

      setProducts(results[0]);
      setStores(results[1]);
    } catch (err) {
      setError("Search failed. Please try again.");
    } finally {
      setIsLoading(false);
    }
  }, [query, searchType, searchProducts, searchStores]);

  useEffect(() => {
    const debounceTimer = setTimeout(() => {
      performSearch();
    }, 300);

    return () => clearTimeout(debounceTimer);
  }, [performSearch]);

  const clearSearch = () => {
    setQuery("");
    setProducts([]);
    setStores([]);
  };

  return (
    <div className="pb-24 sm:pb-12 bg-gray-50 min-h-screen">
      {/* SEARCH HEADER */}
      <div className="sticky top-0 bg-white/80 backdrop-blur-lg z-30 border-b border-gray-100 shadow-sm shadow-gray-100/50">
        <div className="p-4 space-y-4 max-w-7xl mx-auto">
          {/* SEARCH INPUT */}
          <div className="relative group">
            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 group-focus-within:text-orange-500 transition-colors" size={18} />
            <input
              type="text"
              placeholder="Search for food, groceries, stores..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="w-full pl-12 pr-12 py-3.5 bg-gray-100/80 border-none rounded-2xl focus:ring-2 focus:ring-orange-500 text-sm font-bold placeholder:text-gray-500 transition-all"
              autoFocus
            />
            {query && (
              <button
                onClick={clearSearch}
                className="absolute right-4 top-1/2 transform -translate-y-1/2 w-6 h-6 flex items-center justify-center bg-gray-200 hover:bg-gray-300 text-gray-600 rounded-full transition-colors"
              >
                <X size={14} strokeWidth={3} />
              </button>
            )}
          </div>

          {/* SEARCH TYPE FILTERS */}
          <div className="flex gap-2 items-center overflow-x-auto scrollbar-hide pb-1">
            {(["all", "products", "stores"] as SearchType[]).map((type) => (
              <button
                key={type}
                onClick={() => setSearchType(type)}
                className={`px-6 py-2 rounded-full text-[10px] font-black uppercase tracking-widest transition-all whitespace-nowrap ${
                  searchType === type
                    ? "bg-orange-600 text-white shadow-lg shadow-orange-100"
                    : "bg-white text-gray-500 border border-gray-100 hover:bg-gray-50"
                }`}
              >
                {type}
              </button>
            ))}
            <div className="flex-1" />
            <button
              onClick={() => setShowFilters(!showFilters)}
              className={`p-2.5 rounded-xl border transition-all ${
                showFilters 
                  ? "bg-orange-50 border-orange-200 text-orange-600" 
                  : "bg-white border-gray-100 text-gray-500"
              }`}
            >
              <Filter size={18} />
            </button>
          </div>

          {/* ADVANCED FILTERS */}
          {showFilters && (
            <div className="space-y-4 p-5 bg-orange-50/50 rounded-3xl border border-orange-100 animate-in fade-in slide-in-from-top-2 duration-200">
              <div>
                <label className="block text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] mb-3">Sort by</label>
                <div className="grid grid-cols-2 gap-2">
                  {(["relevance", "name", "price_low", "price_high"] as SortOption[]).map((opt) => (
                    <button
                      key={opt}
                      onClick={() => setSort(opt)}
                      className={`px-3 py-2.5 rounded-xl text-xs font-bold border transition-all ${
                        sort === opt
                          ? "bg-white border-orange-500 text-orange-600 shadow-sm"
                          : "bg-white/50 border-gray-100 text-gray-500 hover:border-orange-200"
                      }`}
                    >
                      {opt.replace('_', ' ')}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] mb-3">
                  Price Range: <span className="text-orange-600">₱{priceRange[0]} - ₱{priceRange[1]}</span>
                </label>
                <div className="flex gap-3">
                  <div className="relative flex-1">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-xs font-bold">₱</span>
                    <input
                      type="number"
                      placeholder="Min"
                      value={priceRange[0]}
                      onChange={(e) => setPriceRange([Number(e.target.value), priceRange[1]])}
                      className="w-full pl-7 pr-3 py-2.5 bg-white border border-gray-100 rounded-xl text-xs font-bold focus:ring-2 focus:ring-orange-500 transition-all"
                    />
                  </div>
                  <div className="relative flex-1">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-xs font-bold">₱</span>
                    <input
                      type="number"
                      placeholder="Max"
                      value={priceRange[1]}
                      onChange={(e) => setPriceRange([priceRange[0], Number(e.target.value)])}
                      className="w-full pl-7 pr-3 py-2.5 bg-white border border-gray-100 rounded-xl text-xs font-bold focus:ring-2 focus:ring-orange-500 transition-all"
                    />
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* SEARCH RESULTS */}
      <div className="p-4 max-w-7xl mx-auto">
        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-20">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-orange-600 mb-4"></div>
            <p className="text-gray-400 font-bold text-xs uppercase tracking-widest">Searching...</p>
          </div>
        ) : error ? (
          <div className="bg-red-50 border border-red-100 rounded-3xl p-8 text-center">
            <div className="text-3xl mb-3">⚠️</div>
            <p className="text-red-600 font-bold mb-4">{error}</p>
            <button
              onClick={performSearch}
              className="px-8 py-3 bg-red-600 text-white rounded-2xl font-bold text-sm shadow-lg shadow-red-100"
            >
              Retry
            </button>
          </div>
        ) : query && !isLoading && products.length === 0 && stores.length === 0 ? (
          <div className="py-20 text-center">
            <div className="text-6xl mb-6 grayscale opacity-20">🔍</div>
            <p className="text-gray-900 font-black text-xl mb-2">No matches found</p>
            <p className="text-gray-500 font-medium">Try checking your spelling or use more general terms</p>
          </div>
        ) : !query && !isLoading ? (
          <div className="py-20 text-center">
            <div className="text-6xl mb-6">🌩️</div>
            <p className="text-gray-900 font-black text-xl mb-2">Search JoloRide</p>
            <p className="text-gray-500 font-medium">Find your favorite food and essentials</p>
          </div>
        ) : (
          <div className="space-y-10">
            {/* STORES RESULTS */}
            {stores.length > 0 && (searchType === "all" || searchType === "stores") && (
              <div>
                <div className="flex items-center justify-between mb-4 px-1">
                  <h3 className="text-xl font-bold text-gray-900">Stores</h3>
                  <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">{stores.length} Found</span>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {stores.map((store) => (
                    <div
                      key={store.id}
                      className="bg-white p-4 rounded-3xl border border-gray-100 shadow-sm hover:shadow-md hover:border-orange-200 transition-all cursor-pointer group active:scale-[0.98]"
                      onClick={() => window.location.href = `/user/store/${store.id}`}
                    >
                      <div className="flex gap-4">
                        <div className="w-20 h-20 bg-gray-100 rounded-2xl overflow-hidden flex-shrink-0 relative border border-gray-50">
                          {store.cover_image ? (
                            <img
                              src={store.cover_image}
                              alt={store.name}
                              className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center text-2xl">🏪</div>
                          )}
                        </div>
                        <div className="flex-1 flex flex-col justify-center min-w-0">
                          <h4 className="font-black text-gray-900 leading-tight mb-1 truncate">{store.name}</h4>
                          <p className="text-xs text-gray-500 font-medium line-clamp-2 leading-relaxed mb-2">{store.description}</p>
                          {store.is_featured && (
                            <div className="flex">
                              <span className="px-2 py-0.5 bg-orange-100 text-orange-600 text-[10px] font-black uppercase tracking-widest rounded-lg">
                                Featured
                              </span>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* PRODUCTS RESULTS */}
            {products.length > 0 && (searchType === "all" || searchType === "products") && (
              <div>
                <div className="flex items-center justify-between mb-4 px-1">
                  <h3 className="text-xl font-bold text-gray-900">Products</h3>
                  <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">{products.length} Found</span>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
                  {products.map((product) => (
                    <ProductCard key={product.id} product={product} />
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
