import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getFoods } from '../services/data/foods';
import { 
  getLikesCount, 
  getSavesCount, 
  getCommentsCount, 
  createLike, 
  deleteLike, 
  createSave, 
  deleteSave,
  checkUserLiked,
  checkUserSaved
} from '../services/data/forum';
import { getProfile } from '../services/data/profile';
import { Food, Profile } from '../types/index';

// Query keys
export const queryKeys = {
  foods: 'foods',
  foodStats: 'food-stats',
  foodCreators: 'food-creators',
  userInteractions: 'user-interactions',
  foodDetails: (id: string) => ['food-details', id],
  foodComments: (id: string) => ['food-comments', id],
};

// Hook to fetch foods
export function useFoods(category?: string, search?: string, sort?: string) {
  return useQuery({
    queryKey: [queryKeys.foods, category, search, sort],
    queryFn: async () => {
      const { data, error } = await getFoods(category, true, search);
      
      if (error) {
        throw error;
      }
      
      if (!data) {
        return [];
      }
      
      let sortedData = [...data];
      
      if (sort === 'rating') {
        sortedData.sort((a, b) => (b.calories ?? 0) - (a.calories ?? 0));
      } else if (sort === 'newest') {
        sortedData.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
      } else if (sort === 'best') {
        sortedData.sort((a, b) => (b.ingredient_count ?? 0) - (a.ingredient_count ?? 0));
      } else if (sort === 'like_desc') {
        // First, we need to get likes count for each food
        const likesPromises = sortedData.map(async (food) => {
          const { count } = await getLikesCount(food.id);
          return { foodId: food.id, likes: count || 0 };
        });
        
        const likesData = await Promise.all(likesPromises);
        const likesMap = likesData.reduce((acc, item) => {
          acc[item.foodId] = item.likes;
          return acc;
        }, {} as Record<string, number>);
        
        // Sort by likes count (high to low)
        sortedData.sort((a, b) => (likesMap[b.id] || 0) - (likesMap[a.id] || 0));
      }
      
      return sortedData.map(food => ({
        ...food,
        description: food.description || '',
        ingredient_count: food.ingredient_count ?? 0,
        calories: food.calories ?? 0,
        image_url: food.image_url || '',
      }));
    },
  });
}

// Hook to fetch food stats
export function useFoodStats(foodIds: string[]) {
  return useQuery({
    queryKey: [queryKeys.foodStats, foodIds],
    queryFn: async () => {
      if (!foodIds.length) return {};
      
      const statsPromises = foodIds.map(async (foodId) => {
        const [likesRes, savesRes, commentsRes] = await Promise.all([
          getLikesCount(foodId),
          getSavesCount(foodId),
          getCommentsCount(foodId)
        ]);
        
        return {
          foodId,
          likes: likesRes.count || 0,
          saves: savesRes.count || 0,
          comments: commentsRes.count || 0
        };
      });
      
      const stats = await Promise.all(statsPromises);
      
      return stats.reduce((acc, stat) => {
        acc[stat.foodId] = {
          likes: stat.likes,
          saves: stat.saves,
          comments: stat.comments
        };
        return acc;
      }, {} as Record<string, { likes: number, saves: number, comments: number }>);
    },
    enabled: foodIds.length > 0,
  });
}

// Hook to fetch food creators
export function useFoodCreators(creatorIds: string[]) {
  return useQuery({
    queryKey: [queryKeys.foodCreators, creatorIds],
    queryFn: async () => {
      if (!creatorIds.length) return {};
      
      const uniqueCreatorIds = [...new Set(creatorIds)];
      const creatorProfiles: Record<string, Profile> = {};
      
      for (const creatorId of uniqueCreatorIds) {
        const { data: profile } = await getProfile(creatorId);
        if (profile) {
          creatorProfiles[creatorId] = profile;
        }
      }
      
      return creatorProfiles;
    },
    enabled: creatorIds.length > 0,
  });
}

// Hook to fetch user interactions
export function useUserInteractions(foodIds: string[], userId: string | null) {
  return useQuery({
    queryKey: [queryKeys.userInteractions, foodIds, userId],
    queryFn: async () => {
      if (!foodIds.length || !userId) return {};
      
      const interactionsPromises = foodIds.map(async (foodId) => {
        const [likedRes, savedRes] = await Promise.all([
          checkUserLiked(foodId, userId),
          checkUserSaved(foodId, userId)
        ]);
        
        return {
          foodId,
          liked: !!likedRes.data,
          saved: !!savedRes.data
        };
      });
      
      const interactions = await Promise.all(interactionsPromises);
      
      return interactions.reduce((acc, interaction) => {
        acc[interaction.foodId] = {
          liked: interaction.liked,
          saved: interaction.saved
        };
        return acc;
      }, {} as Record<string, { liked: boolean, saved: boolean }>);
    },
    enabled: foodIds.length > 0 && !!userId,
  });
}

