import React from 'react';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
    label?: string;
    error?: string;
}

export const Input: React.FC<InputProps> = ({ label, error, className = '', ...props }) => {
    return (
        <div className="flex flex-col gap-2 w-full">
            {label && (
                <label className="text-xs font-semibold uppercase tracking-wider text-[var(--foreground-muted)] ml-1">
                    {label}
                </label>
            )}
            <input
                className={`
          w-full px-5 py-3.5 rounded-2xl border-none bg-[var(--surface-highlight)] 
          text-[var(--foreground)] placeholder-[var(--foreground-muted)]
          focus:outline-none focus:ring-2 focus:ring-[var(--primary)]
          transition-all
          ${error ? 'ring-2 ring-red-500' : ''}
          ${className}
        `}
                {...props}
            />
            {error && <span className="text-xs text-red-500 ml-1">{error}</span>}
        </div>
    );
};
