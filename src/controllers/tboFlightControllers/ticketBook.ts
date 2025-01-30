import type { NextFunction, Request, Response } from "express";
import Users from "../../database/tables/usersTable";
import { readFile } from "fs/promises";
import { fixflyTokenPath } from "../../config/paths";
import { tboFlightBookAPI } from "../../utils/tboFlightAPI";
import type { Passenger } from "../../types/BookedFlights";
import Invoices from "../../database/tables/invoicesTable";
import Discounts from "../../database/tables/discountsTable";
import FlightBookings from "../../database/tables/flightBookingsTable";

interface TicketsData {
 LCCType: "LCC" | "NONLCC";
 wayType: "one-way" | "return";
 fareType: string;
 difference: number;
 tboAmount: number;
 tbkAmount: number;
 ResultIndex: string;
 Passengers: Passenger[];
 oldPassengers: Passenger[];
 TokenId: string;
 EndUserIp: string;
 TraceId: string;
 isFlightCombo: boolean;
 flightCities: {origin: string; destination: string};
};

interface body {
 ticketsData: TicketsData[];
 isFlightCombo: boolean;
 TraceId: string;
};

const handleTicketResponse = (ticketResponse: any) => {
 let error = "";
 let response: any;

 const serverError = "Booking Failed Due To Some Technical Issues";

 if ([2, 3, 5]?.includes(ticketResponse?.Response?.ResponseStatus)) {
  // We need to check getBookingDetails and then we will check if booking is success, then the ticket is booked
  // In case of no data in get Booking Details every minute check getBookingDetails for 5 minutes, till then show spinner on frontend

  // After 5 minutes send a mail to tbk admin for the failed booking with TraceId and customer Name annd userId
  // save in failed or unsuccessful booking
 } else if (ticketResponse?.Response?.ResponseStatus !== 1) {
  error = ticketResponse?.Response?.Error?.ErrorMessage || serverError;
 } else if (ticketResponse?.Response?.Error?.ErrorCode !== 0) {
  error = ticketResponse?.Response?.Error?.ErrorMessage || serverError;
 } else if (ticketResponse?.Response?.Response?.IsPriceChanged || ticketResponse?.Response?.Response?.IsTimeChanged) {
  error = serverError;
 } else {
  response = ticketResponse?.Response?.Response;
 };

 return { error, response };
};

