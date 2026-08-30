import * as authRepository from "../repositories/auth.repositories.js";
import argon2 from "argon2";
import { AppError } from "../utils/appError.js";
import type { LoginInput, OtpFields, RegisterInput } from "../validations/auth.validation.js";
import { createAccessToken, createResetToken } from "../lib/jwt.js";
import { prisma } from "../lib/prisma.js";
import redis from "../lib/redis.js";
import { sendEmail } from "../lib/email.js";
import { resetCookieOptions } from "../utils/cookie.js";

export async function register(data: RegisterInput) {
    const existingUsername =
        await authRepository.findByUsername(data.username);

    if (existingUsername) {
        throw new AppError("Username already taken", 409);
    }

    const existingUser =
        await authRepository.findByEmail(data.email);

    if (existingUser) {
        throw new AppError("Email already registered", 409);
    }

    const passwordHash = await argon2.hash(data.password);

    const user = await prisma.user.create({
        data: {
            displayName: data.displayName,
            username: data.username,
            email: data.email,
            passwordHash,
        }
    });

    return "User account created successfully";
}

export async function login(data: LoginInput) {

    const failedAttemptKey = `login:failed-attempt:${data.credential}`;
    const failedAttemptDailyKey = `login:failed-attempt:day:${data.credential}`;

    // 10 failed attempts / 10 minutes
    const failedAttempt = await redis.get(failedAttemptKey);

    if (failedAttempt && Number(failedAttempt) >= 10) {
        const ttl = await redis.ttl(failedAttemptKey);

        throw new AppError(
            `Too many incorrect login attempts. Please try again in ${ttl} seconds.`,
            429
        );
    }

    // 50 failed attempts / rolling 24 hours
    const failedAttemptDaily = await redis.get(
        failedAttemptDailyKey
    );

    if (
        failedAttemptDaily &&
        Number(failedAttemptDaily) >= 50
    ) {
        const ttl = await redis.ttl(
            failedAttemptDailyKey
        );

        throw new AppError(
            `Daily login attempt limit exceeded. Please try again in ${ttl} seconds.`,
            429
        );
    }

    const user = await prisma.user.findFirst({
        where: {
            OR: [
                { email: data.credential },
                { username: data.credential },
            ],
        },
    });

    if (!user) {
        await authRepository.incrementFailedLoginAttempts(
            failedAttemptKey,
            failedAttemptDailyKey
        );

        throw new AppError(
            "Incorrect username or password",
            401
        );
    }

    const validPassword = await argon2.verify(
        user.passwordHash,
        data.password
    );

    if (!validPassword) {
        await authRepository.incrementFailedLoginAttempts(
            failedAttemptKey,
            failedAttemptDailyKey
        );

        throw new AppError(
            "Incorrect username or password",
            401
        );
    }

    // Correct credentials, so don't count this as a failure.
    if (!user.emailVerified) {
        throw new AppError(
            "Email is not verified",
            401,
            "EMAIL_NOT_VERIFIED"
        );
    }

    return createAccessToken({
        id: user.id,
    });
}

