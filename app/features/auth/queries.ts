import type { SupabaseClient } from "@supabase/supabase-js";
import { redirect } from "react-router";
import { makeSSRClient } from "~/supa-client";
import type { Database } from "~/supa-client";

export const checkUsernameExists = async (
    request: Request,
    { username }: { username: string },
) => {
    const { client } = makeSSRClient(request);
    const { error } = await client
        .from("profiles")
        .select("profile_id")
        .eq("username", username)
        .single();
    if (error) {
        return false;
    }
    return true;
};

export const getLoggedInUserId = async (client: SupabaseClient<Database>) => {
    const { data, error } = await client.auth.getUser();
    if (error || data.user === null) {
        throw redirect("/auth/login");
    }
    return data.user.id;
};
