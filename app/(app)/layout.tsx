import { redirect } from "next/navigation";

import { ThemeProvider } from "@/components/providers/ThemeProvider";
import { getSession } from "@/lib/session";

export default async function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getSession();

  if (!session) {
    redirect("/login");
  }

  return <ThemeProvider>{children}</ThemeProvider>;
}
