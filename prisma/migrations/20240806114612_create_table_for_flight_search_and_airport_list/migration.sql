-- CreateTable
CREATE TABLE "searchFlight" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "FlightFrom" TEXT NOT NULL,
    "FlightTo" TEXT NOT NULL,
    "DepartureDate" TIMESTAMP(3) NOT NULL,
    "ReturnDate" TIMESTAMP(3) NOT NULL,
    "travelClass" TEXT NOT NULL,
    "TravelerNumber" INTEGER NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "searchFlight_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "airportList" (
    "id" TEXT NOT NULL,
    "cityName" TEXT NOT NULL,
    "cityCode" TEXT NOT NULL,
    "countryCode" TEXT NOT NULL,
    "airportCode" TEXT NOT NULL,
    "countryName" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "airportList_pkey" PRIMARY KEY ("id")
);
