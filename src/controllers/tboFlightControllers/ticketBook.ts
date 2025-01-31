import type {NextFunction, Request, Response} from "express";
import Users from "../../database/tables/usersTable";
import {readFile} from "fs/promises";
import {fixflyTokenPath} from "../../config/paths";
import {tboFlightBookAPI} from "../../utils/tboFlightAPI";
import type {Passenger} from "../../types/BookedFlights";
import Invoices from "../../database/tables/invoicesTable";
import Discounts from "../../database/tables/discountsTable";
import FlightBookings, {type FlightBookingTypes} from "../../database/tables/flightBookingsTable";
import generateTransactionId from "../../utils/generateTransactionId";
import dayjs from "dayjs";
import Ledgers, {type LedgerType} from "../../database/tables/ledgerTable";
import FareQuotes from "../../database/tables/fareQuotesTable";
import createSHA256Hash from "../../utils/createHash";
import { calculateBaggageTotalPrice, calculateMealsTotalPrice, calculateSeatsTotalPrice } from "../../utils/calculateSSRAmounts";
// Ticket Status is Wrongly being checked - TicketStatus ******************************************************************
// FareType as "PUB" in response
// We need to check getBookingDetails and then we will check if booking is success, then the ticket is booked
  // In case of no data in get Booking Details every minute check getBookingDetails for 5 minutes, till then show spinner on frontend

  // After 5 minutes send a mail to tbk admin for the failed booking with TraceId and customer Name annd userId
  // save in failed or unsuccessful booking

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

const handleBookResponse = async (bookResponse: any) => {
 let error = "";
 let response: any;

 const serverError = "Booking Failed Due To Some Technical Issues";
 const Response = bookResponse?.Response;

  if (Response?.ResponseStatus !== 1) {
  error = Response?.Error?.ErrorMessage || serverError;
 } else if (Response?.Error?.ErrorCode !== 0) {
  error = Response?.Error?.ErrorMessage || serverError;
 } else if (Response?.Response?.IsPriceChanged ||Response?.Response?.IsTimeChanged) {
  error = serverError;

  const BookingId = Response?.Response?.BookingId || Response?.Response?.FlightItinerary?.BookingId;
  const Source = Response?.Response?.FlightItinerary?.Source;

  const TokenId = await readFile(fixflyTokenPath, "utf-8");
  const cancelBookingData = {BookingId, Source, TokenId, EndUserIp: process.env.END_USER_IP};

  const {data} = await tboFlightBookAPI.post("/ReleasePNRRequest", cancelBookingData);

  if (data?.Response?.ResponseStatus !== 1) {
   // next process here
  };

 } else {
  response = Response?.Response;
 };

 return {error, response};
};

