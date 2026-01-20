import { HeroSection } from "~/common/components/hero-section";
import type { Route } from "./+types/submit-team-page";
import { Form, redirect } from "react-router";
import { Button } from "~/common/components/ui/button";
import InputPair from "~/common/components/input-pair";
import SelectPair from "~/common/components/select-pair";
import { z } from "zod";
import { WORKOUT_LEVELS } from "../constants";
import { makeSSRClient } from "~/supa-client";
import { getLoggedInUserId } from "~/features/auth/queries";
import { createTeam } from "../mutations";

export const meta: Route.MetaFunction = () => [
    { title: "Create Team | EXIS" },
];

export const loader = async ({ request }: Route.LoaderArgs) => {
    const { client } = makeSSRClient(request);
    await getLoggedInUserId(client);
};

export const formSchema = z.object({
    name: z.string().min(1).max(20),
    stage: z.string(),
    size: z.coerce.number().min(1).max(10),
    location: z.string().min(1).max(100),
    description: z.string().min(1).max(200),
});

export const action = async ({ request }: Route.ActionArgs) => {
    const { client } = makeSSRClient(request);
    const userId = await getLoggedInUserId(client);
    const formData = await request.formData();
    const { success, data, error } = formSchema.safeParse(
        Object.fromEntries(formData)
    );
    if (!success) {
        return { fieldErrors: error.flatten().fieldErrors };
    }
    const { team_id } = await createTeam(client, userId, {
        ...data,
    });
    return redirect(`/teams/${team_id}`);
};

export default function SubmitTeamPage({ actionData }: Route.ComponentProps) {
    return (
        <div className="space-y-20">
            <HeroSection
                title="Create Workout Group"
                subtitle="Create a workout group to find partners."
            />
            <Form
                method="post"
                className="max-w-screen-2xl flex flex-col items-center gap-10 mx-auto px-10"
            >
                <div className="grid grid-cols-3 w-full gap-10">
                    <InputPair
                        label="What is the name of your workout group?"
                        description="(20 characters max)"
                        placeholder="i.e Morning Runners"
                        name="name"
                        maxLength={20}
                        type="text"
                        id="name"
                        required
                    />
                    {actionData?.fieldErrors?.name && (
                        <p className="text-sm text-destructive">
                            {actionData.fieldErrors.name}
                        </p>
                    )}
                    <SelectPair
                        label="What is the workout level?"
                        description="Select the fitness level"
                        name="stage"
                        required
                        placeholder="Select the workout level"
                        options={WORKOUT_LEVELS.map((level) => ({
                            value: level.value,
                            label: level.label,
                        }))}
                    />
                    {actionData?.fieldErrors?.stage && (
                        <p className="text-sm text-destructive">
                            {actionData.fieldErrors.stage}
                        </p>
                    )}
                    <InputPair
                        label="How many members are you looking for?"
                        description="(1-10)"
                        name="size"
                        max={10}
                        min={1}
                        type="number"
                        id="size"
                        required
                    />
                    {actionData?.fieldErrors?.size && (
                        <p className="text-sm text-destructive">
                            {actionData.fieldErrors.size}
                        </p>
                    )}
                    <InputPair
                        label="Where is your workout group located?"
                        description="(e.g., New York, NY or Central Park)"
                        placeholder="i.e. Central Park, New York"
                        name="location"
                        type="text"
                        id="location"
                        maxLength={100}
                        required
                    />
                    {actionData?.fieldErrors?.location && (
                        <p className="text-sm text-destructive">
                            {actionData.fieldErrors.location}
                        </p>
                    )}
                    <InputPair
                        label="Describe your workout group or goals"
                        description="(200 characters max)"
                        placeholder="i.e We're a group of runners training for a marathon. Looking for partners to join our morning runs."
                        name="description"
                        maxLength={200}
                        type="text"
                        id="description"
                        required
                        textArea
                    />
                    {actionData?.fieldErrors?.description && (
                        <p className="text-sm text-destructive">
                            {actionData.fieldErrors.description}
                        </p>
                    )}
                </div>
                <Button type="submit" className="w-full max-w-sm" size="lg">
                    Create workout group
                </Button>
            </Form>
        </div>
    );
}
