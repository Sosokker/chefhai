import { supabase } from "@/services/supabase";

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
