import { Router } from "express";
import * as authController from "../controllers/auth.controllers.js";
import { validate } from "../middleware/validate.middleware.js";
import { emailSchema, loginSchema, otpFields, passwordSchema, registerSchema } from "../validations/auth.validation.js";
import * as authLimiter from "../middleware/rate_limiters/auth.rate-limiters.js";
import { authenticate, authenticateResetToken } from "../middleware/auth.middleware.js";
import z from "zod";

const authRouter = Router();

authRouter.post(
    "/register",
    authLimiter.registerRate,
    validate(registerSchema),
    authController.register
);

authRouter.post(
    "/login",
    authLimiter.loginRate,
    validate(loginSchema),
    authController.login
);

authRouter.get(
    "/get-me",
    authenticate,
    authController.getMe
);

authRouter.post(
    "/logout",
    authenticate,
    authController.logout
);

authRouter.post(
    "/verify-email",
    authLimiter.verifyOtpRate,
    validate(otpFields),
    authController.verifyEmail
);

authRouter.post(
    "/send-otp",
    authLimiter.sendOtpRate,
    validate(z.object({ email: emailSchema })),
    authController.sendOtp
);

authRouter.post(
    "/forgot-password-verify-email",
    // authLimiter.verifyOtpRate,
    validate(otpFields),
    authController.forgotPasswordVerifyEmail
);

authRouter.post(
    "/forgot-password",
    authLimiter.forgotPasswordRate,
    validate(z.object({ email: emailSchema })),
    authController.forgotPassword
);

authRouter.put(
    "/reset-password",
    // authLimiter.changePasswordRate,
    authenticateResetToken,
    validate(z.object({ password: passwordSchema })),
    authController.resetPassword
);

authRouter.get(
    "/get-reset-me",
    authenticateResetToken,
    authController.getResetUser
);

export default authRouter;