import { Form, redirect } from "react-router";
import InputPair from "~/common/components/input-pair";
import type { Route } from "./+types/submit-post-page";
import { HeroSection } from "~/common/components/hero-section";
import SelectPair from "~/common/components/select-pair";
import { Button } from "~/common/components/ui/button";
import { z } from "zod";
import { makeSSRClient } from "~/supa-client";
import { getLoggedInUserId } from "~/features/auth/queries";
import { getTopics } from "../queries";
import { createPost } from "../mutations";

export const meta: Route.MetaFunction = () => {
    return [
        { title: "Submit Post | EXIS" },
        { name: "description", content: "Create a new post" },
    ];
};

export const loader = async ({ request }: Route.LoaderArgs) => {
    const { client } = makeSSRClient(request);
    await getLoggedInUserId(client);
    const topics = await getTopics(client);
    return { topics };
};

const formSchema = z.object({
    title: z.string().min(1).max(40),
    category: z.string().min(1).max(100),
    content: z.string().min(1).max(1000),
});

export const action = async ({ request }: Route.ActionArgs) => {
    const { client } = makeSSRClient(request);
    const userId = await getLoggedInUserId(client);
    const formData = await request.formData();
    const { success, error, data } = formSchema.safeParse(
        Object.fromEntries(formData)
    );
    if (!success) {
        return {
            fieldErrors: error.flatten().fieldErrors,
        };
    }
    const { title, category, content } = data;
    const { post_id } = await createPost(client, {
        title,
        category,
        content,
        userId,
    });
    return redirect(`/community/${post_id}`);
};

export default function SubmitPostPage({
    loaderData,
    actionData,
}: Route.ComponentProps) {
    return (
        <div className="space-y-10">
            <HeroSection
                title="Submit Post"
                subtitle="Share your fitness journey, ask questions, or help others"
            />
            <Form
                method="post"
                className="flex flex-col gap-7 max-w-screen-lg mx-auto px-10"
            >
                <InputPair
                    label="Title"
                    name="title"
                    id="title"
                    description="(40 characters or less)"
                    placeholder="Enter a title"
                    required
                />
                {actionData?.fieldErrors?.title && (
                    <p className="text-sm text-destructive">
                        {actionData.fieldErrors.title}
                    </p>
                )}
                <SelectPair
                    required
                    name="category"
                    label="Category"
                    description="Choose a category"
                    placeholder="Select a category"
                    options={loaderData.topics.map((topic) => ({
                        label: topic.name,
                        value: topic.slug,
                    }))}
                />
                {actionData?.fieldErrors?.category && (
                    <p className="text-sm text-destructive">
                        {actionData.fieldErrors.category}
                    </p>
                )}
                <InputPair
                    label="Content"
                    name="content"
                    id="content"
                    description="(1000 characters or less)"
                    maxLength={1000}
                    placeholder="Enter your content"
                    textArea
                    required
                />
                {actionData?.fieldErrors?.content && (
                    <p className="text-sm text-destructive">
                        {actionData.fieldErrors.content}
                    </p>
                )}
                <div className="flex justify-center">
                    <Button type="submit" className="w-1/2">
                        Create Discussion
                    </Button>
                </div>
            </Form>
        </div>
    );
}
