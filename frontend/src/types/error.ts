export type ErrorCode = "EMAIL_NOT_VERIFIED";

export type ApiError = {
    message: string;
    errors?: Record<string, string>;
    code?: ErrorCode,
    data?: Record<string, unknown>,
};