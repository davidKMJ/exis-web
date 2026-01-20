import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "~/supa-client";
import { API_URL } from "~/api/constants";
import { getTodayWorkout, getPastWorkouts, getJoinDate } from "./queries";
import { getWorkoutProfile } from "../trainer/queries";
import { DateTime } from "luxon";

// Update a set (mark as completed, add feedback)
export const updateSet = async (
    client: SupabaseClient<Database>,
    {
        setId,
        completed,
        feedback,
    }: {
        setId: number;
        completed?: boolean;
        feedback?: number | null;
    }
) => {
    const updateData: {
        completed?: boolean;
        feedback?: number | null;
        updated_at: string;
    } = {
        updated_at: new Date().toISOString(),
    };
    
    if (completed !== undefined) {
        updateData.completed = completed;
    }
    
    if (feedback !== undefined) {
        updateData.feedback = feedback;
    }
    
    const { data, error } = await client
        .from("sets")
        .update(updateData)
        .eq("set_id", setId)
        .select()
        .single();
    
    if (error) {
        throw error;
    }
    
    return data;
};

// Update workout record overall comment
export const updateWorkoutRecordComment = async (
    client: SupabaseClient<Database>,
    {
        workoutId,
        overallComment,
    }: {
        workoutId: number;
        overallComment: string;
    }
) => {
    const { data, error } = await client
        .from("workouts")
        .update({
            overall_comment: overallComment,
            updated_at: new Date().toISOString(),
        })
        .eq("workout_id", workoutId)
        .select()
        .single();
    
    if (error) {
        throw error;
    }
    
    return data;
};

// Create a workout from planner API response
export const createWorkoutFromPlanner = async (
    client: SupabaseClient<Database>,
    {
        profileId,
        workoutData,
        date,
    }: {
        profileId: string;
        workoutData: {
            date: string;
            exercises: Array<{
                name: string;
                sets: Array<{
                    reps: number;
                    weight: number | null;
                    rest_time: number | null;
                    completed: boolean;
                    feedback: number | null;
                }>;
            }>;
            overall_comment: string | null;
            reason: string;
        } | null;
        date: string;
    }
) => {
    // If workoutData is null, it means it's a rest day
    if (!workoutData) {
        const { data, error } = await client
            .from("workouts")
            .insert({
                profile_id: profileId,
                date,
                reason: "Rest day - recovery is important for progress",
                is_rest: true,
            })
            .select()
            .single();
        
        if (error) {
            throw error;
        }
        
        return data;
    }
    
    // Create the workout record
    const { data: workout, error: workoutError } = await client
        .from("workouts")
        .insert({
            profile_id: profileId,
            date: workoutData.date,
            reason: workoutData.reason,
            overall_comment: workoutData.overall_comment,
            is_rest: false,
        })
        .select()
        .single();
    
    if (workoutError) {
        throw workoutError;
    }
    
    // Create exercises and their sets
    for (const exerciseData of workoutData.exercises) {
        // Create exercise
        const { data: createdExercise, error: exerciseError } = await client
            .from("exercises")
            .insert({
                workout_id: workout.workout_id,
                name: exerciseData.name as any, // Type assertion for enum
            })
            .select()
            .single();
        
        if (exerciseError) {
            throw exerciseError;
        }
        
        // Create sets for this exercise
        if (exerciseData.sets.length > 0) {
            const setsToInsert = exerciseData.sets.map((set) => ({
                exercise_id: createdExercise.exercise_id,
                reps: set.reps,
                weight: set.weight,
                rest_time: set.rest_time,
                completed: set.completed,
                feedback: set.feedback,
            }));
            
            const { error: setsError } = await client
                .from("sets")
                .insert(setsToInsert);
            
            if (setsError) {
                throw setsError;
            }
        }
    }
    
    return workout;
};

// Call planner API and create workout if needed
export const ensureTodayWorkout = async (
    client: SupabaseClient<Database>,
    { profileId }: { profileId: string }
) => {
    // First check if workout exists for today
    const todayWorkout = await getTodayWorkout(client, { profileId });
    if (todayWorkout) {
        return todayWorkout;
    }
    
    // Get workout profile
    const workoutProfile = await getWorkoutProfile(client, { profileId });
    if (!workoutProfile) {
        throw new Error("Workout profile not found. Please complete your profile first.");
    }
    
    // Get join date
    const joinDate = await getJoinDate(client, { profileId });
    if (!joinDate) {
        throw new Error("Failed to get join date");
    }
    
    // Get past workouts
    const pastWorkouts = await getPastWorkouts(client, { profileId });
    
    // Format past workouts for API
    const pastWorkoutsFormatted = pastWorkouts.map((workout) => ({
        date: workout.date,
        exercises: workout.exercises.map((exercise: any) => ({
            name: exercise.name,
            sets: exercise.sets.map((set: any) => ({
                reps: set.reps,
                weight: set.weight,
                rest_time: set.rest_time,
                completed: set.completed,
                feedback: set.feedback,
            })),
        })),
        overall_comment: workout.overall_comment,
        reason: workout.reason,
    }));
    
    // Format workout profile for API
    const workoutProfileFormatted = {
        height: workoutProfile.height ? Number(workoutProfile.height) : null,
        weight: workoutProfile.weight ? Number(workoutProfile.weight) : null,
        bench_press_weight: workoutProfile.bench_press_weight ? Number(workoutProfile.bench_press_weight) : null,
        squat_weight: workoutProfile.squat_weight ? Number(workoutProfile.squat_weight) : null,
        deadlift_weight: workoutProfile.deadlift_weight ? Number(workoutProfile.deadlift_weight) : null,
        pushups_count: workoutProfile.pushups_count ? Number(workoutProfile.pushups_count) : null,
        squats_count: workoutProfile.squats_count ? Number(workoutProfile.squats_count) : null,
        situps_count: workoutProfile.situps_count ? Number(workoutProfile.situps_count) : null,
        exercise_environment: workoutProfile.exercise_environment,
        current_exercise_frequency: workoutProfile.current_exercise_frequency,
        desired_exercise_frequency: workoutProfile.desired_exercise_frequency,
        exercise_goal: workoutProfile.exercise_goal,
        additional_information: workoutProfile.additional_information,
    };
    // Call planner API
    const today = DateTime.now().toISODate();
    if (!today) throw new Error("Failed to get today's date");

    console.log(workoutProfileFormatted);
    console.log(pastWorkoutsFormatted);
    console.log(joinDate);
    console.log(today);
    
    const response = await fetch(`${API_URL}api/planner`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify({
            join_date: joinDate,
            date: today,
            workout_profile: workoutProfileFormatted,
            past_workouts: pastWorkoutsFormatted,
        }),
    });
    
    if (!response.ok) {
        throw new Error("Failed to get workout plan from planner API");
    }
    
    const data = await response.json();
    
    // Create workout in database
    const workout = await createWorkoutFromPlanner(client, {
        profileId,
        workoutData: data.today_workout,
        date: today,
    });
    
    // Fetch and return the complete workout with exercises and sets
    return await getTodayWorkout(client, { profileId });
};
