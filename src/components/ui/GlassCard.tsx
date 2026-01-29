import { cn } from "@/lib/utils";

interface GlassCardProps extends React.HTMLAttributes<HTMLDivElement> {
    children: React.ReactNode;
}

export function GlassCard({ children, className, ...props }: GlassCardProps) {
    return (
        <div
            className={cn(
                "bg-white/80 backdrop-blur-md rounded-2xl border border-white/50 shadow-xl",
                "dark:bg-black/50 dark:border-white/10",
                className
            )}
            {...props}
        >
            {children}
        </div>
    );
}

export function GlassHeader({ title, subtitle }: { title: string; subtitle?: string }) {
    return (
        <div className="text-center mb-8 space-y-2">
            <h1 className="text-3xl md:text-4xl font-serif font-bold text-primary dark:text-primary-light drop-shadow-sm">
                {title}
            </h1>
            {subtitle && (
                <p className="text-neutral-600 dark:text-neutral-300 font-medium">
                    {subtitle}
                </p>
            )}
        </div>
    );
}
