import type { Route } from "./+types/workout-page";
import { makeSSRClient } from "~/supa-client";
import { getLoggedInUserId } from "~/features/auth/queries";
import { getWorkoutProfile } from "~/features/trainer/queries";
import { updateSet, updateWorkoutRecordComment, ensureTodayWorkout } from "../mutations";
import { Card, CardContent, CardHeader, CardTitle } from "~/common/components/ui/card";
import { Button } from "~/common/components/ui/button";
import { Badge } from "~/common/components/ui/badge";
import { Trophy } from "lucide-react";
import { Link, useFetcher, useRevalidator } from "react-router";
import { useState, useEffect } from "react";
import { ExerciseCard } from "../components/exercise-card";

type Exercise = {
    exercise_id: number;
    name: string;
    sets: Array<{
        set_id: number;
        reps: number;
        weight: number | null;
        rest_time: number | null;
        completed: boolean;
        feedback: number | null;
    }>;
};

type Workout = {
    workout_id: number;
    date: string;
    overall_comment: string | null;
    reason: string;
    is_rest: boolean;
    exercises: Exercise[];
};

export const meta: Route.MetaFunction = () => [{ title: "Workout | EXIS" }];

export const loader = async ({ request }: Route.LoaderArgs) => {
    try {
        const { client } = makeSSRClient(request);
        const userId = await getLoggedInUserId(client);
        
        // Check if user has workout profile
        const profile = await getWorkoutProfile(client, { profileId: userId });
        
        if (!profile) {
            return { 
                hasProfile: false,
                workout: null,
            };
        }
        
        // Ensure today's workout exists (will create if needed)
        try {
            const workout = await ensureTodayWorkout(client, { profileId: userId });
            return {
                hasProfile: true,
                workout,
            };
        } catch (error) {
            console.error("Error ensuring workout:", error);
            
            // Check if it's a network/timeout error
            const errorCause = error instanceof Error && 'cause' in error ? (error as any).cause : null;
            const isNetworkError = error instanceof Error && (
                error.message.includes("fetch failed") ||
                error.message.includes("timeout") ||
                error.message.includes("UND_ERR_CONNECT_TIMEOUT") ||
                (errorCause && errorCause.code === "UND_ERR_CONNECT_TIMEOUT")
            );
            
            if (isNetworkError) {
                // Return gracefully instead of crashing
                return {
                    hasProfile: true,
                    workout: null,
                    error: "Connection timeout. Please check your internet connection.",
                };
            }
            
            return { 
                hasProfile: true,
                workout: null,
                error: error instanceof Error ? error.message : "Failed to load workout",
            };
        }
    } catch (error) {
        // Handle errors from getLoggedInUserId or getWorkoutProfile
        const errorCause = error instanceof Error && 'cause' in error ? (error as any).cause : null;
        const isNetworkError = error instanceof Error && (
            error.message.includes("fetch failed") ||
            error.message.includes("timeout") ||
            error.message.includes("UND_ERR_CONNECT_TIMEOUT") ||
            (errorCause && errorCause.code === "UND_ERR_CONNECT_TIMEOUT")
        );
        
        if (isNetworkError) {
            return {
                hasProfile: false,
                workout: null,
                error: "Connection timeout. Please check your internet connection.",
            };
        }
        
        // Re-throw other errors (like redirects)
        throw error;
    }
};

export const action = async ({ request }: Route.ActionArgs) => {
    const { client } = makeSSRClient(request);
    const formData = await request.formData();
    const intent = formData.get("intent");
    const setId = Number(formData.get("setId"));
    const feedbackValue = formData.get("feedback");
    const feedback = feedbackValue && feedbackValue !== "" 
        ? Number(feedbackValue) 
        : null;
    const workoutId = formData.get("workoutId") 
        ? Number(formData.get("workoutId")) 
        : null;

    if (intent === "completeSet" && setId) {
        try {
            await updateSet(client, {
                setId,
                completed: true,
                feedback,
            });
            return { ok: true, intent: "completeSet" };
        } catch (error) {
            return { 
                ok: false, 
                error: error instanceof Error ? error.message : "Failed to update set",
                intent: "completeSet"
            };
        }
    }

    if (intent === "submitWorkout" && workoutId) {
        try {
            await updateWorkoutRecordComment(client, {
                workoutId,
                overallComment: "Workout completed successfully! Great job!",
            });
            return { ok: true, intent: "submitWorkout" };
        } catch (error) {
            return { 
                ok: false, 
                error: error instanceof Error ? error.message : "Failed to submit workout",
                intent: "submitWorkout"
            };
        }
    }

    return { ok: false, error: "Invalid request" };
};

