type SortOption = "name" | "price_low" | "price_high";

interface StoreHeaderProps {
  store: {
    name: string;
    description?: string;
    image_url?: string;
  };
  sort: SortOption;
  setSort: (sort: SortOption) => void;
  priceRange: [number, number];
  setPriceRange: (range: [number, number]) => void;
}

export default function StoreHeader({ 
  store, 
  sort, 
  setSort,
  priceRange,
  setPriceRange 
}: StoreHeaderProps) {
  const handleSortChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setSort(e.target.value as SortOption);
  };

  return (
    <div className="bg-white shadow">
      <div className="max-w-7xl mx-auto px-4 py-6 sm:px-6 lg:px-8">
        <div className="flex items-center space-x-4">
          {store.image_url && (
            <img
              src={store.image_url}
              alt={store.name}
              className="h-16 w-16 rounded-full object-cover"
            />
          )}
          <div>
            <h1 className="text-2xl font-bold text-gray-900">{store.name}</h1>
            {store.description && (
              <p className="text-gray-600">{store.description}</p>
            )}
          </div>
        </div>
        <div className="mt-4 flex items-center space-x-4">
          <select
            value={sort}
            onChange={handleSortChange}
            className="border rounded px-3 py-2"
          >
            <option value="name">Sort by name</option>
            <option value="price_low">Price: Low to High</option>
            <option value="price_high">Price: High to Low</option>
          </select>
        </div>
      </div>
    </div>
  );
}