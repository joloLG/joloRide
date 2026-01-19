import Link from "next/link";
import Image from "next/image";

interface Store {
  id: string;
  name: string;
  cover_image?: string;
}

interface StoresCarouselProps {
  stores: Store[];
}

export default function StoresCarousel({ stores }: StoresCarouselProps) {
  return (
    <div className="flex gap-4 overflow-x-auto scrollbar-hide">
      {stores.map((store) => (
        <Link
          key={store.id}
          href={`/user/store/${store.id}`}
          className="min-w-[140px] bg-white rounded-xl shadow p-2"
        >
          <div className="relative h-20 w-full">
            <Image
              src={store.cover_image || "/placeholder.png"}
              alt={store.name}
              fill
              className="object-cover rounded-lg"
              sizes="(max-width: 768px) 140px, 140px"
            />
          </div>
          <p className="text-sm font-medium mt-2">{store.name}</p>
        </Link>
      ))}
    </div>
  );
}
