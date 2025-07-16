/*
  Warnings:

  - You are about to drop the column `contact` on the `developer` table. All the data in the column will be lost.
  - You are about to drop the column `description` on the `developer` table. All the data in the column will be lost.
  - You are about to drop the column `website` on the `developer` table. All the data in the column will be lost.
  - Added the required column `established` to the `Developer` table without a default value. This is not possible if the table is not empty.
  - Added the required column `location` to the `Developer` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE `developer` DROP COLUMN `contact`,
    DROP COLUMN `description`,
    DROP COLUMN `website`,
    ADD COLUMN `established` VARCHAR(191) NOT NULL,
    ADD COLUMN `location` VARCHAR(191) NOT NULL;
