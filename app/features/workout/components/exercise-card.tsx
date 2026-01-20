import { Card, CardContent, CardHeader, CardTitle } from "~/common/components/ui/card";
import { Button } from "~/common/components/ui/button";
import { Badge } from "~/common/components/ui/badge";
import { Label } from "~/common/components/ui/label";
import { CheckCircle2, Circle, Dumbbell, Timer } from "lucide-react";
import { Link } from "react-router";
import { cn } from "~/lib/utils";
import { useState, useEffect } from "react";
import { useFetcher } from "react-router";

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

type ExerciseCardProps = {
    exercise: Exercise;
    exerciseIndex: number;
    isEnabled: boolean;
    isExpanded: boolean;
    onSetComplete: (setId: number) => void;
    onToggleExpand: () => void;
};

// Difficulty gauge component
function DifficultyGauge({ 
    value, 
    onChange, 
    disabled 
}: { 
    value: number; 
    onChange: (value: number) => void;
    disabled?: boolean;
}) {
    const getColor = (val: number) => {
        if (val <= 3) return "bg-green-500";
        if (val <= 6) return "bg-yellow-500";
        if (val <= 8) return "bg-orange-500";
        return "bg-red-500";
    };

    const getLabel = (val: number) => {
        if (val === 0) return "Not Rated";
        if (val <= 2) return "Very Easy";
        if (val <= 4) return "Easy";
        if (val <= 6) return "Moderate";
        if (val <= 8) return "Hard";
        return "Very Hard";
    };

    return (
        <div className="space-y-2 w-full">
            <div className="flex items-center justify-between">
                <Label className="text-xs text-muted-foreground">Difficulty</Label>
                <span className="text-xs font-medium">{value}/10 - {getLabel(value)}</span>
            </div>
            <div className="relative">
                <input
                    type="range"
                    min="0"
                    max="10"
                    value={value}
                    onChange={(e) => onChange(Number(e.target.value))}
                    disabled={disabled}
                    className={cn(
                        "w-full h-2 bg-muted rounded-lg appearance-none cursor-pointer",
                        "disabled:opacity-50 disabled:cursor-not-allowed",
                        "[&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-5 [&::-webkit-slider-thumb]:h-5 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-primary [&::-webkit-slider-thumb]:cursor-pointer",
                        "[&::-moz-range-thumb]:w-5 [&::-moz-range-thumb]:h-5 [&::-moz-range-thumb]:rounded-full [&::-moz-range-thumb]:bg-primary [&::-moz-range-thumb]:border-0 [&::-moz-range-thumb]:cursor-pointer"
                    )}
                    style={{
                        background: value === 0 
                            ? "rgb(229 231 235)"
                            : `linear-gradient(to right, ${getColor(value)} 0%, ${getColor(value)} ${value * 10}%, rgb(229 231 235) ${value * 10}%, rgb(229 231 235) 100%)`
                    }}
                />
                <div className="flex justify-between mt-1 text-[10px] text-muted-foreground">
                    <span>0</span>
                    <span>5</span>
                    <span>10</span>
                </div>
            </div>
        </div>
    );
}

// Rest time indicator
function RestTimeIndicator({ minutes }: { minutes: number | null }) {
    if (!minutes) return null;
    
    return (
        <div className="flex items-center gap-2 p-3 rounded-lg border bg-muted/20 border-muted/50">
            <Timer className="size-4 text-muted-foreground flex-shrink-0" />
            <span className="text-sm text-muted-foreground">
                Rest {minutes} {minutes === 1 ? 'minute' : 'minutes'}
            </span>
        </div>
    );
}