// Submit workout form component
function SubmitWorkoutForm({ 
    workoutId,
    onSuccess 
}: { 
    workoutId: number;
    onSuccess: () => void;
}) {
    const fetcher = useFetcher();
    const isSubmitting = fetcher.state !== "idle";

    useEffect(() => {
        if (fetcher.data?.ok && fetcher.data?.intent === "submitWorkout") {
            onSuccess();
        }
    }, [fetcher.data, onSuccess]);

    return (
        <fetcher.Form method="post" className="space-y-4">
            <input type="hidden" name="intent" value="submitWorkout" />
            <input type="hidden" name="workoutId" value={workoutId} />
            
            <div className="flex items-center gap-3">
                <Trophy className="size-6 text-green-600 dark:text-green-400" />
                <div className="flex-1">
                    <h3 className="text-lg font-semibold text-green-900 dark:text-green-100">
                        All Exercises Completed!
                    </h3>
                    <p className="text-sm text-green-700 dark:text-green-300">
                        Submit your workout to save your progress and receive trainer feedback.
                    </p>
                </div>
            </div>
            
            <Button
                type="submit"
                variant="default"
                size="lg"
                disabled={isSubmitting}
                className="w-full bg-green-600 hover:bg-green-700 text-white"
            >
                {isSubmitting ? "Submitting..." : "Submit Workout"}
            </Button>
        </fetcher.Form>
    );
}

