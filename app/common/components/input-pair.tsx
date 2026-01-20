import type { InputHTMLAttributes, TextareaHTMLAttributes } from "react";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Textarea } from "./ui/textarea";

export default function InputPair({
    label,
    description,
    textArea = false,
    ...rest
}: {
    label: string;
    description: string;
    textArea?: boolean;
} & InputHTMLAttributes<HTMLInputElement> &
    TextareaHTMLAttributes<HTMLTextAreaElement>) {
    return (
        <div className="flex flex-col space-y-2 items-start">
            <Label
                htmlFor={rest.id}
                className="flex flex-col items-start gap-1"
            >
                {label}
                <small className="text-muted-foreground">{description}</small>
            </Label>
            {textArea ? (
                <Textarea rows={8} className="resize-none" {...rest} />
            ) : (
                <Input {...rest} />
            )}
        </div>
    );
}
