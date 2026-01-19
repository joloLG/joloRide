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
    <Link href={`/user/product/${product.id}`} className="block">
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="relative aspect-square">
          <Image
            src={product.image || "/placeholder.png"}
            alt={product.name}
            fill
            className="object-cover"
          />
        </div>
        <div className="p-2">
          <h3 className="font-medium text-sm line-clamp-1">{product.name}</h3>
          <p className="text-orange-600 font-semibold text-sm">
            ₱{product.price.toLocaleString()}
          </p>
        </div>
      </div>
    </Link>
  );
}
