import { supabase } from "@/services/supabase";
import { getProfile, getProfiles } from "./profile";

export const createLike = async (food_id: string, user_id: string) => {
    console.log('Creating like with food_id:', food_id, 'and user_id:', user_id);
    
    // Check if like already exists to prevent duplicates
    const { data: existingLike } = await supabase
        .from("food_likes")
        .select("*")
        .eq("food_id", food_id)
        .eq("user_id", user_id)
        .single();
    
    if (existingLike) {
        console.log('Like already exists');
        return { data: existingLike, error: null };
    }
    
    const { data, error } = await supabase
        .from("food_likes")
        .insert({ food_id, user_id })
        .select();
    
    if (error) {
        console.error('Error creating like:', error);
    } else {
        console.log('Like created successfully');
    }
    
    return { data, error };
}

export const createSave = async (food_id: string, user_id: string) => {
    console.log('Creating save with food_id:', food_id, 'and user_id:', user_id);
    
    // Check if save already exists to prevent duplicates
    const { data: existingSave } = await supabase
        .from("food_saves")
        .select("*")
        .eq("food_id", food_id)
        .eq("user_id", user_id)
        .single();
    
    if (existingSave) {
        console.log('Save already exists');
        return { data: existingSave, error: null };
    }
    
    const { data, error } = await supabase
        .from("food_saves")
        .insert({ food_id, user_id })
        .select();
    
    if (error) {
        console.error('Error creating save:', error);
    } else {
        console.log('Save created successfully');
    }
    
    return { data, error };
}

export const deleteLike = async (food_id: string, user_id: string) => {
    console.log('Deleting like with food_id:', food_id, 'and user_id:', user_id);
    
    const { data, error } = await supabase
        .from("food_likes")
        .delete()
        .eq("food_id", food_id)
        .eq("user_id", user_id)
        .select();
    
    if (error) {
        console.error('Error deleting like:', error);
    } else {
        console.log('Like deleted successfully');
    }
    
    return { data, error };
}

export const deleteSave = async (food_id: string, user_id: string) => {
    console.log('Deleting save with food_id:', food_id, 'and user_id:', user_id);
    
    const { data, error } = await supabase
        .from("food_saves")
        .delete()
        .eq("food_id", food_id)
        .eq("user_id", user_id)
        .select();
    
    if (error) {
        console.error('Error deleting save:', error);
    } else {
        console.log('Save deleted successfully');
    }
    
    return { data, error };
}

export const createComment = async (food_id: string, user_id: string, content: string) => {
    console.log('Creating comment with food_id:', food_id, 'user_id:', user_id, 'and content:', content);
    
    const { data, error } = await supabase
        .from("food_comments")
        .insert({ food_id, user_id, content })
        .select();
    
    if (error) {
        console.error('Error creating comment:', error);
    } else {
        console.log('Comment created successfully');
    }
    
    return { data, error };
}

export const getLikesCount = async (food_id: string) => {
    console.log('Getting likes count for food_id:', food_id);
    
    const { count, error } = await supabase
        .from("food_likes")
        .select("*", { count: "exact", head: true })
        .eq("food_id", food_id);
    
    if (error) {
        console.error('Error getting likes count:', error);
    } else {
        console.log('Likes count:', count);
    }
    
    return { count, error };
}

export const getSavesCount = async (food_id: string) => {
    console.log('Getting saves count for food_id:', food_id);
    
    const { count, error } = await supabase
        .from("food_saves")
        .select("*", { count: "exact", head: true })
        .eq("food_id", food_id);
    
    if (error) {
        console.error('Error getting saves count:', error);
    } else {
        console.log('Saves count:', count);
    }
    
    return { count, error };
}

export const getCommentsCount = async (food_id: string) => {
    console.log('Getting comments count for food_id:', food_id);
    
    const { count, error } = await supabase
        .from("food_comments")
        .select("*", { count: "exact", head: true })
        .eq("food_id", food_id);
    
    if (error) {
        console.error('Error getting comments count:', error);
    } else {
        console.log('Comments count:', count);
    }
    
    return { count, error };
}

export const checkUserLiked = async (food_id: string, user_id: string) => {
    console.log('Checking if user liked with food_id:', food_id, 'and user_id:', user_id);
    
    const { data, error } = await supabase
        .from("food_likes")
        .select("*")
        .eq("food_id", food_id)
        .eq("user_id", user_id)
        .single();
    
    if (error && error.code !== 'PGRST116') { // PGRST116 is the "no rows returned" error code
        console.error('Error checking if user liked:', error);
    } else {
        console.log('User liked:', !!data);
    }
    
    return { data, error: error && error.code === 'PGRST116' ? null : error };
}

export const checkUserSaved = async (food_id: string, user_id: string) => {
    console.log('Checking if user saved with food_id:', food_id, 'and user_id:', user_id);
    
    const { data, error } = await supabase
        .from("food_saves")
        .select("*")
        .eq("food_id", food_id)
        .eq("user_id", user_id)
        .single();
    
    if (error && error.code !== 'PGRST116') { // PGRST116 is the "no rows returned" error code
        console.error('Error checking if user saved:', error);
    } else {
        console.log('User saved:', !!data);
    }
    
    return { data, error: error && error.code === 'PGRST116' ? null : error };
}

export const getComments = async (food_id: string) => {
    console.log('Getting comments for food_id:', food_id);
    
    try {
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
        
        if (error) {
            console.error('Error getting comments:', error);
            return { data: [], error };
        }
        
        if (data && data.length > 0) {
            // Get unique user IDs from comments
            const userIds = [...new Set(data.map(comment => comment.user_id))];
            
            // Fetch profiles for these users
            const { data: profiles } = await getProfiles(userIds);
            
            // Add user profiles to comments
            if (profiles && profiles.length > 0) {
                const profileMap = profiles.reduce((acc, profile) => {
                    acc[profile.id] = profile;
                    return acc;
                }, {} as Record<string, any>);
                
                // Attach profiles to comments
                const commentsWithProfiles = data.map(comment => ({
                    ...comment,
                    user: profileMap[comment.user_id] || null
                }));
                
                console.log(`Found ${commentsWithProfiles.length} comments for food_id: ${food_id}`);
                return { data: commentsWithProfiles, error: null };
            }
        }
        
        // If no profiles were found or no comments exist, return the original data
        console.log(`Found ${data?.length || 0} comments for food_id: ${food_id}`);
        return { data: data?.map(comment => ({ ...comment, user: null })) || [], error: null };
    } catch (error) {
        console.error('Error in getComments:', error);
        return { data: [], error };
    }
};