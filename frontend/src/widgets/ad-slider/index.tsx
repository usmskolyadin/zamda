"use client";

import { useState } from "react";
import { Advertisement } from "@/src/entities/advertisment/model/types";

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

  return (
    <div className="max-w-[712px]">
      <div className="relative">
        <img
          src={images[activeIndex].image}
          alt={ad.title}
          className="rounded-2xl w-full object-cover h-[400px] lg:h-[600px]"
        />

        {images.length > 1 && (
          <>
            <button
              onClick={prev}
              className="absolute top-1/2 left-2 w-12 h-12 flex items-center justify-center text-4xl rounded-full -translate-y-1/2 bg-black/30 text-white rounded-full p-3 hover:bg-black/70 transition"
            >
              ‹
            </button>
            <button
              onClick={next}
              className="absolute top-1/2 right-2 w-12 h-12 flex items-center justify-center text-4xl rounded-full -translate-y-1/2 bg-black/30 text-white rounded-full p-3 hover:bg-black/70 transition"
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
