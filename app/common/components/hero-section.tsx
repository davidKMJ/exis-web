interface HeroSectionProps {
    title: string;
    subtitle?: string;
}

export function HeroSection({ title, subtitle }: HeroSectionProps) {
    return (
        <div className="flex flex-col py-20 justify-center items-center rounded-md bg-gradient-to-t from-background to-primary/10">
            <h1 className="text-4xl font-bold mb-4">{title}</h1>
            {subtitle && (
                <p className="text-lg text-muted-foreground mb-8">{subtitle}</p>
            )}
        </div>
    );
}