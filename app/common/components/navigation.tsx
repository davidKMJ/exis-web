import { Link } from "react-router";
import { Separator } from "./ui/separator";
import {
    NavigationMenu,
    NavigationMenuContent,
    NavigationMenuItem,
    NavigationMenuList,
    NavigationMenuTrigger,
    navigationMenuTriggerStyle,
} from "./ui/navigation-menu";
import { cn } from "~/lib/utils";
import { Button } from "./ui/button";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuGroup,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "./ui/dropdown-menu";
import {
    BellIcon,
    LogOutIcon,
    MessageCircleIcon,
    SettingsIcon,
    UserIcon,
    BarChart3Icon,
} from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";

const menus = [
    {
        name: "Workout",
        to: "/workout",
    },
    {
        name: "Trainer",
        to: "/trainer",
    },
    {
        name: "Community",
        to: "/community",
        items: [
            {
                name: "Discussions",
                description: "Discuss with other users in your community",
                to: "/community",
            },
            {
                name: "All Posts",
                description: "See all posts in your community",
                to: "/community",
            },
            {
                name: "Top Posts",
                description: "See the top posts in your community",
                to: "/community?sorting=popular",
            },
            {
                name: "New Posts",
                description: "See the new posts in your community",
                to: "/community?sorting=newest",
            },
            {
                name: "Create a Post",
                description: "Create a post in your community",
                to: "/community/submit",
            },
        ],
    },
    {
        name: "Teams",
        to: "/teams",
        items: [
            {
                name: "All Teams",
                description: "See all teams in your community",
                to: "/teams",
            },
            {
                name: "Create a Team",
                description: "Create a team in your community",
                to: "/teams/create",
            },
        ],
    },
];

export default function Navigation({
    isLoggedIn,
    hasNotifications,
    hasMessages,
    username,
    avatar,
    name,
}: {
    isLoggedIn: boolean;
    hasNotifications: boolean;
    hasMessages: boolean;
    username?: string;
    avatar?: string | null;
    name?: string;
}) {
    return (
        <nav className="flex px-20 h-16 items-center justify-between backdrop-blur fixed top-0 left-0 right-0 z-50 bg-background/50">
            <div className="flex items-center">
                <Link to="/" className="font-bold tracking-tighter text-lg">
                    EXIS
                </Link>
                <Separator orientation="vertical" className="h-6 mx-4" />
                <NavigationMenu>
                    <NavigationMenuList>
                        {menus.map((menu) => (
                            <NavigationMenuItem key={menu.name}>
                                {menu.items ? (
                                    <>
                                        <Link to={menu.to} prefetch="viewport">
                                            <NavigationMenuTrigger>
                                                {menu.name}
                                            </NavigationMenuTrigger>
                                        </Link>
                                        <NavigationMenuContent>
                                            <ul className="grid w-[500px] font-light gap-3 p-4 grid-cols-2">
                                                {menu.items?.map((item) => (
                                                    <NavigationMenuItem
                                                        key={item.name}
                                                        className={cn(
                                                            "select-none rounded-md transition-colors focus:bg-accent hover:bg-accent",
                                                            item.to ===
                                                                "/community/submit" &&
                                                                "col-span-2 bg-primary/10 hover:bg-primary/20 focus:bg-primary/20",
                                                        )}
                                                    >
                                                        <Link
                                                            to={item.to}
                                                            className="p-3 space-y-1 block leading-none no-underline outline-none"
                                                        >
                                                            <span className="text-sm font-medium leading-none">
                                                                {item.name}
                                                            </span>
                                                            <p className="text-sm leading-snug text-muted-foreground">
                                                                {
                                                                    item.description
                                                                }
                                                            </p>
                                                        </Link>
                                                    </NavigationMenuItem>
                                                ))}
                                            </ul>
                                        </NavigationMenuContent>
                                    </>
                                ) : (
                                    <Link
                                        to={menu.to}
                                        className={navigationMenuTriggerStyle()}
                                    >
                                        {menu.name}
                                    </Link>
                                )}
                            </NavigationMenuItem>
                        ))}
                    </NavigationMenuList>
                </NavigationMenu>
            </div>
            {isLoggedIn ? (
                <div className="flex items-center gap-2">
                    <Button
                        size="icon"
                        variant="ghost"
                        className="relative"
                    >
                        <BellIcon className="size-4" />
                        {hasNotifications && (
                            <div className="absolute top-1.5 right-1.5 size-1.5 bg-red-500 rounded-full" />
                        )}
                    </Button>
                    <Button
                        size="icon"
                        variant="ghost"
                        className="relative"
                    >
                        <MessageCircleIcon className="size-4" />
                        {hasMessages && (
                            <div className="absolute top-1.5 right-1.5 size-1.5 bg-red-500 rounded-full" />
                        )}
                    </Button>
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Avatar>
                                <AvatarImage src={avatar ?? undefined} className="object-cover" />
                                <AvatarFallback>{name?.charAt(0)}</AvatarFallback>
                            </Avatar>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent className="w-56">
                            <DropdownMenuLabel className="flex flex-col">
                                <span className="font-medium">{name}</span>
                                <span className="text-xs text-muted-foreground">
                                    @{username}
                                </span>
                            </DropdownMenuLabel>
                            <DropdownMenuSeparator />
                            <DropdownMenuGroup>
                                <DropdownMenuItem
                                    className="cursor-pointer"
                                    disabled
                                >
                                    <BarChart3Icon className="size-4 mr-2" />
                                    Dashboard
                                </DropdownMenuItem>
                                <DropdownMenuItem
                                    asChild
                                    className="cursor-pointer"
                                >
                                    <Link to="/my/profile">
                                        <UserIcon className="size-4 mr-2" />
                                        Profile
                                    </Link>
                                </DropdownMenuItem>
                                <DropdownMenuItem
                                    asChild
                                    className="cursor-pointer"
                                >
                                    <Link to="/my/settings">
                                        <SettingsIcon className="size-4 mr-2" />
                                        Settings
                                    </Link>
                                </DropdownMenuItem>
                            </DropdownMenuGroup>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem
                                asChild
                                className="cursor-pointer"
                            >
                                <Link to="/auth/logout">
                                    <LogOutIcon className="size-4 mr-2" />
                                    Logout
                                </Link>
                            </DropdownMenuItem>
                        </DropdownMenuContent>
                    </DropdownMenu>
                </div>
            ) : (
                <div className="flex items-center gap-4">
                    <Link to="/auth/login">
                        <Button variant="secondary">Login</Button>
                    </Link>
                    <Link to="/auth/join">
                        <Button>Sign Up</Button>
                    </Link>
                </div>
            )}
        </nav>
    );
}
