import { Link, useFetcher } from "react-router";
import {
    Card,
    CardFooter,
    CardHeader,
    CardTitle,
} from "~/common/components/ui/card";
import {
    Avatar,
    AvatarImage,
    AvatarFallback,
} from "~/common/components/ui/avatar";
import { Button } from "~/common/components/ui/button";
import { ChevronUpIcon, DotIcon } from "lucide-react";
import { cn } from "~/lib/utils";
import { DateTime } from "luxon";

interface PostCardProps {
    id: number;
    title: string;
    author: string;
    authorAvatarUrl: string | null;
    category: string;
    postedAt: string;
    expanded?: boolean;
    votesCount?: number;
    isUpvoted?: boolean;
}

export function PostCard({
    id,
    title,
    author,
    authorAvatarUrl,
    category,
    postedAt,
    expanded = false,
    votesCount = 0,
    isUpvoted = false,
}: PostCardProps) {
    const fetcher = useFetcher();
    const absorbClick = (e: React.MouseEvent<HTMLButtonElement>) => {
        e.preventDefault();
        fetcher.submit(null, {
            method: "POST",
            action: `/community/${id}/upvote`,
        });
    };
    const optimisitcVotesCount =
        fetcher.state === "idle"
            ? votesCount
            : isUpvoted
              ? votesCount - 1
              : votesCount + 1;
    const optimisitcIsUpvoted =
        fetcher.state === "idle" ? isUpvoted : !isUpvoted;
    return (
        <Link to={`/community/${id}`} className="block">
            <Card
                className={cn(
                    "bg-transparent hover:bg-card/50 transition-colors",
                    expanded ? "flex flex-row items-center justify-between" : ""
                )}
            >
                <CardHeader className="flex flex-row items-center gap-2 w-full">
                    <Avatar className="size-14">
                        <AvatarFallback>{author[0]}</AvatarFallback>
                        {authorAvatarUrl && (
                            <AvatarImage src={authorAvatarUrl} />
                        )}
                    </Avatar>
                    <div className="space-y-2 w-full">
                        <CardTitle>{title}</CardTitle>
                        <div className="flex gap-2 text-sm leading-tight text-muted-foreground w-full">
                            <span>
                                {author} on {category}
                            </span>
                            <DotIcon className="w-4 h-4" />
                            <span>
                                {DateTime.fromISO(postedAt).toRelative()}
                            </span>
                        </div>
                    </div>
                </CardHeader>
                {!expanded && (
                    <CardFooter className="flex justify-end">
                        <Button variant="link">Reply &rarr;</Button>
                    </CardFooter>
                )}
                {expanded && (
                    <CardFooter className="flex justify-end  pb-0">
                        <Button
                            variant="outline"
                            className={cn(
                                "flex flex-col h-14",
                                optimisitcIsUpvoted
                                    ? "border-primary text-primary"
                                    : ""
                            )}
                            onClick={absorbClick}
                        >
                            <ChevronUpIcon className="size-4 shrink-0" />
                            <span>{optimisitcVotesCount}</span>
                        </Button>
                    </CardFooter>
                )}
            </Card>
        </Link>
    );
}
