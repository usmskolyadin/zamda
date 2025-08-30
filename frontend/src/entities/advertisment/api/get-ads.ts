import { apiFetch } from "@/src/shared/api/base";
import { Advertisement } from "../model/types";


export async function getAdsBySubcategory(subcategoryId: number): Promise<Advertisement[]> {
  const res = await apiFetch<{ results: Advertisement[] }>(`/api/ads/?subcategory=${subcategoryId}`);
  return res.results;
}