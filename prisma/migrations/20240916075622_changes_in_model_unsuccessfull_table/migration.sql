-- AlterTable
ALTER TABLE "cancelledFlights" ALTER COLUMN "cancelledDate" DROP NOT NULL,
ALTER COLUMN "CancellationCharge" DROP NOT NULL,
ALTER COLUMN "RefundedAmount" DROP NOT NULL;

-- CreateTable
CREATE TABLE "unsuccesfullFlights" (
    "id" TEXT NOT NULL,
    "totalAmount" TEXT,
    "bookedDate" TIMESTAMP(3),
    "flightStatus" TEXT,
    "userId" TEXT NOT NULL,
    "Origin" TEXT,
    "Destination" TEXT,
    "OriginDate" TIMESTAMP(3),
    "DestinationDate" TIMESTAMP(3),

    CONSTRAINT "unsuccesfullFlights_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "unsuccesfullFlights" ADD CONSTRAINT "unsuccesfullFlights_userId_fkey" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
