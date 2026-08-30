import { NextFunction, Request, Response } from "express";
import * as authService from "../services/auth.services.js";
import { cookieOptions, resetCookieOptions } from "../utils/cookie.js";
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

export const verifyEmail = async (req: Request, res: Response, next: NextFunction) => {
    try {

        const token = await authService.verifyEmail(req.body);
        if (token) {
            res.cookie("access_token", token, cookieOptions);
        }

        res.status(200).json({
            message: "Email verified successfully"
        });

    } catch (error) {
        next(error);
    }
};

export const sendOtp = async (req: Request, res: Response, next: NextFunction) => {
    try {
        await authService.sendOtp(req.body);

        res.status(200).json({
            message: "Email has been sent"
        });

    } catch (error) {
        next(error);
    }
};

export const forgotPasswordVerifyEmail = async (req: Request, res: Response, next: NextFunction) => {
    try {

        const token = await authService.forgotPasswordVerifyEmail(req.body);

        if (token) {
            res.cookie("reset_token", token, resetCookieOptions);
        }

        res.status(200).json({
            message: "Email verified successfully"
        });

    } catch (error) {
        next(error);
    }
};

export const forgotPassword = async (req: Request, res: Response, next: NextFunction) => {
    try {
        await authService.forgotPassword(req.body);

        res.status(200).json({
            message: "Email has been sent"
        });

    } catch (error) {
        next(error);
    }
};

export const resetPassword = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { id } = req.resetUser;
        const { password } = req.body;

        const token = await authService.resetPassword({ id, password });

        res.cookie("access_token", token, cookieOptions);

        res.clearCookie("reset_token", resetCookieOptions);

        res.status(201).json({
            message: "Password updated successfully."
        });
    } catch (error) {
        next(error);
    }
};

export const getResetUser = async (req: Request, res: Response, next: NextFunction) => {
    try {

        if (!req.resetUser) {
            throw new AppError("User not found", 404);
        }

        const user = await authService.getResetUser(req.resetUser);

        res.status(200).json(user);
    } catch (error) {
        next(error);
    }
};