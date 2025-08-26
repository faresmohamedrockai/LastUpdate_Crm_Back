-- CreateEnum
CREATE TYPE "Interest" AS ENUM ('hot', 'warm', 'under_decision');

-- CreateEnum
CREATE TYPE "Tier" AS ENUM ('bronze', 'silver', 'gold', 'platinum');

-- AlterEnum
-- This migration adds more than one value to an enum.
-- With PostgreSQL versions 11 and earlier, this is not possible
-- in a single migration. This can be worked around by creating
-- multiple migrations, each migration adding only one value to
-- the enum.


ALTER TYPE "LeadStatus" ADD VALUE 'vip';
ALTER TYPE "LeadStatus" ADD VALUE 'non_stop';

-- DropIndex
DROP INDEX "Lead_contact_key";

-- AlterTable
ALTER TABLE "Call" ADD COLUMN     "followUpDate" TEXT,
ADD COLUMN     "followUpTime" TEXT;

-- AlterTable
ALTER TABLE "Lead" ADD COLUMN     "cil" BOOLEAN DEFAULT false,
ADD COLUMN     "contacts" TEXT[],
ADD COLUMN     "description" TEXT,
ADD COLUMN     "familyName" TEXT,
ADD COLUMN     "firstConection" TIMESTAMP(3),
ADD COLUMN     "gender" TEXT,
ADD COLUMN     "interest" "Interest" NOT NULL DEFAULT 'under_decision',
ADD COLUMN     "otherProject" TEXT,
ADD COLUMN     "projectInterestId" TEXT,
ADD COLUMN     "tier" "Tier" NOT NULL DEFAULT 'bronze',
ALTER COLUMN "contact" DROP NOT NULL;

-- DropEnum
DROP TYPE "installmentPeriod";

-- AddForeignKey
ALTER TABLE "Lead" ADD CONSTRAINT "Lead_projectInterestId_fkey" FOREIGN KEY ("projectInterestId") REFERENCES "Project"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Call" ADD CONSTRAINT "Call_createdBy_fkey" FOREIGN KEY ("createdBy") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
