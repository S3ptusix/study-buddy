import { ErrorCode } from "../types/error.js";

export class AppError extends Error {
    constructor(
        public message: string,
        public statusCode: number,
        public code?: ErrorCode,
        public data?: Record<string, unknown>
    ) {
        super(message);
        this.name = "AppError";
    }
}