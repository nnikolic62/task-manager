import { cookies } from "next/headers";
import { google } from "@/lib/google";
import { decodeIdToken } from "arctic";
import { db } from "@/db";
import { users, workspaceMembers, workspaces } from "@/db/schema";
import { eq } from "drizzle-orm";
import { slugify } from "@/lib/utils";
import { issueSession } from "@/lib/session";
import { getUserWorkspaces } from "@/lib/workspaces";


export async function GET(request: Request) {
    const { searchParams } = new URL(request.url);
    const code = searchParams.get("code");
    const state = searchParams.get("state");
    const cookieStore = await cookies();

    const googleState = cookieStore.get("google_state")?.value;
    const googleCodeVerifier = cookieStore.get("google_code_verifier")?.value;


    if (
        !code ||
        !state ||
        !googleCodeVerifier ||
        !googleState ||
        googleState !== state
    ) {
        return Response.json({ error: "Invalid code or state" }, { status: 400 });
    }

    const tokens = await google.validateAuthorizationCode(code, googleCodeVerifier);
    const googleUser = decodeIdToken(tokens.idToken()) as {
        sub: string;
        email: string;
        name: string;
        picture: string;
    };

    let user = await db
        .select()
        .from(users)
        .where(eq(users.googleId, googleUser.sub))
        .then(result => result[0]);

    if (!user) {
        user = await db
            .select()
            .from(users)
            .where(eq(users.email, googleUser.email))
            .then(result => result[0]);

        if (user) {
            await db.update(users).set({ googleId: googleUser.sub, avatarUrl: googleUser.picture }).where(eq(users.id, user.id));
        } else {
            await db.transaction(async (tx) => {
                const [newUser] = await tx
                    .insert(users)
                    .values({
                        googleId: googleUser.sub,
                        email: googleUser.email,
                        name: googleUser.name,
                        avatarUrl: googleUser.picture,
                    })
                    .returning();

                user = newUser;

                const slug = slugify(googleUser.name);

                const [workspace] = await tx
                    .insert(workspaces)
                    .values({
                        name: googleUser.name,
                        slug,
                        ownerId: newUser.id,
                    })
                    .returning();

                await tx.insert(workspaceMembers).values({
                    workspaceId: workspace.id,
                    userId: newUser.id,
                    role: "owner",
                });
            });
        }
    }

    await issueSession(user.id);

    const userWorkspaces = await getUserWorkspaces(user.id);


    return Response.redirect(new URL(`/${userWorkspaces[0].slug}`, request.url));
}