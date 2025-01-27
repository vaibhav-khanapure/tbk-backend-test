import type {NextFunction, Request, Response} from "express";
import {fixflyTokenPath} from "../../config/paths";
import {readFile} from "fs/promises";
import {tboFlightBookAPI} from "../../utils/tboFlightAPI";
import ApiTransactions from "../../database/tables/apiTransactionsTable";
import Users from "../../database/tables/usersTable";
import NonLCCBookings from "../../database/tables/nonLCCBookingsTable";

const flightBook = async(req: Request, res: Response, next: NextFunction) => {
 try {
  const token = await readFile(fixflyTokenPath, "utf-8");
  req.body.TokenId = token;
  req.body.EndUserIp = process.env.END_USER_IP;

  const id = res.locals?.user?.id || "";
  const name = res.locals?.user?.name || "";

  const user = await Users.findOne({where: {id}, attributes: {include: ["active"]}});
  if (!user?.active) return res.status(400).json({message: "You don't have permission for booking"});

  const {data} = await tboFlightBookAPI.post("/Book", req.body);

  ApiTransactions.create({
   apiPurpose: "book-nonlcc",
   requestData: req.body,
   responseData: data,
   TraceId: req.body.TraceId, 
   TokenId: token,
   userId: id,
   username: name,
  });

  NonLCCBookings.create({
   userId: id,
   bookingId: data?.Response?.Response?.BookingId,
   TraceId: data?.Response?.TraceId,
   PNR: data?.Response?.Response?.PNR,
   isFlightCombo: Array.isArray(data?.Response?.Response?.FlightItinerary?.Segments?.[0]) ? true : false,
   // Please check amount
   tboAmount: data?.Response?.Response?.FlightItinerary?.Fare?.OfferedFare,
   tbkAmount: data?.Response?.Response?.FlightItinerary?.Fare?.PublishedFare,
   bookedDate: new Date(),
   flightStatus: "",
   paymentTransactionId: "",
   paymentStatus: 'completed',
   bookingStatus: 'hold',
   Source: data?.Response?.Response?.FlightItinerary?.Source,
   bookingExpiryDate: data?.Response?.Response?.FlightItinerary?.LastTicketDate,
    Segments: data?.Response?.Response?.FlightItinerary?.Segments,
    Passenger: data?.Response?.Response?.FlightItinerary?.Passenger,
    flightCities: {origin: "", destination: ""},
    isPNRCancelled: false,
    isTicketGenerated: false,
  });

  return res.status(200).json({data});
 } catch (error) {
  next(error);
 };
};

export default flightBook;