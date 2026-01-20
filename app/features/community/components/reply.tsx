import { Form, Link, useActionData, useOutletContext } from "react-router";
import { DotIcon, MessageCircleIcon } from "lucide-react";
import { Button } from "~/common/components/ui/button";
import {
    Avatar,
    AvatarFallback,
    AvatarImage,
} from "~/common/components/ui/avatar";
import { useEffect, useState } from "react";
import { Textarea } from "~/common/components/ui/textarea";
import { DateTime } from "luxon";

interface ReplyProps {
    name: string;
    username: string;
    avatarUrl: string | null;
    content: string;
    timestamp: string;
    topLevel: boolean;
    replies?: {
        post_reply_id: number;
        content: string;
        created_at: string;
        user: {
            name: string;
            avatar: string | null;
            username: string;
        } | null;
    }[];
    topLevelId: number;
}

export function Reply({
    name,
    username,
    avatarUrl,
    content,
    timestamp,
    topLevel,
    topLevelId,
    replies,
}: ReplyProps) {
    const actionData = useActionData();
    const [replying, setReplying] = useState(false);
    const toggleReplying = () => setReplying((prev) => !prev);
    const {
        isLoggedIn,
        name: loggedInName,
        avatar,
    } = useOutletContext<{
        isLoggedIn: boolean;
        name?: string;
        username?: string;
        avatar?: string;
    }>();
    useEffect(() => {
        if (actionData?.ok) {
            setReplying(false);
        }
    }, [actionData?.ok]);
    return (
        <div className="flex flex-col gap-2 w-full">
            <div className="flex items-start gap-5 w-2/3">
                <Avatar className="size-14">
                    <AvatarFallback>{name[0]}</AvatarFallback>
                    {avatarUrl ? <AvatarImage src={avatarUrl} /> : null}
                </Avatar>
                <div className="flex flex-col gap-2 items-start w-full">
                    <div className="flex gap-2 items-center">
                        <Link to={`/users/${username}`}>
                            <h4 className="font-medium">{name}</h4>
                        </Link>
                        <DotIcon className="size-5" />
                        <span className="text-xs text-muted-foreground">
                            {DateTime.fromISO(timestamp).toRelative()}
                        </span>
                    </div>
                    <p className="text-muted-foreground">{content}</p>
                    {isLoggedIn ? (
                        <Button
                            variant="ghost"
                            className="self-end"
                            onClick={toggleReplying}
                        >
                            <MessageCircleIcon className="size-4" />
                            Reply
                        </Button>
                    ) : null}
                </div>
            </div>
            {replying && (
                <Form className="flex items-start gap-5 w-3/4" method="post">
                    <input type="hidden" name="topLevelId" value={topLevelId} />
                    <Avatar className="size-14">
                        <AvatarFallback>{loggedInName?.[0]}</AvatarFallback>
                        <AvatarImage src={avatar} />
                    </Avatar>
                    <div className="flex flex-col gap-5 items-end w-full">
                        <Textarea
                            autoFocus
                            name="reply"
                            placeholder="Write a reply"
                            className="w-full resize-none"
                            rows={5}
                            defaultValue={`@${username} `}
                        />
                        <Button>Reply</Button>
                    </div>
                </Form>
            )}
            {topLevel && replies && (
                <div className="pl-20 w-full">
                    {replies.map((reply) => (
                        <Reply
                            name={reply.user?.name || ""}
                            username={reply.user?.name || ""}
                            avatarUrl={reply.user?.avatar ?? null}
                            content={reply.content}
                            timestamp={reply.created_at}
                            topLevel={false}
                            topLevelId={topLevelId}
                        />
                    ))}
                </div>
            )}
        </div>
    );
}
