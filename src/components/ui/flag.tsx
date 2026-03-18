"use client";

import { cn } from "@/lib/utils";

type FlagType = "success" | "error" | "info";

interface FlagProps {
  message: string;
  type: FlagType;
  visible: boolean;
}

export function Flag({ message, type, visible }: FlagProps) {
  if (!visible) return null;

  const styles = {
    success: "bg-green-500",
    error: "bg-red-500",
    info: "bg-blue-500",
  };

  return (
    <div className="fixed right-6 top-6 z-50 animate-in slide-in-from-right">
      <div
        className={cn(
          "px-5 py-3 rounded-lg shadow-xl text-white font-medium",
          styles[type]
        )}
      >
        {message}
      </div>
    </div>
  );
}