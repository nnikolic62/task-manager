import { z } from "zod";

/** Matches `users` table row (Drizzle camelCase). */
export const userSchema = z.object({
  id: z.uuid(),
  email: z.email(),
  passwordHash: z.string().nullable(),
  name: z.string().trim().min(1).max(100),
  avatarUrl: z.string().nullable(),
  createdAt: z.coerce.date(),
});

/** Safe user shape for API responses (no password hash). */
export const publicUserSchema = userSchema.omit({ passwordHash: true });

/** Insert into `users` (server sets id + createdAt). */
export const createUserSchema = z.object({
  email: z.email(),
  passwordHash: z.string().min(1),
  name: z.string().trim().min(2).max(100),
  avatarUrl: z.string().nullable().optional(),
});

export const updateUserSchema = createUserSchema
  .partial()
  .refine((data) => Object.keys(data).length > 0, {
    message: "At least one field is required",
  });

/** Registration form (plain password; hash on server). */
export const registerUserSchema = z
  .object({
    name: z.string().trim().min(2, "Name must be at least 2 characters").max(100),
    email: z.email({ error: "Enter a valid email address" }),
    password: z.string().min(8, "Password must be at least 8 characters"),
    confirmPassword: z.string().min(1, "Please confirm your password"),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });

/** Login form. */
export const loginUserSchema = z.object({
  email: z.email({ error: "Enter a valid email address" }),
  password: z.string().min(1, "Password is required"),
});

export type User = z.infer<typeof userSchema>;
export type PublicUser = z.infer<typeof publicUserSchema>;
export type CreateUser = z.infer<typeof createUserSchema>;
export type UpdateUser = z.infer<typeof updateUserSchema>;
export type RegisterUser = z.infer<typeof registerUserSchema>;
export type LoginUser = z.infer<typeof loginUserSchema>;
