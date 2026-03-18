"use client";

import { useRef } from "react";
import { Input } from "@/components/ui/input";

interface OtpInputProps {
    length?: number;
    value: string[];
    onChange: (value: string[]) => void;
}

export function OtpInput({ length = 6, value, onChange }: OtpInputProps) {
    const inputs = useRef<(HTMLInputElement | null)[]>([]);

    const handleChange = (index: number, digit: string) => {
        if (!/^[0-9]?$/.test(digit)) return;

        const newOtp = [...value];
        newOtp[index] = digit;

        onChange(newOtp);

        if (digit && index < length - 1) {
            inputs.current[index + 1]?.focus();
        }
    };

    const handleKeyDown = (index: number, e: React.KeyboardEvent) => {
        if (e.key === "Backspace" && !value[index] && index > 0) {
            inputs.current[index - 1]?.focus();
        }
    };

    return (
        <div className="flex justify-center gap-2 sm:gap-3">
            {Array.from({ length }).map((_, i) => (
                <Input
                    key={i}
                    ref={(el) => {
                        inputs.current[i] = el;
                    }}
                    value={value[i] || ""}
                    onChange={(e) => handleChange(i, e.target.value)}
                    onKeyDown={(e) => handleKeyDown(i, e)}
                    maxLength={1}
                    className="h-12 w-12 text-center text-lg font-semibold border-gray-900 border"
                />
            ))}
        </div>
    );
}