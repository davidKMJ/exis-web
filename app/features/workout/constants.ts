// Exercise names based on OpenAPI spec
export const EXERCISE_NAMES = [
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
] as const;

export type ExerciseName = (typeof EXERCISE_NAMES)[number];

// Exercise categories
export const EXERCISE_CATEGORIES = {
    "Upper Body": [
        "Push-up",
        "Bench Press",
        "Pull-up",
        "Overhead Press",
        "Dips",
        "Bicep Curl",
        "Tricep Extension",
        "Side Lateral Raise",
        "Shoulder Press",
        "Shrug",
        "Arm Curl",
    ],
    "Lower Body": [
        "Squat",
        "Deadlift",
        "Lunge",
        "Hip Thrust",
        "Leg Extension",
        "Leg Curl",
        "Calf Raise",
    ],
    "Core": [
        "Plank",
        "Mountain Climber",
        "Hanging Leg Raise",
        "Sit-up",
    ],
    "Full Body": [
        "Burpee",
        "Kettlebell Swing",
        "Row",
    ],
} as const;