// Set completion form
function SetCompletionForm({ 
    set, 
    exerciseName, 
    setIndex,
    isEnabled,
    onComplete 
}: { 
    set: Exercise["sets"][0];
    exerciseName: string;
    setIndex: number;
    isEnabled: boolean;
    onComplete: () => void;
}) {
    const fetcher = useFetcher();
    const [feedback, setFeedback] = useState<number>(set.feedback ?? 0);
    const isSubmitting = fetcher.state !== "idle";

    // Sync feedback with prop changes (when data is revalidated)
    useEffect(() => {
        if (set.feedback !== null && set.feedback !== undefined) {
            setFeedback(set.feedback);
        }
    }, [set.feedback]);

    // Handle successful completion
    useEffect(() => {
        if (fetcher.data?.ok && fetcher.data?.intent === "completeSet" && fetcher.state === "idle") {
            onComplete();
        }
    }, [fetcher.data, fetcher.state, onComplete]);

    if (set.completed) {
        return (
            <div className="flex items-center gap-2 flex-wrap">
                <CheckCircle2 className="size-5 text-green-500 flex-shrink-0" />
                <span className="text-sm text-green-500 font-medium">Completed</span>
                {set.feedback !== null && set.feedback !== undefined && (
                    <Badge variant="outline" className="text-xs">
                        Difficulty: {set.feedback}/10
                    </Badge>
                )}
            </div>
        );
    }

    return (
        <fetcher.Form method="post" className="space-y-3 w-full">
            <input type="hidden" name="intent" value="completeSet" />
            <input type="hidden" name="setId" value={set.set_id} />
            <input type="hidden" name="feedback" value={feedback} />
            
            <DifficultyGauge
                value={feedback}
                onChange={setFeedback}
                disabled={!isEnabled || isSubmitting}
            />
            
            <Button
                type="submit"
                variant="default"
                size="sm"
                disabled={!isEnabled || isSubmitting}
                className="w-full"
            >
                {isSubmitting ? "Saving..." : "Complete Set"}
            </Button>
        </fetcher.Form>
    );
}

// Exercise icon mapping
const getExerciseIcon = (exerciseName: string) => {
    return <Dumbbell className="size-12 text-muted-foreground" />;
};

