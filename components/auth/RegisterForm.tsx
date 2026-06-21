"use client";

import { redirect } from "next/navigation";
import { useState } from "react";
import { type SubmitEvent } from "react";

import { registerUser } from "@/actions/auth";
import { UserIcon, MailIcon, LockIcon } from "@/components/auth/icons";
import { TextField } from "@/components/ui/TextField";
import { registerUserSchema, type RegisterUser } from "@/schemas/user.schema";

import { toast } from "../ui/Toast";

export function RegisterForm() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState<
    Partial<Record<keyof RegisterUser, string>>
  >({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSubmit(event: SubmitEvent<HTMLFormElement>) {
    event.preventDefault();

    const result = registerUserSchema.safeParse({
      name,
      email,
      password,
      confirmPassword,
    });

    if (!result.success) {
      const fieldErrors: Partial<Record<keyof RegisterUser, string>> = {};
      for (const issues of result.error.issues) {
        const path = issues.path[0] as keyof RegisterUser;
        if (path && !fieldErrors[path]) {
          fieldErrors[path] = issues.message;
        }
      }
      setErrors(fieldErrors);
      return;
    }

    setErrors({});
    setIsSubmitting(true);

    let created = false;

    try {
      const registerResult = await registerUser({
        name: result.data.name,
        email: result.data.email,
        password: result.data.password,
      });

      if (!registerResult.ok) {
        toast.error(
          registerResult.toast ??
            "An error occurred while creating your account",
        );
        return;
      }

      created = true;
    } catch (error) {
      toast.error("Something went wrong. Please try again.");
      console.error(error);
    } finally {
      setIsSubmitting(false);
    }

    if (created) {
      toast.success("Account created successfully");
      redirect("/login");
    }
  }
  return (
    <form onSubmit={handleSubmit} className="space-y-5" noValidate>
      <TextField
        label="Full name"
        name="name"
        type="text"
        placeholder="Jane Doe"
        autoComplete="name"
        required
        value={name}
        onChange={(event) => setName(event.currentTarget.value)}
        error={errors.name}
        leftSection={<UserIcon />}
      />

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

      <TextField
        label="Password"
        name="password"
        type={showPassword ? "text" : "password"}
        placeholder="At least 8 characters"
        autoComplete="new-password"
        required
        value={password}
        onChange={(event) => setPassword(event.currentTarget.value)}
        error={errors.password}
        description="Use 8 or more characters"
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

      <TextField
        label="Confirm password"
        name="confirmPassword"
        type={showPassword ? "text" : "password"}
        placeholder="Repeat your password"
        autoComplete="new-password"
        required
        value={confirmPassword}
        onChange={(event) => setConfirmPassword(event.currentTarget.value)}
        error={errors.confirmPassword}
        leftSection={<LockIcon />}
      />

      <button
        type="submit"
        disabled={isSubmitting}
        className="h-11 w-full rounded-lg bg-primary text-sm font-medium text-primary-foreground shadow-sm transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50"
      >
        {isSubmitting ? "Creating account…" : "Create account"}
      </button>
    </form>
  );
}
