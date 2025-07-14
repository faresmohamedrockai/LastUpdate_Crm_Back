/*
  Warnings:

  - You are about to drop the column `amenities` on the `inventory` table. All the data in the column will be lost.
  - You are about to drop the column `geo` on the `inventory` table. All the data in the column will be lost.
  - You are about to drop the column `location` on the `inventory` table. All the data in the column will be lost.
  - You are about to drop the column `parking` on the `inventory` table. All the data in the column will be lost.
  - You are about to drop the column `type` on the `inventory` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE `developer` ADD COLUMN `contact` VARCHAR(191) NULL,
    ADD COLUMN `description` VARCHAR(191) NULL,
    ADD COLUMN `logo` VARCHAR(191) NULL,
    ADD COLUMN `website` VARCHAR(191) NULL;

-- AlterTable
ALTER TABLE `inventory` DROP COLUMN `amenities`,
    DROP COLUMN `geo`,
    DROP COLUMN `location`,
    DROP COLUMN `parking`,
    DROP COLUMN `type`,
    ADD COLUMN `description` VARCHAR(191) NULL,
    ADD COLUMN `floor` INTEGER NULL,
    ADD COLUMN `paymentPlanId` VARCHAR(191) NULL,
    ADD COLUMN `status` ENUM('available', 'reserved', 'sold', 'under_construction') NOT NULL DEFAULT 'available',
    ADD COLUMN `unitNumber` VARCHAR(191) NULL;

-- AddForeignKey
ALTER TABLE `Inventory` ADD CONSTRAINT `Inventory_paymentPlanId_fkey` FOREIGN KEY (`paymentPlanId`) REFERENCES `PaymentPlan`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;
