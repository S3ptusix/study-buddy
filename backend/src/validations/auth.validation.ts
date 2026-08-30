import { z } from "zod";

/**
 * Reusable fields
 */
export const emailSchema = z
    .string()
    .trim()
    .email("Please enter a valid email address.")
    .toLowerCase();

export const otpSchema = z
    .string()
    .length(6, "OTP must be exactly 6 digits.")
    .regex(/^\d+$/, "OTP must contain only numbers.");

export const passwordSchema = z
    .string()
    .min(8, "Password must be at least 8 characters")
    .max(128, "Password must be at most 128 characters")
    .regex(/[A-Z]/, "Password must contain at least one uppercase letter")
    .regex(/[a-z]/, "Password must contain at least one lowercase letter")
    .regex(/[0-9]/, "Password must contain at least one number")
    .regex(
        /[^A-Za-z0-9]/,
        "Password must contain at least one special character"
    );

/**
 * Register
 */
export const registerSchema = z
    .object({
        displayName: z
            .string()
            .trim()
            .min(2, "Display name must be at least 2 characters.")
            .max(50, "Display name must be at most 50 characters."),

        username: z
            .string()
            .trim()
            .min(3, "Username must be at least 3 characters")
            .max(30, "Username must be at most 30 characters"),

        email: emailSchema,

        password: passwordSchema,

        confirmPassword: z.string(),
    })
    .refine(
        (data) => data.password === data.confirmPassword,
        {
            message: "Passwords do not match",
            path: ["confirmPassword"],
        }
    );

export type RegisterInput = z.infer<typeof registerSchema>;

/**
 * Login
 */
export const loginSchema = z.object({
    credential: z.string().trim().min(1),
    password: z.string().min(1),
});

export type LoginInput = z.infer<typeof loginSchema>;

/**
 * OTP
 */
export const otpFields = z.object({
    email: emailSchema,
    otp: otpSchema,
});

export type OtpFields = z.infer<typeof otpFields>;

/**
 * Email
 */
export type Email = z.infer<typeof emailSchema>;