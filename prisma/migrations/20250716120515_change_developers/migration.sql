/*
  Warnings:

  - You are about to drop the column `name` on the `developer` table. All the data in the column will be lost.
  - Added the required column `nameAr` to the `Developer` table without a default value. This is not possible if the table is not empty.
  - Added the required column `nameEn` to the `Developer` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE `developer` DROP COLUMN `name`,
    ADD COLUMN `nameAr` VARCHAR(191) NOT NULL,
    ADD COLUMN `nameEn` VARCHAR(191) NOT NULL;
