/*
  Warnings:

  - The `TicketId` column on the `cancelledFlights` table would be dropped and recreated. This will lead to data loss if there is data in the column.

*/
-- AlterTable
ALTER TABLE "cancelledFlights" DROP COLUMN "TicketId",
ADD COLUMN     "TicketId" JSONB;
