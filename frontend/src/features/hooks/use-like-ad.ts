"use client";

import { API_URL } from "@/src/shared/api/base";
import { useRouter } from "next/navigation";
import { useState } from "react";

interface UseLikeAdProps {
  adId: number;
  initialIsLiked: boolean;
  initialLikesCount: number;
  token: string | null;
}

export function useLikeAd({ adId, initialIsLiked, initialLikesCount, token }: UseLikeAdProps) {
  const [isLiked, setIsLiked] = useState(initialIsLiked);
  const [likesCount, setLikesCount] = useState(initialLikesCount);
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const toggleLike = async () => {
    if (!token) {
      router.push("/login");
      alert("You must be logged in to like ads.");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch(`${API_URL}api/ads/${adId}/like/`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error(await res.text());
      const data = await res.json();

      setIsLiked(data.detail === "Liked");
      setLikesCount(data.likes_count);
    } catch (err) {
      console.error("Failed to like:", err);
    } finally {
      setLoading(false);
    }
  };

  return { isLiked, likesCount, loading, toggleLike };
}
