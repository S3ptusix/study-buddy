

import argon2 from "argon2";
import { randomInt } from "crypto";
import { prisma } from "../lib/prisma.js";
import redis from "../lib/redis.js";
import { AppError } from "../utils/appError.js";

const OTP_EXPIRATION = 5 * 60; // 5 minutes

export function findByEmail(email: string) {
    return prisma.user.findUnique({
        where: { email }
    });
}

export function findByUsername(username: string) {
    return prisma.user.findUnique({
        where: { username }
    });
}

export async function createOtp(userId: string) {
    // Generate 6-digit OTP
    const otp = randomInt(100000, 1000000);

    // Hash OTP before storing it
    const otpHash = await argon2.hash(otp.toString());

    // Store OTP hash in Redis for 5 minutes
    await redis.set(
        `otp:email-verification:${userId}`,
        otpHash,
        {
            EX: OTP_EXPIRATION
        }
    );

    return otp;
}

export async function verifyOtp(
    userId: string,
    otp: string
) {
    const key = `otp:email-verification:${userId}`;

    const otpHash = await redis.get(key);

    if (!otpHash) {
        throw new AppError(
            "OTP expired or not found",
            400
        );
    }

    const isValid = await argon2.verify(
        otpHash,
        otp
    );

    if (!isValid) {
        throw new AppError(
            "OTP expired or not found",
            400,
            "INVALID_OTP"
        );
    }

    await redis.del(key);
}

export async function forgotPasswordCreateOtp(userId: string) {
    // Generate 6-digit OTP
    const otp = randomInt(100000, 1000000);

    // Hash OTP before storing it
    const otpHash = await argon2.hash(otp.toString());

    // Store OTP hash in Redis for 5 minutes
    await redis.set(
        `otp:forgot-password:${userId}`,
        otpHash,
        {
            EX: OTP_EXPIRATION
        }
    );

    return otp;
}

export async function forgotPasswordVerifyOtp(
    userId: string,
    otp: string
) {
    const key = `otp:forgot-password:${userId}`;

    const otpHash = await redis.get(key);

    if (!otpHash) {
        throw new AppError(
            "OTP expired or wrong",
            400
        );
    }

    const isValid = await argon2.verify(
        otpHash,
        otp
    );

    if (!isValid) {
        throw new AppError(
            "OTP expired or wrong",
            400,
            "INVALID_OTP"
        );
    }

    // Prevent OTP reuse
    await redis.del(key);
}

export async function incrementFailedLoginAttempts(
    failedAttemptKey: string,
    failedAttemptDailyKey: string
) {
    const count = await redis.incr(failedAttemptKey);

    if (count === 1) {
        await redis.expire(
            failedAttemptKey,
            60 * 10
        );
    }

    const dailyCount = await redis.incr(
        failedAttemptDailyKey
    );

    if (dailyCount === 1) {
        await redis.expire(
            failedAttemptDailyKey,
            60 * 60 * 24
        );
    }
}

export async function incrementFailedEmailVerificationAttempts(
    failedAttemptKey: string,
    failedAttemptDailyKey: string
) {
    const count = await redis.incr(
        failedAttemptKey
    );

    if (count === 1) {
        await redis.expire(
            failedAttemptKey,
            60 * 10
        );
    }

    const daily = await redis.incr(
        failedAttemptDailyKey
    );

    if (daily === 1) {
        await redis.expire(
            failedAttemptDailyKey,
            60 * 60 * 24
        );
    }
}

export async function clearFailedOtpAttempts(
    failedAttemptKey: string
) {
    await redis.del(failedAttemptKey);
}