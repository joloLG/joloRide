// components/ReviewList.tsx
import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';

interface Review {
  id: string;
  rating: number;
  comment: string;
  created_at: string;
  user: {
    name: string;
  };
}

interface ReviewListProps {
  productId: string;
}

export default function ReviewList({ productId }: ReviewListProps) {
  const [reviews, setReviews] = useState<Review[]>([]);

  useEffect(() => {
    const fetchReviews = async () => {
      const { data } = await supabase
        .from('reviews')
        .select('*, user:profiles(name)')
        .eq('product_id', productId);
      if (data) setReviews(data);
    };

    fetchReviews();
  }, [productId]);

  return (
    <div className="space-y-4">
      {reviews.map((review) => (
        <div key={review.id} className="border-b pb-4">
          <div className="flex items-center space-x-2">
            <span className="font-medium">{review.user?.name}</span>
            <span className="text-yellow-500">
              {'★'.repeat(review.rating)}
              {'☆'.repeat(5 - review.rating)}
            </span>
          </div>
          <p className="text-sm text-gray-600">{review.comment}</p>
          <p className="text-xs text-gray-400">
            {new Date(review.created_at).toLocaleDateString()}
          </p>
        </div>
      ))}
    </div>
  );
}