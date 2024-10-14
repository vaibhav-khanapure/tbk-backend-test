/*
  Warnings:

  - You are about to drop the column `created_at` on the `airportList` table. All the data in the column will be lost.
  - You are about to drop the column `updatedAt` on the `airportList` table. All the data in the column will be lost.
  - Added the required column `airportName` to the `airportList` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "airportList" DROP COLUMN "created_at",
DROP COLUMN "updatedAt",
ADD COLUMN     "airportName" TEXT NOT NULL;
