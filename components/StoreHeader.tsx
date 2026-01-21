import { ArrowLeft, Filter, Search, Star, Clock, Info } from "lucide-react";
import { useRouter } from "next/navigation";
import Image from "next/image";

type SortOption = "name" | "price_low" | "price_high";

interface StoreHeaderProps {
  store: {
    name: string;
    description?: string;
    image_url?: string;
    cover_image?: string;
    rating?: number;
    total_ratings?: number;
  };
  sort: SortOption;
  setSort: (sort: SortOption) => void;
}

export default function StoreHeader({ 
  store, 
  sort, 
  setSort,
}: StoreHeaderProps) {
  const router = useRouter();

  return (
    <div className="relative">
      {/* Cover Image */}
      <div className="relative h-48 sm:h-64 w-full bg-gray-200">
        {store.cover_image ? (
          <Image
            src={store.cover_image}
            alt={store.name}
            fill
            className="object-cover"
          />
        ) : (
          <div className="w-full h-full bg-linear-to-br from-orange-100 to-orange-200" />
        )}
        <div className="absolute inset-0 bg-black/20" />
        
        {/* Back Button */}
        <button
          onClick={() => router.back()}
          className="absolute top-4 left-4 p-2.5 rounded-2xl bg-white/80 backdrop-blur-md shadow-sm text-gray-900 hover:bg-white transition-all active:scale-95 z-10"
        >
          <ArrowLeft size={20} strokeWidth={3} />
        </button>
      </div>

      {/* Store Info Card */}
      <div className="relative px-4 -mt-12 z-20">
        <div className="bg-white rounded-[2.5rem] border border-gray-100 p-6 shadow-xl shadow-gray-200/50">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-start gap-4">
              <div className="w-20 h-20 rounded-3xl bg-white border-4 border-white shadow-lg overflow-hidden shrink-0 -mt-12 sm:mt-0 relative">
                {store.image_url ? (
                  <Image src={store.image_url} alt={store.name} fill className="object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-3xl bg-orange-50">🏪</div>
                )}
              </div>
              <div className="min-w-0">
                <h1 className="text-2xl font-black text-gray-900 tracking-tight leading-tight mb-1 truncate">
                  {store.name}
                </h1>
                <p className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-2 line-clamp-1">
                  {store.description || "Premium Quality Partner"}
                </p>
                <div className="flex flex-wrap items-center gap-3">
                  <div className="flex items-center gap-1 text-xs font-black text-orange-600 bg-orange-50 px-2 py-1 rounded-lg">
                    <Star size={12} className="fill-orange-600" />
                    <span>{store.rating || "4.8"}</span>
                    <span className="text-[10px] opacity-60">({store.total_ratings || "100+"})</span>
                  </div>
                  <div className="flex items-center gap-1 text-[10px] font-black text-gray-400 uppercase tracking-wider border border-gray-100 px-2 py-1 rounded-lg">
                    <Clock size={12} />
                    <span>20-35 min</span>
                  </div>
                  <div className="flex items-center gap-1 text-[10px] font-black text-gray-400 uppercase tracking-wider border border-gray-100 px-2 py-1 rounded-lg">
                    <Info size={12} />
                    <span>More Info</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Filters Area */}
          <div className="mt-8 pt-6 border-t border-gray-50 flex items-center gap-3 overflow-x-auto scrollbar-hide">
            <div className="relative flex-1 min-w-[200px]">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
              <input 
                type="text" 
                placeholder="Search in store..." 
                className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border-none rounded-xl text-xs font-bold placeholder:text-gray-400 focus:ring-2 focus:ring-orange-500 transition-all"
              />
            </div>
            <select
              value={sort}
              onChange={(e) => setSort(e.target.value as SortOption)}
              className="px-4 py-2.5 bg-white border border-gray-100 rounded-xl text-xs font-black uppercase tracking-wider text-gray-600 focus:ring-2 focus:ring-orange-500 outline-none cursor-pointer"
            >
              <option value="name">A-Z</option>
              <option value="price_low">Price ↑</option>
              <option value="price_high">Price ↓</option>
            </select>
            <button className="p-2.5 rounded-xl bg-gray-50 text-gray-400 hover:text-orange-600 border border-transparent hover:border-orange-100 transition-all">
              <Filter size={18} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}