import {
    bigint,
    boolean,
    integer,
    numeric,
    pgEnum,
    pgTable,
    text,
    timestamp,
    uuid,
} from "drizzle-orm/pg-core";
import { profiles } from "../users/schema";

export const exerciseNames = pgEnum("exercise_names", [
    "Push-up",
    "Squat",
    "Deadlift",
    "Bench Press",
    "Pull-up",
    "Overhead Press",
    "Row",
    "Lunge",
    "Plank",
    "Mountain Climber",
    "Dips",
    "Burpee",
    "Hip Thrust",
    "Bicep Curl",
    "Tricep Extension",
    "Side Lateral Raise",
    "Leg Extension",
    "Leg Curl",
    "Calf Raise",
    "Shoulder Press",
    "Hanging Leg Raise",
    "Shrug",
    "Arm Curl",
    "Sit-up",
    "Kettlebell Swing",
]);

export const workoutProfiles = pgTable("workout_profiles", {
    profile_id: uuid()
        .primaryKey()
        .references(() => profiles.profile_id, {
            onDelete: "cascade",
        })
        .notNull(),
    height: numeric(), // in cm
    weight: numeric(), // in kg
    bench_press_weight: numeric(), // in kg
    squat_weight: numeric(), // in kg
    deadlift_weight: numeric(), // in kg
    pushups_count: numeric(), // number of push-ups
    squats_count: numeric(), // number of bodyweight squats
    situps_count: numeric(), // number of sit-ups
    exercise_environment: text(), // bodyweight, home training, gym, etc.
    current_exercise_frequency: integer(), // current weekly exercise frequency
    desired_exercise_frequency: integer(), // desired weekly exercise frequency
    exercise_goal: text(), // diet, muscle gain, performance, etc.
    additional_information: text(), // injuries, health conditions, equipment available, etc.
    created_at: timestamp().notNull().defaultNow(),
    updated_at: timestamp().notNull().defaultNow(),
});

export const workouts = pgTable("workouts", {
    workout_id: bigint({ mode: "number" })
        .primaryKey()
        .generatedAlwaysAsIdentity(),
    profile_id: uuid()
        .references(() => profiles.profile_id, {
            onDelete: "cascade",
        })
        .notNull(),
    date: timestamp().notNull(), // Date of the workout
    overall_comment: text(), // Overall comment after workout completion
    reason: text().notNull(), // Reason for the workout structure from the trainer
    is_rest: boolean().notNull().default(false), // Whether the workout is a rest day
    created_at: timestamp().notNull().defaultNow(),
    updated_at: timestamp().notNull().defaultNow(),
});

// Individual workouts within a workout record
export const exercises = pgTable("exercises", {
    exercise_id: bigint({ mode: "number" })
        .primaryKey()
        .generatedAlwaysAsIdentity(),
    workout_id: bigint({ mode: "number" })
        .references(() => workouts.workout_id, {
            onDelete: "cascade",
        })
        .notNull(),
    name: exerciseNames().notNull(),
});

// Sets within a workout
export const sets = pgTable("sets", {
    set_id: bigint({ mode: "number" })
        .primaryKey()
        .generatedAlwaysAsIdentity(),
    exercise_id: bigint({ mode: "number" })
        .references(() => exercises.exercise_id, {
            onDelete: "cascade",
        })
        .notNull(),
    reps: integer().notNull(),
    weight: numeric(), // Weight in kg, null for bodyweight exercises
    rest_time: numeric(), // Rest time in minutes, null for last set
    completed: boolean().notNull().default(false),
    feedback: integer(), // Difficulty feedback 1-10, null for uncompleted sets
    created_at: timestamp().notNull().defaultNow(),
    updated_at: timestamp().notNull().defaultNow(),
});

