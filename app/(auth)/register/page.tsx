import { AuthShell } from "@/components/auth/AuthShell";
import { RegisterForm } from "@/components/auth/RegisterForm";

export default function RegisterPage() {
  return (
    <AuthShell
      title="Create an account"
      subtitle="Start organizing tasks with your team"
      footerLabel="Already have an account?"
      footerHref="/login"
      footerLinkText="Sign in"
    >
      <RegisterForm />
    </AuthShell>
  );
}
