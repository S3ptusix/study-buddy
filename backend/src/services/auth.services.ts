import * as userRepository from "../repositories/auth.repositories.js";
import argon2 from "argon2";
import { AppError } from "../utils/appError.js";
import type { LoginInput, RegisterInput } from "../validations/auth.validation.js";
import { createAccessToken } from "../lib/jwt.js";
import { prisma } from "../lib/prisma.js";
import { AuthUser } from "../types/auth.js";

export async function register(data: RegisterInput) {

    const existingUsername =
        await userRepository.findByUsername(data.username);

    if (existingUsername) {
        throw new AppError("Username already taken", 409);
    }

    const existingUser =
        await userRepository.findByEmail(data.email);

    if (existingUser) {
        throw new AppError("Email already registered", 409);
    }

    const passwordHash = await argon2.hash(data.password);

    await prisma.user.create({
        data: {
            displayName: data.displayName,
            username: data.username,
            email: data.email,
            passwordHash
        }
    });

    return "User account created successfully";
}

export async function login(data: LoginInput) {

    const user = await prisma.user.findFirst({
        where: {
            OR: [
                { email: data.credential },
                { username: data.credential },
            ]
        },
    });

    if (!user) {
        throw new AppError("Incorrect username or password", 401);
    }

    const validPassword = await argon2.verify(
        user.passwordHash,
        data.password
    );

    if (!validPassword) {
        throw new AppError("Incorrect username or password", 401);
    }

    const token = createAccessToken({ sub: user.id, role: user.role });

    return token;
}

export async function getMe(data: AuthUser) {

    const user = await prisma.user.findUnique({
        where: {
            id: data.sub
        },
        select: {
            displayName: true,
            username: true,
            email: true,
            avatarUrl: true,
            bio: true,
        }   
    });

    if (!user) {
        throw new AppError("User not found", 404);
    }

    return user
}