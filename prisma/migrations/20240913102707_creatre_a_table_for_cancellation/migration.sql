/*
  Warnings:

  - Added the required column `ChangeRequestId` to the `cancelledFlights` table without a default value. This is not possible if the table is not empty.
  - Added the required column `RefundedAmount` to the `cancelledFlights` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "cancelledFlights" ADD COLUMN     "ChangeRequestId" TEXT NOT NULL,
ADD COLUMN     "ChangeRequestStatus" TEXT,
ADD COLUMN     "CreditNoteCreatedOn" TIMESTAMP(3),
ADD COLUMN     "CreditNoteNo" TEXT,
ADD COLUMN     "KrishiKalyanCess" TEXT,
ADD COLUMN     "RefundedAmount" TEXT NOT NULL,
ADD COLUMN     "SwachhBharatCess" TEXT,
ADD COLUMN     "TicketId" TEXT,
ADD COLUMN     "TraceId" TEXT,
ADD COLUMN     "refundExpectedBy" TIMESTAMP(3),
ADD COLUMN     "refundRequestRaised" TIMESTAMP(3),
ALTER COLUMN "ServiceTaxOnRAF" DROP NOT NULL;
