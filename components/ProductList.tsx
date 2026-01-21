"use client";

import Link from "next/link";
import Image from "next/image";
import { useCartStore } from "@/store/cartStore";
import { toast } from "react-hot-toast";
import { Plus } from "lucide-react";

export interface Product {
  id: string;
  name: string;
  price: number;
  image_url?: string;
  store_id: string;
  description?: string;
  created_at: string;
  updated_at: string;
}

interface ProductListProps {
  products: Product[];
  storeId: string;
}

export default function ProductList({ products }: ProductListProps) {
  const addItem = useCartStore((state) => state.addItem);

  const handleQuickAdd = (e: React.MouseEvent, product: Product) => {
    e.preventDefault();
    e.stopPropagation();
    
    addItem({
      id: product.id,
      name: product.name,
      price: product.price,
      image: product.image_url || "/placeholder.png",
      quantity: 1,
    });
    
    toast.success(`${product.name} added to cart!`, {
      icon: '🛒',
      style: {
        borderRadius: '1rem',
        background: '#333',
        color: '#fff',
        fontSize: '12px',
        fontWeight: 'bold',
      },
    });
  };

  if (products.length === 0) {
    return (
      <div className="py-20 px-4 text-center">
        <div className="text-6xl mb-6 grayscale opacity-20 text-center">🥡</div>
        <p className="text-gray-900 font-black text-xl mb-2">No products available</p>
        <p className="text-gray-500 font-medium">This store hasn&apos;t added any products yet.</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 p-4 max-w-7xl mx-auto">
      {products.map((product) => (
        <Link
          key={product.id}
          href={`/user/product/${product.id}`}
          className="group block"
        >
          <div className="bg-white rounded-[2rem] border border-gray-100 overflow-hidden shadow-sm hover:shadow-md hover:border-orange-200 transition-all active:scale-[0.98]">
            <div className="relative aspect-square overflow-hidden bg-gray-100">
              <Image
                src={product.image_url || "/placeholder.png"}
                alt={product.name}
                fill
                className="object-cover group-hover:scale-110 transition-transform duration-500"
                sizes="(max-width: 768px) 50vw, (max-width: 1200px) 33vw, 20vw"
              />
              <button
                onClick={(e) => handleQuickAdd(e, product)}
                className="absolute bottom-3 right-3 w-10 h-10 rounded-xl bg-orange-600 text-white shadow-lg shadow-orange-200 flex items-center justify-center transition-all hover:bg-orange-700 active:scale-90 z-10"
              >
                <Plus size={20} strokeWidth={3} />
              </button>
            </div>
            <div className="p-4">
              <h3 className="font-black text-gray-900 text-sm line-clamp-1 leading-tight mb-1">{product.name}</h3>
              <p className="text-orange-600 font-black text-base tracking-tighter mt-2">
                ₱{product.price.toLocaleString()}
              </p>
            </div>
          </div>
        </Link>
      ))}
    </div>
  );
}
