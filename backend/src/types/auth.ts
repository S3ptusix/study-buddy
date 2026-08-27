export type UserRole = "STUDENT" | "TEACHER" | "ADMIN";

export interface AuthUser {
    sub: string;
    role: UserRole;
}