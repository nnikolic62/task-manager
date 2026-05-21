import { logoutUser } from "@/actions/auth";
import { getSession } from "@/lib/session";
import { redirect } from "next/navigation";

export default async function Home() {
  const session = await getSession();

  if (!session) {
    redirect("/login");
  }

  return (
    <main className="flex min-h-full flex-1 flex-col items-center justify-center gap-6 p-8">
      <div className="text-center">
        <h1 className="text-2xl font-semibold tracking-tight">Task Manager</h1>
        <p className="mt-2 text-muted-foreground">
          Signed in as {session.name} ({session.email})
        </p>
      </div>

      <form
        action={async () => {
          "use server";
          await logoutUser();
          redirect("/login");
        }}
      >
        <button
          type="submit"
          className="h-10 rounded-lg border border-border px-4 text-sm font-medium transition-colors hover:bg-muted"
        >
          Log out
        </button>
      </form>
    </main>
  );
}
