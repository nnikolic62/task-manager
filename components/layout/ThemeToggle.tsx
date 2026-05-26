"use client";

import { ActionIcon, Tooltip, useMantineColorScheme } from "@mantine/core";
import { useEffect, useState } from "react";

export function ThemeToggle() {
  const { colorScheme, setColorScheme } = useMantineColorScheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const isDark = colorScheme === "dark";

  return (
    <Tooltip
      label={mounted ? (isDark ? "Light mode" : "Dark mode") : "Toggle color scheme"}
    >
      <ActionIcon
        variant="default"
        size="lg"
        radius="md"
        aria-label="Toggle color scheme"
        onClick={() => setColorScheme(isDark ? "light" : "dark")}
      >
        {!mounted ? (
          <IconPlaceholder />
        ) : isDark ? (
          <SunIcon />
        ) : (
          <MoonIcon />
        )}
      </ActionIcon>
    </Tooltip>
  );
}

function IconPlaceholder() {
  return <span className="inline-block h-[18px] w-[18px]" aria-hidden />;
}

function SunIcon() {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width={18}
      height={18}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
    >
      <circle cx="12" cy="12" r="4" />
      <path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M4.93 19.07l1.41-1.41M17.66 6.34l1.41-1.41" />
    </svg>
  );
}

function MoonIcon() {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width={18}
      height={18}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
    >
      <path d="M21 14.5A8.5 8.5 0 0 1 9.5 3 7 7 0 1 0 21 14.5z" />
    </svg>
  );
}
