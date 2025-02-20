import "dotenv/config";
import type { NextFunction, Request, Response } from "express";
import Users from "../../database/tables/usersTable";
import { readFile } from "fs/promises";
import { fixflyTokenPath } from "../../config/paths";
import { tboFlightBookAPI } from "../../utils/tboFlightAPI";
import type { Passenger } from "../../types/BookedFlights";
import razorpay from "../../config/razorpay";
import Invoices from "../../database/tables/invoicesTable";
import Discounts from "../../database/tables/discountsTable";
import FlightBookings, { type FlightBookingTypes } from "../../database/tables/flightBookingsTable";
import generateTransactionId from "../../utils/generateTransactionId";
import dayjs from "dayjs";
import Ledgers from "../../database/tables/ledgerTable";
import FareQuotes from "../../database/tables/fareQuotesTable";
import createSHA256Hash from "../../utils/createHash";
import { calculateBaggageTotalPrice, calculateMealsTotalPrice, calculateSeatsTotalPrice } from "../../utils/calculateSSRAmounts";
import NonLCCBookings from "../../database/tables/nonLCCBookingsTable";
import Payments from "../../database/tables/paymentsTable";
import getInvoiceFinancialYearId from "../../utils/getInvoiceFinancialYearId";
import crypto from "crypto";
import type { RequestBody, TicketsData } from "../../types/TicketBookTypes";
import getBookingBodyData from "../../helpers/TicketBookHelpers/getBookingBodyData";
import handleBookResponse from "../../helpers/TicketBookHelpers/handleBookResponse";
import handleSaveNonLCCFlightBooking from "../../helpers/TicketBookHelpers/handleSaveNonLCCFlightBooking";
import handleSaveUnsuccessfulFlights from "../../helpers/TicketBookHelpers/handleSaveUnsuccessfulFlights";
import handleTicketResponse from "../../helpers/TicketBookHelpers/handleTicketResponse";

