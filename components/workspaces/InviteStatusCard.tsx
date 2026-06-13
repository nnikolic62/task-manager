import Link from "next/link";

type InviteStatusCardProps = {
  title: string;
  description: string;
  actionLabel?: string;
  actionHref?: string;
};

export function InviteStatusCard({
  title,
  description,
  actionLabel = "Go home",
  actionHref = "/",
}: InviteStatusCardProps) {
  return (
    <div className="relative w-full max-w-md">
      <div
        aria-hidden
        className="pointer-events-none absolute -inset-6 rounded-[2rem] bg-muted/50 blur-2xl"
      />

      <div className="relative space-y-6 rounded-2xl border border-border bg-card p-8 text-center shadow-lg">
        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl border border-border bg-muted text-muted-foreground">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width={28}
            height={28}
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden
          >
            <circle cx="12" cy="12" r="10" />
            <path d="M12 8v4" />
            <path d="M12 16h.01" />
          </svg>
        </div>

        <div className="space-y-2">
          <h1 className="text-2xl font-semibold tracking-tight text-foreground">
            {title}
          </h1>
          <p className="text-sm text-muted-foreground">{description}</p>
        </div>

        <Link
          href={actionHref}
          className="inline-flex h-11 w-full items-center justify-center rounded-lg border border-border bg-background text-sm font-medium text-foreground no-underline transition-colors hover:bg-muted hover:no-underline"
        >
          {actionLabel}
        </Link>
      </div>
    </div>
  );
}
