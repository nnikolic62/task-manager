import Link from "next/link";

type AuthShellProps = {
  title: string;
  subtitle: string;
  children: React.ReactNode;
  footerLabel: string;
  footerHref: string;
  footerLinkText: string;
};

export function AuthShell({
  title,
  subtitle,
  children,
  footerLabel,
  footerHref,
  footerLinkText,
}: AuthShellProps) {
  return (
    <div className="flex flex-1 items-center justify-center bg-background px-4 py-12">
      <div className="w-full max-w-md space-y-8 rounded-2xl border border-border bg-card p-8 shadow-lg">
        <div className="space-y-2 text-center">
          <Link
            href="/"
            className="mb-2 inline-block text-sm font-semibold tracking-tight text-primary no-underline hover:underline"
          >
            Task Manager
          </Link>
          <h1 className="text-2xl font-semibold tracking-tight">{title}</h1>
          <p className="text-sm text-muted-foreground">{subtitle}</p>
        </div>

        {children}

        <p className="text-center text-sm text-muted-foreground">
          {footerLabel}{" "}
          <Link
            href={footerHref}
            className="font-medium text-primary no-underline hover:underline"
          >
            {footerLinkText}
          </Link>
        </p>
      </div>
    </div>
  );
}
