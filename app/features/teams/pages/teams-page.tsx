import { HeroSection } from "~/common/components/hero-section";
import { TeamCard } from "../components/team-card";
import type { Route } from "./+types/teams-page";
import { getTeams } from "../queries";
import { makeSSRClient } from "~/supa-client";

export const meta: Route.MetaFunction = () => [{ title: "Teams | EXIS" }];

export const loader = async ({ request }: Route.LoaderArgs) => {
    const { client } = makeSSRClient(request);
    const teams = await getTeams(client, { limit: 8 });
    return { teams };
};

export default function TeamsPage({ loaderData }: Route.ComponentProps) {
    return (
        <div className="space-y-20">
            <HeroSection
                title="Workout Groups"
                subtitle="Find a workout partner or join a fitness group"
            />
            <div className="grid grid-cols-3 gap-4 px-10">
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
        </div>
    );
}
