-- CreateTable
CREATE TABLE "travellerDetails" (
    "id" TEXT NOT NULL,
    "firstName" TEXT NOT NULL,
    "lastName" TEXT NOT NULL,
    "dateOfBirth" TEXT NOT NULL,
    "nationality" TEXT NOT NULL,
    "gender" TEXT NOT NULL,
    "travelerType" TEXT NOT NULL,
    "passportNo" TEXT NOT NULL,
    "passportExpiry" TEXT NOT NULL,
    "passportissuingCountry" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "travellerDetails_pkey" PRIMARY KEY ("id")
);
