-- DropForeignKey
ALTER TABLE "Meeting" DROP CONSTRAINT "Meeting_createdById_fkey";

-- DropForeignKey
ALTER TABLE "Meeting" DROP CONSTRAINT "Meeting_leadId_fkey";

-- AlterTable
ALTER TABLE "Meeting" ADD COLUMN     "assignedToId" TEXT,
ADD COLUMN     "client" TEXT,
ADD COLUMN     "duration" TEXT,
ADD COLUMN     "time" TEXT,
ADD COLUMN     "title" TEXT,
ADD COLUMN     "type" TEXT,
ALTER COLUMN "date" DROP NOT NULL,
ALTER COLUMN "date" SET DATA TYPE TEXT,
ALTER COLUMN "status" DROP NOT NULL,
ALTER COLUMN "leadId" DROP NOT NULL,
ALTER COLUMN "createdById" DROP NOT NULL;

-- AddForeignKey
ALTER TABLE "Meeting" ADD CONSTRAINT "Meeting_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Meeting" ADD CONSTRAINT "Meeting_assignedToId_fkey" FOREIGN KEY ("assignedToId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Meeting" ADD CONSTRAINT "Meeting_leadId_fkey" FOREIGN KEY ("leadId") REFERENCES "Lead"("id") ON DELETE SET NULL ON UPDATE CASCADE;
