import { z } from "zod";

export const registerSchema = z.object({
    displayName: z
        .string()
        .min(2, "Display name must be at least 2 characters.")
        .max(50, "Display name must be at most 50 characters."),

    username: z
        .string()
        .min(3, "Username must be at least 3 characters")
        .max(30, "Username must be at most 30 characters")
        .trim(),

    email: z
        .string()
        .email("Please enter a valid email address.")
        .trim()
        .toLowerCase(),

    password: z
        .string()
        .min(8, "Password must be at least 8 characters")
        .max(128, "Password must be at most 128 characters")
        .regex(/[A-Z]/, "Password must contain at least one uppercase letter")
        .regex(/[a-z]/, "Password must contain at least one lowercase letter")
        .regex(/[0-9]/, "Password must contain at least one number")
        .regex(
            /[^A-Za-z0-9]/,
            "Password must contain at least one special character"
        ),
    confirmPassword: z.string(),
});

export type RegisterInput = z.infer<typeof registerSchema>;

export const loginSchema = z.object({
    credential: z.string().min(1),
    password: z.string().min(1),
});

export type LoginInput = z.infer<typeof loginSchema>;