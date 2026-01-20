import { useState } from "react";
import { Label } from "./ui/label";
import {
    Select,
    SelectValue,
    SelectTrigger,
    SelectItem,
    SelectContent,
    SelectGroup,
} from "./ui/select";

export default function SelectPair({
    name,
    required = false,
    label,
    description,
    placeholder,
    options,
    defaultValue,
}: {
    name: string;
    required?: boolean;
    label: string;
    description: string;
    placeholder: string;
    options: { value: string; label: string }[];
    defaultValue?: string;
}) {
    const [open, setOpen] = useState(false);
    return (
        <div className="space-y-2 flex flex-col items-start w-full">
            <Label
                className="flex flex-col items-start"
                onClick={() => setOpen(!open)}
            >
                {label}
                <small className="text-muted-foreground">{description}</small>
            </Label>
            <Select
                open={open}
                onOpenChange={setOpen}
                name={name}
                required={required}
                defaultValue={defaultValue}
            >
                <SelectTrigger className="w-full">
                    <SelectValue placeholder={placeholder} />
                </SelectTrigger>
                <SelectContent>
                    <SelectGroup>
                        {options.map((option) => (
                            <SelectItem key={option.value} value={option.value}>
                                {option.label}
                            </SelectItem>
                        ))}
                    </SelectGroup>
                </SelectContent>
            </Select>
        </div>
    );
}
