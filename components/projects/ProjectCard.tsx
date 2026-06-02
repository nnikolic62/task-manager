import Link from "next/link";

export type ProjectCardMember = {
  name: string;
  initials?: string;
};

export type ProjectStatus = "active" | "archived" | "done";

export type ProjectCardProps = {
  name: string;
  description?: string | null;
  status?: ProjectStatus | null;
  taskCount?: number;
  progressPercent?: number;
  members?: ProjectCardMember[];
  href?: string;
};

function getInitials(name: string): string {
  return name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? "")
    .join("");
}

function clampProgress(value: number): number {
  return Math.min(100, Math.max(0, value));
}

function statusLabel(status: ProjectStatus): string {
  return status;
}

type StatusStyle = {
  dotClassName: string;
  badgeClassName: string;
};

function statusStyle(status: ProjectStatus): StatusStyle {
  switch (status) {
    case "active":
      return {
        dotClassName: "bg-emerald-500",
        badgeClassName:
          "bg-emerald-500/15 text-emerald-600 dark:bg-emerald-950/50 dark:text-emerald-400",
      };
    case "archived":
      return {
        dotClassName: "bg-zinc-400",
        badgeClassName: "bg-muted text-muted-foreground",
      };
    case "done":
      return {
        dotClassName: "bg-emerald-500",
        badgeClassName:
          "bg-emerald-500/15 text-emerald-600 dark:bg-emerald-950/50 dark:text-emerald-400",
      };
  }
}

function CardShell({
  href,
  children,
}: {
  href?: string;
  children: React.ReactNode;
}) {
  const className =
    "project-card-link flex flex-col gap-4 rounded-2xl border border-border bg-card p-6 text-inherit no-underline transition-transform duration-200 ease-out hover:scale-[1.02] dark:border-zinc-700 dark:bg-zinc-800/90";

  if (href) {
    return (
      <Link href={href} className={className}>
        {children}
      </Link>
    );
  }

  return <article className={className}>{children}</article>;
}

export function ProjectCard({
  name,
  description,
  status = "active",
  taskCount = 0,
  progressPercent = 0,
  members = [],
  href,
}: ProjectCardProps) {
  const resolvedStatus: ProjectStatus = status ?? "active";
  const style = statusStyle(resolvedStatus);
  const progress = clampProgress(progressPercent);
  const taskLabel = taskCount === 1 ? "1 task" : `${taskCount} tasks`;

  return (
    <CardShell href={href}>
      <header className="flex items-start justify-between gap-3">
        <div className="flex min-w-0 items-center gap-2.5">
          <span
            className={`size-2 shrink-0 rounded-full ${style.dotClassName}`}
            aria-hidden
          />
          <h3 className="truncate text-base font-semibold tracking-tight text-card-foreground">
            {name}
          </h3>
        </div>
        <span
          className={`shrink-0 rounded-full px-2.5 py-0.5 text-xs font-medium capitalize ${style.badgeClassName}`}
        >
          {statusLabel(resolvedStatus)}
        </span>
      </header>

      {description ? (
        <p className="line-clamp-2 text-sm leading-relaxed text-muted-foreground">
          {description}
        </p>
      ) : null}

      <footer className="flex items-center gap-3 pt-1">
        <span className="shrink-0 text-sm text-muted-foreground">{taskLabel}</span>

        <div
          className="h-1 min-w-0 flex-1 overflow-hidden rounded-full bg-muted dark:bg-zinc-700"
          role="progressbar"
          aria-valuenow={progress}
          aria-valuemin={0}
          aria-valuemax={100}
          aria-label={`${progress}% complete`}
        >
          <div
            className="h-full rounded-full bg-emerald-500 transition-[width] duration-300"
            style={{ width: `${progress}%` }}
          />
        </div>

        {members.length > 0 ? (
          <div className="flex shrink-0 -space-x-2" aria-label="Project members">
            {members.slice(0, 4).map((member) => (
              <span
                key={member.name}
                title={member.name}
                className="flex size-7 items-center justify-center rounded-full border-2 border-card bg-zinc-700 text-[10px] font-medium text-zinc-100 dark:border-zinc-800 dark:bg-zinc-600"
              >
                {member.initials ?? getInitials(member.name)}
              </span>
            ))}
          </div>
        ) : null}
      </footer>
    </CardShell>
  );
}
