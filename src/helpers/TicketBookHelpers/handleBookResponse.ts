import { readFile } from "fs/promises";
import { fixflyTokenPath } from "../../config/paths";
import { tboFlightBookAPI } from "../../utils/tboFlightAPI";
import NonLCCBookings from "../../database/tables/nonLCCBookingsTable";

const handleBookResponse = async (bookResponse: any) => {
 let error = "";
 let response: any;

 const serverError = "Booking Failed Due To Some Technical Issues";
 const Response = bookResponse?.Response;

 if (Response?.Error?.ErrorCode !== 0) {
  error = Response?.Error?.ErrorMessage || serverError;
 } else if (Response?.ResponseStatus !== 1) {
  error = Response?.Error?.ErrorMessage || serverError;
 } else if (Response?.Response?.IsPriceChanged || Response?.Response?.IsTimeChanged) {
  error = serverError;

  const BookingId = Response?.Response?.BookingId || Response?.Response?.FlightItinerary?.BookingId;
  const Source = Response?.Response?.FlightItinerary?.Source;

  const TokenId = await readFile(fixflyTokenPath, "utf-8");
  const cancelBookingData = { BookingId, Source, TokenId, EndUserIp: process.env.END_USER_IP };

  if (BookingId) {
   const { data } = await tboFlightBookAPI.post("/ReleasePNRRequest", cancelBookingData);

   if (data?.Response?.ResponseStatus === 1) {
    await NonLCCBookings.update({ isPNRCancelled: true }, { where: { bookingId: BookingId } });
   };
  };
 } else {
  response = Response?.Response;
 };

 return { error, response };
};

export default handleBookResponse;