import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "~/supa-client";

export const getWorkoutProfile = async (
    client: SupabaseClient<Database>,
    { profileId }: { profileId: string }
) => {
    const { data, error } = await client
        .from("workout_profiles")
        .select("*")
        .eq("profile_id", profileId)
        .single();
    
    if (error) {
        if (error.code === "PGRST116") {
            // No rows returned
            return null;
        }
        throw error;
    }
    
    return data;
};