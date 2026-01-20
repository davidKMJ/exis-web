import type { Database } from "~/supa-client";
import type { SupabaseClient } from "@supabase/supabase-js";

export const getUserProfile = async (
    client: SupabaseClient<Database>,
    username: string,
) => {
    const { data, error } = await client
        .from("profiles")
        .select(
            `
        profile_id,
        name,
        username,
        avatar,
        role,
        headline,
        bio
        `,
        )
        .eq("username", username)
        .single();
    if (error) {
        throw error;
    }
    return data;
};

export const getUserPosts = async (
    client: SupabaseClient<Database>,
    username: string,
) => {
    const { data, error } = await client
        .from("community_post_detail")
        .select("*")
        .eq("author_username", username);
    if (error) {
        throw error;
    }
    return data;
};

export const getUserById = async (
    client: SupabaseClient<Database>,
    { id }: { id: string },
) => {
    const { data, error } = await client
        .from("profiles")
        .select(
            `
          profile_id,
          name,
          username,
          avatar,
          headline,
          bio,
          role
          `,
        )
        .eq("profile_id", id)
        .single();
    if (error) {
        throw error;
    }
    return data;
};

export const getNotifications = async (
    client: SupabaseClient<Database>,
    { userId }: { userId: string },
) => {
    const { data, error } = await client
        .from("notifications")
        .select(
            `
        notification_id,
        type,
        source:profiles!source_id(
          profile_id,
          name,
          avatar
        ),
        post:posts!post_id(
          post_id,
          title
        ),
        seen,
        created_at
        `,
        )
        .eq("target_id", userId)
        .order("created_at", { ascending: false });
    if (error) {
        throw error;
    }
    return data;
};

export const countNotifications = async (
    client: SupabaseClient<Database>,
    { userId }: { userId: string },
) => {
    const { count, error } = await client
        .from("notifications")
        .select("*", { count: "exact", head: true })
        .eq("seen", false)
        .eq("target_id", userId);
    if (error) {
        throw error;
    }
    return count ?? 0;
};
