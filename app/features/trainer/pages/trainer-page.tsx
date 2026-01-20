import type { Route } from "./+types/trainer-page";
import { makeSSRClient } from "~/supa-client";
import { getLoggedInUserId } from "~/features/auth/queries";
import { getWorkoutProfile } from "~/features/trainer/queries";
import { createWorkoutProfile, updateWorkoutProfile } from "~/features/trainer/mutations";
import { API_URL } from "~/api/constants";
import { useState, useEffect } from "react";
import { Form, useNavigation, useActionData, useLoaderData, useFetcher } from "react-router";
import { Button } from "~/common/components/ui/button";
import { Textarea } from "~/common/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "~/common/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "~/common/components/ui/avatar";
import { ScrollArea } from "~/common/components/ui/scroll-area";
import { Send, Bot, User, LoaderCircle } from "lucide-react";
import { cn } from "~/lib/utils";
import z from "zod";

export const meta: Route.MetaFunction = () => [
    { title: "Trainer | EXIS" },
];

const formSchema = z.object({
    message: z.string().min(1, {
        message: "Message is required",
    }),
});

// Helper function to format workout profile as a string
function formatWorkoutProfile(profile: NonNullable<Awaited<ReturnType<typeof getWorkoutProfile>>>): string {
    const parts: string[] = [];
    
    if (profile.height) parts.push(`Height: ${profile.height} cm`);
    if (profile.weight) parts.push(`Weight: ${profile.weight} kg`);
    if (profile.bench_press_weight) parts.push(`Bench Press: ${profile.bench_press_weight} kg`);
    if (profile.squat_weight) parts.push(`Squat: ${profile.squat_weight} kg`);
    if (profile.deadlift_weight) parts.push(`Deadlift: ${profile.deadlift_weight} kg`);
    if (profile.pushups_count) parts.push(`Push-ups: ${profile.pushups_count}`);
    if (profile.squats_count) parts.push(`Squats: ${profile.squats_count}`);
    if (profile.situps_count) parts.push(`Sit-ups: ${profile.situps_count}`);
    if (profile.exercise_environment) parts.push(`Environment: ${profile.exercise_environment}`);
    if (profile.current_exercise_frequency) parts.push(`Current Frequency: ${profile.current_exercise_frequency} days/week`);
    if (profile.desired_exercise_frequency) parts.push(`Desired Frequency: ${profile.desired_exercise_frequency} days/week`);
    if (profile.exercise_goal) parts.push(`Goal: ${profile.exercise_goal}`);
    if (profile.additional_information) parts.push(`Additional Info: ${profile.additional_information}`);
    
    return parts.join(", ");
}

