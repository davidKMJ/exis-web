import { Link, type MetaFunction } from "react-router";
import type { Route } from "./+types/home-page";
import { PostCard } from "~/features/community/components/post-card";
import { Button } from "../components/ui/button";
import { TeamCard } from "~/features/teams/components/team-card";
import { DateTime } from "luxon";
import { getPosts } from "~/features/community/queries"
import { getTeams } from "~/features/teams/queries";
import { makeSSRClient } from "~/supa-client";
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";
import { Badge } from "../components/ui/badge";
import { ShineBorder } from "../components/ui/shine-border";
import { Dumbbell, Bot, MessageSquare, Users, ArrowRight, CheckCircle2, Circle, Timer, Trophy } from "lucide-react";
import { cn } from "~/lib/utils";

export const meta: MetaFunction = () => {
    return [
        { title: "Home | EXIS" },
        { name: "description", content: "Welcome to EXIS - Your AI-powered fitness companion" },
    ];
};

export const loader = async ({ request }: Route.LoaderArgs) => {
    const { client, headers } = makeSSRClient(request);
    const posts = await getPosts(client, {
        limit: 3,
        sorting: "newest",
    });
    const teams = await getTeams(client, { limit: 3 });
    return { posts, teams };
};

// Fake workout preview data
const fakeWorkoutExercises = [
    { name: "Bench Press", sets: 4, reps: 8, completed: true },
    { name: "Squats", sets: 4, reps: 10, completed: true },
    { name: "Deadlifts", sets: 3, reps: 6, completed: false },
];

