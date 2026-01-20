import {
    Breadcrumb,
    BreadcrumbItem,
    BreadcrumbLink,
    BreadcrumbList,
    BreadcrumbSeparator,
} from "~/common/components/ui/breadcrumb";
import { Form, useOutletContext, useFetcher, Link } from "react-router";
import { ChevronUpIcon, DotIcon } from "lucide-react";
import { Button } from "~/common/components/ui/button";
import { Textarea } from "~/common/components/ui/textarea";
import {
    Avatar,
    AvatarFallback,
    AvatarImage,
} from "~/common/components/ui/avatar";
import { Badge } from "~/common/components/ui/badge";
import { Reply } from "~/features/community/components/reply";
import { getPostById, getReplies } from "../queries";
import { DateTime } from "luxon";
import { makeSSRClient } from "~/supa-client";
import { z } from "zod";
import { createReply } from "../mutations";
import { getLoggedInUserId } from "~/features/auth/queries";
import { useEffect, useRef } from "react";
import { cn } from "~/lib/utils";
import type { Route } from "./+types/post-page";

export const meta = ({ data }: Route.MetaArgs) => {
    return [
        { title: `${data.post.title} on ${data.post.topic_name} | EXIS` },
    ];
};

const formSchema = z.object({
    reply: z.string().min(1),
    topLevelId: z.coerce.number().optional(),
});

export const action = async ({ request, params }: Route.ActionArgs) => {
    const { client } = makeSSRClient(request);
    const userId = await getLoggedInUserId(client);
    const formData = await request.formData();
    const { success, error, data } = formSchema.safeParse(
        Object.fromEntries(formData)
    );
    if (!success) {
        return {
            formErrors: error.flatten().fieldErrors,
        };
    }
    const { reply, topLevelId } = data;
    await createReply(client, {
        postId: Number(params.postId),
        reply,
        userId,
        topLevelId,
    });
    return {
        ok: true,
    };
};

export const loader = async ({ params, request }: Route.LoaderArgs) => {
    const { client, headers } = makeSSRClient(request);
    const post = await getPostById(client, Number(params.postId));
    const replies = await getReplies(client, Number(params.postId));
    return { post, replies };
};

export default function PostPage({
    loaderData,
    actionData,
}: Route.ComponentProps) {
    const fetcher = useFetcher();
    const { isLoggedIn, name, username, avatar } = useOutletContext<{
        isLoggedIn: boolean;
        name?: string;
        username?: string;
        avatar?: string;
    }>();
    const formRef = useRef<HTMLFormElement>(null);
    useEffect(() => {
        if (actionData?.ok) {
            formRef.current?.reset();
        }
    }, [actionData?.ok]);
    return (
        <div className="space-y-10">
            <Breadcrumb>
                <BreadcrumbList>
                    <BreadcrumbItem>
                        <BreadcrumbLink asChild>
                            <Link to="/community">Community</Link>
                        </BreadcrumbLink>
                    </BreadcrumbItem>
                    <BreadcrumbSeparator />
                    <BreadcrumbItem>
                        <BreadcrumbLink asChild>
                            <Link
                                to={`/community?topic=${loaderData.post.topic_slug}`}
                            >
                                {loaderData.post.topic_name}
                            </Link>
                        </BreadcrumbLink>
                    </BreadcrumbItem>
                    <BreadcrumbSeparator />
                    <BreadcrumbItem>
                        <BreadcrumbLink asChild>
                            <Link to={`/community/${loaderData.post.post_id}`}>
                                {loaderData.post.title}
                            </Link>
                        </BreadcrumbLink>
                    </BreadcrumbItem>
                </BreadcrumbList>
            </Breadcrumb>
            <div className="grid gap-40 items-start">
                <div className="space-y-10">
                    <div className="flex w-full items-start gap-10">
                        <fetcher.Form
                            action={`/community/${loaderData.post.post_id}/upvote`}
                            method="post"
                        >
                            <Button
                                variant="outline"
                                className={cn(
                                    "flex flex-col h-14",
                                    loaderData.post.is_upvoted
                                        ? "border-primary text-primary"
                                        : ""
                                )}
                            >
                                <ChevronUpIcon className="size-4 shrink-0" />
                                <span>{loaderData.post.upvotes}</span>
                            </Button>
                        </fetcher.Form>
                        <div className="space-y-20 w-full">
                            <div className="space-y-2">
                                <h2 className="text-3xl font-bold">
                                    {loaderData.post.title}
                                </h2>
                                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                    <span>{loaderData.post.author_name}</span>
                                    <DotIcon className="size-5" />
                                    <span>
                                        {DateTime.fromISO(
                                            loaderData.post.created_at,
                                            {
                                                zone: "local",
                                            }
                                        ).toRelative({ unit: "hours" })}
                                    </span>
                                    <DotIcon className="size-5" />
                                    <span>
                                        {loaderData.post.replies} replies
                                    </span>
                                </div>
                                <p className="text-muted-foreground w-3/4">
                                    {loaderData.post.content}
                                </p>
                            </div>
                            {isLoggedIn ? (
                                <Form
                                    className="flex items-start gap-5 w-3/4"
                                    method="post"
                                    ref={formRef}
                                >
                                    <Avatar className="size-14">
                                        <AvatarFallback>
                                            {name?.[0]}
                                        </AvatarFallback>
                                        <AvatarImage src={avatar} />
                                    </Avatar>
                                    <div className="flex flex-col gap-5 items-end w-full">
                                        <Textarea
                                            name="reply"
                                            placeholder="Write a reply"
                                            className="w-full resize-none"
                                            rows={5}
                                        />
                                        <Button>Reply</Button>
                                    </div>
                                </Form>
                            ) : null}

                            <div className="space-y-10">
                                <h4 className="font-semibold">
                                    {loaderData.post.replies} Replies
                                </h4>
                                <div className="flex flex-col gap-5">
                                    {loaderData.replies.map((reply) => (
                                        <Reply
                                            key={reply.post_reply_id}
                                            name={reply.user?.name || ""}
                                            username={reply.user?.name || ""}
                                            avatarUrl={
                                                reply.user?.avatar || null
                                            }
                                            content={reply.content}
                                            timestamp={reply.created_at}
                                            topLevel={true}
                                            topLevelId={reply.post_reply_id}
                                            replies={reply.post_replies}
                                        />
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}