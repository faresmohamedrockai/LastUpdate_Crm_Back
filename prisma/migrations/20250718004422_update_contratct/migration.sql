-- DropForeignKey
ALTER TABLE "Contract" DROP CONSTRAINT "Contract_createdById_fkey";

-- DropForeignKey
ALTER TABLE "Contract" DROP CONSTRAINT "Contract_inventoryId_fkey";

-- DropForeignKey
ALTER TABLE "Contract" DROP CONSTRAINT "Contract_leadId_fkey";

-- AlterTable
ALTER TABLE "Contract" ALTER COLUMN "leadId" DROP NOT NULL,
ALTER COLUMN "inventoryId" DROP NOT NULL,
ALTER COLUMN "dealValue" DROP NOT NULL,
ALTER COLUMN "contractDate" DROP NOT NULL,
ALTER COLUMN "contractDate" SET DATA TYPE TEXT,
ALTER COLUMN "createdById" DROP NOT NULL,
ALTER COLUMN "notes" DROP NOT NULL,
ALTER COLUMN "status" DROP NOT NULL;

-- AddForeignKey
ALTER TABLE "Contract" ADD CONSTRAINT "Contract_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Contract" ADD CONSTRAINT "Contract_inventoryId_fkey" FOREIGN KEY ("inventoryId") REFERENCES "Inventory"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Contract" ADD CONSTRAINT "Contract_leadId_fkey" FOREIGN KEY ("leadId") REFERENCES "Lead"("id") ON DELETE SET NULL ON UPDATE CASCADE;
