import { cn } from "@/lib/utils";

interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
    children: React.ReactNode;
}

export function Card({ children, className, ...props }: CardProps) {
    return (
        <div
            className={cn(
                "bg-zinc-900/60 backdrop-blur-xl border border-white/10 rounded-3xl p-6 shadow-xl",
                className
            )}
            {...props}
        >
            {children}
        </div>
    );
}
