"use client";

import { useMantineColorScheme } from "@mantine/core";
import { useEffect } from "react";

type ThemeProviderProps = {
  children: React.ReactNode;
};

export function ThemeProvider({ children }: ThemeProviderProps) {
  const { colorScheme } = useMantineColorScheme();

  useEffect(() => {
    document.documentElement.style.colorScheme =
      colorScheme === "dark" ? "dark" : "light";
  }, [colorScheme]);

  return (
    <div className="flex min-h-full flex-1 flex-col bg-[var(--mantine-color-body)] text-foreground">
      {children}
    </div>
  );
}
