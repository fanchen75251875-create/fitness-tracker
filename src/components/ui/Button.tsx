import React from 'react';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
    variant?: 'primary' | 'secondary' | 'outline' | 'ghost';
    size?: 'sm' | 'md' | 'lg';
    fullWidth?: boolean;
}

export const Button: React.FC<ButtonProps> = ({
    children,
    variant = 'primary',
    size = 'md',
    fullWidth = false,
    className = '',
    ...props
}) => {
    const baseStyles = "inline-flex items-center justify-center rounded-full font-bold tracking-wide transition-all active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed";

    const variants = {
        primary: "bg-[var(--primary)] text-white hover:brightness-110 shadow-[0_0_15px_rgba(250,17,79,0.4)]",
        secondary: "bg-[var(--secondary)] text-black hover:brightness-110 shadow-[0_0_15px_rgba(164,255,0,0.3)]",
        outline: "border-2 border-[var(--foreground-muted)] text-[var(--foreground)] hover:border-[var(--foreground)] hover:bg-[var(--surface-highlight)]",
        ghost: "text-[var(--foreground-muted)] hover:text-[var(--foreground)] hover:bg-[var(--surface-highlight)]",
    };

    const sizes = {
        sm: "text-xs px-4 py-2",
        md: "text-sm px-6 py-3",
        lg: "text-base px-8 py-4",
    };

    const width = fullWidth ? "w-full" : "";

    return (
        <button
            className={`${baseStyles} ${variants[variant]} ${sizes[size]} ${width} ${className}`}
            {...props}
        >
            {children}
        </button>
    );
};
