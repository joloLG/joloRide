import { supabase } from "@/lib/supabase";
import { useEffect, useState } from "react";
import { User } from "@supabase/supabase-js";

interface Profile {
  id: string;
  user_id?: string;
  role: 'user' | 'rider' | 'admin';
  full_name?: string;
  mobile?: string;
  address?: string;
  lat?: number;
  lng?: number;
  avatar_url?: string;
  is_active?: boolean;
  created_at: string;
}

export function useUser() {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const { data: { user: authUser } } = await supabase.auth.getUser();
        
        if (!authUser) {
          setUser(null);
          setProfile(null);
          setIsLoading(false);
          return;
        }

        setUser(authUser);

        // Fetch profile data
        const { data: profileData, error: profileError } = await supabase
          .from("profiles")
          .select("*")
          .or(`id.eq.${authUser.id},user_id.eq.${authUser.id}`)
          .single();

        if (profileError) {
          console.error("Error fetching profile:", profileError);
        }

        setProfile(profileData);
      } catch (error) {
        console.error("Error fetching user data:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchUser();
  }, []);

  return { user, profile, isLoading };
}
