import { PostCard } from "~/features/community/components/post-card";
import type { Route } from "./+types/profile-posts-page";
import { z } from "zod";
import { data } from "react-router";
import { getUserPosts } from "../queries";
import { makeSSRClient } from "~/supa-client";

export const meta: Route.MetaFunction = () => {
    return [{ title: "Posts | EXIS" }];
};

export const loader = async ({ params, request }: Route.LoaderArgs) => {
    const { client } = makeSSRClient(request);
    const posts = await getUserPosts(client, params.username);
    return { posts };
};

export default function ProfilePostsPage({ loaderData }: Route.ComponentProps) {
    return (
        <div className="flex flex-col gap-5">
            {loaderData.posts.map((post) => (
                <PostCard
                    id={post.post_id}
                    title={post.title}
                    author={post.author_name}
                    authorAvatarUrl={post.author_avatar}
                    category={post.topic_name}
                    postedAt={post.created_at}
                    expanded
                />
            ))}
        </div>
    );
}
