import { Link } from "react-router";
import { Button } from "~/common/components/ui/button";
import {
    Card,
    CardFooter,
    CardHeader,
    CardTitle,
} from "~/common/components/ui/card";
import { Badge } from "~/common/components/ui/badge";
import {
    Avatar,
    AvatarImage,
    AvatarFallback,
} from "~/common/components/ui/avatar";

interface TeamCardProps {
    id: number;
    teamName: string;
    leaderUsername: string;
    leaderAvatarUrl: string | null;
    workoutLevel: string;
    teamSize: number;
    location: string;
    description: string;
}

export function TeamCard({
    id,
    teamName,
    leaderUsername,
    leaderAvatarUrl,
    workoutLevel,
    teamSize,
    location,
    description,
}: TeamCardProps) {
    return (
        <Link to={`/teams/${id}`} className="block">
            <Card className="bg-transparent hover:bg-card/50 flex flex-col justify-between transition-colors h-full">
                <CardHeader className="flex flex-col gap-3">
                    <CardTitle className="text-xl font-bold">
                        {teamName}
                    </CardTitle>
                    <div className="flex items-center gap-2">
                        <Badge
                            variant="secondary"
                            className="inline-flex shadow-sm items-center"
                        >
                            <span>@{leaderUsername}</span>
                            <Avatar className="size-4 ml-1">
                                {leaderAvatarUrl && (
                                    <AvatarImage src={leaderAvatarUrl} />
                                )}
                                <AvatarFallback>
                                    {leaderUsername[0]?.toUpperCase()}
                                </AvatarFallback>
                            </Avatar>
                        </Badge>
                        <Badge variant="outline" className="capitalize">
                            {workoutLevel}
                        </Badge>
                        <span className="text-sm text-muted-foreground">
                            {teamSize} members
                        </span>
                    </div>
                    <p className="text-sm text-muted-foreground">{location}</p>
                    <p className="text-sm line-clamp-2">{description}</p>
                </CardHeader>
                <CardFooter className="justify-end">
                    <Button variant="link" asChild>
                        Join group &rarr;
                    </Button>
                </CardFooter>
            </Card>
        </Link>
    );
}
