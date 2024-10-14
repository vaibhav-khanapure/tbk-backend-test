/*
  Warnings:

  - You are about to drop the column `TicketCRInfo` on the `bookingDetails` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "bookingDetails" DROP COLUMN "TicketCRInfo",
ADD COLUMN     "ChangeRequestId" TEXT;

-- CreateTable
CREATE TABLE "cancelledFlights" (
    "id" TEXT NOT NULL,
    "flightData" JSONB NOT NULL,
    "cancelledDate" TIMESTAMP(3) NOT NULL,
    "CancellationCharge" TEXT NOT NULL,
    "ServiceTaxOnRAF" TEXT NOT NULL,
    "userId" TEXT NOT NULL,

    CONSTRAINT "cancelledFlights_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "cancelledFlights" ADD CONSTRAINT "cancelledFlights_userId_fkey" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
