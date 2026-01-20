import type { Route } from "./+types/exercise-page";
import { makeSSRClient } from "~/supa-client";
import { Card, CardContent, CardHeader, CardTitle } from "~/common/components/ui/card";
import { Badge } from "~/common/components/ui/badge";
import { EXERCISE_CATEGORIES } from "../constants";

export const meta: Route.MetaFunction = ({ params }: Route.MetaArgs) => [
    { title: `${params.exercise} | EXIS` },
];

// Example exercise data - in real app, this would come from database
const getExerciseInfo = (exerciseName: string) => {
    const name = exerciseName
        .split("-")
        .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
        .join(" ");

    // Find category
    let category = "Full Body";
    for (const [cat, exercises] of Object.entries(EXERCISE_CATEGORIES)) {
        if (exercises.includes(name as never)) {
            category = cat;
            break;
        }
    }

    // Example data for different exercises
    const exerciseData: Record<string, any> = {
        "Push-up": {
            instructions: [
                "Start in a plank position with hands slightly wider than shoulder-width",
                "Lower your body until your chest nearly touches the floor",
                "Push back up to the starting position",
                "Keep your core tight and body in a straight line throughout",
            ],
            explanation:
                "Push-ups are a fundamental upper body exercise that targets the chest, shoulders, triceps, and core. They're excellent for building functional strength and can be modified for different fitness levels.",
            benefits: [
                "Builds upper body strength",
                "Improves core stability",
                "Enhances shoulder mobility",
                "No equipment needed",
            ],
            muscles: ["Chest", "Shoulders", "Triceps", "Core"],
        },
        Squat: {
            instructions: [
                "Stand with feet shoulder-width apart",
                "Lower your body by bending knees and pushing hips back",
                "Go down until thighs are parallel to the floor",
                "Push through heels to return to starting position",
            ],
            explanation:
                "Squats are the king of lower body exercises, targeting the quadriceps, glutes, and hamstrings. They're essential for building leg strength and improving functional movement patterns.",
            benefits: [
                "Builds leg strength",
                "Improves hip mobility",
                "Enhances balance and coordination",
                "Burns calories effectively",
            ],
            muscles: ["Quadriceps", "Glutes", "Hamstrings", "Core"],
        },
        Plank: {
            instructions: [
                "Start in push-up position, but rest on forearms",
                "Keep body in a straight line from head to heels",
                "Engage your core and hold the position",
                "Breathe normally throughout",
            ],
            explanation:
                "Planks are an isometric core exercise that strengthens the entire core, improves posture, and enhances stability. They're low-impact and can be held for varying durations.",
            benefits: [
                "Strengthens entire core",
                "Improves posture",
                "Enhances stability",
                "Low impact exercise",
            ],
            muscles: ["Core", "Shoulders", "Back"],
        },
    };

    return (
        exerciseData[name] || {
            instructions: [
                "Follow proper form for this exercise",
                "Focus on controlled movements",
                "Breathe properly throughout",
                "Listen to your body",
            ],
            explanation:
                "This exercise is great for building strength and improving fitness. Make sure to maintain proper form throughout the movement.",
            benefits: [
                "Builds strength",
                "Improves fitness",
                "Enhances mobility",
            ],
            muscles: ["Multiple muscle groups"],
        }
    );
};

export const loader = async ({ request, params }: Route.LoaderArgs) => {
    const { client } = makeSSRClient(request);
    // TODO: Load exercise details from database
    const exerciseName = params.exercise
        .split("-")
        .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
        .join(" ");

    return { exercise: exerciseName };
};

export default function ExercisePage({ loaderData }: Route.ComponentProps) {
    const exerciseInfo = getExerciseInfo(loaderData.exercise);
    const category = Object.entries(EXERCISE_CATEGORIES).find(([_, exercises]) =>
        exercises.includes(loaderData.exercise as never)
    )?.[0] || "Full Body";

    return (
        <div className="max-w-4xl mx-auto space-y-8">
            <div className="space-y-4">
                <div className="flex items-center gap-3">
                    <h1 className="text-4xl font-bold">{loaderData.exercise}</h1>
                    <Badge variant="secondary">{category}</Badge>
                </div>
            </div>

            {/* 3D Model Placeholder */}
            <Card>
                <CardContent className="p-0">
                    <div className="h-96 bg-muted rounded-lg flex items-center justify-center">
                        <p className="text-muted-foreground text-lg">
                            3D Model Placeholder
                        </p>
                        <p className="text-muted-foreground text-sm ml-2">
                            (Interactive 3D model will be displayed here)
                        </p>
                    </div>
                </CardContent>
            </Card>

            {/* Instructions */}
            <Card>
                <CardHeader>
                    <CardTitle>How to Perform</CardTitle>
                </CardHeader>
                <CardContent>
                    <ol className="space-y-3 list-decimal list-inside">
                        {exerciseInfo.instructions.map((instruction: string, index: number) => (
                            <li key={index} className="text-muted-foreground">
                                {instruction}
                            </li>
                        ))}
                    </ol>
                </CardContent>
            </Card>

            {/* Explanation */}
            <Card>
                <CardHeader>
                    <CardTitle>About This Exercise</CardTitle>
                </CardHeader>
                <CardContent>
                    <p className="text-muted-foreground leading-relaxed">
                        {exerciseInfo.explanation}
                    </p>
                </CardContent>
            </Card>

            {/* Benefits and Muscles */}
            <div className="grid grid-cols-2 gap-6">
                <Card>
                    <CardHeader>
                        <CardTitle>Benefits</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <ul className="space-y-2">
                            {exerciseInfo.benefits.map((benefit: string, index: number) => (
                                <li
                                    key={index}
                                    className="text-muted-foreground flex items-start gap-2"
                                >
                                    <span className="text-primary">•</span>
                                    <span>{benefit}</span>
                                </li>
                            ))}
                        </ul>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle>Target Muscles</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="flex flex-wrap gap-2">
                            {exerciseInfo.muscles.map((muscle: string, index: number) => (
                                <Badge key={index} variant="outline">
                                    {muscle}
                                </Badge>
                            ))}
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
