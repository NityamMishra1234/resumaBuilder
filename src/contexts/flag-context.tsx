"use client";

import { createContext, useContext, useState } from "react";
import { Flag } from "@/components/ui/flag";

type FlagType = "success" | "error" | "info";

interface FlagState {
  message: string;
  type: FlagType;
  visible: boolean;
}

interface FlagContextType {
  showFlag: (message: string, type: FlagType) => void;
}

const FlagContext = createContext<FlagContextType | null>(null);

export function FlagProvider({ children }: { children: React.ReactNode }) {
  const [flag, setFlag] = useState<FlagState>({
    message: "",
    type: "info",
    visible: false,
  });

  const showFlag = (message: string, type: FlagType) => {
    setFlag({ message, type, visible: true });

    setTimeout(() => {
      setFlag((prev) => ({ ...prev, visible: false }));
    }, 3500);
  };

  return (
    <FlagContext.Provider value={{ showFlag }}>
      {children}

      <Flag
        message={flag.message}
        type={flag.type}
        visible={flag.visible}
      />
    </FlagContext.Provider>
  );
}

export function useFlag() {
  const context = useContext(FlagContext);

  if (!context) {
    throw new Error("useFlag must be used inside FlagProvider");
  }

  return context;
}