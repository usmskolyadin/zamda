"use client";

import { useState } from "react";
import { Advertisement } from "@/src/entities/advertisment/model/types";
import { useLikeAd } from "@/src/features/hooks/use-like-ad";
import { useAuth } from "@/src/features/context/auth-context";

interface AdSliderProps {
  ad: Advertisement;
}

export default function AdSlider({ ad }: AdSliderProps) {
  const images = ad.images.filter((img) => !!img.image);
  const [activeIndex, setActiveIndex] = useState(0);

  if (images.length === 0) return null;

  const prev = () =>
    setActiveIndex((prev) => (prev === 0 ? images.length - 1 : prev - 1));
  const next = () =>
    setActiveIndex((prev) => (prev === images.length - 1 ? 0 : prev + 1));
  
  const {accessToken} = useAuth()
  const { isLiked, likesCount, toggleLike, loading } = useLikeAd({
    adId: ad.id,
    initialIsLiked: ad.is_liked,
    initialLikesCount: ad.likes_count,
    token: accessToken,
  });

  return (
    <div className="max-w-[712px]">
      <div className="relative">
        <div className="relative">
          <img
            src={images[activeIndex].image}
            alt={ad.title}
            className="rounded-2xl w-full object-cover min-h-[400px] lg:max-h-[400px] lg:h-[600px]"
          />
          {isLiked ? (
            <button
              onClick={toggleLike}
              disabled={loading}
              className="absolute top-2 right-2 cursor-pointer">
              <div className="bg-black/30 p-2 rounded-full">
                <svg width="30" height="30" className="invert" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path fillRule="evenodd" clipRule="evenodd" d="M12 6.00019C10.2006 3.90317 7.19377 3.2551 4.93923 5.17534C2.68468 7.09558 2.36727 10.3061 4.13778 12.5772C5.60984 14.4654 10.0648 18.4479 11.5249 19.7369C11.6882 19.8811 11.7699 19.9532 11.8652 19.9815C11.9483 20.0062 12.0393 20.0062 12.1225 19.9815C12.2178 19.9532 12.2994 19.8811 12.4628 19.7369C13.9229 18.4479 18.3778 14.4654 19.8499 12.5772C21.6204 10.3061 21.3417 7.07538 19.0484 5.17534C16.7551 3.2753 13.7994 3.90317 12 6.00019Z" stroke="#000000" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </div>
            </button>  
          ): (
             <button
              onClick={toggleLike}
              disabled={loading}
              className="absolute top-2 right-2 cursor-pointer">
              <div className="bg-black/30 p-2 rounded-full">
                <svg width="28" height="28" className="invert" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M1.24264 8.24264L8 15L14.7574 8.24264C15.553 7.44699 16 6.36786 16 5.24264V5.05234C16 2.8143 14.1857 1 11.9477 1C10.7166 1 9.55233 1.55959 8.78331 2.52086L8 3.5L7.21669 2.52086C6.44767 1.55959 5.28338 1 4.05234 1C1.8143 1 0 2.8143 0 5.05234V5.24264C0 6.36786 0.44699 7.44699 1.24264 8.24264Z" fill="#000000"/>
                </svg>
              </div>
            </button>  
            
          )}
        </div>

        {images.length > 1 && (
          <>
            <button
              onClick={prev}
              className="cursor-pointer absolute top-1/2 left-2 w-12 h-12 flex items-center justify-center text-4xl rounded-full -translate-y-1/2 bg-black/30 text-white rounded-full p-3 hover:bg-black/70 transition"
            >
              ‹
            </button>
            <button
              onClick={next}
              className="cursor-pointer absolute top-1/2 right-2 w-12 h-12 flex items-center justify-center text-4xl rounded-full -translate-y-1/2 bg-black/30 text-white rounded-full p-3 hover:bg-black/70 transition"
            >
              ›
            </button>
          </>
        )}
      </div>

      {images.length > 1 && (
        <div className="grid lg:grid-cols-6 grid-cols-4 gap-2 mt-2">
          {images.map((img, idx) => (
            <img
              key={img.id}
              src={img.image}
              alt={ad.title}
              className={`rounded-2xl object-cover cursor-pointer hover:opacity-80 transition border-2 ${
                idx === activeIndex ? "border-blue-500" : "border-transparent"
              }`}
              width={150}
              height={100}
              onClick={() => setActiveIndex(idx)}
            />
          ))}
        </div>
      )}
    </div>
  );
}
