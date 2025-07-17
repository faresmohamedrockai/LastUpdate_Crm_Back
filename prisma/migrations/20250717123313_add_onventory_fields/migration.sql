/*
  Warnings:

  - You are about to drop the column `outcome` on the `Visit` table. All the data in the column will be lost.
  - Added the required column `createdById` to the `Visit` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Visit" DROP COLUMN "outcome",
ADD COLUMN     "createdById" TEXT NOT NULL,
ADD COLUMN     "objections" TEXT;

-- AddForeignKey
ALTER TABLE "Visit" ADD CONSTRAINT "Visit_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
