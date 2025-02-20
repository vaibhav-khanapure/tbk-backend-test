import { readFile } from "fs/promises";
import { fixflyTokenPath } from "../../config/paths";
import { tboFlightBookAPI } from "../../utils/tboFlightAPI";

const handleTicketResponse = async (ticketResponse: any, TraceId: string, tripIndicator?: number) => {
 let error = "";
 let response: any;

 const serverError = "Booking Failed Due To Some Technical Issues";
 const Response = ticketResponse?.Response;
 const TicketStatus = Response?.Response?.TicketStatus;

 if ([2, 3, 5]?.includes(TicketStatus)) {
  const TokenId = await readFile(fixflyTokenPath, "utf-8");

  const body = { TokenId, TraceId, EndUserIp: process.env.END_USER_IP } as Record<string, unknown>;

  if (tripIndicator) body["TripIndicator"] = tripIndicator;

  let bookingDetails = null;
  let attempts = 0;
  const maxAttempts = 5;
  const delay = 60000; // 1 minute in milliseconds

  while (attempts < maxAttempts) {
   attempts++;

   try {
    const { data } = await tboFlightBookAPI.post("/GetBookingDetails", body);

    if (data?.Response?.ResponseStatus === 1) {
     bookingDetails = data?.Response?.Response;
     break; // Exit loop on success
    };
   } catch (err) {
    error = serverError;
   };

   // Wait before next attempt, except after the last one
   if (attempts < maxAttempts) await new Promise(resolve => setTimeout(resolve, delay));
  };

  if (bookingDetails) response = bookingDetails;
  else error = serverError;

 } else if (TicketStatus !== 1) {
  error = Response?.Error?.ErrorMessage || serverError;
 } else if (Response?.Error?.ErrorCode !== 0) {
  error = Response?.Error?.ErrorMessage || serverError;
 } else if (Response?.ResponseStatus !== 1) {
  error = Response?.Error?.ErrorMessage || serverError;
 } else if (Response?.Response?.IsPriceChanged || Response?.Response?.IsTimeChanged) {
  error = serverError;
 } else {
  response = Response?.Response;
 };

 return { error, response };
};

export default handleTicketResponse;