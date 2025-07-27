-- AlterTable
ALTER TABLE "Visit" ADD COLUMN     "projectId" TEXT;

-- AddForeignKey
ALTER TABLE "Visit" ADD CONSTRAINT "Visit_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "Project"("id") ON DELETE SET NULL ON UPDATE CASCADE;
