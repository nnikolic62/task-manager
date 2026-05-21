"use client";

import Link from "next/link";
import { useState, type SubmitEvent } from "react";

import { AuthShell } from "@/components/auth/AuthShell";
import { LockIcon, MailIcon } from "@/components/auth/icons";
import { TextField } from "@/components/ui/TextField";
import { toast } from "@/components/ui/Toast";
import { loginUser } from "@/actions/auth";
import { loginUserSchema, type LoginUser } from "@/schemas/user.schema";
import { redirect } from "next/navigation";

type LoginErrors = Partial<Record<keyof LoginUser, string>>;

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState<LoginErrors>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSubmit(event: SubmitEvent<HTMLFormElement>) {
    event.preventDefault();

    const result = loginUserSchema.safeParse({ email, password });

    if (!result.success) {
      const fieldErrors: Partial<Record<keyof LoginUser, string>> = {};
      for (const issues of result.error.issues) {
        const path = issues.path[0] as keyof LoginUser;
        if (path && !fieldErrors[path]) {
          fieldErrors[path] = issues.message;
        }
      }
      setErrors(fieldErrors);
      return;
    }

    setErrors({});
    setIsSubmitting(true);

    const user = await loginUser({
      email: result.data.email,
      password: result.data.password,
    });

    if (!user) {
      toast.error("Invalid email or password");
      setIsSubmitting(false);
      return;
    }

    toast.success(`Welcome back, ${user.name}`);
    redirect("/");
  }

  return (
    <AuthShell
      title="Welcome back"
      subtitle="Sign in to your workspace"
      footerLabel="Don't have an account?"
      footerHref="/register"
      footerLinkText="Create one"
    >
      <form onSubmit={handleSubmit} className="space-y-5" noValidate>
        <TextField
          label="Email"
          name="email"
          type="email"
          placeholder="you@example.com"
          autoComplete="email"
          required
          value={email}
          onChange={(event) => setEmail(event.currentTarget.value)}
          error={errors.email}
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
            value={password}
            onChange={(event) => setPassword(event.currentTarget.value)}
            error={errors.password}
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
          disabled={isSubmitting}
          className="h-11 w-full rounded-lg bg-primary text-sm font-medium text-primary-foreground shadow-sm transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {isSubmitting ? "Signing in…" : "Sign in"}
        </button>
      </form>
    </AuthShell>
  );
}
