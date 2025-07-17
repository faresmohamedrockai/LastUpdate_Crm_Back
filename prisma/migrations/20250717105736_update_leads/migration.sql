/*
  Warnings:

  - You are about to drop the `Note` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "Note" DROP CONSTRAINT "Note_leadId_fkey";

-- AlterTable
ALTER TABLE "Lead" ADD COLUMN     "notes" TEXT[];

-- DropTable
DROP TABLE "Note";
