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

interface SavedFood {
  user_id: string;
  food_id: string;
  created_at: string;
}

interface LikedFood {
  user_id: string;
  food_id: string;
  created_at: string;
}

/**
 * Retrieves a list of saved foods for a specific user.
 * 
 * @param userId - The ID of the user to retrieve saved foods for.
 */
export const getSavedFoods = async (userId: string): Promise<{ data: SavedFood[] | null; error: PostgrestError | null }> => {
  const { data, error } = await supabase.from("food_saves")
  .select(`
      user_id,
      food_id,
      created_at
      `)
  .eq("user_id", userId)
  return { data, error };
}

/**
 * Retrieves a list of liked foods for a specific user.
 * 
 * @param userId - The ID of the user to retrieve liked foods for.
 */
export const getLikedFoods = async (userId: string): Promise<{ data: LikedFood[] | null; error: PostgrestError | null }> => {
  const { data, error } = await supabase.from("food_likes")
  .select(`
      user_id,
      food_id,
      created_at
      `)
  .eq("user_id", userId)
  return { data, error };
}

interface Nutrient {
  food_id: string,
  fat_g: number,
  fiber_g: number,
  protein_g: number,
  carbs_g: number,
  created_at: string,
}

export const getNutrients = async (food_id: string): Promise<{ data: Nutrient | null; error: PostgrestError | null }> => {
  const { data, error } = await supabase.from("nutrients")
  .select(`
      food_id,
      fat_g,
      fiber_g,
      protein_g,
      carbs_g,
      created_at
      `)
  .eq("food_id", food_id)
  .single()
  return { data, error };
}

interface Ingredient {
  id: string;
  food_id: string;
  name: string;
  emoji: string;
  created_at: string;
}

/**
* Retrieves a list of ingredients for a specific food.
* 
* @param foodId - The ID of the food to retrieve ingredients for.
*/
export const getIngredients = async (foodId: string): Promise<{ data: Ingredient[] | null; error: PostgrestError | null }> => {
  const { data, error } = await supabase.from("ingredients")
  .select(`
      id,
      food_id,
      name,
      emoji,
      created_at
      `)
  .eq("food_id", foodId)
  return { data, error };
}; 