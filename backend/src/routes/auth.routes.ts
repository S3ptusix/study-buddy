import { Router } from "express";
import * as authController from "../controllers/auth.controllers.js";
import { validate } from "../middleware/validate.middleware.js";
import { loginSchema, registerSchema } from "../validations/auth.validation.js";
import { loginRateLimiter, registerRateLimiter } from "../middleware/rate_limiters/auth.rate-limiters.js";
import { authenticate } from "../middleware/auth.middleware.js";

const authRouter = Router();

authRouter.post(
    "/register",
    registerRateLimiter,
    validate(registerSchema),
    authController.register
);

authRouter.post(
    "/login",
    loginRateLimiter,
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

export default authRouter;