// import { count, desc, eq } from "drizzle-orm";
// import { posts, postUpvotes, topics } from "./schema";
// import db from "~/db";
// import { profiles } from "../users/schema";

import type { Database } from "~/supa-client";
import type { SupabaseClient } from "@supabase/supabase-js";
import { DateTime } from "luxon";
import { redirect } from "react-router";

// export const getTopics = async () => {
//     const allTopics = await db
//         .select({
//             topicId: topics.topic_id,
//             name: topics.name,
//             slug: topics.slug,
//         })
//         .from(topics);
//     return allTopics;
// };

// export const getPosts = async () => {
//     const allPosts = await db.select({
//         postId: posts.post_id,
//         title: posts.title,
//         content: posts.content,
//         createdAt: posts.created_at,
//         topicName: topics.name,
//         authorName: profiles.name,
//         authorAvatar: profiles.avatar,
//         upvotes: count(postUpvotes.post_id),
//     }).from(posts)
//     .innerJoin(topics, eq(posts.topic_id, topics.topic_id))
//     .innerJoin(profiles, eq(posts.profile_id, profiles.profile_id))
//     .leftJoin(postUpvotes, eq(posts.post_id, postUpvotes.post_id))
//     .groupBy(posts.post_id, topics.topic_id, profiles.profile_id)
//     .orderBy(desc(posts.created_at));

//     return allPosts;
// }

export const getTopics = async (client: SupabaseClient<Database>) => {
    const { data, error } = await client.from("topics").select(
        "topicId: topic_id, name, slug",
    );
    if (error) throw new Error(error.message);
    return data;
};

// export const getPosts = async () => {
//     const { data, error } = await client.from("posts").select(`
//         postId: post_id,
//         title,
//         content,
//         createdAt: created_at,
//         topics!inner (
//             name,
//             slug
//         ),
//         author: profiles!posts_profile_id_profiles_profile_id_fk!inner (
//             name,
//             avatar
//         ),
//         upvotes: post_upvotes (
//             count
//         )
//     `);
//     if (error) throw new Error(error.message);
//     return data;
// };

export const getPosts = async (client: SupabaseClient<Database>, {
    limit,
    sorting,
    period = "all",
    keyword,
    topic,
}: {
    limit: number | undefined;
    sorting: "newest" | "popular";
    period?: "all" | "today" | "week" | "month" | "year";
    keyword?: string;
    topic?: string;
}) => {
    const baseQuery = client.from("community_post_list_view")
        .select(`*`)
    if (limit) {
        baseQuery.limit(limit);
    }
    if (sorting === "newest") {
        baseQuery.order("created_at", { ascending: false });
    } else if (sorting === "popular") {
        if (period === "all") {
            baseQuery.order("upvotes", { ascending: false });
        } else {
            const today = DateTime.now();
            if (period === "today") {
                baseQuery.gte("created_at", today.startOf("day").toISO());
            } else if (period === "week") {
                baseQuery.gte("created_at", today.startOf("week").toISO());
            } else if (period === "month") {
                baseQuery.gte("created_at", today.startOf("month").toISO());
            } else if (period === "year") {
                baseQuery.gte("created_at", today.startOf("year").toISO());
            }
            baseQuery.order("upvotes", { ascending: false });
        }
    }

    if (keyword) {
        baseQuery.ilike("title", `%${keyword}%`);
    }

    if (topic) {
        baseQuery.eq("topic_slug", topic);
    }

    const { data, error } = await baseQuery;
    if (error) throw new Error(error.message);
    return data;
};

export const getPostById = async (
    client: SupabaseClient<Database>,
    postId: number,
) => {
    const { data, error } = await client
        .from("community_post_detail")
        .select("*")
        .eq("post_id", postId)
        .single();
    if (error) throw error;
    return data;
};

export const getReplies = async (
    client: SupabaseClient<Database>,
    postId: number,
) => {
    const replyQuery = `
      post_reply_id,
      content,
      created_at,
      user:profiles (
        name,
        avatar,
        username
      )
    `;
    const { data, error } = await client
        .from("post_replies")
        .select(
            `
        ${replyQuery},
        post_replies (
          ${replyQuery}
        )
        `,
        )
        .eq("post_id", postId)
        .order("created_at", { ascending: false });
    if (error) throw error;
    return data;
};
