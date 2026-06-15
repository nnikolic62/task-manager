"use client";

import { GoogleIcon } from "@/components/auth/icons";

type GoogleSSOProps = {
  redirectTo?: string;
  label?: string;
};

export function GoogleSSO({
  redirectTo,
  label = "Continue with Google",
}: GoogleSSOProps) {
  function handleClick() {
    const url = new URL("/api/auth/google", window.location.origin);

    if (redirectTo) {
      url.searchParams.set("redirect", redirectTo);
    }

    window.location.assign(url.toString());
  }

  return (
    <button
      type="button"
      onClick={handleClick}
      className="group flex h-11 w-full items-center justify-center gap-3 rounded-lg border border-border bg-card px-4 text-sm font-medium text-foreground shadow-sm transition-[background-color,box-shadow,border-color] duration-150 hover:border-border hover:bg-muted hover:shadow-md active:translate-y-px disabled:cursor-not-allowed disabled:opacity-50"
    >
      <span className="flex h-5 w-5 shrink-0 items-center justify-center">
        <GoogleIcon size={18} />
      </span>
      <span>{label}</span>
    </button>
  );
}
