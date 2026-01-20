import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "~/supa-client";

type WorkoutProfileInput = {
    height?: number | null;
    weight?: number | null;
    bench_press_weight?: number | null;
    squat_weight?: number | null;
    deadlift_weight?: number | null;
    pushups_count?: number | null;
    squats_count?: number | null;
    situps_count?: number | null;
    exercise_environment?: string | null;
    current_exercise_frequency?: number | null;
    desired_exercise_frequency?: number | null;
    exercise_goal?: string | null;
    additional_information?: string | null;
};

export const createWorkoutProfile = async (
    client: SupabaseClient<Database>,
    {
        profileId,
        profile,
    }: {
        profileId: string;
        profile: WorkoutProfileInput;
    }
) => {
    const { data, error } = await client
        .from("workout_profiles")
        .insert({
            profile_id: profileId,
            ...profile,
            updated_at: new Date().toISOString(),
        })
        .select()
        .single();

    if (error) {
        throw error;
    }

    return data;
};

export const updateWorkoutProfile = async (
    client: SupabaseClient<Database>,
    {
        profileId,
        profile,
    }: {
        profileId: string;
        profile: WorkoutProfileInput;
    }
) => {
    const { data, error } = await client
        .from("workout_profiles")
        .update({
            ...profile,
            updated_at: new Date().toISOString(),
        })
        .eq("profile_id", profileId)
        .select()
        .single();

    if (error) {
        throw error;
    }

    return data;
};