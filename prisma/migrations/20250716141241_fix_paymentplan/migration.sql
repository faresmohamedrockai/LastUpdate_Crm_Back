/*
  Warnings:

  - You are about to alter the column `schedule` on the `paymentplan` table. The data in that column could be lost. The data in that column will be cast from `VarChar(191)` to `Json`.
  - You are about to drop the column `name` on the `project` table. All the data in the column will be lost.
  - Added the required column `installmentEvery` to the `PaymentPlan` table without a default value. This is not possible if the table is not empty.
  - Added the required column `installmentPeriod` to the `PaymentPlan` table without a default value. This is not possible if the table is not empty.
  - Added the required column `nameAr` to the `Project` table without a default value. This is not possible if the table is not empty.
  - Added the required column `nameEn` to the `Project` table without a default value. This is not possible if the table is not empty.
  - Added the required column `type` to the `Project` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE `paymentplan` DROP FOREIGN KEY `PaymentPlan_projectId_fkey`;

-- DropIndex
DROP INDEX `PaymentPlan_projectId_key` ON `paymentplan`;

-- AlterTable
ALTER TABLE `paymentplan` ADD COLUMN `description` VARCHAR(191) NULL,
    ADD COLUMN `installmentEvery` INTEGER NOT NULL,
    ADD COLUMN `installmentPeriod` INTEGER NOT NULL,
    ADD COLUMN `yearsToPay` INTEGER NULL,
    MODIFY `schedule` JSON NOT NULL;

-- AlterTable
ALTER TABLE `project` DROP COLUMN `name`,
    ADD COLUMN `nameAr` VARCHAR(191) NOT NULL,
    ADD COLUMN `nameEn` VARCHAR(191) NOT NULL,
    ADD COLUMN `type` VARCHAR(191) NOT NULL;

-- AddForeignKey
ALTER TABLE `Contract` ADD CONSTRAINT `Contract_projectId_fkey` FOREIGN KEY (`projectId`) REFERENCES `Project`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;
