export interface Food {
  id: string;
  created_at: string;
  name: string;
  description: string;
  time_to_cook_minutes: number;
  skill_level: string;
  ingredient_count: number;
  calories: number;
  image_url: string;
  is_shared: boolean;
  created_by: string;
}

export interface FoodLike {
  created_at: string;
  user_id: string;
  food_id: string;
}

export interface FoodSave {
  created_at: string;
  user_id: string;
  food_id: string;
}

export interface FoodComment {
  id: string;
  created_at: string;
  user_id: string;
  food_id: string;
  content: string; // Adding content field for comments
}

export interface User {
  id: string;
  username: string;
  avatar_url?: string;
  rating?: number;
}

export interface Nutrient {
  food_id: string;
  fat_g: number;
  fiber_g: number;
  protein_g: number;
  carbs_g: number;
  created_at: string;
}

export interface Ingredient {
  id: string;
  food_id: string;
  name: string;
  emoji: string;
  created_at: string;
}

export interface Profile {
  id: string;
  updated_at: string;
  username: string;
  full_name?: string;
  avatar_url?: string;
  website?: string;
}
