/*
  Warnings:

  - You are about to alter the column `budget` on the `lead` table. The data in that column could be lost. The data in that column will be cast from `Double` to `VarChar(191)`.
  - Added the required column `nameAr` to the `Lead` table without a default value. This is not possible if the table is not empty.
  - Added the required column `nameEn` to the `Lead` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE `lead` ADD COLUMN `nameAr` VARCHAR(191) NOT NULL,
    ADD COLUMN `nameEn` VARCHAR(191) NOT NULL,
    MODIFY `budget` VARCHAR(191) NOT NULL;