// Hook to like/unlike a food
export function useLikeMutation() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ foodId, userId, isLiked }: { foodId: string, userId: string, isLiked: boolean }) => {
      if (isLiked) {
        return deleteLike(foodId, userId);
      } else {
        return createLike(foodId, userId);
      }
    },
    onMutate: async ({ foodId, isLiked }) => {
      // Cancel any outgoing refetches
      await queryClient.cancelQueries({ queryKey: [queryKeys.foodStats] });
      await queryClient.cancelQueries({ queryKey: [queryKeys.userInteractions] });
      
      // Snapshot the previous value
      const previousStats = queryClient.getQueryData([queryKeys.foodStats]);
      const previousInteractions = queryClient.getQueryData([queryKeys.userInteractions]);
      
      // Optimistically update
      queryClient.setQueryData([queryKeys.foodStats], (old: any) => {
        if (!old) return old;
        
        return {
          ...old,
          [foodId]: {
            ...old[foodId],
            likes: isLiked ? Math.max(0, old[foodId].likes - 1) : old[foodId].likes + 1
          }
        };
      });
      
      queryClient.setQueryData([queryKeys.userInteractions], (old: any) => {
        if (!old) return old;
        
        return {
          ...old,
          [foodId]: {
            ...old[foodId],
            liked: !isLiked
          }
        };
      });
      
      // Return a context object with the snapshotted value
      return { previousStats, previousInteractions };
    },
    onError: (err, variables, context) => {
      // If the mutation fails, use the context returned from onMutate to roll back
      if (context?.previousStats) {
        queryClient.setQueryData([queryKeys.foodStats], context.previousStats);
      }
      if (context?.previousInteractions) {
        queryClient.setQueryData([queryKeys.userInteractions], context.previousInteractions);
      }
    },
    onSettled: () => {
      // Always refetch after error or success
      queryClient.invalidateQueries({ queryKey: [queryKeys.foodStats] });
      queryClient.invalidateQueries({ queryKey: [queryKeys.userInteractions] });
    },
  });
}

// Hook to save/unsave a food
export function useSaveMutation() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ foodId, userId, isSaved }: { foodId: string, userId: string, isSaved: boolean }) => {
      if (isSaved) {
        return deleteSave(foodId, userId);
      } else {
        return createSave(foodId, userId);
      }
    },
    onMutate: async ({ foodId, isSaved }) => {
      // Cancel any outgoing refetches
      await queryClient.cancelQueries({ queryKey: [queryKeys.foodStats] });
      await queryClient.cancelQueries({ queryKey: [queryKeys.userInteractions] });
      
      // Snapshot the previous value
      const previousStats = queryClient.getQueryData([queryKeys.foodStats]);
      const previousInteractions = queryClient.getQueryData([queryKeys.userInteractions]);
      
      // Optimistically update
      queryClient.setQueryData([queryKeys.foodStats], (old: any) => {
        if (!old) return old;
        
        return {
          ...old,
          [foodId]: {
            ...old[foodId],
            saves: isSaved ? Math.max(0, old[foodId].saves - 1) : old[foodId].saves + 1
          }
        };
      });
      
      queryClient.setQueryData([queryKeys.userInteractions], (old: any) => {
        if (!old) return old;
        
        return {
          ...old,
          [foodId]: {
            ...old[foodId],
            saved: !isSaved
          }
        };
      });
      
      // Return a context object with the snapshotted value
      return { previousStats, previousInteractions };
    },
    onError: (err, variables, context) => {
      // If the mutation fails, use the context returned from onMutate to roll back
      if (context?.previousStats) {
        queryClient.setQueryData([queryKeys.foodStats], context.previousStats);
      }
      if (context?.previousInteractions) {
        queryClient.setQueryData([queryKeys.userInteractions], context.previousInteractions);
      }
    },
    onSettled: () => {
      // Always refetch after error or success
      queryClient.invalidateQueries({ queryKey: [queryKeys.foodStats] });
      queryClient.invalidateQueries({ queryKey: [queryKeys.userInteractions] });
    },
  });
}
