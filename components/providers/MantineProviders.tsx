"use client";

import { createTheme, MantineProvider } from "@mantine/core";
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
    <MantineProvider theme={theme} defaultColorScheme="auto">
      <Toaster />
      {children}
    </MantineProvider>
  );
}
