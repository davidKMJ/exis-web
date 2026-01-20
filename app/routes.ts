import {
    index,
    layout,
    prefix,
    route,
    type RouteConfig,
} from "@react-router/dev/routes";

export default [
    index("common/pages/home-page.tsx"),
    ...prefix("/workout", [
        index("features/workout/pages/workout-page.tsx"),
        route("/:exercise", "features/workout/pages/exercise-page.tsx"),
    ]),
    route("/trainer", "features/trainer/pages/trainer-page.tsx"),
    ...prefix("/auth", [
        layout("features/auth/layouts/auth-layout.tsx", [
            route("/login", "features/auth/pages/login-page.tsx"),
            route("/logout", "features/auth/pages/logout-page.tsx"),
            route("/join", "features/auth/pages/join-page.tsx"),
            ...prefix("/otp", [
                route("/start", "features/auth/pages/otp-start-page.tsx"),
                route("/complete", "features/auth/pages/otp-complete-page.tsx"),
            ]),
            ...prefix("/social/:provider", [
                route("/start", "features/auth/pages/social-start-page.tsx"),
                route(
                    "/complete",
                    "features/auth/pages/social-complete-page.tsx",
                ),
            ]),
        ]),
    ]),
    ...prefix("/community", [
        index("features/community/pages/community-page.tsx"),
        route("/submit", "features/community/pages/submit-post-page.tsx"),
        route("/:postId", "features/community/pages/post-page.tsx"),
        route(
            "/:postId/upvote",
            "features/community/pages/upvote-post-page.tsx",
        ),
    ]),
    ...prefix("/teams", [
        index("features/teams/pages/teams-page.tsx"),
        route("/:teamId", "features/teams/pages/team-page.tsx"),
        route("/create", "features/teams/pages/submit-team-page.tsx"),
    ]),
    ...prefix("/my", [
        layout("features/users/layouts/dashboard-layout.tsx", [
            ...prefix("/dashboard", [
                index("features/users/pages/dashboard-page.tsx"),
            ]),
        ]),
        layout("features/users/layouts/messages-layout.tsx", [
            ...prefix("/messages", [
                index("features/users/pages/messages-page.tsx"),
                route("/:messageId", "features/users/pages/message-page.tsx"),
            ]),
        ]),
        route("/profile", "features/users/pages/my-profile-page.tsx"),
        route("/settings", "features/users/pages/settings-page.tsx"),
        route("/notifications", "features/users/pages/notifications-page.tsx"),
        route(
            "/notifications/:notificationId/see",
            "features/users/pages/see-notification-page.tsx",
        ),
    ]),
    ...prefix("/users/:username", [
        layout("features/users/layouts/profile-layout.tsx", [
            index("features/users/pages/profile-page.tsx"),
            route("/posts", "features/users/pages/profile-posts-page.tsx"),
        ]),
    ]),
] satisfies RouteConfig;
