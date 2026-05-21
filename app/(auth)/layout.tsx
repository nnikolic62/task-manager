import type { Metadata } from "next";
import { redirect } from "next/navigation";

import { getSession } from "@/lib/session";

export const metadata: Metadata = {
  title: "Account",
};

export default async function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getSession();

  if (session) {
    redirect("/");
  }

  return <div className="flex min-h-full flex-1 flex-col">{children}</div>;
}
