-- DropForeignKey
ALTER TABLE "Client" DROP CONSTRAINT "Client_planId_fkey";

-- AlterTable
ALTER TABLE "Client" ALTER COLUMN "planId" DROP NOT NULL;

-- AddForeignKey
ALTER TABLE "Client" ADD CONSTRAINT "Client_planId_fkey" FOREIGN KEY ("planId") REFERENCES "Plan"("id") ON DELETE SET NULL ON UPDATE CASCADE;
