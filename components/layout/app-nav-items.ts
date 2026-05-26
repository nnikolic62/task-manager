export type AppNavItem = {
  href: string;
  label: string;
};

export function getAppNavItems(workspaceSlug: string): AppNavItem[] {
  return [{ href: `/${workspaceSlug}`, label: "Home" }];
}
