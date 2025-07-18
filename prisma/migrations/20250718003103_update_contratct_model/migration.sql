/*
  Warnings:

  - You are about to drop the column `projectId` on the `Contract` table. All the data in the column will be lost.
  - Made the column `inventoryId` on table `Contract` required. This step will fail if there are existing NULL values in that column.
  - Changed the type of `status` on the `Contract` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.
  - Made the column `notes` on table `Contract` required. This step will fail if there are existing NULL values in that column.

*/
-- CreateEnum
CREATE TYPE "ContractStatus" AS ENUM ('Pending', 'Signed', 'Cancelled');

-- DropForeignKey
ALTER TABLE "Contract" DROP CONSTRAINT "Contract_inventoryId_fkey";

-- DropForeignKey
ALTER TABLE "Contract" DROP CONSTRAINT "Contract_projectId_fkey";

-- AlterTable
ALTER TABLE "Contract" DROP COLUMN "projectId",
ALTER COLUMN "inventoryId" SET NOT NULL,
DROP COLUMN "status",
ADD COLUMN     "status" "ContractStatus" NOT NULL,
ALTER COLUMN "notes" SET NOT NULL;

-- AddForeignKey
ALTER TABLE "Contract" ADD CONSTRAINT "Contract_inventoryId_fkey" FOREIGN KEY ("inventoryId") REFERENCES "Inventory"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
