-- DropForeignKey
ALTER TABLE "Inventory" DROP CONSTRAINT "Inventory_developerId_fkey";

-- DropForeignKey
ALTER TABLE "Inventory" DROP CONSTRAINT "Inventory_projectId_fkey";

-- DropForeignKey
ALTER TABLE "Inventory" DROP CONSTRAINT "Inventory_zoneId_fkey";

-- DropForeignKey
ALTER TABLE "Lead" DROP CONSTRAINT "Lead_ownerId_fkey";

-- DropForeignKey
ALTER TABLE "Log" DROP CONSTRAINT "Log_userId_fkey";

-- DropForeignKey
ALTER TABLE "PaymentPlan" DROP CONSTRAINT "PaymentPlan_projectId_fkey";

-- DropForeignKey
ALTER TABLE "Visit" DROP CONSTRAINT "Visit_createdById_fkey";

-- DropForeignKey
ALTER TABLE "Visit" DROP CONSTRAINT "Visit_leadId_fkey";

-- AlterTable
ALTER TABLE "Inventory" ALTER COLUMN "projectId" DROP NOT NULL,
ALTER COLUMN "developerId" DROP NOT NULL,
ALTER COLUMN "zoneId" DROP NOT NULL;

-- AlterTable
ALTER TABLE "Lead" ALTER COLUMN "ownerId" DROP NOT NULL;

-- AlterTable
ALTER TABLE "Log" ALTER COLUMN "userId" DROP NOT NULL;

-- AlterTable
ALTER TABLE "PaymentPlan" ALTER COLUMN "projectId" DROP NOT NULL;

-- AlterTable
ALTER TABLE "Visit" ALTER COLUMN "leadId" DROP NOT NULL,
ALTER COLUMN "createdById" DROP NOT NULL;

-- AddForeignKey
ALTER TABLE "Lead" ADD CONSTRAINT "Lead_ownerId_fkey" FOREIGN KEY ("ownerId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Inventory" ADD CONSTRAINT "Inventory_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "Project"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Inventory" ADD CONSTRAINT "Inventory_developerId_fkey" FOREIGN KEY ("developerId") REFERENCES "Developer"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Inventory" ADD CONSTRAINT "Inventory_zoneId_fkey" FOREIGN KEY ("zoneId") REFERENCES "Zone"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PaymentPlan" ADD CONSTRAINT "PaymentPlan_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "Project"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Visit" ADD CONSTRAINT "Visit_leadId_fkey" FOREIGN KEY ("leadId") REFERENCES "Lead"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Visit" ADD CONSTRAINT "Visit_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Log" ADD CONSTRAINT "Log_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