export function ExerciseCard({ exercise, exerciseIndex, isEnabled, isExpanded, onSetComplete, onToggleExpand }: ExerciseCardProps) {
    const allSetsCompleted = exercise.sets.every((set) => set.completed);
    
    return (
        <Card className={cn(
            "transition-all",
            !isEnabled && "opacity-60",
            allSetsCompleted && "border-green-200 dark:border-green-800"
        )}>
            <CardHeader 
                className="cursor-pointer"
                onClick={onToggleExpand}
            >
                <div className="flex items-start gap-4">
                    {/* Exercise Photo/Icon Box */}
                    <div className="flex-shrink-0 w-24 h-24 bg-muted rounded-lg flex items-center justify-center border-2 border-border">
                        {getExerciseIcon(exercise.name)}
                    </div>
                    
                    <div className="flex-1 space-y-2">
                        <div className="flex items-start justify-between">
                            <CardTitle className="text-2xl">
                                <Link
                                    to={`/workout/${exercise.name.toLowerCase().replace(/\s+/g, "-")}`}
                                    className="hover:underline"
                                    onClick={(e) => e.stopPropagation()}
                                >
                                    {exercise.name}
                                </Link>
                            </CardTitle>
                            <div className="flex items-center gap-2">
                                {allSetsCompleted && (
                                    <CheckCircle2 className="size-5 text-green-500" />
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </CardHeader>
            
            {isExpanded && (
                <CardContent>
                    <div className="space-y-4">
                        <div className="grid grid-cols-3 gap-4 text-sm font-medium text-muted-foreground pb-2 border-b">
                            <div>Set</div>
                            <div>Reps</div>
                            <div>Weight</div>
                        </div>
                        
                        {exercise.sets.map((set, setIndex) => {
                            const isCompleted = set.completed;
                            const previousSet = setIndex > 0 ? exercise.sets[setIndex - 1] : null;
                            const previousSetCompleted = previousSet ? previousSet.completed : false;
                            
                            // Find the first incomplete set (the active one)
                            const activeSetIndex = exercise.sets.findIndex((s) => !s.completed);
                            const isActiveSet = setIndex === activeSetIndex;
                            const isUpcomingSet = !isCompleted && !isActiveSet;
                            
                            // Show completed set
                            if (isCompleted) {
                                return (
                                    <div key={set.set_id} className="space-y-3">
                                        <div className={cn(
                                            "grid grid-cols-3 gap-4 items-start p-4 rounded-lg border transition-all",
                                            "bg-green-50 dark:bg-green-950/20 border-green-200 dark:border-green-800"
                                        )}>
                                            <div className="font-medium flex items-center gap-2">
                                                <CheckCircle2 className="size-4 text-green-500 flex-shrink-0" />
                                                Set {setIndex + 1}
                                            </div>
                                            <div>
                                                {set.reps}{" "}
                                                {exercise.name === "Plank" || 
                                                 exercise.name.toLowerCase().includes("hold")
                                                    ? "sec"
                                                    : "reps"}
                                            </div>
                                            <div>
                                                {set.weight
                                                    ? `${set.weight} kg`
                                                    : "Bodyweight"}
                                            </div>
                                        </div>
                                        
                                        {set.feedback !== null && set.feedback !== undefined && (
                                            <div className="px-4">
                                                <Badge variant="outline" className="text-xs">
                                                    Difficulty: {set.feedback}/10
                                                </Badge>
                                            </div>
                                        )}
                                        
                                        {set.rest_time && (
                                            <RestTimeIndicator minutes={set.rest_time} />
                                        )}
                                    </div>
                                );
                            }
                            
                            // Show active set (with completion form)
                            if (isActiveSet) {
                                return (
                                    <div key={set.set_id} className="space-y-3">
                                        <div className={cn(
                                            "grid grid-cols-3 gap-4 items-start p-4 rounded-lg border transition-all",
                                            "bg-card border-border hover:border-primary/50"
                                        )}>
                                            <div className="font-medium">
                                                Set {setIndex + 1}
                                            </div>
                                            <div>
                                                {set.reps}{" "}
                                                {exercise.name === "Plank" || 
                                                 exercise.name.toLowerCase().includes("hold")
                                                    ? "sec"
                                                    : "reps"}
                                            </div>
                                            <div>
                                                {set.weight
                                                    ? `${set.weight} kg`
                                                    : "Bodyweight"}
                                            </div>
                                        </div>
                                        
                                        <div className="px-4">
                                            <SetCompletionForm
                                                set={set}
                                                exerciseName={exercise.name}
                                                setIndex={setIndex}
                                                isEnabled={isEnabled}
                                                onComplete={() => onSetComplete(set.set_id)}
                                            />
                                        </div>
                                    </div>
                                );
                            }
                            
                            // Show upcoming sets (preview, disabled)
                            if (isUpcomingSet) {
                                return (
                                    <div key={set.set_id} className="space-y-3">
                                        <div className={cn(
                                            "grid grid-cols-3 gap-4 items-start p-4 rounded-lg border transition-all",
                                            "bg-muted/30 border-muted opacity-50"
                                        )}>
                                            <div className="font-medium flex items-center gap-2">
                                                <Circle className="size-4 text-muted-foreground" />
                                                Set {setIndex + 1}
                                            </div>
                                            <div className="text-muted-foreground">
                                                {set.reps}{" "}
                                                {exercise.name === "Plank" || 
                                                 exercise.name.toLowerCase().includes("hold")
                                                    ? "sec"
                                                    : "reps"}
                                            </div>
                                            <div className="text-muted-foreground">
                                                {set.weight
                                                    ? `${set.weight} kg`
                                                    : "Bodyweight"}
                                            </div>
                                        </div>
                                    </div>
                                );
                            }
                            
                            return null;
                        })}
                    </div>
                </CardContent>
            )}
        </Card>
    );
}

