import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

export const supabase = createClient(supabaseUrl, supabaseAnonKey);


export const updateUserProfile = async (userId: string, updates: { full_name?: string; mobile?: string; address?: string }) => {
  const { data, error } = await supabase
    .from("profiles")
    .update(updates)
    .or(`id.eq.${userId},user_id.eq.${userId}`)
    .single();

  if (error) throw error;
  return data;
};