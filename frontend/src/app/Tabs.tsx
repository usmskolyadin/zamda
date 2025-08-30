"use client";

import { useEffect, useState } from "react";
import ProductCard from "./ProductCard";
import { apiFetch } from "@/src/shared/api/base";
import { Advertisement } from "../entities/advertisment/model/types";

const tabs = [
  { id: "recommendations", label: "Recommendations" },
  { id: "favorites", label: "Favorites" },
  { id: "recent", label: "Recently viewed" },
];

export default function TabsExample() {
  const [activeTab, setActiveTab] = useState("favorites");
  const [ads, setAds] = useState<Advertisement[]>([]);
  const [loading, setLoading] = useState(false);

useEffect(() => {
  if (activeTab === "favorites") {
    setLoading(true);
    apiFetch<any>("/api/ads/")
      .then((data) => {
        console.log("ADS RESPONSE:", data);  // <-- смотри что реально приходит
        setAds(data.results || data);        // если это пагинация через DRF
      })
      .catch((err) => console.error("API error:", err))
      .finally(() => setLoading(false));
  }
}, [activeTab]);

  const renderContent = () => {
    switch (activeTab) {
      case "recommendations":
        return <p>Here are your recommendations.</p>;
      case "favorites":
        if (loading) return <p>Loading...</p>;
        if (!ads.length) return <p>No ads found.</p>;
        return (
          <div className="grid lg:grid-cols-4 grid-cols-1 gap-4 mt-6">
            {ads.map((ad) => (
              <ProductCard
                key={ad.id}
                title={ad.title}
                price={`${ad.price} €`}
                location={ad.owner.profile?.city || "Unknown"} // если в модели нет поля location
                image={ad.images.length > 0 ? ad.images[0].image : "/no-image.png"}
              />
            ))}
          </div>
        );
      case "recent":
        return <p>You recently viewed these items.</p>;
      default:
        return null;
    }
  };

  return (
    <div className="max-w-screen-xl mx-auto py-6 flex flex-col justify-center items-center">
      <div className="flex lg:flex-row flex-col justify-center lg:space-x-8 lg:border-b border-gray-300">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`lg:m-0 lg:p-3 m-2 text-xl cursor-pointer font-medium ${
              activeTab === tab.id
                ? "text-blue-600 border-b-2 border-blue-600"
                : "text-gray-500 hover:text-blue-500"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      <div className="mt-4">{renderContent()}</div>
    </div>
  );
}
