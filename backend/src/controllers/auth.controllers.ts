import { NextFunction, Request, Response } from "express";
import * as authService from "../services/auth.services.js";
import { cookieOptions } from "../utils/cookie.js";
import { AppError } from "../utils/appError.js";

export const register = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const message = await authService.register(req.body);

        res.status(201).json({
            message
        });
    } catch (error) {
        next(error);
    }
};

export const login = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const token = await authService.login(req.body);

        res.cookie("access_token", token, cookieOptions);

        res.status(200).json({
            message: "Login successful"
        });
    } catch (error) {
        next(error);
    }
};

export const getMe = async (req: Request, res: Response, next: NextFunction) => {
    try {

        if (!req.user) {
            throw new AppError("User not found", 404);
        }

        const user = await authService.getMe(req.user);

        res.status(200).json(user);
    } catch (error) {
        next(error);
    }
};

export const logout = (req: Request, res: Response) => {
    res.clearCookie("access_token", cookieOptions);

    return res.status(200).json({
        message: "Logged out successfully"
    });
};