/*
  Warnings:

  - You are about to drop the column `description` on the `Inventory` table. All the data in the column will be lost.
  - You are about to drop the column `floor` on the `Inventory` table. All the data in the column will be lost.
  - You are about to drop the column `unitNumber` on the `Inventory` table. All the data in the column will be lost.
  - Added the required column `amenitiesOther` to the `Inventory` table without a default value. This is not possible if the table is not empty.
  - Added the required column `developerId` to the `Inventory` table without a default value. This is not possible if the table is not empty.
  - Added the required column `location` to the `Inventory` table without a default value. This is not possible if the table is not empty.
  - Added the required column `parking` to the `Inventory` table without a default value. This is not possible if the table is not empty.
  - Added the required column `titleAr` to the `Inventory` table without a default value. This is not possible if the table is not empty.
  - Added the required column `titleEn` to the `Inventory` table without a default value. This is not possible if the table is not empty.
  - Added the required column `type` to the `Inventory` table without a default value. This is not possible if the table is not empty.
  - Added the required column `typeOther` to the `Inventory` table without a default value. This is not possible if the table is not empty.
  - Added the required column `zoneId` to the `Inventory` table without a default value. This is not possible if the table is not empty.
  - Changed the type of `status` on the `Inventory` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.
  - Made the column `projectId` on table `Inventory` required. This step will fail if there are existing NULL values in that column.

*/
-- DropForeignKey
ALTER TABLE "Inventory" DROP CONSTRAINT "Inventory_projectId_fkey";

-- AlterTable
ALTER TABLE "Inventory" DROP COLUMN "description",
DROP COLUMN "floor",
DROP COLUMN "unitNumber",
ADD COLUMN     "amenities" TEXT[],
ADD COLUMN     "amenitiesOther" TEXT NOT NULL,
ADD COLUMN     "developerId" TEXT NOT NULL,
ADD COLUMN     "location" TEXT NOT NULL,
ADD COLUMN     "parking" TEXT NOT NULL,
ADD COLUMN     "titleAr" TEXT NOT NULL,
ADD COLUMN     "titleEn" TEXT NOT NULL,
ADD COLUMN     "type" TEXT NOT NULL,
ADD COLUMN     "typeOther" TEXT NOT NULL,
ADD COLUMN     "zoneId" TEXT NOT NULL,
DROP COLUMN "status",
ADD COLUMN     "status" TEXT NOT NULL,
ALTER COLUMN "projectId" SET NOT NULL;

-- AddForeignKey
ALTER TABLE "Inventory" ADD CONSTRAINT "Inventory_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "Project"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Inventory" ADD CONSTRAINT "Inventory_developerId_fkey" FOREIGN KEY ("developerId") REFERENCES "Developer"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Inventory" ADD CONSTRAINT "Inventory_zoneId_fkey" FOREIGN KEY ("zoneId") REFERENCES "Zone"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
