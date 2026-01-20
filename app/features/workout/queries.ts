import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "~/supa-client";
import { DateTime } from "luxon";

// Get today's workout for a user
export const getTodayWorkout = async (
    client: SupabaseClient<Database>,
    { profileId }: { profileId: string }
) => {
    const today = DateTime.now().toISODate();
    if (!today) throw new Error("Failed to get today's date");
    
    // First get the workout
    const { data: workout, error: workoutError } = await client
        .from("workouts")
        .select("*")
        .eq("profile_id", profileId)
        .eq("date", today)
        .single();
    
    if (workoutError) {
        if (workoutError.code === "PGRST116") {
            // No rows returned
            return null;
        }
        throw workoutError;
    }
    
    // Get exercises for this workout
    const { data: exercises, error: exercisesError } = await client
        .from("exercises")
        .select("*")
        .eq("workout_id", workout.workout_id)
        .order("exercise_id", { ascending: true });
    
    if (exercisesError) {
        throw exercisesError;
    }
    
    if (!exercises || exercises.length === 0) {
        return {
            workout_id: workout.workout_id,
            date: workout.date,
            overall_comment: workout.overall_comment,
            reason: workout.reason,
            is_rest: workout.is_rest ?? false,
            exercises: [],
        };
    }
    
    // Get all sets for these exercises
    const exerciseIds = exercises.map((e) => e.exercise_id);
    const { data: sets, error: setsError } = await client
        .from("sets")
        .select("*")
        .in("exercise_id", exerciseIds)
        .order("set_id", { ascending: true });
    
    if (setsError) {
        throw setsError;
    }
    
    // Group sets by exercise
    const exercisesWithSets = exercises.map((exercise) => {
        const exerciseSets = (sets || []).filter((set) => set.exercise_id === exercise.exercise_id);
        
        return {
            exercise_id: exercise.exercise_id,
            name: exercise.name,
            sets: exerciseSets,
        };
    });
    
    return {
        workout_id: workout.workout_id,
        date: workout.date,
        overall_comment: workout.overall_comment,
        reason: workout.reason,
        is_rest: workout.is_rest ?? false,
        exercises: exercisesWithSets,
    };
};

// Get past workouts for a user (for planner API)
export const getPastWorkouts = async (
    client: SupabaseClient<Database>,
    { profileId, limit = 30 }: { profileId: string; limit?: number }
) => {
    const today = DateTime.now().toISODate();
    if (!today) throw new Error("Failed to get today's date");
    
    // Get workouts
    const { data: workouts, error: workoutsError } = await client
        .from("workouts")
        .select("*")
        .eq("profile_id", profileId)
        .lt("date", today)
        .order("date", { ascending: false })
        .limit(limit);
    
    if (workoutsError) {
        throw workoutsError;
    }
    
    if (!workouts || workouts.length === 0) {
        return [];
    }
    
    // Get all exercises for these workouts
    const workoutIds = workouts.map((w) => w.workout_id);
    const { data: exercises, error: exercisesError } = await client
        .from("exercises")
        .select("*")
        .in("workout_id", workoutIds)
        .order("exercise_id", { ascending: true });
    
    if (exercisesError) {
        throw exercisesError;
    }
    
    if (!exercises || exercises.length === 0) {
        return workouts.map((workout) => ({
            ...workout,
            exercises: [],
        }));
    }
    
    // Get all sets for these exercises
    const exerciseIds = exercises.map((e) => e.exercise_id);
    const { data: sets, error: setsError } = await client
        .from("sets")
        .select("*")
        .in("exercise_id", exerciseIds)
        .order("set_id", { ascending: true });
    
    if (setsError) {
        throw setsError;
    }
    
    // Group exercises and sets by workout
    return workouts.map((workout) => {
        const workoutExercises = exercises.filter((e) => e.workout_id === workout.workout_id);
        
        // Group sets by exercise
        const exercisesWithSets = workoutExercises.map((exercise) => {
            const exerciseSets = (sets || []).filter((set) => set.exercise_id === exercise.exercise_id);
            
            return {
                exercise_id: exercise.exercise_id,
                name: exercise.name,
                sets: exerciseSets,
            };
        });
        
        return {
            ...workout,
            exercises: exercisesWithSets,
        };
    });
};

// Get user's join date (first workout profile creation date)
export const getJoinDate = async (
    client: SupabaseClient<Database>,
    { profileId }: { profileId: string }
) => {
    const { data, error } = await client
        .from("workout_profiles")
        .select("created_at")
        .eq("profile_id", profileId)
        .single();
    
    if (error) {
        if (error.code === "PGRST116") {
            return null;
        }
        throw error;
    }
    
    return data ? DateTime.fromISO(data.created_at).toISODate() : null;
};
