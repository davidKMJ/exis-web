import { HeroSection } from "~/common/components/hero-section";
import type { Route } from "./+types/community-page";
import { Await, data, Form, Link, useSearchParams } from "react-router";
import { Button } from "~/common/components/ui/button";
import {
    DropdownMenu,
    DropdownMenuCheckboxItem,
    DropdownMenuContent,
    DropdownMenuTrigger,
} from "~/common/components/ui/dropdown-menu";
import { ChevronDownIcon } from "lucide-react";
import { PERIOD_OPTIONS, SORT_OPTIONS } from "../constants";
import { Input } from "~/common/components/ui/input";
import { PostCard } from "../components/post-card";
import { z } from "zod";
import { getPosts, getTopics } from "../queries";
import { Suspense } from "react";
import { makeSSRClient } from "~/supa-client";

export const meta: Route.MetaFunction = () => {
    return [{ title: "Community | EXIS" }];
};

const searchParamsSchema = z.object({
    sorting: z.enum(["newest", "popular"]).optional().default("newest"),
    period: z
        .enum(["all", "today", "week", "month", "year"])
        .optional()
        .default("all"),
    keyword: z.string().optional(),
    topic: z.string().optional(),
});

export const loader = async ({ request }: Route.LoaderArgs) => {
    const { client, headers } = makeSSRClient(request);
    // const topics = await getTopics();
    // const posts = await getPosts();
    // const [topics, posts] = await Promise.all([getTopics(), getPosts()]);
    // const topics = getTopics();
    // const posts = getPosts();
    // return { topics, posts };

    const url = new URL(request.url);
    const { success, data: parsedData } = searchParamsSchema.safeParse(
        Object.fromEntries(url.searchParams)
    );
    if (!success) {
        throw data(
            {
                error_code: "invalid_search_params",
                message: "Invalid search params",
            },
            { status: 400 }
        );
    }

    const topics = await getTopics(client);
    const posts = await getPosts(client, {
            limit: 20,
            sorting: parsedData.sorting,
            period: parsedData.period,
            keyword: parsedData.keyword,
            topic: parsedData.topic,
        });
    return { topics, posts };
};

// export const clientLoader = async ({
//     serverLoader,
// }: Route.ClientLoaderArgs) => {
//     // track analytics
//     // const serverData = await serverLoader();
//     // const [topics, posts] = await Promise.all([getTopics(), getPosts()]);
//     // return { topics, posts };
// };

export default function CommunityPage({ loaderData }: Route.ComponentProps) {
    const [searchParams, setSearchParams] = useSearchParams();
    const sorting = searchParams.get("sorting") || "newest";
    const period = searchParams.get("period") || "all";
    return (
        <div className="space-y-20">
            <HeroSection
                title="Community"
                subtitle="Ask questions, share tips, and connect with other fitness enthusiasts"
            />
            <div className="grid grid-cols-6 items-start gap-40 px-10">
                <div className="col-span-4 space-y-10">
                    <div className="flex justify-between">
                        <div className="space-y-5 w-full">
                            <div className="flex items-center gap-5">
                                <DropdownMenu>
                                    <DropdownMenuTrigger className="flex items-center gap-1">
                                        <span className="text-sm capitalize">
                                            {sorting}
                                        </span>
                                        <ChevronDownIcon className="size-5" />
                                    </DropdownMenuTrigger>
                                    <DropdownMenuContent>
                                        {SORT_OPTIONS.map((option) => (
                                            <DropdownMenuCheckboxItem
                                                className="capitalize cursor-pointer"
                                                key={option}
                                                onCheckedChange={(
                                                    checked: boolean
                                                ) => {
                                                    if (checked) {
                                                        searchParams.set(
                                                            "sorting",
                                                            option
                                                        );
                                                        setSearchParams(
                                                            searchParams
                                                        );
                                                    }
                                                }}
                                            >
                                                {option}
                                            </DropdownMenuCheckboxItem>
                                        ))}
                                    </DropdownMenuContent>
                                </DropdownMenu>
                                {sorting === "popular" && (
                                    <DropdownMenu>
                                        <DropdownMenuTrigger className="flex items-center gap-1">
                                            <span className="text-sm capitalize">
                                                {period}
                                            </span>
                                            <ChevronDownIcon className="size-5" />
                                        </DropdownMenuTrigger>
                                        <DropdownMenuContent>
                                            {PERIOD_OPTIONS.map((option) => (
                                                <DropdownMenuCheckboxItem
                                                    className="capitalize cursor-pointer"
                                                    key={option}
                                                    onCheckedChange={(
                                                        checked: boolean
                                                    ) => {
                                                        if (checked) {
                                                            searchParams.set(
                                                                "period",
                                                                option
                                                            );
                                                            setSearchParams(
                                                                searchParams
                                                            );
                                                        }
                                                    }}
                                                >
                                                    {option}
                                                </DropdownMenuCheckboxItem>
                                            ))}
                                        </DropdownMenuContent>
                                    </DropdownMenu>
                                )}
                            </div>
                            <Form className="w-2/3">
                                <Input
                                    type="text"
                                    name="keyword"
                                    placeholder="Search for posts"
                                />
                            </Form>
                        </div>
                        <Button asChild>
                            <Link to={`/community/submit`}>
                                Create Discussion
                            </Link>
                        </Button>
                    </div>
                    <Suspense fallback={<div>Loading...</div>}>
                        <Await resolve={loaderData.posts}>
                            {(posts) => (
                                <div className="space-y-5">
                                    {posts.map((post) => (
                                        <PostCard
                                            key={post.post_id}
                                            id={post.post_id}
                                            title={post.title}
                                            author={post.author_name}
                                            authorAvatarUrl={post.author_avatar}
                                            category={post.topic_name}
                                            postedAt={post.created_at}
                                            votesCount={post.upvotes}
                                            isUpvoted={post.is_upvoted}
                                            expanded
                                        />
                                    ))}
                                </div>
                            )}
                        </Await>
                    </Suspense>
                </div>
                <aside className="col-span-2 space-y-5">
                    <span className="text-sm font-bold text-muted-foreground uppercase">
                        Topics
                    </span>
                    <Suspense fallback={<div>Loading...</div>}>
                        <Await resolve={loaderData.topics}>
                            {(topics) => (
                                <div className="flex flex-col gap-2 items-start mt-2">
                                    {topics.map((topic) => (
                                        <Button
                                            key={topic.topicId}
                                            variant={"link"}
                                            asChild
                                        >
                                            <Link
                                                to={`/community?topic=${topic.slug}`}
                                                preventScrollReset
                                            >
                                                {topic.name}
                                            </Link>
                                        </Button>
                                    ))}
                                </div>
                            )}
                        </Await>
                    </Suspense>
                </aside>
            </div>
        </div>
    );
}