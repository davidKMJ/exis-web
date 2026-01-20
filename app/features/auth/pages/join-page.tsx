import InputPair from "~/common/components/input-pair";
import { Form, Link, useNavigation, redirect } from "react-router";
import type { Route } from "./+types/join-page";
import { Button } from "~/common/components/ui/button";
import { LoaderCircle } from "lucide-react";
import AuthButtons from "../components/auth-buttons";
import { makeSSRClient } from "~/supa-client";
import { z } from "zod";
import { checkUsernameExists } from "../queries";

const formSchema = z.object({
    name: z.string().min(3),
    username: z.string().min(3),
    email: z.email(),
    password: z.string().min(8),
});

export const meta: Route.MetaFunction = () => {
    return [
        { title: "Join | EXIS" },
        { name: "description", content: "Create a new account" },
    ];
};

export const action = async ({ request }: Route.ActionArgs) => {
    const formData = await request.formData();
    const { success, error, data } = formSchema.safeParse(
        Object.fromEntries(formData)
    );
    if (!success) {
        return {
            formErrors: error.flatten().fieldErrors,
        };
    }
    const usernameExists = await checkUsernameExists(request, {
        username: data.username,
    });
    if (usernameExists) {
        return {
            formErrors: { username: ["Username already exists"] },
        };
    }
    const { client, headers } = makeSSRClient(request);
    const { error: signUpError } = await client.auth.signUp({
        email: data.email,
        password: data.password,
        options: {
            data: {
                name: data.name,
                username: data.username,
            },
        },
    });
    if (signUpError) {
        return {
            signUpError: signUpError.message,
        };
    }
    return redirect("/", { headers });
};

export default function JoinPage({ actionData }: Route.ComponentProps) {
    const navigation = useNavigation();
    const isSubmitting =
        navigation.state === "submitting" || navigation.state === "loading";
    return (
        <div className="flex flex-col items-center justify-center h-full relative">
            <Button variant="ghost" asChild className="absolute top-4 right-4">
                <Link to="/auth/login">Login</Link>
            </Button>
            <div className="flex flex-col items-center justify-center gap-10 max-w-lg w-full">
                <h1 className="text-4xl font-bold">Create an account</h1>
                <Form className="w-full space-y-4" method="post">
                    <InputPair
                        id="name"
                        label="Name"
                        description="Enter your name"
                        name="name"
                        type="text"
                        placeholder="Enter your name"
                        required
                    />
                    {actionData?.formErrors?.username && (
                        <p className="text-sm text-destructive">
                            {actionData.formErrors.username}
                        </p>
                    )}
                    <InputPair
                        id="username"
                        label="Username"
                        description="Enter your username"
                        name="username"
                        type="text"
                        placeholder="Enter your username"
                        required
                    />
                    {actionData?.formErrors?.username && (
                        <p className="text-sm text-destructive">
                            {actionData.formErrors.username}
                        </p>
                    )}
                    <InputPair
                        id="email"
                        label="Email"
                        description="Enter your email"
                        name="email"
                        type="email"
                        placeholder="Enter your email"
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
                            <LoaderCircle className="w-4 h-4 animate-spin" />
                        ) : (
                            "Create account"
                        )}
                    </Button>
                    {actionData?.signUpError && (
                        <p className="text-sm text-destructive">
                            {actionData.signUpError}
                        </p>
                    )}
                    <AuthButtons />
                </Form>
            </div>
        </div>
    );
}
