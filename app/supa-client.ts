import { createClient } from "@supabase/supabase-js";
import type { Database as SupabaseDatabase } from "database.types";
import type { MergeDeep, SetFieldType, SetNonNullable } from "type-fest";
import {
    type CookieMethodsServer,
    createBrowserClient,
    createServerClient,
    parseCookieHeader,
    serializeCookieHeader,
} from "@supabase/ssr";

export type Database = MergeDeep<SupabaseDatabase, {
    public: {
        Views: {
            community_post_list_view: {
                Row: SetNonNullable<
                    SetFieldType<
                        SupabaseDatabase["public"]["Views"][
                            "community_post_list_view"
                        ]["Row"],
                        "author_avatar",
                        string | null
                    >
                >;
            };
            community_post_detail: {
                Row: SetNonNullable<
                    SupabaseDatabase["public"]["Views"][
                        "community_post_detail"
                    ]["Row"]
                >;
            };
        };
    };
}>;

export const adminClient = createClient<Database>(
    process.env.SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
);

// export default client;

// export const browserClient = createBrowserClient<Database>(
//     process.env.SUPABASE_URL!,
//     process.env.SUPABASE_ANON_KEY!,
// );

export const makeSSRClient = (request: Request) => {
    const headers = new Headers();
    const cookies: CookieMethodsServer = {
        getAll() {
            const cookies = parseCookieHeader(
                request.headers.get("Cookie") ?? "",
            );
            return cookies.map(({ name, value }) => ({
                name,
                value: value ?? "",
            }));
        },
        setAll(cookiesToSet) {
            cookiesToSet.forEach(({ name, value, options }) => {
                headers.append(
                    "Set-Cookie",
                    serializeCookieHeader(name, value, options),
                );
            });
        },
    };
    const serverSideClient = createServerClient<Database>(
        process.env.SUPABASE_URL!,
        process.env.SUPABASE_ANON_KEY!,
        {
            cookies,
        },
    );
    return {
        client: serverSideClient,
        headers,
    };
};
