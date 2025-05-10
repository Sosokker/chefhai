import { supabase } from "@/services/supabase";
import { Foods, GenAIResult, LikedFood, SavedFood } from "@/types";
import { PostgrestError } from "@supabase/supabase-js";

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


/**
 * Inserts a new food into the database.
 * 
 * @param genAIResult - The result from the GenAI API.
 * @param userId - The ID of the user who created the food.
 * @param imageUrl - The URL of the image of the food.
 * @returns A promise that resolves to an object containing the ID of the inserted food and any error that occurred.
 */
export const insertGenAIResult = async (
  genAIResult: GenAIResult,
  userId: string,
  imageUrl: string
): Promise<{ data: string | null; error: PostgrestError | null }> => {
  const client = supabase;

  const now = new Date().toISOString();

  const { foods, ingredients, nutrients, cooking_steps } = genAIResult;

  const { data: foodInsert, error: foodError } = await client
    .from("foods")
    .insert({
      name: foods.name,
      description: foods.description,
      time_to_cook_minutes: foods.time_to_cook_minutes,
      skill_level: foods.skill_level,
      ingredient_count: foods.ingredient_count,
      calories: foods.calories,
      image_url: imageUrl,
      is_shared: false,
      created_by: userId,
      created_at: now,
    })
    .select("id")
    .single();

  if (foodError || !foodInsert) {
    return { data: null, error: foodError };
  }

  const foodId = foodInsert.id;

  const { error: nutrientError } = await client.from("nutrients").insert({
    food_id: foodId,
    ...nutrients,
    created_at: now,
  });

  if (nutrientError) {
    return { data: null, error: nutrientError };
  }

  const ingredientInsert = ingredients.map((i) => ({
    food_id: foodId,
    name: i.name,
    emoji: i.emoji,
    created_at: now,
  }));

  const { error: ingredientError } = await client
    .from("ingredients")
    .insert(ingredientInsert);

  if (ingredientError) {
    return { data: null, error: ingredientError };
  }

  const stepInsert = cooking_steps.map((step) => ({
    food_id: foodId,
    step_order: step.step_order,
    title: step.title,
    description: step.description,
    created_at: now,
  }));

  const { error: stepError } = await client
    .from("cooking_steps")
    .insert(stepInsert);

  if (stepError) {
    return { data: null, error: stepError };
  }

  return { data: foodId, error: null };
};