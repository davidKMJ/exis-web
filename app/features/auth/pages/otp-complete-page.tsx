import { Form, redirect, useNavigation, useSearchParams } from "react-router";
import type { Route } from "./+types/otp-complete-page";
import { Button } from "~/common/components/ui/button";
import InputPair from "~/common/components/input-pair";
import z from "zod";
import { makeSSRClient } from "~/supa-client";
import { LoaderCircle } from "lucide-react";

export const meta: Route.MetaFunction = () => {
    return [
        { title: "Complete OTP | EXIS" },
        { name: "description", content: "Complete OTP verification" },
    ];
};

const formSchema = z.object({
    email: z.email(),
    otp: z.string().min(6).max(6),
});

export const action = async ({ request }: Route.ActionArgs) => {
    const formData = await request.formData();
    const { data, success, error } = formSchema.safeParse(
        Object.fromEntries(formData)
    );
    if (!success) {
        return { fieldErrors: error.flatten().fieldErrors };
    }
    const { email, otp } = data;
    const { client, headers } = makeSSRClient(request);

    const { error: verifyError } = await client.auth.verifyOtp({
        email,
        token: otp,
        type: "email",
    });
    if (verifyError) {
        return { verifyError: verifyError.message };
    }
    return redirect("/", { headers });
};

export default function OtpPage({ actionData }: Route.ComponentProps) {
    const [searchParams] = useSearchParams();
    const email = searchParams.get("email");
    const navigation = useNavigation();
    const isSubmitting =
        navigation.state === "submitting" || navigation.state === "loading";
    return (
        <div className="flex flex-col items-center justify-center h-full relative">
            <div className="flex flex-col items-center justify-center gap-10 max-w-lg w-full">
                <div>
                    <h1 className="text-4xl font-bold text-center">
                        Confirm OTP
                    </h1>
                    <p className="text-sm text-muted-foreground text-center">
                        Enter the OTP code sent to your email to verify your
                        account.
                    </p>
                </div>
                <Form className="w-full space-y-4" method="post">
                    <InputPair
                        id="email"
                        label="Email"
                        description="Enter your email"
                        name="email"
                        type="text"
                        placeholder="Enter your name"
                        defaultValue={email ?? ""}
                        required
                    />
                    {actionData?.fieldErrors?.email && (
                        <p className="text-sm text-destructive">
                            {actionData.fieldErrors.email}
                        </p>
                    )}
                    <InputPair
                        id="otp"
                        label="OTP"
                        description="Enter the OTP code"
                        name="otp"
                        type="text"
                        placeholder="Enter your OTP"
                        required
                    />
                    {actionData?.fieldErrors?.otp && (
                        <p className="text-sm text-destructive">
                            {actionData.fieldErrors.otp}
                        </p>
                    )}
                    {actionData?.verifyError && (
                        <p className="text-sm text-destructive">
                            {actionData.verifyError}
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
                            "Verify OTP"
                        )}
                    </Button>
                </Form>
            </div>
        </div>
    );
}
