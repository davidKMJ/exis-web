import { Form, useNavigation, redirect } from "react-router";
import type { Route } from "./+types/otp-start-page";
import { Button } from "~/common/components/ui/button";
import InputPair from "~/common/components/input-pair";
import { makeSSRClient } from "~/supa-client";
import z from "zod";
import { LoaderCircle } from "lucide-react";

export const meta: Route.MetaFunction = () => {
    return [
        { title: "Start OTP | EXIS" },
        { name: "description", content: "Start OTP verification" },
    ];
};
const formSchema = z.object({
    email: z.email(),
});

export const action = async ({ request }: Route.ActionArgs) => {
    const formData = await request.formData();
    const { data, success } = formSchema.safeParse(
        Object.fromEntries(formData)
    );
    if (!success) {
        return { error: "Invalid email address" };
    }
    const { email } = data;

    const { client } = makeSSRClient(request);

    const { error } = await client.auth.signInWithOtp({
        email,
        options: {
            shouldCreateUser: true,
        },
    });

    if (error) {
        return { error: "Failed to send OTP" };
    }

    return redirect(`/auth/otp/complete?email=${email}`);
};

export default function OtpStartPage({ actionData }: Route.ComponentProps) {
    const navigation = useNavigation();
    const isSubmitting =
        navigation.state === "submitting" || navigation.state === "loading";
    return (
        <div className="flex flex-col items-center justify-center h-full relative">
            <div className="flex flex-col items-center justify-center gap-10 max-w-lg w-full">
                <div>
                    <h1 className="text-4xl font-bold text-center">
                        Login with OTP
                    </h1>
                    <p className="text-sm text-muted-foreground text-center">
                        We will send a code to your email to verify your
                        account.
                    </p>
                </div>
                <Form method="post" className="w-full space-y-4">
                    <InputPair
                        id="email"
                        label="Email"
                        description="Enter your email"
                        name="email"
                        type="text"
                        placeholder="Enter your name"
                        required
                    />
                    {actionData && "error" in actionData && (
                        <p className="text-red-500 text-sm">
                            {actionData.error}
                        </p>
                    )}
                    <Button
                        className="w-full"
                        type="submit"
                        disabled={isSubmitting}
                    >
                        {isSubmitting ? (
                            <LoaderCircle className="animate-spin" />
                        ) : (
                            "Send OTP"
                        )}
                    </Button>
                </Form>
            </div>
        </div>
    );
}
