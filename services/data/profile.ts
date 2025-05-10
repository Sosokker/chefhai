import { supabase } from "@/services/supabase";
import { PostgrestError } from "@supabase/supabase-js";

/**
 * Retrieves a user's profile from the `profiles` table.
 */
export async function getProfile(userId: string): Promise<{
    data: {
        id: any;
        updated_at: any;
        username: any;
        avatar_url: any;
        full_name?: any;
        website?: any;
    } | null;
    error: PostgrestError | null;
}> {
    const { data, error } = await supabase
      .from('profiles')
      .select(`
        id,
        updated_at,
        username,
        full_name,
        avatar_url,
        website
        `)
      .eq('id', userId)
      .single()
  
    return { data, error }
}

/**
 * Updates the username (and optionally avatar_url) of a user in the `profiles` table.
 */
export async function updateProfile(
  userId: string,
  username?: string | null,
  avatar_url?: string | null,
  full_name?: string | null,
  website?: string | null
): Promise<{ data: any; error: PostgrestError | null }> {
  const updateData: Record<string, string | null> = {}
  if (username !== undefined && username !== null) {
    updateData.username = username
  }
  if (avatar_url !== undefined && avatar_url !== null) {
    updateData.avatar_url = avatar_url
  }
  if (full_name !== undefined && full_name !== null) {
    updateData.full_name = full_name
  }
  if (website !== undefined && website !== null) {
    updateData.website = website
  }

  const { data, error } = await supabase
    .from('profiles')
    .update(updateData)
    .eq('id', userId)
    .select()
    .single()

  return { data, error }
}

/**
 * Gets multiple user profiles by their IDs
 */
export async function getProfiles(userIds: string[]): Promise<{
  data: {
    id: any;
    username: any;
    avatar_url: any;
    full_name?: any;
  }[] | null;
  error: PostgrestError | null;
}> {
  const { data, error } = await supabase
    .from('profiles')
    .select(`
      id,
      username,
      full_name,
      avatar_url
    `)
    .in('id', userIds)

  return { data, error }
}