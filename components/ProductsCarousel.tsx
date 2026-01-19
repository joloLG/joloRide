// components/ProductsCarousel.tsx
import Image from 'next/image';
import Link from 'next/link';

interface Product {
  id: string;
  name: string;
  price: number;
  image_url?: string;
}

interface ProductsCarouselProps {
  products: Product[];
}

export default function ProductsCarousel({ products }: ProductsCarouselProps) {
  return (
    <div className="flex space-x-4 overflow-x-auto py-4">
      {products.map((product) => (
        <Link
          key={product.id}
          href={`/product/${product.id}`}
          className="flex-shrink-0 w-40"
        >
          <div className="relative aspect-square">
            <Image
              src={product.image_url || '/placeholder.png'}
              alt={product.name}
              fill
              className="object-cover rounded-lg"
            />
          </div>
          <h3 className="text-sm font-medium mt-2">{product.name}</h3>
          <p className="text-sm text-gray-600">${product.price}</p>
        </Link>
      ))}
    </div>
  );
}