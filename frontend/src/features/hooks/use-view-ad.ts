"use client";

import { useEffect, useState } from "react";
import { useAuth } from "../context/auth-context";
import { API_URL } from "@/src/shared/api/base";
import { useRouter } from "next/navigation";

export function useViewAd(adId: number) {
  const [viewsCount, setViewsCount] = useState<number | null>(null);
  const { accessToken } = useAuth();
  const router = useRouter();
  
  useEffect(() => {
    const registerView = async () => {
      if (!accessToken) {
        router.push("/login");
        return;
      }

      try {
        const res = await fetch(`${API_URL}api/ads/${adId}/view/`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            ...(accessToken ? { Authorization: `Bearer ${accessToken}` } : {}),
          },
        });

        if (!res.ok) throw new Error(await res.text());

        const data = await res.json();
        setViewsCount(data.views_count);
      } catch (err) {
        console.error("Failed to register view:", err);
      }
    };

    registerView();
  }, [adId, accessToken]);

  return { viewsCount };
}