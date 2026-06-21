"use client";

import {
  createTheme,
  localStorageColorSchemeManager,
  MantineProvider,
} from "@mantine/core";
import { DatesProvider } from "@mantine/dates";

import { Toaster } from "@/components/ui/Toast";

const theme = createTheme({
  primaryColor: "indigo",
  defaultRadius: "md",
  fontFamily: "var(--font-geist-sans), ui-sans-serif, system-ui, sans-serif",
  headings: {
    fontFamily: "var(--font-geist-sans), ui-sans-serif, system-ui, sans-serif",
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
      <DatesProvider settings={{ consistentWeeks: true }}>
        <div className="flex min-h-svh flex-1 flex-col">
          <Toaster />
          {children}
        </div>
      </DatesProvider>
    </MantineProvider>
  );
}
