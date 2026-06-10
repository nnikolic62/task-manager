import { z } from "zod";

export const WORKSPACE_ROLES = [
  "owner",
  "admin",
  "member",
  "viewer",
] as const;

export const INVITE_WORKSPACE_ROLES = ["admin", "member", "viewer"] as const;

export type WorkspaceRole = (typeof WORKSPACE_ROLES)[number];
export type InviteWorkspaceRole = (typeof INVITE_WORKSPACE_ROLES)[number];

export const inviteWorkspaceMemberSchema = z.object({
  email: z.email("Enter a valid email address"),
  role: z.enum(INVITE_WORKSPACE_ROLES),
});
