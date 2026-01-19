"use client";

import { useCallback, useEffect, useState } from "react";
import Image from "next/image";
import { supabase } from "@/lib/supabase";
import { useParams, useRouter } from "next/navigation";
import QuantitySelector from "@/components/QuantitySelector";
import { useCartStore } from "@/store/cartStore";
import ReviewList from "@/components/ReviewList";
import { Product } from "@/types";

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
    <div className="pb-20">
      {/* IMAGE */}
      <div className="relative w-full h-56">
        <Image
          src={product.image_url || "/placeholder.png"}
          alt={product.name}
          fill
          className="object-cover"
          priority
        />
      </div>

      {/* DETAILS */}
      <div className="p-4 space-y-4">
        <h1 className="text-lg font-bold">{product.name}</h1>
        <p className="text-orange-600 font-semibold text-lg">
          ₱{product.price}
        </p>

        <p className="text-sm text-gray-600">{product.description}</p>

        {/* QUANTITY */}
        <QuantitySelector value={qty} setValue={setQty} />

        {/* ADD TO CART */}
        <button
          onClick={handleAddToCart}
          className="w-full bg-black text-white py-3 rounded-xl font-medium"
        >
          Add to Cart
        </button>

        {/* REVIEWS */}
        <ReviewList productId={product.id} />
      </div>
    </div>
  );
}
