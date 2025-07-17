/*
  Warnings:

  - You are about to drop the column `name` on the `Lead` table. All the data in the column will be lost.
  - You are about to drop the column `notes` on the `Lead` table. All the data in the column will be lost.

*/
-- AlterEnum
-- This migration adds more than one value to an enum.
-- With PostgreSQL versions 11 and earlier, this is not possible
-- in a single migration. This can be worked around by creating
-- multiple migrations, each migration adding only one value to
-- the enum.


ALTER TYPE "LeadStatus" ADD VALUE 'closed_deal';
ALTER TYPE "LeadStatus" ADD VALUE 'no_answer';
ALTER TYPE "LeadStatus" ADD VALUE 'not_intersted_now';

-- AlterTable
ALTER TABLE "Lead" DROP COLUMN "name",
DROP COLUMN "notes",
ADD COLUMN     "email" TEXT,
ALTER COLUMN "nameAr" DROP NOT NULL,
ALTER COLUMN "nameEn" DROP NOT NULL;

-- AlterTable
ALTER TABLE "Visit" ADD COLUMN     "outcome" TEXT,
ALTER COLUMN "date" DROP NOT NULL,
ALTER COLUMN "date" SET DATA TYPE TEXT,
ALTER COLUMN "status" DROP NOT NULL;

-- CreateTable
CREATE TABLE "Note" (
    "id" TEXT NOT NULL,
    "leadId" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdBy" TEXT NOT NULL,

    CONSTRAINT "Note_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "Note" ADD CONSTRAINT "Note_leadId_fkey" FOREIGN KEY ("leadId") REFERENCES "Lead"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
