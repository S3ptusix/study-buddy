-- AlterTable
ALTER TABLE "users" ADD COLUMN     "otp" INTEGER,
ADD COLUMN     "otpExpiration" TIMESTAMP(3);
