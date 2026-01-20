import type { Database } from "~/supa-client";
import type { SupabaseClient } from "@supabase/supabase-js";

export const getTeams = async (client: SupabaseClient<Database>, { limit }: { limit: number }) => {
    const { data, error } = await client
        .from("teams")
        .select(
            `
        team_id,
        team_name,
        team_size,
        location,
        workout_level,
        team_description,
        team_leader:profiles!inner(
        username,
        avatar
    )
    `,
        )
        .limit(limit);

    if (error) {
        throw error;
    }

    return data;
};

export const getTeamById = async (client: SupabaseClient<Database>, teamId: number) => {
    const { data, error } = await client
        .from("teams")
        .select(
            `
        *,
        team_leader:profiles!inner(
          name,
          avatar,
          role
        )
        `,
        )
        .eq("team_id", teamId)
        .single();
    if (error) throw error;
    return data;
};