const ticketBook = async (req: Request, res: Response, next: NextFunction) => {
 let oneWayFlightResponse: any;
 let returnFlightResponse: any;
 let oneWayFlightError = "";
 let returnFlightError = "";

 try {
  const userId = res.locals?.user?.id;
  const name = res.locals?.user?.name;

  const {ticketsData, TraceId} = req.body as body;

  if (!TraceId) return res.status(400).json({ message: "TraceId is required" });

  if (!ticketsData || !Array.isArray(ticketsData) || (Array?.isArray(ticketsData) && !ticketsData?.length)) {
   return res.status(400).json({ message: "Ticket data is required" });
  };

  if (ticketsData?.length > 2) {
   return res.status(400).json({ message: "Only 2 tickets can be booked at a time" });
  };

  if (!["LCC", "NONLCC"]?.includes(ticketsData?.[0]?.LCCType)) {
   return res.status(400).json({message: "Invalid LCC type"});
  };

  if (ticketsData?.length > 1 && !["LCC", "NONLCC"]?.includes(ticketsData?.[1]?.LCCType)) {
   return res.status(400).json({message: "Invalid LCC type"});
  };

  const oneWayFlight = ticketsData?.find((ticket: TicketsData) => ticket?.wayType === "one-way");
  const returnFlight = ticketsData?.find((ticket: TicketsData) => ticket?.wayType === "return");

  if (!oneWayFlight && !returnFlight) {
   return res.status(400).json({ message: "Origin or Destination flight is required" });
  };

  const [token, user, invoice, discounts] = await Promise.all([
   readFile(fixflyTokenPath, "utf-8"),
   Users.findOne({ where: { id: userId } }),
   Invoices.findOne({ limit: 1, order: [["createdAt", "DESC"]] }),
   Discounts.findAll({ where: { userId }, attributes: ["fareType", "discount", "markup", "updatedBy"] }),
  ]);

  const getDiscountMarkup = (fareType: string) => {
   const discount = discounts?.find((discount) => discount?.fareType === fareType);
   return {discount: discount?.discount || 0, markup: discount?.markup || 0, updatedBy: discount?.updatedBy || null};
  };

  if (!user) return res.status(404).json({ message: "User not found" });

  if (!user?.active || user?.disableTicket) {
   return res.status(400).json({ message: "You don't have permission for booking" });
  };

  if (oneWayFlight) {
   try {
    oneWayFlight.TokenId = token;
    oneWayFlight.EndUserIp = process.env.END_USER_IP as string;
    oneWayFlight.TraceId = TraceId;

    if (oneWayFlight?.LCCType === "LCC") {
     const { data: onewWayFlightTicketResponse } = await tboFlightBookAPI.post("/Ticket", oneWayFlight);
     const { error, response } = handleTicketResponse(onewWayFlightTicketResponse);

     if (error) oneWayFlightError = error;
     if (response) oneWayFlightResponse = response;
    } else if (oneWayFlight?.LCCType === "NONLCC") {
     const { data: onewWayFlightBookResponse } = await tboFlightBookAPI.post("/Book", oneWayFlight);
     const { error, response } = handleTicketResponse(onewWayFlightBookResponse);

     if (error) oneWayFlightError = error;
     if (response) {
      const Response = onewWayFlightBookResponse?.Response?.Response;
      const { PNR, BookingId, FlightItinerary: { Passenger } } = Response;

      const passports = Passenger?.map((passenger: Passenger) => {
       const { PaxId, PassportNo, PassportExpiry, DateOfBirth } = passenger;

       const Passenger = { PaxId, DateOfBirth } as Record<string, unknown>;
       if (PassportNo) Passenger["PassportNo"] = PassportNo;
       if (PassportExpiry) Passenger["PassportExpiry"] = PassportExpiry;
       return Passenger;
      });

     const data = { TraceId, PNR, BookingId, Passport: passports } as Record<string, string>;

     data.TokenId = token;
     data.EndUserIp = process.env.END_USER_IP as string;
     data.TraceId = TraceId;

     const { data: onewWayFlightTicketResponse } = await tboFlightBookAPI.post("/Ticket", data);
     const { error, response } = handleTicketResponse(onewWayFlightTicketResponse);

     if (error) oneWayFlightError = error;
     if (response) oneWayFlightResponse = response;
    };
   };
   } catch (error) {
    
   };
  }; // One way End

  // Booking for return flight
  if (returnFlight) {
   returnFlight.TokenId = token;
   returnFlight.EndUserIp = process.env.END_USER_IP as string;
   returnFlight.TraceId = TraceId;

   if (returnFlight?.LCCType === "LCC") {
    const { data: returnFlightTicketResponse } = await tboFlightBookAPI.post("/Ticket", returnFlight);
    const { error, response } = handleTicketResponse(returnFlightTicketResponse);

    if (error) returnFlightError = error;
    if (response) returnFlightResponse = response;
   } else if (returnFlight?.LCCType === "NONLCC") {
    const { data: returnFlightBookResponse } = await tboFlightBookAPI.post("/Book", returnFlight);
    const { error, response } = handleTicketResponse(returnFlightBookResponse);

    if (error) returnFlightError = error;
    if (response) {
     const Response = returnFlightBookResponse?.Response?.Response;
     const { PNR, BookingId, FlightItinerary: { Passenger } } = Response;

     const passports = Passenger?.map((passenger: Passenger) => {
      const { PaxId, PassportNo, PassportExpiry, DateOfBirth } = passenger;
      const Passenger = { PaxId, DateOfBirth } as Record<string, unknown>;

      if (PassportNo) Passenger["PassportNo"] = PassportNo;
      if (PassportExpiry) Passenger["PassportExpiry"] = PassportExpiry;
      return Passenger;
     });

     const data = { TraceId, PNR, BookingId, Passport: passports } as Record<string, string>;
     data.TokenId = token;
     data.EndUserIp = process.env.END_USER_IP as string;
     data.TraceId = TraceId;

     const { data: returnFlightTicketResponse } = await tboFlightBookAPI.post("/Ticket", data);
     const { error, response } = handleTicketResponse(returnFlightTicketResponse);

     if (error) returnFlightError = error;
     if (response) returnFlightResponse = response;
    };
   };
  };

  // In case of success
  if (oneWayFlightResponse || returnFlightResponse) {
   let invoiceNo: string | number = "";

   if (!invoice) {
    invoiceNo  = "ID/2425/1";
   } else {
    invoiceNo = invoice?.dataValues?.InvoiceNo?.split("/")?.[2];
   };

   const InvoiceId = !invoice ? 1 : Number(invoice?.InvoiceId) + 1;
   const InvoiceNo = !invoice? invoiceNo : `ID/2425/${Number(invoiceNo) + 1}`;

   const successBookings = [];
   let tboAmount = 0;

   if (oneWayFlightResponse) {
    tboAmount += oneWayFlightResponse?.FlightItinerary?.Fare?.OfferedFare || 0;
    const {discount, markup, updatedBy} = getDiscountMarkup(oneWayFlight?.fareType as string);
    const publishedFare = oneWayFlightResponse?.FlightItinerary?.Fare?.PublishedFare || 0;
    const tbkAmount = publishedFare + markup - discount + (oneWayFlight?.difference || 0);

    successBookings.push({
     tboAmount: oneWayFlightResponse?.FlightItinerary?.Fare?.OfferedFare,
     tbkAmount,
     TraceId,
     InvoiceNo,
     InvoiceId,
     Passenger: oneWayFlight?.oldPassengers ? oneWayFlight?.oldPassengers : oneWayFlightResponse?.FlightItinerary?.Passenger,
     tboPassenger: oneWayFlightResponse?.FlightItinerary?.Passenger,
     Segments: oneWayFlightResponse?.FlightItinerary?.Segments,
     bookingId: oneWayFlightResponse?.FlightItinerary?.BookingId,
     PNR: oneWayFlightResponse?.FlightItinerary?.PNR,
     bookedDate: oneWayFlightResponse?.FlightItinerary?.InvoiceCreatedOn || new Date(),
     IsLCC: oneWayFlightResponse?.FlightItinerary?.IsLCC,
     flightStatus: oneWayFlightResponse?.FlightItinerary?.Segments?.[0]?.FlightStatus,
     fareType: oneWayFlight?.fareType as string,
     userId,
     discount,
     markup,
     discountUpdatedByStaffId: updatedBy as number,
     ...(oneWayFlight?.isFlightCombo ? {isFlightCombo: true} : {isFlightCombo: false}),
     ...(oneWayFlight?.flightCities ? {flightCities: oneWayFlight?.flightCities} : {}),
    });
   };

   if (returnFlightResponse) {
    tboAmount += returnFlightResponse?.FlightItinerary?.Fare?.OfferedFare || 0;
    const {discount, markup, updatedBy} = getDiscountMarkup(returnFlight?.fareType as string);
    const publishedFare = returnFlightResponse?.FlightItinerary?.Fare?.PublishedFare || 0;
    const tbkAmount = publishedFare + markup - discount + (returnFlight?.difference || 0);

    successBookings.push({
     tboAmount: returnFlightResponse?.FlightItinerary?.Fare?.OfferedFare,
     tbkAmount,
     TraceId,
     InvoiceNo,
     InvoiceId,
     Passenger: returnFlight?.oldPassengers ? returnFlight?.oldPassengers : returnFlightResponse?.FlightItinerary?.Passenger,
     tboPassenger: returnFlightResponse?.FlightItinerary?.Passenger,
     Segments: returnFlightResponse?.FlightItinerary?.Segments,
     bookingId: returnFlightResponse?.FlightItinerary?.BookingId,
     PNR: returnFlightResponse?.FlightItinerary?.PNR,
     bookedDate: returnFlightResponse?.FlightItinerary?.InvoiceCreatedOn || new Date(),
     IsLCC: returnFlightResponse?.FlightItinerary?.IsLCC,
     flightStatus: returnFlightResponse?.FlightItinerary?.Segments?.[0]?.FlightStatus,
     fareType: returnFlight?.fareType as string,
     userId,
     discountUpdatedByStaffId: updatedBy as number,
     discount,
     isFlightCombo: false,
     markup,
    });
   };

   const tbkAmount = Number(successBookings?.reduce((acc, defVal) => acc + Number(defVal?.tbkAmount), 0)).toFixed(2);

   const leadPax = successBookings?.[0]?.Passenger?.find((traveller: Record<string, unknown>) => traveller?.IsLeadPax);
   const totalPassengers = successBookings?.[0]?.Passenger?.length as number;

   await FlightBookings.bulkCreate(successBookings);
  };

  const responseData = {} as Record<string, unknown>;

  if (oneWayFlightError) responseData["oneWayError"] = oneWayFlightError;
  if (returnFlightError) responseData["returnError"] = returnFlightError;
  if (oneWayFlightResponse) responseData["oneWayFlightResponse"] = oneWayFlightResponse;
  if (returnFlightResponse) responseData["returnFlightResponse"] = returnFlightResponse;

  return res.status(200).json(responseData);
 } catch (error) {
  next(error);
 };
};

export default ticketBook;