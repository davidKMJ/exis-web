import { HeroSection } from "~/common/components/hero-section";
import type { Route } from "./+types/team-page";
import { Button } from "~/common/components/ui/button";
import {
    Avatar,
    AvatarFallback,
    AvatarImage,
} from "~/common/components/ui/avatar";
import { Badge } from "~/common/components/ui/badge";
import { Form } from "react-router";
import InputPair from "~/common/components/input-pair";
import {
    Card,
    CardContent,
    CardHeader,
    CardTitle,
} from "~/common/components/ui/card";
import { getTeamById } from "../queries";
import { makeSSRClient } from "~/supa-client";

export const meta: Route.MetaFunction = () => [
    { title: "Team Details | EXIS" },
];

export const loader = async ({ params, request }: Route.LoaderArgs) => {
    const { client } = makeSSRClient(request);
    const team = await getTeamById(client, Number(params.teamId));
    return { team };
};

export default function TeamPage({ loaderData }: Route.ComponentProps) {
    return (
        <div className="space-y-20">
            <HeroSection title={`Join ${loaderData.team.team_leader.name}'s workout group`} />
            <div className="grid grid-cols-6 gap-40 items-start">
                <div className="col-span-4 grid grid-cols-4 gap-5">
                    {[
                        {
                            title: "Group name",
                            value: loaderData.team.team_name,
                        },
                        {
                            title: "Workout level",
                            value: loaderData.team.workout_level,
                        },
                        {
                            title: "Group size",
                            value: `${loaderData.team.team_size} members`,
                        },
                        {
                            title: "Location",
                            value: loaderData.team.location,
                        },
                    ].map((item) => (
                        <Card key={item.title}>
                            <CardHeader>
                                <CardTitle className="text-sm font-medium text-muted-foreground">
                                    {item.title}
                                </CardTitle>
                                <CardContent className="p-0 capitalize font-bold text-2xl">
                                    <p>{item.value}</p>
                                </CardContent>
                            </CardHeader>
                        </Card>
                    ))}
                    <Card className="col-span-4">
                        <CardHeader>
                            <CardTitle className="text-sm font-medium text-muted-foreground">
                                Group description
                            </CardTitle>
                            <CardContent className="p-0 font-medium text-xl">
                                <p>{loaderData.team.team_description}</p>
                            </CardContent>
                        </CardHeader>
                    </Card>
                </div>
                <aside className="col-span-2 space-y-5 border rounded-lg p-6 shadow-sm">
                    <div className="flex gap-5">
                        <Avatar className="size-14">
                            <AvatarFallback>
                                {loaderData.team.team_leader.name[0]}
                            </AvatarFallback>
                            {loaderData.team.team_leader.avatar ? (
                                <AvatarImage
                                    src={loaderData.team.team_leader.avatar}
                                />
                            ) : null}
                        </Avatar>
                        <div className="flex flex-col">
                            <h4 className="text-lg font-medium">
                                {loaderData.team.team_leader.name}
                            </h4>
                            <Badge variant="secondary" className="capitalize">
                                {loaderData.team.team_leader.role}
                            </Badge>
                        </div>
                    </div>
                    <Form className="space-y-5">
                        <InputPair
                            label="Introduce yourself"
                            description="Tell us about your fitness goals"
                            name="introduction"
                            type="text"
                            id="introduction"
                            required
                            textArea
                            placeholder="i.e. I'm looking for a workout partner to train for a marathon. I run 3 times a week."
                        />
                        <Button type="submit" className="w-full">
                            Join group
                        </Button>
                    </Form>
                </aside>
            </div>
        </div>
    );
}
