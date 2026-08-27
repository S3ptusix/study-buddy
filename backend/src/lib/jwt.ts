import jwt from "jsonwebtoken";
import type { AuthUser } from "../types/auth.js";

const JWT_SECRET = process.env.JWT_SECRET!;

export function createAccessToken(user: AuthUser) {
    return jwt.sign(
        {
            sub: user.sub,
            role: user.role
        },
        JWT_SECRET,
        {
            expiresIn: "15m"
        }
    );
}

export function verifyAccessToken(token: string): AuthUser {
    return jwt.verify(token, JWT_SECRET) as AuthUser;
}