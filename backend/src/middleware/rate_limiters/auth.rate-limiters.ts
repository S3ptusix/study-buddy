import { NextFunction, Request, Response } from "express";
import { rateLimit } from "express-rate-limit";
import redis from "../../lib/redis.js";
import { AppError } from "../../utils/appError.js";

export const registerRate = async (
    req: Request,
    res: Response,
    next: NextFunction
) => {
    try {
        const ip = req.ip;

        if (!ip) return next();

        const registerKey = `register:rate:${ip}`;
        const registerDailyKey = `register:day:rate:${ip}`;

        const count = await redis.incr(registerKey);

        if (count === 1) {
            await redis.expire(registerKey, 60);
        }

        if (count > 5) {
            const ttl = await redis.ttl(registerKey);
            throw new AppError(
                `Too many Register requests. Please wait ${ttl} seconds before request.`,
                429
            )
        }

        const countDaily = await redis.incr(registerDailyKey);

        if (countDaily === 1) {
            await redis.expire(registerDailyKey, 60 * 60 * 24);
        }

        if (countDaily > 20) {
            const ttl = await redis.ttl(registerDailyKey);
            throw new AppError(
                `Daily request limit exceeded. Please wait ${ttl} seconds before requesting another code.`,
                429
            )
        }

        next();
    } catch (error) {
        next(error);
    }
}

export const loginRate = async (
    req: Request,
    res: Response,
    next: NextFunction
) => {
    try {
        const ip = req.ip;

        if (!ip) return next();

        const key = `login:rate:${ip}`;

        const count = await redis.incr(key);

        if (count === 1) {
            await redis.expire(key, 60);
        }

        if (count > 20) {
            const ttl = await redis.ttl(key);
            throw new AppError(
                `Too many login requests. Please wait ${ttl} seconds before request.`,
                429
            )
        }
        next();
    } catch (error) {
        next(error);
    }
}

export const sendOtpRate = async (
    req: Request,
    res: Response,
    next: NextFunction
) => {
    try {
        const ip = req.ip;

        if (!ip) return next();

        const key = `otp-send:rate:${ip}`;

        const count = await redis.incr(key);

        if (count === 1) {
            await redis.expire(key, 60);
        }

        if (count > 10) {
            const ttl = await redis.ttl(key);
            throw new AppError(
                `Too many OTP requests. Please wait ${ttl} seconds before request.`,
                429
            )
        }
        next();
    } catch (error) {
        next(error);
    }
}

export const verifyOtpRate = async (
    req: Request,
    res: Response,
    next: NextFunction
) => {
    try {
        const ip = req.ip;

        if (!ip) return next();

        const key = `verify-otp:rate:${ip}`;

        const count = await redis.incr(key);

        if (count === 1) {
            await redis.expire(key, 60);
        }

        if (count > 10) {
            const ttl = await redis.ttl(key);
            throw new AppError(
                `Too many OTP guesses. Please wait ${ttl} seconds before request.`,
                429
            )
        }
        next();
    } catch (error) {
        next(error);
    }
}

export const forgotPasswordRate = async (
    req: Request,
    res: Response,
    next: NextFunction
) => {
    try {
        const ip = req.ip;

        if (!ip) return next();

        const key = `forgot-password:rate:${ip}`;

        const count = await redis.incr(key);

        if (count === 1) {
            await redis.expire(key, 60 * 15);
        }

        if (count > 5) {
            const ttl = await redis.ttl(key);
            throw new AppError(
                `Too many forgot password requests. Please wait ${ttl} seconds before request.`,
                429
            )
        }
        next();
    } catch (error) {
        next(error);
    }
}