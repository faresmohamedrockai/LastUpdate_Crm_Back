/*
  Warnings:

  - Changed the type of `installmentPeriod` on the `PaymentPlan` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.

*/
-- CreateEnum
CREATE TYPE "InstallmentPeriod" AS ENUM ('monthly', 'quarterly', 'yearly', 'custom');

-- AlterTable
ALTER TABLE "PaymentPlan" DROP COLUMN "installmentPeriod",
ADD COLUMN     "installmentPeriod" "InstallmentPeriod" NOT NULL;
