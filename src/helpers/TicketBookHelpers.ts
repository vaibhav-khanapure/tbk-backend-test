import { readFile } from "fs/promises";
import { fixflyTokenPath } from "../config/paths";
import { tboFlightBookAPI } from "../utils/tboFlightAPI";
import NonLCCBookings from "../database/tables/nonLCCBookingsTable";
import type { NonLCCFlightArgs, TicketsData, UnsuccessfulFlightsArgs } from "../types/TicketBookTypes";
import FareQuotes from "../database/tables/fareQuotesTable";
import createSHA256Hash from "../utils/createHash";
import UnsuccessfulFlights from "../database/tables/unsuccessfulFlightsTable";

export const handleBookResponse = async (bookResponse: any) => {
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

export const handleTicketResponse = async (ticketResponse: any, TraceId: string) => {
 let error = "";
 let response: any;

 const serverError = "Booking Failed Due To Some Technical Issues";
 const Response = ticketResponse?.Response;
 const TicketStatus = Response?.Response?.TicketStatus;

 if ([2, 3, 5]?.includes(TicketStatus)) {
  const TokenId = await readFile(fixflyTokenPath, "utf-8");

  const body = {TokenId, TraceId, EndUserIp: process.env.END_USER_IP};

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
   if (attempts < maxAttempts) {
    await new Promise(resolve => setTimeout(resolve, delay));
   };
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


export const getBookingBodyData = (data: TicketsData) => {
 const body = { ...data } as Record<string, unknown>;

 const removeKeys = ["LCCType", "wayType", "fareType", "oldPassengers", "isFLightCombo", "flightCities"];

 removeKeys?.forEach((key) => {
  if (key in body) delete body[key];
 });

 return body;
};

export const handleSaveUnsuccessfulFlights = async (Args: UnsuccessfulFlightsArgs) => {
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

export const handleSaveNonLCCFlightBooking = async (Args: NonLCCFlightArgs) => {
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