import jwt from "jsonwebtoken";
import { AuthUser } from "../types/auth.js";
import { AppError } from "../utils/appError.js";

const JWT_SECRET = process.env.JWT_SECRET!;

export function createAccessToken(user: AuthUser) {
    return jwt.sign(
        {
            id: user.id,
        },
        JWT_SECRET,
        {
            expiresIn: "30d"
        }
    );
}

export function verifyAccessToken(token: string): AuthUser {
    return jwt.verify(token, JWT_SECRET) as AuthUser;
}

interface ResetTokenPayload {
    id: string;
    purpose: "password-reset";
}

export function createResetToken(id: string) {
    return jwt.sign(
        {
            id,
            purpose: "password-reset",
        },
        JWT_SECRET,
        {
            expiresIn: "10m"
        }
    );
}

export function verifyResetToken(token: string): ResetTokenPayload {
    const payload = jwt.verify(token, JWT_SECRET) as ResetTokenPayload;

    if (payload.purpose !== "password-reset") {
        throw new AppError("Invalid reset token", 400);
    }

    return payload;
}