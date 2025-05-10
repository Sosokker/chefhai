interface SavedFood {
    user_id: string;
    food_id: string;
    created_at: string;
  }
  
  interface LikedFood {
    user_id: string;
    food_id: string;
    created_at: string;
  }

  interface Foods {
    id: string;
    name: string;
    description?: string;
    time_to_cook_minutes: number;
    skill_level: "Easy" | "Medium" | "Hard";
    ingredient_count?: number;
    calories?: number;
    image_url?: string;
    is_shared: boolean;
    created_by: string;
    created_at: string;
}

interface CookingStep {
    id: string,
    created_at: string,
    food_id: string,
    step_order: number,
    title: string,
    description: string
}

interface GenAIResult {
  foods: {
    name: string;
    description: string;
    time_to_cook_minutes: number;
    skill_level: "Easy" | "Medium" | "Hard";
    ingredient_count: number;
    calories: number;
  };
  cooking_steps: {
    title: string;
    description: string;
    step_order: number;
  }[];
  ingredients: {
    name: string;
    emoji: string;
  }[];
  nutrients: {
    fat_g: number;
    fiber_g: number;
    protein_g: number;
    carbs_g: number;
  };
}

export { CookingStep, Foods, GenAIResult, LikedFood, SavedFood };

