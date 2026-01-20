import { SupabaseClient } from "@supabase/supabase-js";
import { z } from "zod";
import type { Database } from "~/supa-client";
import { formSchema } from "./pages/submit-team-page";

export const createTeam = async (
    client: SupabaseClient<Database>,
    userId: string,
    team: z.infer<typeof formSchema>,
) => {
    const { data, error } = await client
        .from("teams")
        .insert({
            team_leader_id: userId,
            team_name: team.name,
            team_size: team.size,
            location: team.location,
            workout_level: team.stage as
                | "beginner"
                | "intermediate"
                | "advanced"
                | "expert",
            team_description: team.description,
        })
        .select("team_id")
        .single();
    if (error) {
        throw error;
    }
    return data;
};
