/*
  Warnings:

  - You are about to drop the column `name` on the `zone` table. All the data in the column will be lost.
  - Added the required column `nameEn` to the `Zone` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE `zone` DROP COLUMN `name`,
    ADD COLUMN `nameAr` VARCHAR(191) NULL,
    ADD COLUMN `nameEn` VARCHAR(191) NOT NULL;
