export function slugify(text: string) {
  if (!text) {
    return "workspace";
  }
  return text
    .toLowerCase()
    .replace(/ /g, "-")
    .replace(/[^a-z0-9-]/g, "");
}

export function getAppBaseUrl() {
  const configured =
    process.env.NEXT_PUBLIC_APP_URL ?? process.env.APP_URL ?? null;

  if (configured) {
    return configured.replace(/\/$/, "");
  }

  return "http://localhost:3000";
}

export function getSafeRedirectPath(
  path: string | FormDataEntryValue | null | undefined,
): string | null {
  if (
    typeof path !== "string" ||
    !path.startsWith("/") ||
    path.startsWith("//")
  ) {
    return null;
  }

  return path;
}
