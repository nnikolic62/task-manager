import { LoginForm } from "@/components/auth/LoginForm";
import { getSafeRedirectPath } from "@/lib/utils";

type LoginPageProps = {
  searchParams: Promise<{ redirect?: string }>;
};

export default async function LoginPage({ searchParams }: LoginPageProps) {
  const { redirect } = await searchParams;
  const redirectTo = getSafeRedirectPath(redirect) ?? undefined;

  return <LoginForm redirectTo={redirectTo} />;
}
