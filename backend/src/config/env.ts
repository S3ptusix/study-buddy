import "dotenv/config";
import { z } from "zod";

const envSchema = z.object({
    NODE_ENV: z
        .enum(["development", "production", "test"])
        .default("development"),

    PORT: z.coerce.number().default(8000),

    JWT_SECRET: z
        .string()
        .min(32, "JWT_SECRET must be at least 32 characters")
});

export const env = envSchema.parse(process.env);