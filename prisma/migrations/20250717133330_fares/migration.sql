-- DropForeignKey
ALTER TABLE "Visit" DROP CONSTRAINT "Visit_inventoryId_fkey";

-- AlterTable
ALTER TABLE "Visit" ALTER COLUMN "inventoryId" DROP NOT NULL;

-- AddForeignKey
ALTER TABLE "Visit" ADD CONSTRAINT "Visit_inventoryId_fkey" FOREIGN KEY ("inventoryId") REFERENCES "Inventory"("id") ON DELETE SET NULL ON UPDATE CASCADE;
