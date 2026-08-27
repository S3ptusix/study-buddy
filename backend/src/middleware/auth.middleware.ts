import { Request, Response, NextFunction } from "express";
import { verifyAccessToken } from "../lib/jwt.js";
import { AppError } from "../utils/appError.js";

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
        next(error);
    }
}
