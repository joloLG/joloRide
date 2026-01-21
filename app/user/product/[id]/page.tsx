"use client";

import { 
  useCallback, 
  useEffect, 
  useState 
} from "react";
import Image from "next/image";
import { 
  ArrowLeft, 
  ShoppingCart, 
  Star, 
  ShieldCheck, 
  Clock, 
  Truck 
} from "lucide-react";
import { supabase } from "@/lib/supabase";
import { useParams, useRouter } from "next/navigation";
import QuantitySelector from "@/components/QuantitySelector";
import { useCartStore } from "@/store/cartStore";
import ReviewList from "@/components/ReviewList";
import { Product } from "@/types";
import Link from "next/link";
import { toast } from "react-hot-toast";

export default function ProductPage() {
  const router = useRouter();
  const { id } = useParams();
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [qty, setQty] = useState(1);
  const addItem = useCartStore((state) => state.addItem);

  const fetchProduct = useCallback(async () => {
    try {
      setLoading(true);
      const { data, error: fetchError } = await supabase
        .from("products")
        .select("*")
        .eq("id", id)
        .single();

      if (fetchError) throw fetchError;
      if (!data) throw new Error("Product not found");

      setProduct(data);
    } catch (err) {
      console.error("Error fetching product:", err);
      setError(err instanceof Error ? err.message : "Failed to load product");
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    if (id) {
      fetchProduct();
    }
  }, [id, fetchProduct]);

  const handleAddToCart = () => {
    if (!product) return;
    
    addItem({
      id: product.id,
      name: product.name,
      price: product.price,
      image: product.image_url,
      quantity: qty,
    });

    // Optional: Add toast notification instead of alert
    alert("Added to cart");
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className="text-center py-12">
        <h2 className="text-xl font-semibold text-gray-800 mb-2">Product not found</h2>
        <p className="text-gray-600 mb-4">{error || "The product you're looking for doesn't exist."}</p>
        <button
          onClick={() => router.back()}
          className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
        >
          Go Back
        </button>
      </div>
    );
  }

  return (
    <div className="pb-24 sm:pb-12 min-h-screen bg-white">
      {/* HEADER */}
      <div className="sticky top-0 bg-white/80 backdrop-blur-md z-30 flex items-center justify-between p-4 border-b border-gray-50">
        <button
          onClick={() => router.back()}
          className="p-2.5 rounded-2xl bg-gray-100 hover:bg-gray-200 transition-all active:scale-95 text-gray-600"
        >
          <ArrowLeft size={20} strokeWidth={3} />
        </button>
        <button className="p-2.5 rounded-2xl bg-gray-100 hover:bg-gray-200 transition-all active:scale-95 text-gray-600">
          <ShoppingCart size={20} strokeWidth={2.5} />
        </button>
      </div>

      <div className="max-w-4xl mx-auto">
        {/* PRODUCT IMAGE SECTION */}
        <div className="relative aspect-square sm:aspect-video w-full bg-gray-50 sm:rounded-[3rem] overflow-hidden">
          <Image
            src={product.image_url || "/placeholder.png"}
            alt={product.name}
            fill
            className="object-cover"
            priority
          />
          <div className="absolute bottom-6 right-6">
            <div className="bg-white/90 backdrop-blur-md p-3 rounded-2xl shadow-xl border border-white/50">
              <Star size={20} className="text-orange-500 fill-orange-500" />
            </div>
          </div>
        </div>

        {/* DETAILS SECTION */}
        <div className="p-6 sm:p-10 -mt-8 relative z-10 bg-white rounded-t-[3rem] sm:rounded-none">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
            <div>
              <h1 className="text-3xl font-black text-gray-900 tracking-tight leading-tight mb-2">
                {product.name}
              </h1>
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-1.5 px-2.5 py-1 bg-green-50 text-green-600 rounded-lg text-[10px] font-black uppercase tracking-widest border border-green-100">
                  <ShieldCheck size={12} strokeWidth={3} />
                  <span>Quality Verified</span>
                </div>
                <div className="flex items-center gap-1.5 text-gray-400 text-xs font-bold uppercase tracking-wider">
                  <Clock size={14} />
                  <span>20-30 mins</span>
                </div>
              </div>
            </div>
            <div className="text-left sm:text-right">
              <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-1">Price</p>
              <p className="text-4xl font-black text-orange-600 tracking-tighter">
                ₱{product.price.toLocaleString()}
              </p>
            </div>
          </div>

          <div className="space-y-6">
            <div>
              <h2 className="text-xs font-black text-gray-400 uppercase tracking-[0.2em] mb-3">Description</h2>
              <p className="text-gray-600 font-medium leading-relaxed">
                {product.description || "No description available for this item."}
              </p>
            </div>

            {/* FEATURES GRID */}
            <div className="grid grid-cols-2 gap-3 py-6 border-y border-gray-50">
              <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-2xl border border-gray-100">
                <div className="w-10 h-10 rounded-xl bg-white flex items-center justify-center text-lg shadow-sm">🚀</div>
                <div className="min-w-0">
                  <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Delivery</p>
                  <p className="text-xs font-bold text-gray-900 truncate">Fast Express</p>
                </div>
              </div>
              <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-2xl border border-gray-100">
                <div className="w-10 h-10 rounded-xl bg-white flex items-center justify-center text-lg shadow-sm">💎</div>
                <div className="min-w-0">
                  <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Quality</p>
                  <p className="text-xs font-bold text-gray-900 truncate">Premium Only</p>
                </div>
              </div>
            </div>

            {/* ACTION SECTION */}
            <div className="space-y-4 pt-4">
              <div className="flex items-center justify-between px-1">
                <h3 className="text-xs font-black text-gray-400 uppercase tracking-[0.2em]">Select Quantity</h3>
                <span className="text-[10px] font-black text-orange-600 bg-orange-50 px-2 py-0.5 rounded-lg">MAX 10</span>
              </div>
              
              <div className="flex gap-4">
                <div className="flex-1 bg-gray-100 rounded-2xl p-1 flex items-center">
                  <QuantitySelector value={qty} setValue={setQty} />
                </div>
                <button
                  onClick={handleAddToCart}
                  className="flex-2 bg-orange-600 text-white py-4 rounded-2xl font-black text-sm uppercase tracking-[0.2em] shadow-lg shadow-orange-100 transition-all hover:bg-orange-700 active:scale-95 flex items-center justify-center gap-3"
                >
                  <span>Add to Cart</span>
                  <ShoppingCart size={18} strokeWidth={3} />
                </button>
              </div>
            </div>

            {/* REVIEWS */}
            <div className="pt-8">
              <div className="flex items-center justify-between mb-6 px-1">
                <h3 className="text-xl font-black text-gray-900 tracking-tight">Customer Reviews</h3>
                <button className="text-[10px] font-black text-orange-600 uppercase tracking-widest bg-orange-50 px-3 py-1 rounded-full border border-orange-100">
                  Write Review
                </button>
              </div>
              <ReviewList productId={product.id} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
