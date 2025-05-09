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
    } | null;
    error: PostgrestError | null;
}> {
    const { data, error } = await supabase
      .from('profiles')
      .select(`
        id,
        updated_at,
        username,
        avatar_url
        `)
      .eq('id', userId)
      .single()
  
    return { data, error }
}

/**
 * Updates the username of a user in the `profiles` table.
 */
export async function updateProfile(userId: string, username: string): Promise<{ data: any; error: PostgrestError | null }> {
    const { data, error } = await supabase
      .from('profiles')
      .update({ username: username })
      .eq('id', userId)
      .select()
      .single()
  
    return { data, error }
}