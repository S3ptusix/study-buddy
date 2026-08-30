import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import { verifyAccessToken, verifyResetToken } from "../lib/jwt.js";
import { AppError } from "../utils/appError.js";

function handleJwtError(error: unknown, next: NextFunction) {
    if (error instanceof jwt.TokenExpiredError) {
        return next(new AppError("Session expired. Please log in again.", 401));
    }
    if (error instanceof jwt.JsonWebTokenError) {
        return next(new AppError("Invalid token.", 401));
    }
    next(error);
}

export function authenticate(
    req: Request,
    res: Response,
    next: NextFunction
) {
    try {
        const token = req.cookies.access_token;
        if (!token) {
            throw new AppError("Unauthorized", 401);
        }

        const payload = verifyAccessToken(token);
        req.user = payload;

        next();
    } catch (error) {
        handleJwtError(error, next);
    }
}

export function authenticateResetToken(
    req: Request,
    res: Response,
    next: NextFunction
) {
    try {
        const token = req.cookies.reset_token;
        if (!token) {
            throw new AppError("Unauthorized", 401);
        }

        const payload = verifyResetToken(token);
        req.resetUser = payload;

        next();
    } catch (error) {
        if (error instanceof jwt.TokenExpiredError) {
            return next(new AppError("Reset session expired. Please start again.", 400));
        }
        handleJwtError(error, next);
    }
}