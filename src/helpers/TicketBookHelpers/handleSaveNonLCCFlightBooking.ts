import NonLCCBookings from "../../database/tables/nonLCCBookingsTable";
import type { NonLCCFlightArgs } from "../../types/TicketBookTypes";

const handleSaveNonLCCFlightBooking = async (Args: NonLCCFlightArgs) => {
 try {
  await NonLCCBookings.create({
   userId: Args?.userId,
   bookingId: Args?.bookingId,
   TraceId: Args?.TraceId,
   PNR: Args?.PNR,
   isFlightCombo: Args?.isFlightCombo || false,
   tboAmount: Args?.tboAmount,
   tbkAmount: Args?.tbkAmount,
   bookedDate: Args?.bookedDate,
   flightStatus: Args?.flightStatus,
   paymentTransactionId: Args?.paymentTransactionId,
   paymentStatus: Args?.paymentStatus,
   bookingStatus: Args?.bookingStatus,
   Source: Args?.Source,
   bookingExpiryDate: Args?.bookingExpiryDate,
   Segments: Args?.Segments,
   Passenger: Args?.Passenger,
   flightCities: Args?.flightCities,
   isPNRCancelled: false,
   isTicketGenerated: false,
  });
  
  return true;
 } catch (error) {
  return false;
 };
};

export default handleSaveNonLCCFlightBooking;