import { projects } from "@/db/schema";


export type Project = typeof projects.$inferSelect;