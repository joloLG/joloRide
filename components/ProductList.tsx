"use client";

import Link from "next/link";
import Image from "next/image";

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

export default function ProductList({ products, storeId }: ProductListProps) {
  if (products.length === 0) {
    return (
      <div className="p-8 text-center text-gray-500">
        No products found in this store.
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 gap-4 p-4">
      {products.map((product) => (
        <Link
          key={product.id}
          href={`/user/product/${product.id}`}
          className="bg-white rounded-xl shadow p-2 flex flex-col"
        >
          <div className="relative aspect-square w-full">
            <Image
              src={product.image_url || "/placeholder.png"}
              alt={product.name}
              fill
              className="object-cover rounded-lg"
              sizes="(max-width: 768px) 50vw, 33vw"
              priority={false}
            />
          </div>
          <p className="text-sm font-medium mt-2 line-clamp-1">{product.name}</p>
          <p className="text-xs text-orange-600">₱{product.price.toLocaleString()}</p>
          <button 
            className="mt-auto bg-black text-white text-xs py-2 rounded-lg hover:bg-gray-800 transition-colors"
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              // TODO: Implement add to cart functionality
            }}
          >
            Add to Cart
          </button>
        </Link>
      ))}
    </div>
  );
}