export default function HomePage({ loaderData }: Route.ComponentProps) {
    return (
        <div className="space-y-32 pb-20">
            {/* Hero Section */}
            <div className="flex flex-col items-center justify-center text-center space-y-6 py-20">
                <h1 className="text-6xl md:text-7xl font-bold tracking-tight bg-gradient-to-br from-foreground to-foreground/60 bg-clip-text text-transparent">
                    Transform Your Fitness Journey
                </h1>
                <p className="text-xl md:text-2xl text-muted-foreground max-w-2xl">
                    AI-powered workouts, personalized training, and a supportive community all in one place
                </p>
                <div className="flex gap-4 pt-4">
                    <Button size="lg" asChild>
                        <Link to="/workout">Start Workout</Link>
                    </Button>
                    <Button size="lg" variant="outline" asChild>
                        <Link to="/trainer">Meet Your Trainer</Link>
                    </Button>
                </div>
            </div>

            {/* Workout Preview Section */}
            <section className="space-y-8">
                <div className="flex items-center justify-between">
                    <div className="space-y-2">
                        <div className="flex items-center gap-3">
                            <Dumbbell className="size-8 text-primary" />
                            <h2 className="text-4xl font-bold">Today's Workout</h2>
                        </div>
                        <p className="text-lg text-muted-foreground">
                            Your personalized workout plan, updated daily
                        </p>
                    </div>
                    <Button variant="link" asChild className="text-lg">
                        <Link to="/workout" prefetch="intent">
                            View Full Workout <ArrowRight className="ml-2 size-4" />
                        </Link>
                    </Button>
                </div>
                
                <Card className="relative overflow-hidden border-2">
                    <CardHeader>
                        <div className="flex items-center justify-between">
                            <CardTitle className="text-2xl">Workout Plan</CardTitle>
                            <Badge variant="secondary" className="text-sm">
                                2 / 3 exercises completed
                            </Badge>
                        </div>
                        <div className="w-full bg-muted rounded-full h-2 mt-4">
                            <div className="bg-primary h-2 rounded-full transition-all" style={{ width: "67%" }} />
                        </div>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        {fakeWorkoutExercises.map((exercise, idx) => (
                            <div
                                key={idx}
                                className={cn(
                                    "flex items-center gap-4 p-4 rounded-lg border transition-all",
                                    exercise.completed
                                        ? "bg-green-50 dark:bg-green-950/20 border-green-200 dark:border-green-800"
                                        : "bg-card border-border"
                                )}
                            >
                                <div className="flex-1">
                                    <div className="flex items-center gap-2 mb-2">
                                        {exercise.completed ? (
                                            <CheckCircle2 className="size-5 text-green-600 dark:text-green-400" />
                                        ) : (
                                            <Circle className="size-5 text-muted-foreground" />
                                        )}
                                        <h3 className="font-semibold text-lg">{exercise.name}</h3>
                                    </div>
                                    <div className="flex items-center gap-4 text-sm text-muted-foreground ml-7">
                                        <span className="flex items-center gap-1">
                                            <Dumbbell className="size-4" />
                                            {exercise.sets} sets × {exercise.reps} reps
                                        </span>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </CardContent>
                </Card>
            </section>

            {/* Trainer Preview Section with Shine Border */}
            <section className="space-y-8">
                <div className="flex items-center justify-between">
                    <div className="space-y-2">
                        <div className="flex items-center gap-3">
                            <Bot className="size-8 text-primary" />
                            <h2 className="text-4xl font-bold">AI Trainer</h2>
                        </div>
                        <p className="text-lg text-muted-foreground">
                            Get personalized fitness guidance from your AI trainer
                        </p>
                    </div>
                    <Button variant="link" asChild className="text-lg">
                        <Link to="/trainer" prefetch="intent">
                            Chat with Trainer <ArrowRight className="ml-2 size-4" />
                        </Link>
                    </Button>
                </div>

                <div className="relative rounded-xl">
                    <Card className="relative bg-gradient-to-br from-card to-card/50 backdrop-blur-sm overflow-hidden">
                        <ShineBorder
                            className="rounded-xl"
                            borderWidth={2}
                            duration={14}
                            shineColor={["#3b82f6", "#8b5cf6", "#ec4899", "#3b82f6"]}
                        />
                        <CardHeader className="relative z-10">
                            <div className="flex items-center gap-3">
                                <div className="size-10 rounded-full bg-primary/10 flex items-center justify-center">
                                    <Bot className="size-5 text-primary" />
                                </div>
                                <div>
                                    <CardTitle>AI Trainer Assistant</CardTitle>
                                    <p className="text-sm text-muted-foreground">Online • Ready to help</p>
                                </div>
                            </div>
                        </CardHeader>
                        <CardContent className="space-y-4 relative z-10">
                            <div className="space-y-3">
                                <div className="flex gap-3">
                                    <div className="size-8 rounded-full bg-muted flex items-center justify-center shrink-0">
                                        <Bot className="size-4" />
                                    </div>
                                    <div className="bg-muted rounded-lg px-4 py-2 max-w-[80%]">
                                        <p className="text-sm">
                                            Hi! I'm your AI fitness trainer. I'll help you create a personalized workout plan based on your goals, experience, and available equipment.
                                        </p>
                                    </div>
                                </div>
                                <div className="flex gap-3 justify-end">
                                    <div className="bg-primary text-primary-foreground rounded-lg px-4 py-2 max-w-[80%]">
                                        <p className="text-sm">
                                            I want to build muscle and have access to a gym
                                        </p>
                                    </div>
                                    <div className="size-8 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                                        <span className="text-xs font-semibold">U</span>
                                    </div>
                                </div>
                            </div>
                            <div className="pt-4 border-t">
                                <Button variant="outline" className="w-full" asChild>
                                    <Link to="/trainer">Continue Conversation</Link>
                                </Button>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </section>

            {/* Community Preview Section */}
            <section className="space-y-8">
                <div className="flex items-center justify-between">
                    <div className="space-y-2">
                        <div className="flex items-center gap-3">
                            <MessageSquare className="size-8 text-primary" />
                            <h2 className="text-4xl font-bold">Community</h2>
                        </div>
                        <p className="text-lg text-muted-foreground">
                            Join discussions, share tips, and connect with fitness enthusiasts
                        </p>
                    </div>
                    <Button variant="link" asChild className="text-lg">
                        <Link to="/community" prefetch="intent">
                            View All Posts <ArrowRight className="ml-2 size-4" />
                        </Link>
                    </Button>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {loaderData.posts.map((post) => (
                        <PostCard
                            key={post.post_id}
                            id={post.post_id}
                            title={post.title}
                            author={post.author_name}
                            authorAvatarUrl={post.author_avatar}
                            category={post.topic_name}
                            postedAt={post.created_at}
                            votesCount={post.upvotes}
                        />
                    ))}
                </div>
            </section>

            {/* Teams Preview Section */}
            <section className="space-y-8">
                <div className="flex items-center justify-between">
                    <div className="space-y-2">
                        <div className="flex items-center gap-3">
                            <Users className="size-8 text-primary" />
                            <h2 className="text-4xl font-bold">Workout Teams</h2>
                        </div>
                        <p className="text-lg text-muted-foreground">
                            Find workout partners and join fitness groups
                        </p>
                    </div>
                    <Button variant="link" asChild className="text-lg">
                        <Link to="/teams" prefetch="intent">
                            Explore All Teams <ArrowRight className="ml-2 size-4" />
                        </Link>
                    </Button>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {loaderData.teams.map((team) => (
                        <TeamCard
                            key={team.team_id}
                            id={team.team_id}
                            teamName={team.team_name}
                            leaderUsername={team.team_leader.username}
                            leaderAvatarUrl={team.team_leader.avatar}
                            workoutLevel={team.workout_level}
                            teamSize={team.team_size}
                            location={team.location}
                            description={team.team_description}
                        />
                    ))}
                </div>
            </section>
        </div>
    );
}
