-- AlterTable
ALTER TABLE "travellerDetails" ADD COLUMN     "userId" TEXT;

-- AddForeignKey
ALTER TABLE "travellerDetails" ADD CONSTRAINT "travellerDetails_userId_fkey" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE SET NULL ON UPDATE CASCADE;
