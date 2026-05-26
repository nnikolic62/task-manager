"use client";

import {
  createTheme,
  localStorageColorSchemeManager,
  MantineProvider,
} from "@mantine/core";
import { Toaster } from "@/components/ui/Toast";

const theme = createTheme({
  primaryColor: "indigo",
  defaultRadius: "md",
  fontFamily:
    "var(--font-geist-sans), ui-sans-serif, system-ui, sans-serif",
  headings: {
    fontFamily:
      "var(--font-geist-sans), ui-sans-serif, system-ui, sans-serif",
  },
});

export function MantineProviders({ children }: { children: React.ReactNode }) {
  return (
    <MantineProvider
      theme={theme}
      defaultColorScheme="light"
      colorSchemeManager={localStorageColorSchemeManager({
        key: "task-manager-color-scheme",
      })}
    >
      <Toaster />
      {children}
    </MantineProvider>
  );
}
