import { HomeIcon, PackageIcon, RocketIcon, SparklesIcon } from "lucide-react";
import { Link, Outlet, useLocation } from "react-router";
import {
    Sidebar,
    SidebarContent,
    SidebarGroup,
    SidebarGroupLabel,
    SidebarMenu,
    SidebarMenuButton,
    SidebarMenuItem,
    SidebarProvider,
} from "~/common/components/ui/sidebar";
import { makeSSRClient } from "~/supa-client";
import { getLoggedInUserId } from "~/features/auth/queries";
import type { Route } from "./+types/dashboard-layout";

export const loader = async ({ request }: Route.LoaderArgs) => {
    const { client } = makeSSRClient(request);
    const userId = await getLoggedInUserId(client);
    return {
        userId,
    };
};

export default function DashboardLayout({ loaderData }: Route.ComponentProps) {
    const location = useLocation();
    return (
        <SidebarProvider className="flex min-h-full">
            <Sidebar className="pt-16" variant="floating">
                <SidebarContent>
                    <SidebarGroup>
                        <SidebarMenu>
                            <SidebarMenuItem>
                                <SidebarMenuButton
                                    asChild
                                    isActive={
                                        location.pathname === "/my/dashboard"
                                    }
                                >
                                    <Link to="/my/dashboard">
                                        <HomeIcon className="size-4" />
                                        <span>Home</span>
                                    </Link>
                                </SidebarMenuButton>
                            </SidebarMenuItem>
                            <SidebarMenuItem>
                                <SidebarMenuButton
                                    asChild
                                    isActive={
                                        location.pathname ===
                                        "/my/dashboard/ideas"
                                    }
                                >
                                    <Link to="/my/dashboard/ideas">
                                        <SparklesIcon className="size-4" />
                                        <span>Ideas</span>
                                    </Link>
                                </SidebarMenuButton>
                            </SidebarMenuItem>
                        </SidebarMenu>
                    </SidebarGroup>
                    <SidebarGroup>
                        <SidebarGroupLabel>Product Analytics</SidebarGroupLabel>
                        <SidebarMenu>
                        </SidebarMenu>
                    </SidebarGroup>
                </SidebarContent>
            </Sidebar>
            <div className="w-full h-full">
                <Outlet />
            </div>
        </SidebarProvider>
    );
}
