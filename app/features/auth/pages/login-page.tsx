import InputPair from "~/common/components/input-pair";
import { Link, redirect, useNavigation, Form } from "react-router";
import type { Route } from "./+types/login-page";
import { Button } from "~/common/components/ui/button";
import { LoaderCircle } from "lucide-react";
import AuthButtons from "../components/auth-buttons";
import { makeSSRClient } from "~/supa-client";
import { z } from "zod";

export const meta: Route.MetaFunction = () => {
    return [
        { title: "Login | EXIS" },
        { name: "description", content: "Login to your account" },
    ];
};

const formSchema = z.object({
    email: z.email({
        error: (iss) =>
            iss.input === undefined ? "Field is required." : "Invalid email.",
    }),
    password: z
        .string({
            error: (iss) =>
                iss.input === undefined
                    ? "Field is required."
                    : "Invalid password.",
        })
        .min(8, {
            message: "Password must be at least 8 characters",
        }),
});

export const action = async ({ request }: Route.ActionArgs) => {
    const formData = await request.formData();
    const { success, data, error } = formSchema.safeParse(
        Object.fromEntries(formData)
    );
    if (!success) {
        return {
            loginError: null,
            formErrors: error.flatten().fieldErrors,
        };
    }
    const { email, password } = data;
    const { client, headers } = makeSSRClient(request);
    const { error: loginError } = await client.auth.signInWithPassword({
        email,
        password,
    });
    if (loginError) {
        return {
            formErrors: null,
            loginError: loginError.message,
        };
    }
    return redirect("/", { headers });
};

export default function LoginPage({ actionData }: Route.ComponentProps) {
    const navigation = useNavigation();
    const isSubmitting =
        navigation.state === "submitting" || navigation.state === "loading";
    return (
        <div className="flex flex-col items-center justify-center h-full relative">
            <Button variant="ghost" asChild className="absolute top-4 right-4">
                <Link to="/auth/join">Join</Link>
            </Button>
            <div className="flex flex-col items-center justify-center gap-10 max-w-lg w-full">
                <h1 className="text-4xl font-bold">Login to your account</h1>
                <Form className="w-full space-y-4" method="post">
                    <InputPair
                        id="email"
                        label="Email"
                        description="Enter your email"
                        name="email"
                        type="text"
                        placeholder="Enter your name"
                        required
                    />
                    {actionData?.formErrors?.email && (
                        <p className="text-sm text-destructive">
                            {actionData.formErrors.email}
                        </p>
                    )}
                    <InputPair
                        label="Password"
                        description="Enter your password"
                        name="password"
                        type="password"
                        placeholder="Enter your password"
                        required
                    />
                    {actionData?.formErrors?.password && (
                        <p className="text-sm text-destructive">
                            {actionData.formErrors.password}
                        </p>
                    )}
                    <Button
                        type="submit"
                        className="w-full"
                        disabled={isSubmitting}
                    >
                        {isSubmitting ? (
                            <LoaderCircle className="animate-spin" />
                        ) : (
                            "Login"
                        )}
                    </Button>
                    {actionData?.loginError && (
                        <p className="text-sm text-destructive">
                            {actionData.loginError}
                        </p>
                    )}
                    <AuthButtons />
                </Form>
            </div>
        </div>
    );
}
