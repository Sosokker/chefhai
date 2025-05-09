import { supabase } from "@/services/supabase";
import { CookingStep } from "@/types";
import { PostgrestError } from "@supabase/supabase-js";

export const getCookingSteps = async (food_id: string): Promise<{ data: CookingStep[] | null; error: PostgrestError | null }> => {
    const { data, error } = await supabase.from("cooking_steps").select(`
        id,
        created_at,
        food_id,
        step_order,
        title,
        description
    `).eq("food_id", food_id).order("step_order", { ascending: true });
    return { data, error };
};