export default function WorkoutPage({ loaderData }: Route.ComponentProps) {
    const [completedSets, setCompletedSets] = useState<Set<number>>(new Set());
    const [expandedExercises, setExpandedExercises] = useState<Set<number>>(new Set());
    const revalidator = useRevalidator();

    // Show profile setup if no profile
    if (!loaderData.hasProfile) {
        return (
            <div className="space-y-10 max-w-2xl mx-auto">
                <div className="text-center space-y-4">
                    <h1 className="text-4xl font-bold">Welcome to EXIS!</h1>
                    <p className="text-muted-foreground text-lg">
                        Before we create your personalized workout plan, let's get to know you better.
                    </p>
                </div>
                <Card>
                    <CardHeader>
                        <CardTitle>Complete Your Workout Profile</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <p className="text-muted-foreground">
                            Our AI trainer will ask you a few questions to understand your fitness goals,
                            experience level, and preferences. This will help us create the perfect workout
                            plan for you.
                        </p>
                        <Button asChild className="w-full" size="lg">
                            <Link to="/trainer">Start with Trainer</Link>
                        </Button>
                    </CardContent>
                </Card>
            </div>
        );
    }

    // Show error or no workout message
    if (!loaderData.workout) {
        return (
            <div className="space-y-10 max-w-2xl mx-auto">
                <div className="text-center space-y-4">
                    <h1 className="text-4xl font-bold">Today's Workout</h1>
                    <p className="text-muted-foreground text-lg">
                        {loaderData.error || "No workout planned for today. Check back tomorrow!"}
                    </p>
                </div>
            </div>
        );
    }

    const workout = loaderData.workout;
    
    // Initialize completed sets from workout data
    useEffect(() => {
        const initialCompleted = new Set<number>();
        
        workout.exercises.forEach((exercise) => {
            exercise.sets.forEach((set) => {
                if (set.completed) {
                    initialCompleted.add(set.set_id);
                }
            });
        });
        
        setCompletedSets(initialCompleted);
    }, [workout]);
    
    // Initialize expansion state - only on first load, find first incomplete exercise
    const [hasInitializedExpansion, setHasInitializedExpansion] = useState(false);
    useEffect(() => {
        // Only initialize once on first load
        if (!hasInitializedExpansion) {
            const firstIncompleteIndex = workout.exercises.findIndex((exercise) =>
                !exercise.sets.every((set) => set.completed)
            );
            
            const initialExpanded = new Set<number>();
            if (firstIncompleteIndex !== -1) {
                initialExpanded.add(workout.exercises[firstIncompleteIndex].exercise_id);
            } else if (workout.exercises.length > 0) {
                // All exercises completed, expand the last one
                initialExpanded.add(workout.exercises[workout.exercises.length - 1].exercise_id);
            }
            
            setExpandedExercises(initialExpanded);
            setHasInitializedExpansion(true);
        }
    }, [workout, hasInitializedExpansion]);
 
    // Calculate progress
    const totalSets = workout.exercises.reduce(
        (sum: number, exercise: Exercise) => sum + exercise.sets.length,
        0
    );
    const currentCompleted = workout.exercises.reduce(
        (sum: number, exercise: Exercise) =>
            sum + exercise.sets.filter((set) => completedSets.has(set.set_id)).length,
        0
    );
    const progress = totalSets > 0 ? (currentCompleted / totalSets) * 100 : 0;

    // Check if all exercises are completed
    const allExercisesCompleted = workout.exercises.every((exercise: Exercise) =>
        exercise.sets.every((set) => completedSets.has(set.set_id))
    );

    // Helper function to check if an exercise is enabled (sequential logic)
    const isExerciseEnabled = (exerciseIndex: number): boolean => {
        if (exerciseIndex === 0) return true;
        
        // Check if previous exercise is fully completed
        const previousExercise = workout.exercises[exerciseIndex - 1];
        return previousExercise.sets.every((set) => completedSets.has(set.set_id));
    };

    const handleSetComplete = (setId: number) => {
        // Find which exercise this set belongs to
        const exerciseIndex = workout.exercises.findIndex((exercise) =>
            exercise.sets.some((set) => set.set_id === setId)
        );
        
        if (exerciseIndex === -1) return;
        
        const exercise = workout.exercises[exerciseIndex];
        
        // Update completed sets
        setCompletedSets((prev) => {
            const next = new Set(prev);
            next.add(setId);
            
            // Check if this exercise is now fully completed
            const allCompleted = exercise.sets.every((set) => {
                if (set.set_id === setId) return true; // Include the just-completed set
                return next.has(set.set_id);
            });
            
            // Auto-collapse completed exercise and expand next one
            if (allCompleted) {
                setExpandedExercises((prevExpanded) => {
                    const nextExpanded = new Set(prevExpanded);
                    nextExpanded.delete(exercise.exercise_id);
                    
                    // Expand next exercise if it exists
                    if (exerciseIndex < workout.exercises.length - 1) {
                        const nextExercise = workout.exercises[exerciseIndex + 1];
                        nextExpanded.add(nextExercise.exercise_id);
                    }
                    
                    return nextExpanded;
                });
            }
            
            return next;
        });
        
        // Revalidate to get fresh data (with error handling)
        try {
            revalidator.revalidate();
        } catch (error) {
            // Silently handle revalidation errors - the UI state is already updated
            console.warn("Revalidation failed:", error);
        }
    };
    
    const handleWorkoutSubmitSuccess = () => {
        // Revalidate to get fresh data (with error handling)
        try {
            revalidator.revalidate();
        } catch (error) {
            // Handle revalidation errors gracefully
            console.warn("Revalidation after workout submission failed:", error);
            // The workout is already submitted, so we can continue without revalidation
        }
    };
    
    const handleToggleExercise = (exerciseId: number) => {
        setExpandedExercises((prev) => {
            const next = new Set(prev);
            if (next.has(exerciseId)) {
                next.delete(exerciseId);
            } else {
                next.add(exerciseId);
            }
            return next;
        });
    };

    // Check if it's a rest day
    if ((workout as Workout).is_rest) {
        return (
            <div className="space-y-10 max-w-2xl mx-auto">
                <div className="text-center space-y-4">
                    <h1 className="text-4xl font-bold">Rest Day</h1>
                    <p className="text-muted-foreground text-lg">
                        {workout.reason}
                    </p>
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-10 max-w-4xl mx-auto">
            <div className="space-y-4">
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-4xl font-bold">Today's Workout</h1>
                        <p className="text-muted-foreground mt-2">
                            {new Date(workout.date).toLocaleDateString("en-US", {
                                weekday: "long",
                                year: "numeric",
                                month: "long",
                                day: "numeric",
                            })}
                        </p>
                    </div>
                    <Badge variant="secondary" className="text-lg px-4 py-2">
                        {currentCompleted} / {totalSets} sets completed
                    </Badge>
                </div>
                <div className="w-full bg-muted rounded-full h-3">
                    <div
                        className="bg-primary h-3 rounded-full transition-all duration-300"
                        style={{ width: `${progress}%` }}
                    />
                </div>
            </div>

            {workout.reason && (
                <Card>
                    <CardHeader>
                        <CardTitle>Workout Plan</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <p className="text-muted-foreground">{workout.reason}</p>
                    </CardContent>
                </Card>
            )}

            <div className="space-y-8">
                {workout.exercises.map((exercise: Exercise, exerciseIndex: number) => {
                    const exerciseEnabled = isExerciseEnabled(exerciseIndex);
                    const isExpanded = expandedExercises.has(exercise.exercise_id);
                    
                    return (
                        <ExerciseCard
                            key={exercise.exercise_id}
                            exercise={exercise}
                            exerciseIndex={exerciseIndex}
                            isEnabled={exerciseEnabled}
                            isExpanded={isExpanded}
                            onSetComplete={handleSetComplete}
                            onToggleExpand={() => handleToggleExercise(exercise.exercise_id)}
                        />
                    );
                })}
            </div>

            {/* Submit Workout Button - appears when all exercises are completed */}
            {!workout.overall_comment && !workout.is_rest && allExercisesCompleted && (
                <Card className="border-green-200 dark:border-green-800 bg-green-50 dark:bg-green-950/20">
                    <CardContent className="pt-6">
                        <SubmitWorkoutForm 
                            workoutId={workout.workout_id}
                            onSuccess={handleWorkoutSubmitSuccess}
                        />
                    </CardContent>
                </Card>
            )}

            {workout.overall_comment && (
                <Card>
                    <CardHeader>
                        <CardTitle>Trainer's Comment</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <p className="text-muted-foreground">
                            {workout.overall_comment}
                        </p>
                    </CardContent>
                </Card>
            )}
        </div>
    );
}