const handleTicketResponse = (ticketResponse: any) => {
 let error = "";
 let response: any;

 const serverError = "Booking Failed Due To Some Technical Issues";
 const Response = ticketResponse?.Response;

 if (Response?.ResponseStatus !== 1) {
  error = Response?.Error?.ErrorMessage || serverError;
 } else if (ticketResponse?.Response?.Error?.ErrorCode !== 0) {
  error = Response?.Error?.ErrorMessage || serverError;
 } else if (Response?.Response?.IsPriceChanged || Response?.Response?.IsTimeChanged) {
  error = serverError;
 } else {
  response = Response?.Response;
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

  const {ticketsData, TraceId} = req.body as body;

  if (!TraceId) return res.status(400).json({ message: "TraceId is required" });

  if (!ticketsData || !Array.isArray(ticketsData) || (Array?.isArray(ticketsData) && !ticketsData?.length)) {
   return res.status(400).json({ message: "Ticket data is required" });
  };

  if (ticketsData?.length > 2) {
   return res.status(400).json({ message: "Maximum 2 tickets can be booked at a time" });
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

  let totalOriginBookingAmount = 0;
  let totalDestinationBookingAmount = 0;

  // Calculate total price for one way flight
  if (oneWayFlight) {
   const fare = await FareQuotes.findOne({ where: { uuid: createSHA256Hash(oneWayFlight?.ResultIndex) } });

   if (!fare) {
    return res.status(404).json({ message: "Booking failed Due to some Technical Issues" });
   };

   let publishedFare = Number(fare?.oldPublishedFare);

   if (fare?.isPriceChanged && Number(fare?.newPublishedFare) > publishedFare) {
    publishedFare = Number(fare?.newPublishedFare);
   };

   let ssrAmount = 0;
   const Passengers = oneWayFlight?.Passengers;

   const seats = Passengers?.map((passenger) => passenger?.SeatDynamic);
   const meals = Passengers?.map((passenger) => passenger?.MealDynamic);
   const baggage = Passengers?.map((passenger) => passenger?.Baggage);

   if (seats) ssrAmount += calculateSeatsTotalPrice(seats?.flat(10));
   if (meals) ssrAmount += calculateMealsTotalPrice(meals?.flat(10));
   if (baggage) ssrAmount += calculateBaggageTotalPrice(baggage?.flat(10));

   totalOriginBookingAmount += (publishedFare + ssrAmount);
  };

  if (returnFlight) {
   const fare = await FareQuotes.findOne({ where: { uuid: createSHA256Hash(returnFlight?.ResultIndex) } });

   if (!fare) {
    return res.status(404).json({ message: "Booking failed Due to some Technical Issues" });
   };
 
   let publishedFare = Number(fare?.oldPublishedFare);

   if (fare?.isPriceChanged && Number(fare?.newPublishedFare) > publishedFare) {
    publishedFare = Number(fare?.newPublishedFare);
   };

   let ssrAmount = 0;
   const Passengers = returnFlight?.Passengers;

   const seats = Passengers?.map((passenger) => passenger?.SeatDynamic);
   const meals = Passengers?.map((passenger) => passenger?.MealDynamic);
   const baggage = Passengers?.map((passenger) => passenger?.Baggage);

   if (seats) ssrAmount += calculateSeatsTotalPrice(seats?.flat(10));
   if (meals) ssrAmount += calculateMealsTotalPrice(meals?.flat(10));
   if (baggage) ssrAmount += calculateBaggageTotalPrice(baggage?.flat(10));

   totalDestinationBookingAmount += (publishedFare + ssrAmount);
  };

  const [token, user, invoice, discounts] = await Promise.all([
   readFile(fixflyTokenPath, "utf-8"),
   Users.findOne({ where: { id: userId } }),
   Invoices.findOne({ limit: 1, order: [["createdAt", "DESC"]] }),
   Discounts.findAll({ where: { userId }, attributes: ["fareType", "discount", "markup", "updatedBy"] }),
  ]);

  if (!user) return res.status(404).json({ message: "User not found" });
 
  if (!user?.active || user?.disableTicket) {
   return res.status(400).json({ message: "You don't have permission for booking" });
  };

  const getDiscountMarkup = (fareType: string) => {
   const discount = discounts?.find((discount) => discount?.fareType === fareType);
   return {discount: discount?.discount || 0, markup: discount?.markup || 0, updatedBy: discount?.updatedBy || null};
  };

  // check if TBK Credits suffiecient
  const getTotalBookingAmount = () => {
   let total = 0;
   let oneWayFlightTotal = 0;
   let returnFlightTotal = 0;

   if (oneWayFlight) {
    const {discount, markup} = getDiscountMarkup(oneWayFlight?.fareType);
    oneWayFlightTotal = (totalOriginBookingAmount + markup - discount);
   };

   if (returnFlight) {
    const {discount, markup} = getDiscountMarkup(returnFlight?.fareType);
    returnFlightTotal= (totalDestinationBookingAmount + markup - discount);
   };

   total = oneWayFlightTotal + returnFlightTotal;

    console.log({total, oneWayFlightTotal, returnFlightTotal});

   return Number(total);
  };

  const totalBookingAmount = getTotalBookingAmount();

  console.log("TOATL BOOKING AMOUNT", totalBookingAmount, {totalOriginBookingAmount, totalDestinationBookingAmount});

  if (totalBookingAmount > Number(user?.tbkCredits)) {
   return res.status(400).json({ message: "Insufficient TBK Credits to book flight" });
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
     const { error, response } = await handleBookResponse(onewWayFlightBookResponse);

     if (error) oneWayFlightError = error;
     if (response) {
      const Response = onewWayFlightBookResponse?.Response?.Response;
      const {PNR, BookingId, FlightItinerary: { Passenger }} = Response;

      const passports = Passenger?.map((passenger: Passenger) => {
       const {PaxId, PassportNo, PassportExpiry, DateOfBirth} = passenger;

       const Passenger = { PaxId, DateOfBirth } as Record<string, unknown>;
       if (PassportNo) Passenger["PassportNo"] = PassportNo;
       if (PassportExpiry) Passenger["PassportExpiry"] = PassportExpiry;
       return Passenger;
      });

      // WHat if ticket fails we need to pass releasePNRCancellation

      const data = {TraceId, PNR, BookingId, Passport: passports} as Record<string, string>;

      data.TokenId = token;
      data.EndUserIp = process.env.END_USER_IP as string;
      data.TraceId = TraceId;

      const { data: onewWayFlightTicketResponse } = await tboFlightBookAPI.post("/Ticket", data);
      const { error, response } = handleTicketResponse(onewWayFlightTicketResponse);

      if (error) oneWayFlightError = error;
      if (response) oneWayFlightResponse = response;
     };
    };
   } catch (error: any) {
    const err = error?.data?.response?.message || error?.message || "Booking failed Due to some Technical Issues";
    oneWayFlightError = err;
   };
  }; // One way End

  // Booking for return flight
  if (returnFlight && !oneWayFlightError) {
   try {
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
   } catch (error: any) {
    const err = error?.data?.response?.message || error?.message || "Booking failed Due to some Technical Issues";
    oneWayFlightError = err;
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

   const successBookings = [] as FlightBookingTypes[];
   let tboAmount = 0;
   let tbkAmount = 0;

   if (oneWayFlightResponse) {
    tboAmount += oneWayFlightResponse?.FlightItinerary?.Fare?.OfferedFare || 0;
    const {discount, markup, updatedBy} = getDiscountMarkup(oneWayFlight?.fareType as string);

    const publishedFare = oneWayFlightResponse?.FlightItinerary?.Fare?.PublishedFare || 0;
    tbkAmount += publishedFare + markup - discount + (oneWayFlight?.difference || 0);

    successBookings.push({
     tboAmount: oneWayFlightResponse?.FlightItinerary?.Fare?.OfferedFare,
     tbkAmount: publishedFare + markup - discount + (oneWayFlight?.difference || 0),
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
     isFlightCombo: oneWayFlight?.isFlightCombo || false,
     ...(oneWayFlight?.flightCities ? {flightCities: oneWayFlight?.flightCities} : {}),
    });
   };

   if (returnFlightResponse) {
    tboAmount += returnFlightResponse?.FlightItinerary?.Fare?.OfferedFare || 0;
    const {discount, markup, updatedBy} = getDiscountMarkup(returnFlight?.fareType as string);

    const publishedFare = returnFlightResponse?.FlightItinerary?.Fare?.PublishedFare || 0;
    tbkAmount += publishedFare + markup - discount + (returnFlight?.difference || 0);

    successBookings.push({
     tboAmount: returnFlightResponse?.FlightItinerary?.Fare?.OfferedFare,
     tbkAmount: publishedFare + markup - discount + (returnFlight?.difference || 0),
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

   // getting ledgers
   const getLedgers = () => {
    const ledgers = successBookings?.map((booking, index) => {
     const segments = booking?.Segments;

     const DepTime = segments?.[0]?.Origin?.DepTime;
     const AirlineCode = segments?.[0]?.Airline?.AirlineCode;
     const FlightNumber = segments?.[0]?.Airline?.FlightNumber;

     const leadPax = booking?.Passenger?.find(passenger => passenger?.IsLeadPax);

     const Title = leadPax?.Title;
     const FirstName = leadPax?.FirstName;
     const LastName = leadPax?.LastName;

     const totalPassengers = booking?.Passenger?.length;

     const getCities = () => {
      const origin = segments?.[0]?.Origin?.Airport?.CityName;

      if (booking?.isFlightCombo) {
       const dest = segments?.find(segment => segment?.Origin?.Airport?.CityCode === booking?.flightCities?.destination);
       const destination = dest?.Origin?.Airport?.CityName;

       return `${origin} → ${destination} → ${origin}`;
      };

      const destination = segments?.[segments?.length - 1]?.Destination?.Airport?.CityName;
      return `${origin} → ${destination}`;
     };

     const pax = `${Title} ${FirstName} ${LastName}${totalPassengers > 1 ? ` + ${Number(totalPassengers) - 1}` : ""}`;

     let balance = Number(user?.tbkCredits);

     if (index === 0 && successBookings?.length === 2) {
      const destAmount = successBookings?.[1]?.tbkAmount;
      balance += Number(destAmount);
     };

     const TransactionId = generateTransactionId();

     return {
      type: "Invoice",
      debit: Number(booking?.tbkAmount)?.toFixed(2),
      credit: 0,
      balance: Number(balance)?.toFixed(2),
      InvoiceNo,
      PaxName: pax,
      paymentMethod: "wallet",
      addedBy: user?.id,
      TransactionId,
      userId,
      particulars: {
       "Ticket Created": pax,
       [getCities()]: `PNR ${booking?.PNR}`,
       "Travel Date" : `${dayjs(DepTime)?.format('DD MMM YYYY, hh:mm A')}, By ${AirlineCode} ${FlightNumber}`,
       "Payment Method": "wallet",
      },
     } as LedgerType;
    });

    return ledgers;
   };
   // ledgers end

   await Promise.allSettled([
    FlightBookings.bulkCreate(successBookings),
    Invoices.create({InvoiceId, InvoiceNo, tboAmount, tbkAmount, userId}),
    Ledgers.bulkCreate(getLedgers()),
    Users.update({tbkCredits: Number(user?.tbkCredits) - Number(tbkAmount)}, {where: {id: user?.id}}),
   ]);

   // get flight response for flight
   const getFlightResponse = (FlightResponse: any) => {
    const origin = FlightResponse?.FlightItinerary?.Origin;
    const destination = FlightResponse?.FlightItinerary?.Destination;
    const PNR = FlightResponse?.PNR || FlightResponse?.FlightItinerary?.PNR;
    const BookingId = FlightResponse?.BookingId || FlightResponse?.FlightItinerary?.BookingId;
    const bookedDate = FlightResponse?.FlightItinerary?.InvoiceCreatedOn

    let comboFlightMessage = "";
    if (ticketsData?.[0]?.isFlightCombo) comboFlightMessage = ` and ${destination} to ${origin}`;

    const message = `Flight booked successfully from ${origin} to ${destination}${comboFlightMessage}`;

    return {InvoiceNo, PNR, BookingId, message, bookedDate};
   };
   
   const oneWayResponseData = {} as Record<string, unknown>;

   oneWayResponseData["message"] = oneWayFlightResponse?.FlightItinerary?.Origin;

   const responseData = {} as Record<string, unknown>;
   
   if (oneWayFlightError) responseData["oneWayError"] = oneWayFlightError;
   if (returnFlightError) responseData["returnError"] = returnFlightError;
   if (oneWayFlightResponse) responseData["oneWayFlightResponse"] = getFlightResponse(oneWayFlightResponse);
   if (returnFlightResponse) responseData["returnFlightResponse"] = getFlightResponse(returnFlightResponse);

   return res.status(200).json(responseData);
  };

  const responseData = {} as Record<string, unknown>;

  if (oneWayFlightError) responseData["oneWayError"] = oneWayFlightError;
  if (returnFlightError) responseData["returnError"] = returnFlightError;

  return res.status(200).json(responseData);
 } catch (error) {
  next(error);
 };
};

export default ticketBook;