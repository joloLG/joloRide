import Image from "next/image";
import Link from "next/link";

export interface ProductCardProps {
  product: {
    id: string;
    name: string;
    price: number;
    image?: string;
    store_id: string;
  };
}

export default function ProductCard({ product }: ProductCardProps) {
  return (
    <Link href={`/user/product/${product.id}`} className="block group">
      <div className="bg-white rounded-[2rem] border border-gray-100 overflow-hidden shadow-sm hover:shadow-md hover:border-orange-200 transition-all active:scale-[0.98]">
        <div className="relative aspect-square overflow-hidden bg-gray-100">
          <Image
            src={product.image || "/placeholder.png"}
            alt={product.name}
            fill
            className="object-cover group-hover:scale-110 transition-transform duration-500"
          />
          <div className="absolute top-2 right-2">
            <div className="w-8 h-8 rounded-full bg-white/80 backdrop-blur-md flex items-center justify-center text-xs shadow-sm opacity-0 group-hover:opacity-100 transition-opacity">
              ❤️
            </div>
          </div>
        </div>
        <div className="p-4">
          <h3 className="font-black text-gray-900 text-sm line-clamp-1 leading-tight mb-1">{product.name}</h3>
          <div className="flex items-center justify-between mt-2">
            <p className="text-orange-600 font-black text-base tracking-tighter">
              ₱{product.price.toLocaleString()}
            </p>
            <div className="w-7 h-7 rounded-lg bg-orange-100 flex items-center justify-center text-orange-600">
              <span className="text-lg font-bold leading-none">+</span>
            </div>
          </div>
        </div>
      </div>
    </Link>
  );
}
