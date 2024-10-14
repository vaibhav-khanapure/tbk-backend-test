-- AlterTable
ALTER TABLE "travellerDetails" ALTER COLUMN "passportNo" DROP NOT NULL,
ALTER COLUMN "passportExpiry" DROP NOT NULL,
ALTER COLUMN "passportissuingCountry" DROP NOT NULL;
