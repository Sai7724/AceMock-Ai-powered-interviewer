import React from 'react';

interface StarRatingProps {
  score: number; // score out of 10
}

export default function StarRating({ score }: StarRatingProps) {
  const filledStars = Math.round(score / 2); // Convert 10-point scale to 5 stars
  const stars = Array.from({ length: 5 }, (_, i) => i < filledStars);

  return (
    <div className="flex items-center">
      {stars.map((isFilled, index) => (
        <svg
          key={index}
          className={`w-6 h-6 ${isFilled ? 'text-amber-400' : 'text-slate-600'}`}
          fill="currentColor"
          viewBox="0 0 20 20"
        >
          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.286 3.957a1 1 0 00.95.69h4.162c.969 0 1.371 1.24.588 1.81l-3.368 2.446a1 1 0 00-.364 1.118l1.287 3.957c.3.921-.755 1.688-1.54 1.118l-3.368-2.446a1 1 0 00-1.176 0l-3.368 2.446c-.784.57-1.838-.197-1.539-1.118l1.287-3.957a1 1 0 00-.364-1.118L2.05 9.384c-.783-.57-.38-1.81.588-1.81h4.162a1 1 0 00.95-.69L9.049 2.927z" />
        </svg>
      ))}
       <span className="ml-2 text-slate-300 font-semibold">{score.toFixed(1)}/10</span>
    </div>
  );
}
