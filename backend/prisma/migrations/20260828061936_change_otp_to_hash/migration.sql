/*
  Warnings:

  - You are about to drop the column `otp` on the `users` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "users" DROP COLUMN "otp",
ADD COLUMN     "otpHash" TEXT;
