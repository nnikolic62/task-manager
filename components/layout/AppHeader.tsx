"use client";

import { ActionIcon, Avatar, Burger, Group, Text } from "@mantine/core";
import Link from "next/link";

import { logoutAndRedirect, logoutUser } from "@/actions/auth";
import type { SessionUser } from "@/lib/session";

import { ThemeToggle } from "./ThemeToggle";
import { redirect } from "next/navigation";

type AppHeaderProps = {
  user: SessionUser;
  menuOpened: boolean;
  onMenuToggle: () => void;
  workspaceSlug: string;
};

export function AppHeader({
  user,
  menuOpened,
  onMenuToggle,
  workspaceSlug,
}: AppHeaderProps) {
  const initials = user.name
    .split(" ")
    .map((part) => part[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  async function handleLogout() {
    await logoutUser();
    redirect("/login");
  }

  return (
    <header className="border-b border-[var(--mantine-color-default-border)] bg-[var(--mantine-color-body)]">
      <Group h={56} px="md" justify="space-between" wrap="nowrap">
        <Group gap="sm" wrap="nowrap">
          <Burger
            opened={menuOpened}
            onClick={onMenuToggle}
            size="sm"
            aria-label={menuOpened ? "Close menu" : "Open menu"}
          />
          <Link
            href={`/${workspaceSlug}`}
            className="app-nav-link text-sm font-semibold tracking-tight"
          >
            Task Manager
          </Link>
        </Group>

        <Group gap="sm" wrap="nowrap">
          <ThemeToggle />

          <Group gap="xs" wrap="nowrap">
            <Avatar radius="xl" size="sm" color="indigo">
              {initials}
            </Avatar>
            <Text size="sm" visibleFrom="xs" className="text-foreground">
              {user.name}
            </Text>
          </Group>

          <form action={logoutAndRedirect}>
            <ActionIcon
              type="submit"
              variant="subtle"
              color="gray"
              size="lg"
              radius="md"
              aria-label="Log out"
              onClick={handleLogout}
            >
              <LogoutIcon />
            </ActionIcon>
          </form>
        </Group>
      </Group>
    </header>
  );
}

function LogoutIcon() {
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
      <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
      <path d="M16 17l5-5-5-5M21 12H9" />
    </svg>
  );
}
