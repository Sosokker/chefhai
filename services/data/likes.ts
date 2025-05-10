import { supabase } from "@/services/supabase"
import type { PostgrestError } from "@supabase/supabase-js"

/**
 * Retrieves posts that a user has liked
 */
export async function getLikedPosts(userId: string): Promise<{
  data: any[] | null
  error: PostgrestError | null
}> {
  // First get all food_ids that the user has liked
  const { data: likedFoodIds, error: likeError } = await supabase
    .from("food_likes")
    .select("food_id")
    .eq("user_id", userId)

  if (likeError) {
    return { data: null, error: likeError }
  }

  if (!likedFoodIds || likedFoodIds.length === 0) {
    return { data: [], error: null }
  }

  // Extract just the IDs
  const foodIds = likedFoodIds.map((item) => item.food_id)

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
