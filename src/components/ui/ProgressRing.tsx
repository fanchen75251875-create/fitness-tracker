"use client";

import { motion } from "framer-motion";

interface ProgressRingProps {
    progress: number; // 0 to 100
    size?: number;
    strokeWidth?: number;
    color?: string;
    trackColor?: string;
    label?: string;
    value?: string | number;
    unit?: string;
}

export function ProgressRing({
    progress,
    size = 120,
    strokeWidth = 8,
    color = "var(--primary)",
    trackColor = "rgba(255,255,255,0.1)",
    label,
    value,
    unit,
}: ProgressRingProps) {
    const radius = (size - strokeWidth) / 2;
    const circumference = radius * 2 * Math.PI;
    const offset = circumference - (progress / 100) * circumference;

    return (
        <div className="relative flex flex-col items-center justify-center" style={{ width: size, height: size }}>
            <svg width={size} height={size} className="rotate-[-90deg]">
                {/* Track */}
                <circle
                    stroke={trackColor}
                    strokeWidth={strokeWidth}
                    fill="transparent"
                    r={radius}
                    cx={size / 2}
                    cy={size / 2}
                />
                {/* Progress */}
                <motion.circle
                    stroke={color}
                    strokeWidth={strokeWidth}
                    fill="transparent"
                    r={radius}
                    cx={size / 2}
                    cy={size / 2}
                    strokeDasharray={circumference}
                    initial={{ strokeDashoffset: circumference }}
                    animate={{ strokeDashoffset: offset }}
                    transition={{ duration: 1, ease: "easeOut" }}
                    strokeLinecap="round"
                />
            </svg>

            {(label || value) && (
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                    {value && (
                        <span className="text-2xl font-bold tabular-nums leading-none">
                            {value}
                        </span>
                    )}
                    {unit && <span className="text-xs text-zinc-400 mt-0.5">{unit}</span>}
                    {label && <span className="text-xs text-zinc-500 mt-1">{label}</span>}
                </div>
            )}
        </div>
    );
}
