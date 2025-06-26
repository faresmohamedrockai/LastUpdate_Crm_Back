-- AlterTable
ALTER TABLE `call` ADD COLUMN `projectId` VARCHAR(191) NULL;

-- AlterTable
ALTER TABLE `inventory` MODIFY `images` VARCHAR(191) NULL;

-- AddForeignKey
ALTER TABLE `Call` ADD CONSTRAINT `Call_projectId_fkey` FOREIGN KEY (`projectId`) REFERENCES `Project`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;