export const action = async ({ request }: Route.ActionArgs) => {
    const { client } = makeSSRClient(request);
    const userId = await getLoggedInUserId(client);
    
    const formData = await request.formData();
    const userMessage = formData.get("message") as string;
    
    if (!userMessage || !userMessage.trim()) {
        return {
            error: "Message is required",
        };
    }
    
    // Get existing workout profile
    const existingProfile = await getWorkoutProfile(client, { profileId: userId });
    
    // Get existing messages from form data (if any)
    // This should contain the full conversation history
    const existingMessagesJson = formData.get("messages") as string | null;
    let messages: Array<{ role: "user" | "assistant"; content: string }> = [];
    
    if (existingMessagesJson) {
        try {
            messages = JSON.parse(existingMessagesJson);
        } catch {
            // If parsing fails, try to get from loader data or start fresh
            // For now, start fresh - this shouldn't happen in normal flow
            messages = [];
        }
    }
    
    // Add user message
    messages.push({ role: "user", content: userMessage });
    
    // Call consultant API
    const response = await fetch(`${API_URL}api/consultant`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify({
            messages,
        }),
    });
    
    if (!response.ok) {
        return {
            error: "Failed to get response from consultant API",
        };
    }
    
    const data = await response.json();
    
    // Update or create workout profile if one is returned
    if (data.workout_profile) {
        const profileData = data.workout_profile;
        if (existingProfile) {
            await updateWorkoutProfile(client, {
                profileId: userId,
                profile: {
                    height: profileData.height ?? null,
                    weight: profileData.weight ?? null,
                    bench_press_weight: profileData.bench_press_weight ?? null,
                    squat_weight: profileData.squat_weight ?? null,
                    deadlift_weight: profileData.deadlift_weight ?? null,
                    pushups_count: profileData.pushups_count ?? null,
                    squats_count: profileData.squats_count ?? null,
                    situps_count: profileData.situps_count ?? null,
                    exercise_environment: profileData.exercise_environment ?? null,
                    current_exercise_frequency: profileData.current_exercise_frequency ?? null,
                    desired_exercise_frequency: profileData.desired_exercise_frequency ?? null,
                    exercise_goal: profileData.exercise_goal ?? null,
                    additional_information: profileData.additional_information ?? null,
                },
            });
        } else {
            await createWorkoutProfile(client, {
                profileId: userId,
                profile: {
                    height: profileData.height ?? null,
                    weight: profileData.weight ?? null,
                    bench_press_weight: profileData.bench_press_weight ?? null,
                    squat_weight: profileData.squat_weight ?? null,
                    deadlift_weight: profileData.deadlift_weight ?? null,
                    pushups_count: profileData.pushups_count ?? null,
                    squats_count: profileData.squats_count ?? null,
                    situps_count: profileData.situps_count ?? null,
                    exercise_environment: profileData.exercise_environment ?? null,
                    current_exercise_frequency: profileData.current_exercise_frequency ?? null,
                    desired_exercise_frequency: profileData.desired_exercise_frequency ?? null,
                    exercise_goal: profileData.exercise_goal ?? null,
                    additional_information: profileData.additional_information ?? null,
                },
            });
        }
    }
    
    return {
        messages: data.messages,
        appropriate_input: data.appropriate_input,
        end_of_questions: data.end_of_questions,
        workout_profile: data.workout_profile,
    };
};

export const loader = async ({ request }: Route.LoaderArgs) => {
    const { client } = makeSSRClient(request);
    const userId = await getLoggedInUserId(client);
    
    // Check if user has a workout profile
    const workoutProfile = await getWorkoutProfile(client, { profileId: userId });
    
    // Prepare initial message
    let initialUserMessage: string;
    if (workoutProfile) {
        // User has a profile - include it in the message
        const profileInfo = formatWorkoutProfile(workoutProfile);
        initialUserMessage = `${profileInfo} (original workout profile of this user. user doesn't know that this is shared.) (this means that this is not user's first visit. so start with greeting and then ask what they want to update.) Hello!`;
    } else {
        // User doesn't have a profile - just say Hello
        initialUserMessage = "Hello";
    }
    
    return {
        messages: [{ role: "user", content: initialUserMessage }],
        hasProfile: !!workoutProfile,
    };
};

