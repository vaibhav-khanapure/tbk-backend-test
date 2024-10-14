-- CreateTable
CREATE TABLE "bookingDetails" (
    "id" TEXT NOT NULL,
    "bookingId" TEXT NOT NULL,
    "TraceId" TEXT NOT NULL,
    "PNR" TEXT NOT NULL,
    "totalAmount" TEXT NOT NULL,
    "InvoiceAmount" TEXT NOT NULL,
    "bookedDate" TIMESTAMP(3) NOT NULL,
    "InvoiceNo" TEXT NOT NULL,
    "InvoiceId" TEXT NOT NULL,
    "IsLCC" BOOLEAN NOT NULL,
    "Segments" JSONB NOT NULL,
    "Passenger" JSONB NOT NULL,
    "userId" TEXT NOT NULL,

    CONSTRAINT "bookingDetails_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "bookingDetails" ADD CONSTRAINT "bookingDetails_userId_fkey" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
