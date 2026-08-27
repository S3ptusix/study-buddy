

import { prisma } from "../lib/prisma.js";


export function findByEmail(email: string) {
    return prisma.user.findUnique({
        where: { email }
    });
}
export function findByUsername(username: string) {
    return prisma.user.findUnique({
        where: { username }
    });
}