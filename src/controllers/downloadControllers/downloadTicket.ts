import htmlPdf from 'html-pdf';
import type {NextFunction, Request, Response} from "express";
import FlightBookings from '../../database/tables/flightBookingsTable';
import type {BookedFlightTypes, Segment} from '../../types/BookedFlights';
import dayjs from "dayjs";
import getCabinClass from '../../utils/getCabinClass';
import getTimeDifference from '../../utils/getTimeDifference';
import getCurrencySymbol from '../../utils/getCurrencySymbol';
import bwip from "bwip-js";
import {officialLogoPath} from '../../config/paths';
import Users from '../../database/tables/usersTable';

const downloadTicket = async (req: Request, res: Response, next: NextFunction) => {
 try {
  const userId = res.locals?.user?.id;
  const bookingId = req.query?.bookingId as {bookingId: string;};

  if (!userId) return res.status(401).json({message: "Unauthorized"});
  if (!bookingId) return res.status(400).json({message: "Please Provide Booking Id"});

  const [user, booking] = await Promise.all([
   Users.findOne({
    where: {id: userId},
    raw: true,
    attributes: ["active"]
   }),
   FlightBookings?.findOne({
    where: {bookingId, userId}, 
    raw: true,
    attributes: {
     exclude: ["createdAt", "updatedAt", "tboAmount", "tboPassenger", "discountUpdatedByStaffId", "fareType", "userId"]
    }
   }),
  ]);

  if (!booking) return res.status(404).json({message: "No bookings found"});
  if (!user) return res.status(404).json({message: "User not found"});

  if (booking?.flightStatus === "Cancelled") return res.status(400).json({message: "This Booking was Cancelled"});

  if (booking?.flightStatus === "Partial" && booking?.cancelledTickets?.length === booking?.Passenger?.length) {
   return res.status(400).json({message: "This Booking was Cancelled"}); 
  };

  const airlineImage = `${process.env.SERVER_URL}/api/v1/images/Airline_images/${booking?.Segments?.[0]?.Airline?.AirlineCode}.gif`;

  const isPassportRequired = booking?.Passenger?.find(passenger => passenger?.PassportNo);

  const getStops = (segments: Segment[]) => {
   if(segments?.length  === 1) return {info: `<span>No Stops</span>`, fullInfo: ""};
   const stops = [] as {CityName: string; stopTime: string; CityCode: string; nextFlight: string}[];

   let info = "";
   let fullInfo = "";

   segments?.forEach((Segment, index) => {
    if(index === segments?.length - 1) return;

    const CityCode = Segment?.Destination?.Airport?.CityCode || "";
    const CityName = Segment?.Destination?.Airport?.CityName || "";

    const arrTime = Segment?.Destination?.ArrTime;
    const depTime = segments?.[index + 1]?.Origin?.DepTime;

    const stopTime = getTimeDifference(depTime, arrTime);

    const AirlineCode = segments?.[index + 1]?.Airline?.AirlineCode;
    const FlightNumber = segments?.[index + 1]?.Airline?.FlightNumber;
    const nextFlight = `${AirlineCode} ${FlightNumber}`;
    stops.push({CityName, CityCode, stopTime, nextFlight});
   });

   stops?.forEach((stop) => {
    info += `<p">${stop?.CityName} - ${stop?.stopTime}</p>`;
    fullInfo += `<p style="margin: 4px 0">${stop?.stopTime} layover Stopover in ${stop?.CityName} (${stop?.CityCode}), then you will have to change the Flight to ${stop?.nextFlight}</p>`;
   });

   return {info, fullInfo};
  };

  const getAmount = () => {
   let baseFare = 0;
   let tax = Number(booking?.markup || 0);
   let seats = 0;
   let meals = 0;
   let baggages = 0;
   let serviceFee = 0;
   let paymentMarkup = 0;
   let discount = Number(booking?.discount || 0);

   const getTotalTaxes = (fare: BookedFlightTypes["Passenger"][0]["Fare"]) => {
    type ObjectKeys<T> = keyof T;

    const props: ObjectKeys<typeof fare>[] = ["Tax", "OtherCharges", "TransactionFee", "ServiceFee", "AdditionalTxnFeePub", "AirlineTransFee"];

    let total = 0;
    props?.forEach(prop => total += Number(fare?.[prop] || 0));
    return total;
   };

   booking?.Passenger?.forEach((passenger) => {
    const Fare = passenger?.Fare;

    baseFare += Number(Fare?.BaseFare);
    tax += getTotalTaxes(Fare);

    const Seats = passenger?.SeatDynamic;
    const Meals = passenger?.MealDynamic;
    const Baggages = passenger?.Baggage;

    if (Seats && Array?.isArray(Seats)) {
     Seats?.forEach(seat => seats += (seat?.Description === 1 ? 0 : Number(seat?.Price || 0)));
    };

    if (Meals && Array?.isArray(Meals)) {
     Meals?.forEach(meal => meals += (meal?.Description === 1 ? 0 : Number(meal?.Price || 0)));
    };

    if (Baggages && Array?.isArray(Baggages)) {
     Baggages?.forEach(baggage => baggages += (baggage?.Description === 1 ? 0 : Number(baggage?.Price || 0)));
    };
   });

   const ancillaryFare = seats + meals + baggages;
   const total = baseFare + tax + ancillaryFare + serviceFee + paymentMarkup - discount;

   return {seats, meals, baggages, ancillaryFare, baseFare, tax, total, discount, serviceFee, paymentMarkup};
  };

  const getContact = () => {
   const lead = booking?.Passenger?.find(traveller => traveller?.IsLeadPax);

   const email = lead?.Email || "";
   const phoneNumber = lead?.ContactNo || "";

   return {email, phoneNumber};
  };

  const getPassengers = async () => {
   let passengers = "";

   let validPassengers = [];

   if(booking?.flightStatus === "Partial") {
    validPassengers = booking?.Passenger?.filter(passenger => !booking?.cancelledTickets?.includes(passenger?.Ticket?.TicketId));
   } else {
    validPassengers = booking?.Passenger;
   };

   for (const passenger of validPassengers || []) {
    const isBarCodeAvailable = passenger?.BarcodeDetails?.Barcode;
    let barcodeList = '';

    if (isBarCodeAvailable) {
     const barcodes = await Promise.all(passenger?.BarcodeDetails?.Barcode?.map(async (barcode) => {
      const png = await bwip.toBuffer({
       bcid: barcode?.Format?.toLowerCase(),
       text: barcode?.Content,
       scale: 3,
       height: 20,
       width: 140,
       textxalign: 'center',
       includetext: true, // Show text below barcode
      //  padding: 5 // Add padding around barcode
      });

      return png.toString('base64');
     }) || []);

     barcodes.forEach(img => {
      barcodeList += (
       `<div style="margin: 8px 0;">
         <img src="data:image/png;base64,${img}" alt="Barcode" style="height: 60px; width: 160px;" />
        </div>`
      );
     });
    };

    const seatsInfo = () => {
     const seats = passenger?.Seat || passenger?.SeatDynamic;
     const segments = booking?.Segments;

     if(!seats) return "-";

     if(passenger?.Seat) {
      const origin = segments?.[0]?.Origin?.Airport?.CityName;
      let destination = segments?.[segments?.length - 1]?.Destination?.Airport?.CityName;

      if (booking?.flightCities?.destination) destination = booking?.flightCities?.destination;

      const returnSeatInfo = booking?.isFlightCombo ? `and ${destination} - ${origin}` : "";
      return (
       `
        <p>
         ${origin} - ${destination} ${returnSeatInfo} : ${passenger?.Seat?.Description || ""} (${passenger?.Seat?.Code})
         <span style="margin: 0px; background-color: #E0F7FA; padding: 2px;">preference</span>
        </p>
       ` 
      );
     };

     const dynamicSeat = passenger?.SeatDynamic;

     let details = "";

     (dynamicSeat || [])?.forEach(seat => {
      details += `<p>${seat?.Origin} - ${seat?.Destination} : ${seat?.Code}</p>`;
     });

     return details;
    };

    const mealsInfo = () => {
     const meals = passenger?.Meal || passenger?.MealDynamic;
     const segments = booking?.Segments;

     const getMealName = (meal: BookedFlightTypes["Passenger"][0]["MealDynamic"][0]) => {
      if (meal?.Code === "NoMeal") return "No Meal";
      if (meal?.AirlineDescription) return meal?.AirlineDescription;
      return meal?.Description;
     };

     if(!meals) return "-";

     if(passenger?.Meal) {
      const origin = segments?.[0]?.Origin?.Airport?.CityName;
      let destination = segments?.[segments?.length - 1]?.Destination?.Airport?.CityName;
      
      if (booking?.flightCities?.destination) destination = booking?.flightCities?.destination;

      const returnMealInfo = booking?.isFlightCombo ? `and ${destination} - ${origin}` : "";
      return `${origin} - ${destination} ${returnMealInfo} : ${passenger?.Meal?.Description}`;
     };

     let details = "";

     const Meals = [] as {cities: string; meals: (string | number)[]}[];

     const dynamicMeal = passenger?.MealDynamic;

     (dynamicMeal || [])?.forEach(meal => {
      const index = Meals?.findIndex(Meal => Meal?.cities === `${meal?.Origin} - ${meal?.Destination}`);

      if (index > - 1) {
       Meals[index].meals.push(getMealName(meal));
      } else {
       Meals.push({cities: `${meal?.Origin} - ${meal?.Destination}`, meals: [getMealName(meal)]}); 
      };
     });

     Meals?.forEach(meal => {
      details += (
       `<div>
         <p>${meal?.cities} : </p>
         <ol style="list-style-type: circle;">
          ${meal?.meals?.map(meal => `<li style="margin-left: 2px;">${meal}</li>`).join("")}
         </ol>
        </div>`
      );
     });

     return details;
    };

    const baggageInfo = () => {
     const baggages = passenger?.Baggage;
     if(!baggages) return "-";
     let details = "";

     (baggages || [])?.forEach(baggage => {
      details += (
       `<div>
         <p>${baggage?.Origin} - ${baggage?.Destination} : ${baggage?.Code}</p>
         ${baggage?.Weight ? `<p>Weight : ${baggage?.Weight} KG</p>` : ""}
         ${baggage?.Text ? `<p>${baggage?.Text}</p>` : ""}
        </div>`
      );
     });

     return details;
    };

    const traveller = `
     <tr>
      <td style="border: 1px solid black; padding: 5px;">
       ${passenger?.Title} ${passenger?.FirstName} ${passenger?.LastName} (${String(passenger?.Gender) === String(1) ? "M" : "F"})
      </td>
      <td style="border: 1px solid black; padding: 5px;">${passenger?.Ticket?.TicketId || "-"}</td>
      <td style="border: 1px solid black; padding: 5px;">${seatsInfo()}</td>
      <td style="border: 1px solid black; padding: 5px;">${mealsInfo()}</td>
      <td style="border: 1px solid black; padding: 5px;">${baggageInfo()}</td>
      <td style="border: 1px solid black; padding: 5px;">-</td>
      <td style="border: 1px solid black; padding: 5px;">${isBarCodeAvailable ? barcodeList : "-"}</td>
     </tr>
    `;

    passengers += traveller;
   };

   return passengers;
  };

  const passengers = await getPassengers();

  const getLayovers = () => {
   let layovers = "";

   const isFlightCombo = booking?.isFlightCombo;
   const segments = [];

   if(isFlightCombo) {
    const index = booking?.Segments?.findIndex(flight => flight?.Origin?.Airport?.CityCode === booking?.flightCities?.destination);

    const origin = booking?.Segments?.slice(0, index);
    const destination = booking?.Segments?.slice(index,);

    segments?.push(origin, destination);
   } else {
    segments?.push(booking?.Segments);
   };

   segments?.forEach(segment => {
    const cities = `${segment?.[0]?.Origin?.Airport?.CityName} to ${segment?.[segment?.length - 1]?.Destination?.Airport?.CityName}`;

    layovers += getStops(segment)?.fullInfo ? (
     `<section style="padding: 8px">
       <div style="font-size: 14px; padding: 5px; border: 1px solid #000">
        <h3 style="margin: 0; padding: 0;">${cities} Stopover(s)</h3>
        ${getStops(segment)?.fullInfo}
       </div>
      </section>
     `
    ) : "";
   });

   return layovers;
  };

  const getTerminal = (Terminal: string) => {
   if (!Terminal) return "";
   return `Terminal ${Terminal}, <br />`;
  };

  const getFlightDetails = (segments: Segment[]) => {
   let details = "";

   segments?.forEach((Segment) => {
    details += `
     <section>
      <table style="width: 100%; border-collapse: collapse; margin-top: 14px; border-top: 1px solid #000;">
       <tr>
        <td style="border-right: 1px solid gray; padding: 8px; height: 100%; vertical-align: top; width: 25%;">
         <img src='${airlineImage}' style="height: 36px; width: 36px;" alt="Image" style="margin-right: 4px;" />
         <p style="font-weight: bold; margin: 2px;">
          ${Segment?.Airline?.AirlineName}
         </p>
        </td>
        <td style="border-right: 1px solid gray; padding: 8px; height: 100%; vertical-align: top; width: 25%;">
         <span>Travel Class</span> <br />
         <p style="font-weight: bold; margin: 0; margin-top: 8px;">
          ${getCabinClass(Segment?.CabinClass)}
         </p>
        </td>
        <td style="border-right: 1px solid gray; padding: 8px; height: 100%; vertical-align: top; width: 25%;">
         <span>Check-In Baggage</span> <br />
         <p style="font-weight: bold; margin: 0; margin-top: 8px;">
          ${Segment?.Baggage || "No Detail Available"}
         </p>
        </td>
        <td style="padding: 8px; height: 100%; vertical-align: top; width: 25%;">
         <span>Cabin Baggage</span> <br />
         <p style="font-weight: bold; margin: 0; margin-top: 8px;">
          ${Segment?.CabinBaggage || "No Detail Available"}
         </p>
        </td>
       </tr>
      </table>
     </section>
     <section>
      <table style="width: 100%; border-collapse: collapse; border-top: 1px solid #000;">
       <tr>
        <th style="font-weight: bold; padding: 5px; border-right: 1px solid black; border-bottom: 1px solid #000; text-align: left;">
         Flight Number
        </th>
        <th style="font-weight: bold; padding: 5px; border-right: 1px solid black; border-bottom: 1px solid #000; text-align: left;">
         From
        </th>
        <th style="font-weight: bold; padding: 5px; border-right: 1px solid black; border-bottom: 1px solid #000; text-align: left;">
         Departure Time
        </th>
        <th style="font-weight: bold; padding: 5px; border-right: 1px solid black; border-bottom: 1px solid #000; text-align: left;">
         To
        </th>
        <th style="font-weight: bold; padding: 5px; border-bottom: 1px solid #000; text-align: left;">
         Arrival Time
        </th>
       </tr>
       <tr${`${segments?.length > 1 ? " style='border-bottom: 1px solid #000;'" : ""}`}>
        <td style="font-weight: normal; padding: 5px; border-right: 1px solid gray;">
         ${Segment?.Airline?.FlightNumber}, ${Segment?.Airline?.AirlineCode}
        </td>
        <td style="font-weight: normal; padding: 5px; border-right: 1px solid gray;">
         ${getTerminal(Segment?.Origin?.Airport?.Terminal)}
         ${Segment?.Origin?.Airport?.AirportName}, <br />
         ${Segment?.Origin?.Airport?.CityName}
        </td>
        <td style="font-weight: normal; padding: 5px; border-right: 1px solid gray;">
         ${dayjs(Segment?.Origin?.DepTime)?.format('DD MMM YYYY, hh:mm A')}
        </td>
        <td style="font-weight: normal; padding: 5px; border-right: 1px solid gray;">
         ${getTerminal(Segment?.Destination?.Airport?.Terminal)}
         ${Segment?.Destination?.Airport?.AirportName}, <br />
         ${Segment?.Destination?.Airport?.CityName}
        </td>
        <td style="font-weight: normal; padding: 5px;">
         ${dayjs(Segment?.Destination?.ArrTime)?.format('DD MMM YYYY, hh:mm A')}
        </td>
       </tr$>
      </table>
     </section>
    `;
   });

   return details;
  };

  const generateFlightDetails = () => {
   const isFlightCombo = booking?.isFlightCombo;
   let segments = [];

   if(isFlightCombo) {
    const index = booking?.Segments?.findIndex(flight => flight?.Origin?.Airport?.CityCode === booking?.flightCities?.destination);

    const origin = booking?.Segments?.slice(0, index);
    const destination = booking?.Segments?.slice(index,);

    segments?.push(origin, destination);
   } else {
    segments?.push(booking?.Segments);
   };

   let details = ``;

   segments?.forEach(segment => {
    details += `
     <section style="margin: 8px; border: 1px solid black;">
      <div style="border-bottom: 1px solid black; display: table; width: 100%;">
       <div style="display: table-cell; vertical-align: top; padding: 8px; border-right: 1px solid black; font-weight: normal; width: 50%;">
        <p style="margin: 0;">
         ${getTerminal(segment?.[0]?.Origin?.Airport?.Terminal)}
         ${segment?.[0].Origin?.Airport?.AirportName}, ${segment?.[0]?.Origin?.Airport?.CityName}
         to <br />
         ${getTerminal(segment?.[segment?.length - 1]?.Destination?.Airport?.Terminal)}
         ${segment?.[segment?.length - 1]?.Destination?.Airport?.AirportName}, ${segment?.[segment?.length - 1]?.Destination?.Airport?.CityName}
        </p>
        <p style="margin-top: 4px; font-weight: bold;">
         ${dayjs(segment?.[0]?.Origin?.DepTime)?.format('DD MMM YYYY, hh:mm A')} To ${dayjs(segment?.[segment?.length - 1]?.Destination?.ArrTime)?.format('DD MMM YYYY, hh:mm A')}
        </p>
       </div>
       <div style="display: table-cell; width: 50%; padding: 0px;">
        <table style="width: 100%; border-collapse: collapse; height: 100%">
         <tr>
          <td style="border-right: 1px solid black; border-bottom: 1px solid #000; width: 50%; font-weight: normal; padding: 10px;">
           <span>Flight Number</span> <br />
           <p style="font-weight: bold; margin: 0; margin-top: 6px;">
            ${segment?.[0]?.Airline?.FlightNumber}
           </p>
          </td>
          <td style="border-bottom: 1px solid black; width: 50%; font-weight: normal; padding: 10px;">
           <span>Fare Class</span> <br />
           <p style="font-weight: bold; margin: 0; margin-top: 6px;">
            ${segment?.[0]?.Airline?.FareClass}
           </p>
          </td>
         </tr>
         <tr>
          <td style="border: 1px solid black; border-bottom: none; border-left: none; width: 50%; font-weight: normal; padding: 10px;">
           <span>Airline Ref:</span> <br />
           <p style="font-weight: bold; margin: 0; margin-top: 6px;">${booking?.PNR}</p>
          </td>
          <td style="border: 1px solid black; border-bottom: none; border-right: none; width: 50%; font-weight: normal; padding: 10px;">
           <span>CSR Ref:</span><br />
           <p style="font-weight: bold; margin: 0; margin-top: 6px;">${booking?.PNR}</p>
          </td>
         </tr>
        </table>
       </div>
      </div>
     ${getFlightDetails(segment)}
     </section>
    `;
   });

   return details;
  };

  const getPaxDetails = () => {
   const leadPax = booking?.Passenger?.find(pax => pax?.IsLeadPax);

   if (leadPax) {
    const firstName = leadPax?.FirstName || "";
    const lastName = leadPax?.LastName || "";
    const email = leadPax?.Email || "";

    const addressLine2 = leadPax?.AddressLine2 ? `${leadPax?.AddressLine2},` : "";

    const address = `${leadPax?.AddressLine1 || ""}, ${addressLine2} ${leadPax?.City}`;
    const contactNo = leadPax?.ContactNo;

    return {
     name: `${firstName} ${lastName}`,
     email,
     contactNo,
     address,
    };
   };
  };

  const htmlContent = `
  <!DOCTYPE html>
   <html lang="en">
   <head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>ETicket</title>
   </head>
   <body style="font-family: Arial, sans-serif; margin: 0 auto; zoom: 0.5; padding: 5px; background-color: #f9f9f9;">
    <h3 style="text-align: center; margin: 0; margin-bottom: 4px;">E-Ticket</h3>
    <div style="max-width: 100%; margin: auto; background-color: white; border: 1px solid #000;">
     <header>
      <table style="width: 100%;">
       <tr>
        <td style="width: 50%; vertical-align: top; padding: 5px; border-right: 1px solid #000; border-bottom: 1px solid #000;">
         <img src='${officialLogoPath}' style="height: 80px; width: 200px;" alt="Official logo" />
        </td>
        <td style="width: 50%; vertical-align: top; border-bottom: 1px solid #000;">
         <table style="width: 100%; padding: 5px;">
          <tr style="margin: 10px 0;">
           <td style="font-weight: 600; vertical-align: top;">Name:</td>
           <td>${getPaxDetails()?.name}</td>
          </tr>
          <tr style="margin: 10px 0;">
           <td style="font-weight: 600; vertical-align: top;">Address:</td>
            <td>${getPaxDetails()?.address}</td>
           </tr>
           <tr style="margin: 10px 0;">
            <td style="font-weight: 600;" vertical-align: top;>Phone No.:</td>
            <td>${getPaxDetails()?.contactNo}</td>
           </tr>
           <tr style="margin: 10px 0;">
            <td style="font-weight: 600;" vertical-align: top;>Email:</td>
            <td>${getPaxDetails()?.email}</td>
           </tr>
          </table>
         </td>
        </tr>
       </table>
      </header>
      <section style="margin: 8px 0;">
       <table style="width: 100%; border-bottom: 1px solid #000; border-top: 1px solid #000;">
        <tr>
         <td style="width: 33.33%; border-right: 1px solid #000; padding: 8px;">
          <p style="margin: 0; margin-bottom: 4px;">Booking Reference:</p>
          <strong style="font-weight: 600;">${booking?.bookingId}</strong>
         </td>
         <td style="width: 33.33%; border-right: 1px solid #000; padding: 8px;">
          <p style="margin: 0; margin-bottom: 4px;">Date of Booking:</p>
          <strong style="font-weight: 600;">${dayjs(booking?.bookedDate)?.format('DD MMM YYYY, hh:mm A')}</strong>
         </td>
         <td style="width: 33.33%; padding: 8px;">
          <p style="margin: 0; margin-bottom: 4px;">Status:</p>
          <strong style="color: rgb(38, 194, 38); font-weight: 600;">CONFIRMED</strong>
         </td>
        </tr>
       </table>
      </section>
      ${generateFlightDetails()}
      <section style="padding: 8px;">
       <h3 style="margin: 0; margin-bottom: 8px;">Travellers' Details</h3>
        <table style="width: 100%; border-collapse: collapse; border: 1px solid black;">
         <thead>
          <tr>
           <th style="border: 1px solid black; padding: 5px; text-align: left;">Name</th>
           <th style="border: 1px solid black; padding: 5px; text-align: left;">Ticket No.</th>
           <th style="border: 1px solid black; padding: 5px; text-align: left;">Seat No.</th>
           <th style="border: 1px solid black; padding: 5px; text-align: left;">Meals</th>
           <th style="border: 1px solid black; padding: 5px; text-align: left;">Baggage</th>
           <th style="border: 1px solid black; padding: 5px; text-align: left;">
            Baggage out First/ <br />
            Priority Check-in/ <br />
            Sports Equipment
           </th>
           <th style="border: 1px solid black; padding: 5px; text-align: left;">Barcode</th>
          </tr>
         </thead>
         <tbody>
          ${passengers}
         </tbody>
        </table>
       </section>
       <section style="padding: 8px;">
        <h3 style="margin: 0; margin-bottom: 8px;">Contact Details</h3>
        <table style="width: 100%; border: 1px solid #000;">
         <tr>
          <td style="width: 50%;">
           <span>Email:</span>
           <b style="padding-left: 4px; font-weight: 600;">${getContact()?.email}</b>
          </td>
          <td style="width: 50%;">
           <span>Phone Number:</span>
           <b style="padding-left: 4px; font-weight: 600;">${getContact()?.phoneNumber}</b>
          </td>
         </tr>
        </table>
       </section>
       <section style="padding: 8px;">
        <table style="width: 100%; border-collapse: collapse; text-align: left;">
         <thead>
          <tr>
           <th style="border: 1px solid black; padding: 5px;">Base Fare</th>
           <th style="border: 1px solid black; padding: 5px;">Ancillary Fare</th>
           <th style="border: 1px solid black; padding: 5px;">Taxes and Charges</th>
           <th style="border: 1px solid black; padding: 5px;">Service Fee</th>
           <th style="border: 1px solid black; padding: 5px;">Payment Markup</th>
           <th style="border: 1px solid black; padding: 5px;">Discount</th>
           <th style="border: 1px solid black; padding: 5px; font-weight: bold;">Total</th>
          </tr>
         </thead>
         <tbody>
          <tr>
           <td style="border: 1px solid black; padding: 5px;">${getAmount()?.baseFare}</td>
           <td style="border: 1px solid black; padding: 5px;">${getAmount()?.ancillaryFare}</td>
           <td style="border: 1px solid black; padding: 5px;">${getAmount()?.tax?.toFixed(2)}</td>
           <td style="border: 1px solid black; padding: 5px;">${getAmount()?.serviceFee}</td>
           <td style="border: 1px solid black; padding: 5px;">${getAmount()?.paymentMarkup}</td>
           <td style="border: 1px solid black; padding: 5px;">${getAmount()?.discount}</td>
           <td style="border: 1px solid black; padding: 5px;"'>${getAmount()?.total}</td>
          </tr>
         </tbody>
         <tfoot>
          <tr>
           <td colspan="6" style="text-align: right; border: 1px solid black; font-weight: bold; padding: 5px;">
            Total Net Fare:
           </td>
           <td style="text-align: right; border: 1px solid black; font-weight: bold; padding: 5px; text-align: left;">
            ${getCurrencySymbol(booking?.Passenger?.[0]?.Fare?.Currency)} ${getAmount()?.total}
           </td>
          </tr>
         </tfoot>
        </table>
       </section>
       ${getLayovers()}
       <section style="padding: 8px;">
        <div style="background-color: #FFEFC6; padding: 8px;">
         <h3 style="margin: 0; margin-bottom: 2px;">Important Note:</h3>
         <ul style="margin: 0; font-size: 14px; padding: 0 5px;">
          <li style="margin: 4px 0 4px 20px;">Refund/date change penalties up to 100% may apply</li>
          <li style="margin: 4px 0 4px 20px;">Valid ID Proof is needed</li>
          ${isPassportRequired ? `<li style="margin: 4px 0 4px 20px;">Passport proof is required</li>` : ""}
         </ul>
        </div>
       </section>
      </div>
      <script>
       window.onload = function() {
        ${booking?.Passenger?.map((passenger, index) => `
         ${passenger?.BarcodeDetails?.Barcode ? 
          passenger?.BarcodeDetails?.Barcode?.map((barcode, barcodeIndex) => `
           bwipjs.toCanvas('barcode-${index}-${barcodeIndex}', {
           bcid: '${barcode.Format || 'code128'}',
           text: '${barcode.Content}',
           scale: 3,
           height: 10,
           includetext: true,
           textxalign: 'center',
          }).catch(err => console.error(err));
        `).join('') : ''}
      `).join('')}
      };
      </script>
    </body>
   </html>
 `;

  const borderSize = "5mm";

  const options: htmlPdf.CreateOptions = {
   format: 'A4',
   orientation: 'portrait',
   width: '210mm',
   height: '297mm',
   border: {
    top: borderSize,
    right: borderSize,
    bottom: borderSize,
    left: borderSize,
   }
  };

  let filename = "";

  if(booking?.isFlightCombo) {
   const origin = booking?.flightCities || "";
   const destination = booking?.flightCities || "";
   filename = `${origin}-${destination}-${origin}`;
  } else {
   const segments = booking?.Segments; 
   const origin = segments?.[0]?.Origin?.Airport?.CityCode;
   const destination = segments?.[segments?.length - 1]?.Destination?.Airport?.CityCode;
   filename = `${origin}-${destination}`;
  };

  htmlPdf.create(htmlContent, options).toBuffer((err, buffer) => {
   if (err) return res.status(500).send({message: 'Error generating PDF'});

   res.contentType('application/pdf');
   res.setHeader('Access-Control-Expose-Headers', 'Content-Disposition');
   res.setHeader('Content-Disposition', `attachment; filename=TBK-Ticket-${filename}.pdf`);
   return res.send(buffer);
  });
 } catch (error: any) {
  next(error);
 };
};

export default downloadTicket;