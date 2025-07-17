/*
  Warnings:

  - You are about to drop the column `inventoryId` on the `Visit` table. All the data in the column will be lost.

*/
-- DropForeignKey
ALTER TABLE "Visit" DROP CONSTRAINT "Visit_inventoryId_fkey";

-- AlterTable
ALTER TABLE "Visit" DROP COLUMN "inventoryId";
