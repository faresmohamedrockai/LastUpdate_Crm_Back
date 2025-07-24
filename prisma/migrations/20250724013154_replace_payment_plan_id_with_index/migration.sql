/*
  Warnings:

  - You are about to drop the column `paymentPlanId` on the `Inventory` table. All the data in the column will be lost.

*/
-- DropForeignKey
ALTER TABLE "Inventory" DROP CONSTRAINT "Inventory_paymentPlanId_fkey";

-- AlterTable
ALTER TABLE "Inventory" DROP COLUMN "paymentPlanId",
ADD COLUMN     "paymentPlanIndex" INTEGER;
