"use client";

import Link from "next/link";
import { useActionState, useEffect, useState } from "react";

import { loginAction, LoginActionState } from "@/actions/auth";
import { AuthShell } from "@/components/auth/AuthShell";
import { LockIcon, MailIcon } from "@/components/auth/icons";
import { TextField } from "@/components/ui/TextField";
import { toast } from "@/components/ui/Toast";

import { GoogleSSO } from "./GoogleSSO";

type LoginFormProps = {
  redirectTo?: string;
};

export function LoginForm({ redirectTo }: LoginFormProps) {
  const [showPassword, setShowPassword] = useState(false);
  const [state, formAction, pending] = useActionState<
    LoginActionState,
    FormData
  >(loginAction, { fieldErrors: {} });

  useEffect(() => {
    if (state?.toast) {
      toast.error(state.toast);
    }
  }, [state]);

  const registerHref = redirectTo
    ? `/register?redirect=${encodeURIComponent(redirectTo)}`
    : "/register";

  return (
    <AuthShell
      title="Welcome back"
      subtitle="Sign in to your workspace"
      footerLabel="Don't have an account?"
      footerHref={registerHref}
      footerLinkText="Create one"
    >
      <form action={formAction} className="space-y-5" noValidate>
        {redirectTo ? (
          <input type="hidden" name="redirect" value={redirectTo} />
        ) : null}

        <TextField
          label="Email"
          name="email"
          type="email"
          placeholder="you@example.com"
          autoComplete="email"
          required
          error={state?.fieldErrors?.email}
          leftSection={<MailIcon />}
        />

        <div className="space-y-2">
          <TextField
            label="Password"
            name="password"
            type={showPassword ? "text" : "password"}
            placeholder="••••••••"
            autoComplete="current-password"
            required
            error={state?.fieldErrors?.password}
            leftSection={<LockIcon />}
            rightSection={
              <button
                type="button"
                onClick={() => setShowPassword((value) => !value)}
                className="text-xs font-medium text-muted-foreground transition-colors hover:text-foreground"
              >
                {showPassword ? "Hide" : "Show"}
              </button>
            }
            rightSectionPointerEvents="all"
          />

          <div className="flex justify-end">
            <Link
              href="#"
              className="text-xs font-medium text-muted-foreground no-underline hover:text-primary hover:underline"
            >
              Forgot password?
            </Link>
          </div>
        </div>

        <button
          type="submit"
          disabled={pending}
          className="h-11 w-full rounded-lg bg-primary text-sm font-medium text-primary-foreground shadow-sm transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {pending ? "Signing in…" : "Sign in"}
        </button>
        <div className="flex items-center justify-center">
          <span className="text-sm text-muted-foreground">Or</span>
        </div>
        <GoogleSSO />
      </form>
    </AuthShell>
  );
}
