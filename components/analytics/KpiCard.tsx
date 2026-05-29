export type KpiCardTone = "default" | "warning" | "success";

export type KpiCardProps = {
  label: string;
  value: string | number;
  hint: string;
  tone?: KpiCardTone;
};

type ToneStyle = {
  accentClassName: string;
  valueClassName: string;
};

function toneStyle(tone: KpiCardTone): ToneStyle {
  switch (tone) {
    case "default":
      return {
        accentClassName: "bg-zinc-400 dark:bg-zinc-500",
        valueClassName: "text-foreground",
      };
    case "warning":
      return {
        accentClassName: "bg-rose-500",
        valueClassName: "text-rose-500 dark:text-rose-400",
      };
    case "success":
      return {
        accentClassName: "bg-emerald-500",
        valueClassName: "text-emerald-600 dark:text-emerald-400",
      };
  }
}

export function KpiCard({
  label,
  value,
  hint,
  tone = "default",
}: KpiCardProps) {
  const style = toneStyle(tone);

  return (
    <article className="relative overflow-hidden rounded-lg bg-muted/50 py-5 pl-5 pr-4 dark:bg-zinc-900/70">
      <span
        className={`absolute inset-y-0 left-0 w-1 ${style.accentClassName}`}
        aria-hidden
      />
      <div className="flex flex-col gap-3">
        <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
          {label}
        </p>
        <p
          className={`text-4xl font-bold leading-none tabular-nums tracking-tight ${style.valueClassName}`}
        >
          {value}
        </p>
        <p className="text-xs leading-snug text-muted-foreground/90">{hint}</p>
      </div>
    </article>
  );
}
