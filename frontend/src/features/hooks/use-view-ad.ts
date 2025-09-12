"use client";

import { useEffect, useState } from "react";
import { useAuth } from "../context/auth-context";
import { API_URL } from "@/src/shared/api/base";

export function useViewAd(adId: number) {
  const [viewsCount, setViewsCount] = useState<number | null>(null);
  const { accessToken } = useAuth();
  
  useEffect(() => {
    const registerView = async () => {
      try {
        const res = await fetch(`${API_URL}/api/ads/${adId}/view/`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            ...(accessToken ? { Authorization: `Bearer ${accessToken}` } : {}),
          },
        });

        const data = await res.json();

        if (res.ok) {
          setViewsCount(data.views_count);
        } else {
          console.warn("View not counted:", data?.detail || data);
        }
      } catch (err) {
        console.error("Failed to register view:", err);
      }
    };

    if (adId) {
      registerView();
    }
  }, [adId, accessToken]);

  return { viewsCount };
}