const ticketBook = async (req: Request, res: Response, next: NextFunction) => {
  let oneWayFlightResponse: any;
  let returnFlightResponse: any;
  let oneWayFlightError = "";
  let returnFlightError = "";

  const userId = res.locals?.user?.id;
  const { ticketsData, TraceId, razorpayPaymentDetails, paymentType } = req.body as RequestBody;

  try {
    if (!TraceId) return res.status(400).json({ message: "TraceId is required" });

    if (!["razorpay", "partial", "wallet"]?.includes(paymentType)) {
      return res.status(400).json({ message: "Invalid payment type" });
    };

    if (paymentType === "razorpay" || paymentType === "partial") {
      const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = razorpayPaymentDetails;

      if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
        return res.status(400).json({ message: "All fields are required" });
      };
    };

    if (!ticketsData || !Array.isArray(ticketsData) || (Array?.isArray(ticketsData) && !ticketsData?.length)) {
      return res.status(400).json({ message: "Ticket data is required" });
    };

    if (ticketsData?.length > 2) {
      return res.status(400).json({ message: "Maximum 2 tickets can be booked at a time" });
    };

    if (!["LCC", "NONLCC"]?.includes(ticketsData?.[0]?.LCCType)) {
      return res.status(400).json({ message: "Invalid LCC type" });
    };

    if (ticketsData?.length > 1 && !["LCC", "NONLCC"]?.includes(ticketsData?.[1]?.LCCType)) {
      return res.status(400).json({ message: "Invalid LCC type" });
    };

    const oneWayFlight = ticketsData?.find(ticket => ticket?.wayType === "one-way");
    const returnFlight = ticketsData?.find(ticket => ticket?.wayType === "return");

    if (!oneWayFlight && !returnFlight) {
      return res.status(400).json({ message: "Origin or Destination flight is required" });
    };

    const [token, user, invoice, discounts] = await Promise.all([
      readFile(fixflyTokenPath, "utf-8"),
      Users.findByPk(userId, {
        raw: true,
        attributes: ["active", "disableTicket", "tbkCredits", "name"]
      }),
      Invoices.findOne({ limit: 1, order: [["created_at", "DESC"]] }),
      Discounts.findAll({ where: { userId }, attributes: ["fareType", "discount", "markup", "updatedBy"] }),
    ]);

    if (!user) return res.status(404).json({ message: "User not found" });

    if (!user?.active || user?.disableTicket) {
      return res.status(400).json({ message: "You don't have permission for booking" });
    };

    const getDiscountMarkup = (fareType: string) => {
      const discount = discounts?.find((discount) => discount?.fareType === fareType);
      return { discount: discount?.discount || 0, markup: discount?.markup || 0, updatedBy: discount?.updatedBy || null };
    };

    let oneWayFlightBookingAmount = 0;
    let returnFlightBookingAmount = 0;

    const getFare = async (flight: TicketsData) => {
      const fare = await FareQuotes.findOne({ where: { uuid: createSHA256Hash(flight?.ResultIndex) } });
      if (!fare) return res.status(404).json({ message: "Booking failed Due to some Technical Issues" });

      let publishedFare = Number(fare?.oldPublishedFare);

      if (fare?.isPriceChanged && Number(fare?.newPublishedFare) > publishedFare) {
        publishedFare = Number(fare?.newPublishedFare);
      };

      let ssrAmount = 0;
      const Passengers = flight?.Passengers;

      const seats = Passengers?.map((passenger) => passenger?.SeatDynamic);
      const meals = Passengers?.map((passenger) => passenger?.MealDynamic);
      const baggage = Passengers?.map((passenger) => passenger?.Baggage);

      if (seats) ssrAmount += calculateSeatsTotalPrice(seats?.flat(10));
      if (meals) ssrAmount += calculateMealsTotalPrice(meals?.flat(10));
      if (baggage) ssrAmount += calculateBaggageTotalPrice(baggage?.flat(10));

      const { discount, markup } = getDiscountMarkup(flight?.fareType);
      return Number(publishedFare) + Number(ssrAmount) + Number(markup) - Number(discount);
    };

    if (oneWayFlight) {
      const fare = await getFare(oneWayFlight);
      oneWayFlightBookingAmount = Number(fare);
    };

    if (returnFlight) {
      const fare = await getFare(returnFlight);
      returnFlightBookingAmount = Number(fare);
    };

    const totalBookingAmount = oneWayFlightBookingAmount + returnFlightBookingAmount;

    if (paymentType === "wallet" && totalBookingAmount > Number(user?.tbkCredits)) {
      return res.status(400).json({ message: "Insufficient TBK Credits to book flight" });
    };

    if (paymentType === "razorpay" || paymentType === "partial") {
      const sign = `${razorpayPaymentDetails?.razorpay_order_id}|${razorpayPaymentDetails?.razorpay_payment_id}`;

      const expectedSignature = crypto
        .createHmac("sha256", process.env.RAZORPAY_API_SECRET as string)
        .update(sign.toString())
        .digest("hex");

      const isAuthentic = expectedSignature === razorpayPaymentDetails?.razorpay_signature;

      if (!isAuthentic) return res.status(400).json({ success: false });

      const order = await Payments?.findOne({ where: { RazorpayOrderId: razorpayPaymentDetails?.razorpay_order_id } });

      if (!order) return res.status(400).json({ message: "Invalid payment details" });

      if (order?.RazorpayPaymentId || order?.RazorpaySignature) {
        return res.status(400).json({ message: "Invalid payment details" });
      };

      if (order?.RazorpayPaymentId === razorpayPaymentDetails?.razorpay_payment_id || order?.RazorpaySignature === razorpayPaymentDetails?.razorpay_signature) {
        return res.status(400).json({ message: "Invalid payment details" });
      };

      const payment = await razorpay.payments.fetch(razorpayPaymentDetails?.razorpay_payment_id);
      const totalRazorpayPayment = Number(payment?.amount) / 100;

      const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = razorpayPaymentDetails;

      const tbkCredits = (Number(user?.tbkCredits) + Number(totalRazorpayPayment))?.toFixed(2);

      user.tbkCredits = tbkCredits;

      const TransactionId = generateTransactionId();

      await Promise.all([
        Users.update({ tbkCredits }, { where: { id: userId } }),
        Payments?.update({
          RazorpayPaymentId: razorpay_payment_id,
          RazorpaySignature: razorpay_signature,
          TransactionId,
          PaidAmount: Number(totalRazorpayPayment)?.toFixed(2),
          PaymentMethod: payment?.method,
          Reason: "Added TBK Wallet Payment for Ticket Booking",
          userId
        }, { where: { RazorpayOrderId: razorpay_order_id } }),
        Ledgers?.create({
          addedByUserId: userId,
          type: "Credit",
          credit: Number(totalRazorpayPayment)?.toFixed(2),
          reason: "Adding TBK Credits for Ticket Booking",
          debit: 0,
          balance: tbkCredits,
          PaxName: user?.name,
          paymentMethod: payment?.method,
          TransactionId,
          userId,
          particulars: {
            "Amount Credited in TBK Wallet": Number(totalRazorpayPayment)?.toFixed(2),
            "Credited On": `${dayjs().format('DD MMM YYYY, hh:mm A')}`,
          },
        }),
      ]);
    };

    const oneWayFlightTransactionId = generateTransactionId();
    const returnFlightTransactionId = generateTransactionId();

    if (oneWayFlight) {
      const paxName = oneWayFlight?.Passengers?.find((passenger) => passenger?.IsLeadPax);
      const totalPassengers = oneWayFlight?.Passengers?.length > 1 ? ` + ${Number(oneWayFlight?.Passengers?.length) - 1}` : "";

      await Users.update(
        { tbkCredits: (Number(user?.tbkCredits) - oneWayFlightBookingAmount)?.toFixed(2) },
        { where: { id: userId } }
      );

      await Ledgers.create({
        addedByUserId: userId,
        balance: Number(user?.tbkCredits) - oneWayFlightBookingAmount,
        credit: 0,
        debit: oneWayFlightBookingAmount,
        PaxName: `${paxName?.Title} ${paxName?.FirstName} ${paxName?.LastName}${totalPassengers}`,
        paymentMethod: "wallet",
        TransactionId: oneWayFlightTransactionId,
        reason: "Flight Booking",
        type: "Invoice",
        userId,
        particulars: {},
      });

      user.tbkCredits = (Number(user?.tbkCredits) - oneWayFlightBookingAmount)?.toFixed(2);

      try {
        oneWayFlight.TokenId = token;
        oneWayFlight.EndUserIp = process.env.END_USER_IP as string;
        oneWayFlight.TraceId = TraceId;

        if (oneWayFlight?.LCCType === "LCC") {
          const { data: onewWayFlightTicketResponse } = await tboFlightBookAPI.post("/Ticket", getBookingBodyData(oneWayFlight));
          const { error, response } = await handleTicketResponse(onewWayFlightTicketResponse, TraceId);

          if (error) {
            oneWayFlightError = error;

            await handleSaveUnsuccessfulFlights({
              bookingAmount: oneWayFlightBookingAmount,
              paymentMethod: "wallet",
              TraceId,
              Reason: error,
              RefundCreditedDate: new Date(),
              RefundedAmount: Number(oneWayFlightBookingAmount)?.toFixed(2),
              RefundStatus: "Approved",
              ResultIndex: oneWayFlight?.ResultIndex,
              userId,
              RefundedUntil: new Date(),
              RefundProcessedOn: new Date(),
              travellers: oneWayFlight?.Passengers,
              ...(oneWayFlight?.isFlightCombo ? { isFlightCombo: true } : {}),
              ...(oneWayFlight?.flightCities ? { flightCities: oneWayFlight?.flightCities } : {}),
            });
          };
          if (response) oneWayFlightResponse = response;

        } else if (oneWayFlight?.LCCType === "NONLCC") {
          const { data: onewWayFlightBookResponse } = await tboFlightBookAPI.post("/Book", getBookingBodyData(oneWayFlight));

          await handleSaveNonLCCFlightBooking({
            userId,
            bookingId: onewWayFlightBookResponse?.Response?.Response?.BookingId,
            TraceId: onewWayFlightBookResponse?.Response?.TraceId,
            PNR: onewWayFlightBookResponse?.Response?.Response?.PNR,
            tboAmount: Number(onewWayFlightBookResponse?.Response?.Response?.FlightItinerary?.Fare?.OfferedFare)?.toFixed(2),
            tbkAmount: Number(oneWayFlightBookingAmount)?.toFixed(2),
            bookedDate: new Date(),
            flightStatus: "",
            paymentTransactionId: "",
            paymentStatus: 'completed',
            bookingStatus: 'hold',
            Source: onewWayFlightBookResponse?.Response?.Response?.FlightItinerary?.Source,
            bookingExpiryDate: onewWayFlightBookResponse?.Response?.Response?.FlightItinerary?.LastTicketDate,
            Segments: onewWayFlightBookResponse?.Response?.Response?.FlightItinerary?.Segments,
            Passenger: onewWayFlightBookResponse?.Response?.Response?.FlightItinerary?.Passenger,
            isPNRCancelled: false,
            isTicketGenerated: false,
            ...(oneWayFlight?.isFlightCombo ? { isFlightCombo: true } : {}),
            ...(oneWayFlight?.flightCities ? { flightCities: oneWayFlight?.flightCities } : {})
          });

          const { error, response } = await handleBookResponse(onewWayFlightBookResponse);

          if (error) {
            oneWayFlightError = error;

            await handleSaveUnsuccessfulFlights({
              bookingAmount: oneWayFlightBookingAmount,
              paymentMethod: "wallet",
              Reason: error,
              TraceId,
              userId,
              RefundCreditedDate: new Date(),
              RefundedAmount: Number(oneWayFlightBookingAmount)?.toFixed(2),
              RefundStatus: "Approved",
              ResultIndex: oneWayFlight?.ResultIndex,
              RefundedUntil: new Date(),
              RefundProcessedOn: new Date(),
              travellers: oneWayFlight?.Passengers,
              ...(oneWayFlight?.isFlightCombo ? { isFlightCombo: true } : {}),
              ...(oneWayFlight?.flightCities ? { flightCities: oneWayFlight?.flightCities } : {}),
            });
          };

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
            const { error, response } = await handleTicketResponse(onewWayFlightTicketResponse, TraceId);

            if (error) {
              oneWayFlightError = error;

              await handleSaveUnsuccessfulFlights({
                bookingAmount: oneWayFlightBookingAmount,
                paymentMethod: "wallet",
                Reason: error,
                RefundCreditedDate: new Date(),
                TraceId,
                RefundedAmount: Number(oneWayFlightBookingAmount)?.toFixed(2),
                RefundStatus: "Approved",
                ResultIndex: oneWayFlight?.ResultIndex,
                userId,
                RefundedUntil: new Date(),
                RefundProcessedOn: new Date(),
                travellers: oneWayFlight?.Passengers,
                ...(oneWayFlight?.isFlightCombo ? { isFlightCombo: true } : {}),
                ...(oneWayFlight?.flightCities ? { flightCities: oneWayFlight?.flightCities } : {}),
              });
            };

            if (response) {
              oneWayFlightResponse = response;

              NonLCCBookings.update(
                { isTicketGenerated: true, bookingStatus: "confirmed", },
                { where: { bookingId: onewWayFlightBookResponse?.Response?.Response?.BookingId } }
              );
            };
          };
        };
      } catch (error: any) {
        const err = error?.data?.response?.message || error?.message || "Booking failed Due to some Technical Issues";
        oneWayFlightError = err;

        await handleSaveUnsuccessfulFlights({
          bookingAmount: oneWayFlightBookingAmount,
          paymentMethod: "wallet",
          Reason: err,
          TraceId,
          RefundCreditedDate: new Date(),
          RefundedAmount: Number(oneWayFlightBookingAmount)?.toFixed(2),
          RefundStatus: "Approved",
          ResultIndex: oneWayFlight?.ResultIndex,
          userId,
          RefundedUntil: new Date(),
          RefundProcessedOn: new Date(),
          travellers: oneWayFlight?.Passengers,
          ...(oneWayFlight?.isFlightCombo ? { isFlightCombo: true } : {}),
          ...(oneWayFlight?.flightCities ? { flightCities: oneWayFlight?.flightCities } : {}),
        });
      };
    }; // One way End

    // Booking for return flight
    if (returnFlight && !oneWayFlightError) {
      const paxName = returnFlight?.Passengers?.find((passenger) => passenger?.IsLeadPax);
      const totalPassengers = returnFlight?.Passengers?.length > 1 ? ` + ${Number(oneWayFlight?.Passengers?.length) - 1}` : "";

      await Users.update(
        { tbkCredits: (Number(user?.tbkCredits) - returnFlightBookingAmount)?.toFixed(2) },
        { where: { id: userId } }
      );

      await Ledgers.create({
        addedByUserId: userId,
        balance: Number(user?.tbkCredits) - returnFlightBookingAmount,
        credit: 0,
        debit: returnFlightBookingAmount,
        PaxName: `${paxName?.Title} ${paxName?.FirstName} ${paxName?.LastName}${totalPassengers}`,
        paymentMethod: "wallet",
        TransactionId: returnFlightTransactionId,
        reason: "Flight Booking",
        type: "Invoice",
        userId,
        particulars: {},
      });

      try {
        returnFlight.TokenId = token;
        returnFlight.EndUserIp = process.env.END_USER_IP as string;
        returnFlight.TraceId = TraceId;

        if (returnFlight?.LCCType === "LCC") {
          const { data: returnFlightTicketResponse } = await tboFlightBookAPI.post("/Ticket", getBookingBodyData(returnFlight));
          const { error, response } = await handleTicketResponse(returnFlightTicketResponse, TraceId, 2);

          if (error) {
            returnFlightError = error;

            await handleSaveUnsuccessfulFlights({
              bookingAmount: returnFlightBookingAmount,
              paymentMethod: "wallet",
              Reason: error,
              TraceId,
              RefundCreditedDate: new Date(),
              RefundedAmount: Number(returnFlightBookingAmount)?.toFixed(2),
              RefundStatus: "Approved",
              ResultIndex: returnFlight?.ResultIndex,
              userId,
              RefundedUntil: new Date(),
              RefundProcessedOn: new Date(),
              travellers: returnFlight?.Passengers,
            });
          };

          if (response) returnFlightResponse = response;
        } else if (returnFlight?.LCCType === "NONLCC") {
          const { data: returnFlightBookResponse } = await tboFlightBookAPI.post("/Book", getBookingBodyData(returnFlight));

          await handleSaveNonLCCFlightBooking({
            userId,
            bookingId: returnFlightBookResponse?.Response?.Response?.BookingId,
            TraceId: returnFlightBookResponse?.Response?.TraceId,
            PNR: returnFlightBookResponse?.Response?.Response?.PNR,
            tboAmount: Number(returnFlightBookResponse?.Response?.Response?.FlightItinerary?.Fare?.OfferedFare)?.toFixed(2),
            tbkAmount: Number(returnFlightBookingAmount)?.toFixed(2),
            bookedDate: new Date(),
            flightStatus: "",
            paymentTransactionId: "",
            paymentStatus: 'completed',
            bookingStatus: 'hold',
            Source: returnFlightBookResponse?.Response?.Response?.FlightItinerary?.Source,
            bookingExpiryDate: returnFlightBookResponse?.Response?.Response?.FlightItinerary?.LastTicketDate,
            Segments: returnFlightBookResponse?.Response?.Response?.FlightItinerary?.Segments,
            Passenger: returnFlightBookResponse?.Response?.Response?.FlightItinerary?.Passenger,
            isPNRCancelled: false,
            isTicketGenerated: false,
          });

          const { error, response } = await handleBookResponse(returnFlightBookResponse);


          if (error) {
            returnFlightError = error;

            await handleSaveUnsuccessfulFlights({
              bookingAmount: returnFlightBookingAmount,
              paymentMethod: "wallet",
              Reason: error,
              TraceId,
              RefundCreditedDate: new Date(),
              RefundedAmount: Number(returnFlightBookingAmount)?.toFixed(2),
              RefundStatus: "Approved",
              ResultIndex: returnFlight?.ResultIndex,
              userId,
              RefundedUntil: new Date(),
              RefundProcessedOn: new Date(),
              travellers: returnFlight?.Passengers,
            });
          };

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
            const { error, response } = await handleTicketResponse(returnFlightTicketResponse, TraceId, 2);

            if (error) {
              returnFlightError = error;

              await handleSaveUnsuccessfulFlights({
                TraceId,
                bookingAmount: returnFlightBookingAmount,
                paymentMethod: "wallet",
                Reason: error,
                RefundCreditedDate: new Date(),
                RefundedAmount: Number(returnFlightBookingAmount)?.toFixed(2),
                RefundStatus: "Approved",
                ResultIndex: returnFlight?.ResultIndex,
                userId,
                RefundedUntil: new Date(),
                RefundProcessedOn: new Date(),
                travellers: returnFlight?.Passengers,
              });
            };

            if (response) {
              returnFlightResponse = response;

              NonLCCBookings.update(
                { isTicketGenerated: true, bookingStatus: "confirmed", },
                { where: { bookingId: returnFlightBookResponse?.Response?.Response?.BookingId } }
              );
            };
          };
        };
      } catch (error: any) {
        const err = error?.data?.response?.message || error?.message || "Booking failed Due to some Technical Issues";
        oneWayFlightError = err;

        await handleSaveUnsuccessfulFlights({
          bookingAmount: returnFlightBookingAmount,
          TraceId,
          paymentMethod: "wallet",
          Reason: oneWayFlightError,
          RefundCreditedDate: new Date(),
          RefundedAmount: Number(returnFlightBookingAmount)?.toFixed(2),
          RefundStatus: "Approved",
          ResultIndex: returnFlight?.ResultIndex,
          userId,
          RefundedUntil: new Date(),
          RefundProcessedOn: new Date(),
          travellers: returnFlight?.Passengers,
        });
      };
    };

    // return the amount add ledger also
    if (oneWayFlightError) {
      const getCredits = await Users.findByPk(userId, { attributes: ["tbkCredits"] });
      let credits = (Number(getCredits?.tbkCredits) + Number(oneWayFlightBookingAmount));

      // if (returnFlight) credits += Number(returnFlightBookingAmount);

      const tbkCredits = Number(credits)?.toFixed(2);

      await Users.update({ tbkCredits }, { where: { id: userId } });
      await Ledgers.create({
        addedByUserId: userId,
        balance: tbkCredits,
        debit: 0,
        credit: oneWayFlightBookingAmount,
        PaxName: user?.name,
        paymentMethod: "wallet",
        reason: oneWayFlightError,
        TransactionId: oneWayFlightTransactionId,
        type: "Refund",
        userId,
        particulars: {
          "Refund Amount": oneWayFlightBookingAmount?.toFixed(2),
          "Credited On": dayjs().format('DD MMM YYYY, hh:mm A'),
        }
      });
    };

    if (returnFlightError) {
      const getCredits = await Users.findByPk(userId, { attributes: ["tbkCredits"] });
      const tbkCredits = (Number(getCredits?.tbkCredits) + Number(returnFlightBookingAmount))?.toFixed(2);

      await Users.update({ tbkCredits }, { where: { id: userId } });
      await Ledgers.create({
        addedByUserId: userId,
        balance: tbkCredits,
        debit: 0,
        credit: returnFlightBookingAmount,
        PaxName: user?.name,
        paymentMethod: "wallet",
        reason: returnFlightError,
        TransactionId: oneWayFlightTransactionId,
        type: "Refund",
        userId,
        particulars: {
          "Refund Amount": returnFlightBookingAmount?.toFixed(2),
          "Credited On": dayjs().format('DD MMM YYYY, hh:mm A'),
        }
      });
    };

    // In case of success
    if (oneWayFlightResponse || returnFlightResponse) {
      let invoiceNo: string | number = "";

      if (!invoice) {
        invoiceNo = `ID/${getInvoiceFinancialYearId()}/1`;
      } else {
        invoiceNo = invoice?.dataValues?.InvoiceNo?.split("/")?.[2];
      };

      const InvoiceId = !invoice ? 1 : Number(invoice?.InvoiceId) + 1;
      const InvoiceNo = !invoice ? invoiceNo : `ID/${getInvoiceFinancialYearId()}/${Number(invoiceNo) + 1}`;

      type SuccessBookings = FlightBookingTypes & { type: "one-way" | "return" };

      const successBookings = [] as SuccessBookings[];
      let tboAmount = 0;
      let tbkAmount = 0;

      if (oneWayFlightResponse) {
        tboAmount += oneWayFlightResponse?.FlightItinerary?.Fare?.OfferedFare || 0;
        const { discount, markup, updatedBy } = getDiscountMarkup(oneWayFlight?.fareType as string);

        const publishedFare = oneWayFlightResponse?.FlightItinerary?.Fare?.PublishedFare || 0;
        tbkAmount += publishedFare + markup - discount;

        successBookings.push({
          tboAmount: oneWayFlightResponse?.FlightItinerary?.Fare?.OfferedFare,
          tbkAmount: oneWayFlightBookingAmount || (publishedFare + markup - discount),
          TraceId,
          InvoiceNo,
          InvoiceId,
          type: "one-way",
          Passenger: oneWayFlight?.oldPassengers || oneWayFlightResponse?.FlightItinerary?.Passenger,
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
          ...(oneWayFlight?.flightCities ? { flightCities: oneWayFlight?.flightCities } : {}),
        });
      };

      if (returnFlightResponse) {
        tboAmount += returnFlightResponse?.FlightItinerary?.Fare?.OfferedFare || 0;
        const { discount, markup, updatedBy } = getDiscountMarkup(returnFlight?.fareType as string);

        const publishedFare = returnFlightResponse?.FlightItinerary?.Fare?.PublishedFare || 0;
        tbkAmount += publishedFare + markup - discount;

        successBookings.push({
          tboAmount: returnFlightResponse?.FlightItinerary?.Fare?.OfferedFare,
          tbkAmount: returnFlightBookingAmount || (publishedFare + markup - discount),
          TraceId,
          InvoiceNo,
          InvoiceId,
          type: "return",
          Passenger: returnFlight?.oldPassengers || returnFlightResponse?.FlightItinerary?.Passenger,
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
      const updateLedgers = () => {
        const ledgers = successBookings?.map(async booking => {
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
            const Origin = segments?.[0]?.Origin?.Airport?.CityName;

            if (booking?.isFlightCombo) {
              const dest = segments?.find(segment => segment?.Origin?.Airport?.CityCode === booking?.flightCities?.destination);
              const Destination = dest?.Origin?.Airport?.CityName;

              return `${Origin} → ${Destination} → ${Origin}`;
            };

            const Destination = segments?.[segments?.length - 1]?.Destination?.Airport?.CityName;
            return `${Origin} → ${Destination}`;
          };

          const pax = `${Title} ${FirstName} ${LastName}${totalPassengers > 1 ? ` + ${Number(totalPassengers) - 1}` : ""}`;

          const TransactionId = booking?.type === "one-way" ? oneWayFlightTransactionId : returnFlightTransactionId;

          await Ledgers.update({
            InvoiceNo,
            particulars: {
              "Ticket Created": pax,
              [getCities()]: `PNR ${booking?.PNR}`,
              "Travel Date": `${dayjs(DepTime)?.format('DD MMM YYYY, hh:mm A')}, By ${AirlineCode} ${FlightNumber}`,
              "Payment Method": "wallet",
            },
          }, { where: { TransactionId } });
        });

        return ledgers;
      };
      // ledgers end

      await Promise.allSettled([
        Invoices.create({ InvoiceId, InvoiceNo, tboAmount, tbkAmount, userId }),
        FlightBookings.bulkCreate(successBookings),
        updateLedgers(),
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

        return { InvoiceNo, PNR, BookingId, message, bookedDate };
      };

      const oneWayResponseData = {} as Record<string, unknown>;

      oneWayResponseData["message"] = oneWayFlightResponse?.FlightItinerary?.Origin;

      const responseData = {} as Record<string, unknown>;

      if (oneWayFlightError) responseData["oneWayFlightError"] = oneWayFlightError;
      if (returnFlightError) responseData["returnFlightError"] = returnFlightError;
      if (oneWayFlightResponse) responseData["oneWayFlightResponse"] = getFlightResponse(oneWayFlightResponse);
      if (returnFlightResponse) responseData["returnFlightResponse"] = getFlightResponse(returnFlightResponse);

      return res.status(200).json(responseData);
    };

    const responseData = {} as Record<string, unknown>;

    if (oneWayFlightError) responseData["oneWayFlightError"] = oneWayFlightError;
    if (returnFlightError) responseData["returnFlightError"] = returnFlightError;

    return res.status(200).json(responseData);
  } catch (error) {
    next(error);
  };
};

export default ticketBook;