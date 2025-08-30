import { apiFetch } from "@/src/shared/api/base";
import { SubCategory } from "../model/types";

interface PaginatedResponse<T> {
  count: number;
  next: string | null;
  previous: string | null;
  results: T[];
}

export async function getSubCategories(categoryId: number): Promise<SubCategory[]> {
  const data = await apiFetch<PaginatedResponse<SubCategory>>(
    `/api/subcategories/?category=${categoryId}`
  );
  return data.results;
}
