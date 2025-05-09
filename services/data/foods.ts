import { supabase } from "@/services/supabase";
import { PostgrestError } from "@supabase/supabase-js";

interface Foods {
    id: string;
    name: string;
    description?: string;
    time_to_cook_minutes: number;
    skill_level: "Easy" | "Medium" | "Hard";
    ingredient_count?: number;
    calories?: number;
    image_url?: string;
    is_shared: boolean;
    created_by: string;
    created_at: string;
}

/**
 * Retrieves a list of foods based on the provided filters.
 * 
 * @param userId - The ID of the user to filter foods by.
 * @param isShared - Whether to filter foods by shared status.
 * @param search - The search query to filter foods by name or description.
 * @param limit - The maximum number of foods to retrieve.
 * @param offset - The offset to start retrieving foods from.
 * @returns A promise that resolves to an object containing the list of foods and any error that occurred.
 */
export const getFoods = async (
  userId?: string,
  isShared?: boolean,
  search?: string,
  limit?: number,
  offset?: number
): Promise<{ data: Foods[] | null; error: PostgrestError | null }> => {
  let query = supabase
    .from("foods")
    .select(
      `id, name, description, time_to_cook_minutes, skill_level, ingredient_count, calories, image_url, is_shared, created_by, created_at`
    );

  if (userId) {
    query = query.eq("created_by", userId);
  }
  if (typeof isShared === "boolean") {
    query = query.eq("is_shared", isShared);
  }
  if (search) {
    query = query.or(`name.ilike.%${search}%,description.ilike.%${search}%`);
  }
  if (typeof limit === "number") {
    query = query.limit(limit);
  }
  if (typeof offset === "number") {
    query = query.range(offset, offset + (limit ? limit - 1 : 9));
  }

  const { data, error } = await query;
  return { data, error };
};