export async function getMe(data: { id: string }) {

    const key = `user:${data.id}`;
    const cachedUser = await redis.get(key);

    if (cachedUser) {
        return JSON.parse(cachedUser);
    }

    const user = await prisma.user.findUnique({
        where: {
            id: data.id
        },
        select: {
            id: true,
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

    await redis.set(
        key,
        JSON.stringify(user),
        {
            EX: 60 * 60, // 1 hour
        }
    );

    return user
}

export async function verifyEmail(data: OtpFields) {

    const failedAttemptKey = `verify-email:failed-attempt:${data.email}`;
    const failedAttemptDailyKey = `verify-email:failed-attempt:day:${data.email}`;

    const failedAttempt = await redis.get(failedAttemptKey);

    if (failedAttempt && Number(failedAttempt) >= 10) {
        const ttl = await redis.ttl(failedAttemptKey);
        throw new AppError(
            `Too many incorrect OTP attempts. Please wait ${ttl} seconds before requesting another code.`,
            429
        );
    }

    const failedAttemptDaily = await redis.get(failedAttemptDailyKey);

    if (failedAttemptDaily && Number(failedAttemptDaily) >= 30) {
        const ttl = await redis.ttl(failedAttemptDailyKey);
        throw new AppError(
            `Daily OTP incorrect attempt limit exceeded. Please wait ${ttl} seconds before requesting another code.`,
            429
        );
    }

    const user = await prisma.user.findUnique({
        where: {
            email: data.email,
        },
    });

    if (!user) {
        await authRepository.incrementFailedEmailVerificationAttempts(
            failedAttemptKey,
            failedAttemptDailyKey
        );

        throw new AppError(
            "OTP expired or wrong",
            400
        );
    }

    if (user.emailVerified) {
        throw new AppError(
            "OTP expired or wrong",
            400
        );
    }

    try {
        await authRepository.verifyOtp(user.id, data.otp);

        await prisma.user.update({
            where: {
                id: user.id,
            },
            data: {
                emailVerified: true,
            },
        });

        // Reset failed-attempt tracking on success
        await authRepository.clearFailedOtpAttempts(failedAttemptKey);

        const token = createAccessToken({
            id: user.id,
        });

        return token;

    } catch (error) {
        if (
            error instanceof AppError
        ) {
            await authRepository.incrementFailedEmailVerificationAttempts(
                failedAttemptKey,
                failedAttemptDailyKey
            );
        }

        throw error;
    }
}

export async function sendOtp(data: { email: string }) {

    const cooldownKey = `send-otp:otp-cooldown:${data.email}`;
    const dailyKey = `send-otp:otp-send:day:${data.email}`;

    // 60-second cooldown
    const cooldown = await redis.exists(cooldownKey);

    if (cooldown) {
        const ttl = await redis.ttl(cooldownKey);
        throw new AppError(
            `Please wait ${ttl} seconds before requesting another code.`,
            429
        );
    }

    const dailyCount = await redis.get(dailyKey);

    if (dailyCount && Number(dailyCount) >= 10) {
        const ttl = await redis.ttl(dailyKey);
        throw new AppError(
            `Daily request limit exceeded. Please wait ${ttl} seconds before requesting another code.`,
            429
        )
    }

    // Set the cooldown/daily counters up front, regardless of whether the
    // email exists or is already verified, so this endpoint can't be
    // hammered to fish for valid/verified emails or to bypass throttling.
    await redis.set(cooldownKey, "1", { EX: 60 });

    const newCount = await redis.incr(dailyKey);
    if (newCount === 1) {
        await redis.expire(dailyKey, 60 * 60 * 24);
    }

    const user = await prisma.user.findUnique({
        where: { email: data.email },
    });

    if (!user || user.emailVerified) {
        return;
    }

    const otp = await authRepository.createOtp(user.id);

    await sendEmail({
        to: [data.email],
        subject: "Your StudyBuddy verification code",
        html: `<h1>${otp}</h1>`,
    });

    return;
}

export async function forgotPasswordVerifyEmail(data: OtpFields) {

    const failedAttemptKey = `forgot-password:failed-attempt:${data.email}`;
    const failedAttemptDailyKey = `forgot-password:failed-attempt:day:${data.email}`;

    const failedAttempt = await redis.get(failedAttemptKey);

    if (failedAttempt && Number(failedAttempt) >= 10) {
        const ttl = await redis.ttl(failedAttemptKey);
        throw new AppError(
            `Too many incorrect OTP attempts. Please wait ${ttl} seconds before requesting another code.`,
            429
        );
    }

    const failedAttemptDaily = await redis.get(failedAttemptDailyKey);

    if (failedAttemptDaily && Number(failedAttemptDaily) >= 30) {
        const ttl = await redis.ttl(failedAttemptDailyKey);
        throw new AppError(
            `Daily OTP incorrect attempt limit exceeded. Please wait ${ttl} seconds before requesting another code.`,
            429
        );
    }

    const user = await prisma.user.findUnique({
        where: {
            email: data.email,
        },
    });

    if (!user) {
        await authRepository.incrementFailedEmailVerificationAttempts(
            failedAttemptKey,
            failedAttemptDailyKey
        );
        throw new AppError(
            "OTP expired or wrong",
            400
        );
    }

    try {
        await authRepository.forgotPasswordVerifyOtp(user.id, data.otp);
    } catch (error) {
        if (error instanceof AppError) {
            await authRepository.incrementFailedEmailVerificationAttempts(
                failedAttemptKey,
                failedAttemptDailyKey
            );
        }
        throw error;
    }

    // Reset failed-attempt tracking on success
    await authRepository.clearFailedOtpAttempts(failedAttemptKey);

    return createResetToken(user.id);
}

export async function forgotPassword(data: { email: string }) {

    const cooldownKey = `forgot-password:otp-cooldown:${data.email}`;
    const dailyKey = `forgot-password:otp-send:day:${data.email}`;

    // 60-second cooldown
    const cooldown = await redis.exists(cooldownKey);

    if (cooldown) {
        const ttl = await redis.ttl(cooldownKey);
        throw new AppError(
            `Please wait ${ttl} seconds before requesting another code.`,
            429
        );
    }

    const dailyCount = await redis.get(dailyKey);

    if (dailyCount && Number(dailyCount) >= 3) {
        const ttl = await redis.ttl(dailyKey);
        throw new AppError(
            `Daily request limit exceeded. Please wait ${ttl} seconds before requesting another code.`,
            429
        )
    }

    // Set counters before the existence check, so this can't be spammed
    // against unknown/verified emails to dodge throttling.
    await redis.set(cooldownKey, "1", { EX: 60 });

    const newCount = await redis.incr(dailyKey);
    if (newCount === 1) {
        await redis.expire(dailyKey, 60 * 60 * 24);
    }

    const user = await prisma.user.findUnique({
        where: { email: data.email },
    });

    if (!user) {
        return
    }

    const otp = await authRepository.forgotPasswordCreateOtp(user.id);

    await sendEmail({
        to: [data.email],
        subject: "Your StudyBuddy verification code",
        html: `<h1>${otp}</h1>`,
    });

    return;
}

export async function resetPassword(data: { id: string; password: string }) {
    const user = await prisma.user.findUnique({
        where: {
            id: data.id
        }
    });

    if (!user) {
        throw new AppError("User not found.", 404);
    }

    const passwordHash = await argon2.hash(data.password);

    await prisma.user.update({
        data: {
            passwordHash
        },
        where: {
            id: data.id
        }
    });

    return createAccessToken({
        id: user.id,
    });
}

export async function getResetUser(data: { id: string }) {

    const key = `reset-user:${data.id}`;
    const cachedUser = await redis.get(key);

    if (cachedUser) {
        return JSON.parse(cachedUser);
    }

    const user = await prisma.user.findUnique({
        where: {
            id: data.id
        },
        select: {
            id: true,
        }
    });

    if (!user) {
        throw new AppError("User not found", 404);
    }

    await redis.set(
        key,
        JSON.stringify(user),
        {
            EX: 60 * 5,
        }
    );

    return user
}