export default function TrainerPage({ loaderData, actionData }: Route.ComponentProps) {
    const navigation = useNavigation();
    const isLoading = navigation.state === "submitting";
    const fetcher = useFetcher();
    
    const [input, setInput] = useState("");
    const [hasTriggeredInitialAction, setHasTriggeredInitialAction] = useState(false);

    // Get the current action data (from either fetcher or form submission)
    const currentActionData = actionData || fetcher.data;

    // Trigger action on initial load
    useEffect(() => {
        if (!currentActionData && !hasTriggeredInitialAction && fetcher.state === "idle") {
            const initialMessage = loaderData.messages[0]?.content || "Hello";
            fetcher.submit(
                {
                    message: initialMessage,
                    messages: JSON.stringify([]),
                },
                {
                    method: "post",
                }
            );
            setHasTriggeredInitialAction(true);
        }
    }, [currentActionData, hasTriggeredInitialAction, fetcher, loaderData.messages]);

    // Clear input after successful submission
    useEffect(() => {
        if (currentActionData && !isLoading && fetcher.state === "idle") {
            setInput("");
        }
    }, [currentActionData, isLoading, fetcher.state]);
    
    // Use actionData messages if available, otherwise use loaderData messages
    const displayMessages = (currentActionData?.messages.slice(1) || loaderData?.messages.slice(1) || []) as Array<{ role: "user" | "assistant"; content: string }>;

    const handleKeyPress = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
        if (e.key === "Enter" && !e.shiftKey) {
            e.preventDefault();
            // Form submission will be handled by the Form component
            const form = e.currentTarget.form;
            if (form) {
                form.requestSubmit();
            }
        }
    };

    return (
        <div className="max-w-4xl mx-auto space-y-6">
            <div className="space-y-2">
                <h1 className="text-4xl font-bold">AI Trainer</h1>
                <p className="text-muted-foreground">
                    Chat with your personal AI fitness trainer to create your workout profile
                </p>
            </div>

            <Card className="h-[600px] flex flex-col">
                <CardHeader className="border-b">
                    <CardTitle className="flex items-center gap-2">
                        <Bot className="size-5" />
                        Consult with your AI Trainer
                    </CardTitle>
                </CardHeader>
                <CardContent className="flex-1 flex flex-col p-6 h-[400px]">
                    <ScrollArea className="mb-4 h-[350px]">
                        <div className="space-y-4 pr-4">
                            {displayMessages.map((message, index) => (
                                <div
                                    key={index}
                                    className={cn(
                                        "flex gap-3",
                                        message.role === "user"
                                            ? "justify-end"
                                            : "justify-start"
                                    )}
                                >
                                    {message.role === "assistant" && (
                                        <Avatar className="size-8 shrink-0">
                                            <AvatarFallback>
                                                <Bot className="size-4" />
                                            </AvatarFallback>
                                        </Avatar>
                                    )}
                                    <div
                                        className={cn(
                                            "rounded-lg px-4 py-2 max-w-[80%]",
                                            message.role === "user"
                                                ? "bg-primary text-primary-foreground"
                                                : "bg-muted"
                                        )}
                                    >
                                        <p className="text-sm whitespace-pre-wrap">
                                            {message.content}
                                        </p>
                                    </div>
                                    {message.role === "user" && (
                                        <Avatar className="size-8 shrink-0">
                                            <AvatarFallback>
                                                <User className="size-4" />
                                            </AvatarFallback>
                                        </Avatar>
                                    )}
                                </div>
                            ))}
                        </div>
                    </ScrollArea>
                    <Form method="post" className="flex gap-2">
                        <input
                            type="hidden"
                            name="messages"
                            value={JSON.stringify(currentActionData?.messages || loaderData?.messages || [])}
                        />
                        <Textarea
                            name="message"
                            value={input}
                            onChange={(e) => setInput(e.target.value)}
                            onKeyPress={handleKeyPress}
                            placeholder="Type your message..."
                            className="resize-none"
                            rows={2}
                        />
                        <Button
                            type="submit"
                            disabled={!input.trim() || isLoading || fetcher.state === "submitting" || fetcher.state === "loading"}
                            size="icon"
                            className="shrink-0"
                        >
                            {(fetcher.state === "submitting" || fetcher.state === "loading" || isLoading)? (
                                <LoaderCircle className="animate-spin" />
                            ) : (
                                <Send className="size-4" />
                            )}
                        </Button>
                    </Form>
                </CardContent>
            </Card>

            <Card>
                <CardHeader>
                    <CardTitle>About the Trainer</CardTitle>
                </CardHeader>
                <CardContent>
                    <p className="text-sm text-muted-foreground">
                        Our AI trainer will ask you questions about your fitness goals, experience level,
                        available equipment, and any health considerations. Based on your answers, we'll
                        create a personalized workout profile and plan that's perfect for you.
                    </p>
                </CardContent>
            </Card>
        </div>
    );
}
