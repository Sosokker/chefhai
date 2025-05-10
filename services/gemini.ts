import { GenAIResult } from '../types';
import { supabase } from './supabase';

export async function callGenAIonImage(imageUrl: string): Promise<{ data: GenAIResult | null; error: Error | null }> {
  const { data, error } = await supabase.functions.invoke('gemini-food-analyze', {
    body: { imageUrl: imageUrl },
  })

  return { data, error }
}