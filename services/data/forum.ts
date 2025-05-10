import { supabase } from "@/services/supabase";
import { getProfile, getProfiles } from "./profile";

export const createLike = async (food_id: string, user_id: string) => {
    const { data, error } = await supabase.from("food_likes").insert({ food_id, user_id });
    return { data, error };
}

export const createSave = async (food_id: string, user_id: string) => {
    const { data, error } = await supabase.from("food_saves").insert({ food_id, user_id });
    return { data, error };
}

export const deleteLike = async (food_id: string, user_id: string) => {
    const { data, error } = await supabase.from("food_likes").delete().eq("food_id", food_id).eq("user_id", user_id);
    return { data, error };
}

export const deleteSave = async (food_id: string, user_id: string) => {
    const { data, error } = await supabase.from("food_saves").delete().eq("food_id", food_id).eq("user_id", user_id);
    return { data, error };
}

export const createComment = async (food_id: string, user_id: string, content: string) => {
    const { data, error } = await supabase.from("food_comments").insert({ food_id, user_id, content });
    return { data, error };
}

export const getComments = async (food_id: string) => {
    const { data, error } = await supabase
        .from("food_comments")
        .select(`
            id,
            created_at,
            user_id,
            food_id,
            content
        `)
        .eq("food_id", food_id)
        .order("created_at", { ascending: false });
    
    if (data && data.length > 0) {
        // Get unique user IDs from comments
        const userIds = [...new Set(data.map(comment => comment.user_id))];
        
        // Fetch profiles for these users
        const { data: profiles } = await getProfiles(userIds);
        
        // Add user profiles to comments
        if (profiles) {
            const profileMap = profiles.reduce((acc, profile) => {
                acc[profile.id] = profile;
                return acc;
            }, {} as Record<string, any>);
            
            // Attach profiles to comments
            const commentsWithProfiles = data.map(comment => ({
                ...comment,
                user: profileMap[comment.user_id]
            }));
            
            return { data: commentsWithProfiles, error };
        }
    }
    
    return { data, error };
}

export const getLikesCount = async (food_id: string) => {
    const { count, error } = await supabase
        .from("food_likes")
        .select("*", { count: "exact", head: true })
        .eq("food_id", food_id);
    return { count, error };
}

export const getSavesCount = async (food_id: string) => {
    const { count, error } = await supabase
        .from("food_saves")
        .select("*", { count: "exact", head: true })
        .eq("food_id", food_id);
    return { count, error };
}

export const getCommentsCount = async (food_id: string) => {
    const { count, error } = await supabase
        .from("food_comments")
        .select("*", { count: "exact", head: true })
        .eq("food_id", food_id);
    return { count, error };
}

export const checkUserLiked = async (food_id: string, user_id: string) => {
    const { data, error } = await supabase
        .from("food_likes")
        .select("*")
        .eq("food_id", food_id)
        .eq("user_id", user_id)
        .single();
    return { data, error };
}

export const checkUserSaved = async (food_id: string, user_id: string) => {
    const { data, error } = await supabase
        .from("food_saves")
        .select("*")
        .eq("food_id", food_id)
        .eq("user_id", user_id)
        .single();
    return { data, error };
}