import FareQuotes from "../../database/tables/fareQuotesTable";
import UnsuccessfulFlights from "../../database/tables/unsuccessfulFlightsTable";
import type { UnsuccessfulFlightsArgs } from "../../types/TicketBookTypes";
import createSHA256Hash from "../../utils/createHash";

const handleSaveUnsuccessfulFlights = async (Args: UnsuccessfulFlightsArgs) => {
 const fareQuote = await FareQuotes.findOne({
  where: { uuid: createSHA256Hash(Args?.ResultIndex) },
  attributes: ["segments"],
 });

 try {
  await UnsuccessfulFlights.create({
   TraceId: Args?.TraceId,
   bookingAmount: Args?.bookingAmount,
   paymentMethod: Args?.paymentMethod,
   RefundCreditedDate: new Date(),
   RefundedAmount: Args?.RefundedAmount,
   RefundProcessedOn: new Date(),
   RefundStatus: "Approved",
   Segments: fareQuote?.segments || [],
   travellers: Args?.travellers || [],
   Reason: Args?.Reason || "",
   RefundedUntil: new Date(),
   Currency: Args?.Currency || "INR",
   userId: Args?.userId,
   ...(Args?.isFlightCombo ? { isFlightCombo: true } : {}),
   ...(Args?.flightCities ? { flightCities: Args?.flightCities } : {}),
  });

  return true;
 } catch (error) {
  return false;
 };
};

export default handleSaveUnsuccessfulFlights