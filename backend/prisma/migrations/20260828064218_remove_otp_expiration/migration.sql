/*
  Warnings:

  - You are about to drop the column `otpExpiration` on the `users` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "users" DROP COLUMN "otpExpiration",
ADD COLUMN     "emailVerified" BOOLEAN NOT NULL DEFAULT false;
