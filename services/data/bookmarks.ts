import { supabase } from "@/services/supabase"
import type { PostgrestError } from "@supabase/supabase-js"

/**
 * Retrieves posts that a user has saved/bookmarked
 */
export async function getBookmarkedPosts(userId: string): Promise<{
  data: any[] | null
  error: PostgrestError | null
}> {
  // First get all food_ids that the user has saved
  const { data: savedFoodIds, error: saveError } = await supabase
    .from("food_saves")
    .select("food_id")
    .eq("user_id", userId)

  if (saveError) {
    return { data: null, error: saveError }
  }

  if (!savedFoodIds || savedFoodIds.length === 0) {
    return { data: [], error: null }
  }

  // Extract just the IDs
  const foodIds = savedFoodIds.map((item) => item.food_id)

  // Then fetch the actual food items
  const { data, error } = await supabase
    .from("foods")
    .select(`
      id,
      name,
      description,
      time_to_cook_minutes,
      skill_level,
      ingredient_count,
      calories,
      image_url,
      is_shared,
      created_by,
      created_at
    `)
    .in("id", foodIds)
    .order("created_at", { ascending: false })

  return { data, error }
}
