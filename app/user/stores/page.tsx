"use client";

import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { Search, Filter, Star } from "lucide-react";

interface Store {
  id: string;
  name: string;
  description: string;
  image?: string;
  is_featured: boolean;
  rating?: number;
  total_ratings?: number;
  delivery_time?: string;
  delivery_fee?: number;
}

export default function StoresPage() {
  const [stores, setStores] = useState<Store[]>([]);
  const [filteredStores, setFilteredStores] = useState<Store[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [showFilters, setShowFilters] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [sortBy, setSortBy] = useState("featured");

  const categories = [
    { id: "all", name: "All Stores" },
    { id: "food", name: "Food & Restaurants" },
    { id: "grocery", name: "Grocery" },
    { id: "pharmacy", name: "Pharmacy" },
    { id: "convenience", name: "Convenience Store" },
  ];

  useEffect(() => {
    fetchStores();
  }, []);

  useEffect(() => {
    filterAndSortStores();
  }, [stores, searchQuery, selectedCategory, sortBy]);

  const fetchStores = async () => {
    try {
      const { data, error } = await supabase
        .from("stores")
        .select(`
          *,
          reviews:reviews(count)
        `)
        .order("is_featured", { ascending: false })
        .order("name");

      if (error) throw error;

      const storesWithRatings = (data || []).map(store => ({
        ...store,
        rating: 4.5, // Placeholder - would calculate from reviews
        total_ratings: store.reviews?.[0]?.count || 0,
        delivery_time: "20-30 min",
        delivery_fee: 40,
      }));

      setStores(storesWithRatings);
    } catch (error) {
      console.error("Error fetching stores:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const filterAndSortStores = () => {
    let filtered = [...stores];

    // Apply search filter
    if (searchQuery) {
      filtered = filtered.filter(store =>
        store.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        store.description.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    // Apply category filter (placeholder - would need category field in database)
    if (selectedCategory !== "all") {
      // For now, just randomly filter some stores as example
      filtered = filtered.filter((_, index) => index % 2 === 0);
    }

    // Apply sorting
    switch (sortBy) {
      case "featured":
        filtered.sort((a, b) => (b.is_featured ? 1 : 0) - (a.is_featured ? 1 : 0));
        break;
      case "rating":
        filtered.sort((a, b) => (b.rating || 0) - (a.rating || 0));
        break;
      case "name":
        filtered.sort((a, b) => a.name.localeCompare(b.name));
        break;
      case "delivery_fee":
        filtered.sort((a, b) => (a.delivery_fee || 0) - (b.delivery_fee || 0));
        break;
    }

    setFilteredStores(filtered);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="pb-16">
      {/* HEADER */}
      <div className="sticky top-0 bg-white z-10 border-b">
        <div className="p-4 space-y-3">
          <h1 className="text-xl font-bold">All Stores</h1>
          
          {/* SEARCH BAR */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
            <input
              type="text"
              placeholder="Search stores..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-3 border rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500"
            />
          </div>

          {/* CATEGORY FILTERS */}
          <div className="flex gap-2 overflow-x-auto pb-2">
            {categories.map((category) => (
              <button
                key={category.id}
                onClick={() => setSelectedCategory(category.id)}
                className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-colors ${
                  selectedCategory === category.id
                    ? "bg-orange-600 text-white"
                    : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                }`}
              >
                {category.name}
              </button>
            ))}
            <button
              onClick={() => setShowFilters(!showFilters)}
              className="ml-auto p-2 rounded-lg bg-gray-100 hover:bg-gray-200 shrink-0"
            >
              <Filter size={20} />
            </button>
          </div>

          {/* ADVANCED FILTERS */}
          {showFilters && (
            <div className="space-y-3 p-3 bg-gray-50 rounded-lg">
              <div>
                <label className="block text-sm font-medium mb-2">Sort by</label>
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="w-full p-2 border rounded-lg"
                >
                  <option value="featured">Featured First</option>
                  <option value="rating">Highest Rated</option>
                  <option value="name">Name (A-Z)</option>
                  <option value="delivery_fee">Lowest Delivery Fee</option>
                </select>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* STORES LIST */}
      <div className="p-4">
        {filteredStores.length === 0 ? (
          <div className="text-center py-8">
            <div className="text-gray-400 text-6xl mb-4">🏪</div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">No stores found</h3>
            <p className="text-gray-600">
              {searchQuery ? "Try different search terms" : "Check back later for new stores"}
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {filteredStores.map((store) => (
              <div
                key={store.id}
                className="bg-white rounded-lg border hover:shadow-lg transition-shadow cursor-pointer"
                onClick={() => window.location.href = `/user/store/${store.id}`}
              >
                <div className="p-4">
                  <div className="flex gap-4">
                    {/* STORE IMAGE */}
                    <div className="w-20 h-20 bg-gray-200 rounded-lg overflow-hidden shrink-0">
                      {store.image ? (
                        <img
                          src={store.image}
                          alt={store.name}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-gray-400">
                          🏪
                        </div>
                      )}
                    </div>

                    {/* STORE INFO */}
                    <div className="flex-1">
                      <div className="flex items-start justify-between mb-1">
                        <h3 className="font-semibold text-lg">{store.name}</h3>
                        {store.is_featured && (
                          <span className="px-2 py-1 bg-orange-100 text-orange-600 text-xs rounded-full">
                            Featured
                          </span>
                        )}
                      </div>

                      <p className="text-gray-600 text-sm mb-2 line-clamp-2">
                        {store.description}
                      </p>

                      <div className="flex items-center gap-4 text-sm text-gray-600">
                        {/* RATING */}
                        <div className="flex items-center gap-1">
                          <Star size={14} className="fill-yellow-400 text-yellow-400" />
                          <span>{store.rating?.toFixed(1) || "4.5"}</span>
                          <span className="text-gray-400">({store.total_ratings || 0})</span>
                        </div>

                        {/* DELIVERY TIME */}
                        <div className="flex items-center gap-1">
                          <span>🕐</span>
                          <span>{store.delivery_time}</span>
                        </div>

                        {/* DELIVERY FEE */}
                        <div className="flex items-center gap-1">
                          <span>🚚</span>
                          <span>₱{store.delivery_fee}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
