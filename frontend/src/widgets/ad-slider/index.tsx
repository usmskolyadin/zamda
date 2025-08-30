"use client";

import { Swiper, SwiperSlide } from "swiper/react";
import "swiper/css";
import "swiper/css/navigation";
import { Navigation } from "swiper/modules";
import { Advertisement } from "@/src/entities/advertisment/model/types";

export default function AdSlider({ ad }: { ad: Advertisement }) {
  const images = ad.images.filter((img) => !!img.image);

  if (images.length === 0) return null; 

  return (
    <div className="max-w-[712px]">
      <Swiper
        modules={[Navigation]}
        navigation
        spaceBetween={10}
        slidesPerView={1}
        className="rounded-2xl"
      >
        {images.map((img) => (
          <SwiperSlide key={img.id}>
            <img
              className="rounded-2xl w-full object-cover"
              src={img.image}
              width={900}
              height={600}
              alt={ad.title}
            />
          </SwiperSlide>
        ))}
      </Swiper>

      {images.length > 1 && (
        <div className="grid lg:grid-cols-6 grid-cols-4 gap-2 mt-2">
          {images.map((img) => (
            <img
              key={img.id}
              className="rounded-2xl object-cover cursor-pointer hover:opacity-80 transition"
              src={img.image}
              width={150}
              height={100}
              alt={ad.title}
            />
          ))}
        </div>
      )}
    </div>
  );
}
