import { Request, Response, NextFunction } from "express";
import { AppError } from "../utils/appError.js";

export const errorHandler = (
    err: unknown,
    req: Request,
    res: Response,
    next: NextFunction
) => {
    if (err instanceof AppError) {
        return res.status(err.statusCode).json({
            code: err.code,
            message: err.message,
            data: err.data,
        });
    }

    console.error(err);

    return res.status(500).json({
        code: "INTERNAL_SERVER_ERROR",
        message: "Internal server error",
    });
};