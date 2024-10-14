/*
  Warnings:

  - The `TicketCRInfo` column on the `bookingDetails` table would be dropped and recreated. This will lead to data loss if there is data in the column.

*/
-- AlterTable
ALTER TABLE "bookingDetails" DROP COLUMN "TicketCRInfo",
ADD COLUMN     "TicketCRInfo" JSONB;
