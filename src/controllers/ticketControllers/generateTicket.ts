import htmlPdf from 'html-pdf';
import type { NextFunction, Request, Response } from "express";
import BookingDetails from '../../database/tables/bookingDetailsTable';
import type { BookedFlightTypes } from '../../types/BookedFlights';
import dayjs from "dayjs";
import getCabinClass from '../../utils/getCabinClass';
import getTimeDifference from '../../utils/getTimeDifference';
import * as bwipjs from 'bwip-js';
import getCurrencySymbol from '../../utils/getCurrencySymbol';

const generateTicket = async (req: Request, res: Response, next: NextFunction) => {
 try {
  const {bookingId} = req.query as {bookingId: string;};
  if(!bookingId) return res.status(400).json({message: "Please Provide Booking Id"});

  const booking = await BookingDetails?.findOne({ where: { id: bookingId } }) as unknown as BookedFlightTypes;
  if(!booking) return res.status(404).json({message: "No bookings found"});

  const logo = `${process.env.SERVER_URL}/images/tbklogo.png`;
  const airlineImage = `${process.env.SERVER_URL}/images/Airline_images/${booking?.Segments?.[0]?.Airline?.AirlineCode}.gif`;

  const getStops = () => {
   if(booking?.Segments?.length < 2) return "No Stops";
   let stops = "";

   booking?.Segments?.slice(0, booking?.Segments?.length - 1).forEach((segment, index) => {
    const time = getTimeDifference(segment?.Destination?.ArrTime, booking?.Segments?.[index - 1]?.Origin?.DepTime);
    const city = segment?.Destination?.Airport?.CityName;
    stops += `<p>${city}: ${time}</p>`;
   });

   return stops;
  };

  const getAmount = () => {
   let baseFare = 0;
   let tax = 0;
   let seats = 0;
   let meals = 0;
   let serviceFee = 0;
   let paymentMarkup = 0;
   let discount = 0;
  
   booking?.Passenger?.forEach((passenger, index) => {
    baseFare += passenger?.tbkFare ? Number(passenger?.tbkFare?.BaseFare) : Number(passenger?.Fare?.BaseFare);
    tax += passenger?.tbkFare ? (Number(passenger?.tbkFare?.Tax) + Number(passenger?.tbkFare?.OtherCharges || 0)) : (Number(passenger?.Fare?.Tax) + Number(passenger?.Fare?.OtherCharges || 0));
     
    if(passenger?.SeatDynamic) {
     const Seats = passenger?.tbkSeatDynamic || passenger?.SeatDynamic;
     Seats?.forEach(seat => seats += Number(seat?.Price || 0));
    };
  
    if(passenger?.MealDynamic) {
     const Meals = passenger?.tbkMealDynamic || passenger?.MealDynamic;
     Meals?.forEach(meal => meals += Number(meal?.Price || 0));
    };
   });
  
   const ancillaryFare = seats + meals;
   const total = baseFare + tax + ancillaryFare + discount + serviceFee + paymentMarkup;
  
   return {seats, meals, ancillaryFare, baseFare, tax, total, discount, serviceFee, paymentMarkup};
  };

  const getContact = () => {
   const lead = booking?.Passenger?.find(traveller => traveller?.IsLeadPax);
   const email = lead?.Email;
   const phoneNumber = lead?.ContactNo;

   return {email, phoneNumber};
  };

  const getPassengers = () => {
   let passengers = "";

   booking?.Passenger?.forEach((passenger, index) => {
    const barcodeCanvasId = `barcode-${index}`;

    const barcodeContent = passenger?.BarcodeDetails?.Barcode?.[0]?.Content;

    const traveller = `
     <tr>
      <td style="border: 1px solid black; padding: 5px;">${passenger?.Title} ${passenger?.FirstName} ${passenger?.LastName}</td>
      <td style="border: 1px solid black; padding: 5px;">${passenger?.Ticket?.TicketId}</td>
      <td style="border: 1px solid black; padding: 5px;">
       ${(passenger?.Seat || passenger?.SeatDynamic) ? (passenger?.Seat ? passenger?.Seat?.Code : passenger?.SeatDynamic?.map(seat => seat?.Code).join(", ")) : "-"}
      </td>
      <td style="border: 1px solid black; padding: 5px;">
       ${(passenger?.Meal || passenger?.MealDynamic) ? (passenger?.Meal ? passenger?.Meal?.Code : passenger?.MealDynamic?.map((meal) => (
        `<p>
          ${meal?.AirlineDescription || meal?.Description}  
         </p>`
        ))) : "-"}
      </td>
      <td style="border: 1px solid black; padding: 5px;">-</td>
      <td style="border: 1px solid black; padding: 5px;">-</td>
      <td style="border: 1px solid black; padding: 5px;">
       <canvas id="${barcodeCanvasId}" style="width: 140px; height: 60px;"></canvas>
      </td>
     </tr>
    `;

    passengers += traveller;
   });

   return passengers;
  };

  const htmlContent = `
  <!DOCTYPE html>
   <html lang="en">
   <head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>ETicket</title>
   </head>
   <body style="font-family: Arial, sans-serif; margin: 0 auto; max-width: 100%; padding: 5px; background-color: #f9f9f9;">
    <h3 style="text-align: center; margin: 0; margin-bottom: 4px;">E-Ticket</h3>
    <div style="max-width: 100%; margin: auto; background-color: white; border: 1px solid #000;">
     <header>
      <table style="width: 100%;">
       <tr>
        <td style="width: 50%; vertical-align: top; padding: 5px; border-right: 1px solid #000; border-bottom: 1px solid #000;">
         <img src='${logo}' style="height: 80px; width: 200px;" alt="Official logo" />
        </td>
        <td style="width: 50%; vertical-align: top; border-bottom: 1px solid #000;">
         <table style="width: 100%; padding: 5px;">
          <tr style="margin: 10px 0;">
           <td style="font-weight: 600; vertical-align: top;">Name:</td>
           <td>FIXFLY TRAVEL AND TOURS <br /> PRIVATE LIMITED</td>
          </tr>
          <tr style="margin: 10px 0;">
           <td style="font-weight: 600; vertical-align: top;">Address:</td>
            <td>
             GROUND FLOOR L T COLONY <br />
             ROAD NO.3 PLOT NO.15,MODH <br />
             VANIK VIDYARTHI BHUVAN, <br />
             LOKMANYA TILAK <br />
             COLONY,DADAR <br />
             Mumbai - 400014 <br />
             MAHARASHTRA
            </td>
           </tr>
           <tr style="margin: 10px 0;">
            <td style="font-weight: 600;" vertical-align: top;>Phone No.:</td>
            <td>91-9131761489</td>
           </tr>
           <tr style="margin: 10px 0;">
            <td style="font-weight: 600;" vertical-align: top;>Email:</td>
            <td>Accounts.tbk@ticketbookkaro.com</td>
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
      <section style="margin: 8px; border: 1px solid black;">
       <div style="border-bottom: 1px solid black; display: table; width: 100%;">
        <div style="display: table-cell; vertical-align: top; padding: 8px; border-right: 1px solid black; font-weight: normal; width: 50%;">
         <p style="margin: 0;">
          Terminal ${booking?.Segments?.[0]?.Origin?.Airport?.Terminal}, <br />
          ${booking?.Segments?.[0]?.Origin?.Airport?.AirportName}, ${booking?.Segments?.[0]?.Origin?.Airport?.CityName}
          to <br />
          Terminal ${booking?.Segments?.[booking?.Segments?.length - 1]?.Destination?.Airport?.Terminal}, <br />
          ${booking?.Segments?.[booking?.Segments?.length - 1]?.Destination?.Airport?.AirportName}, ${booking?.Segments?.[booking?.Segments?.length - 1]?.Destination?.Airport?.CityName}
         </p>
         <p style="margin-top: 4px; font-weight: bold;">
          ${dayjs(booking?.Segments?.[0]?.Origin?.DepTime)?.format('DD MMM YYYY, hh:mm A')}
         </p>
        </div>
        <div style="display: table-cell; width: 50%;">
         <table style="width: 100%; border-collapse: collapse;">
          <tr>
           <td style="border-right: 1px solid black; border-bottom: 1px solid #000; width: 50%; font-weight: normal; padding: 8px;">
            <span>Flight Number</span><br />
            <p style="font-weight: bold; margin: 0; margin-top: 6px;">
             ${booking?.Segments?.[0]?.Airline?.FlightNumber}
            </p>
           </td>
           <td style="border-bottom: 1px solid black; width: 50%; font-weight: normal; padding: 8px;">
            <span>Fare Class</span><br />
            <p style="font-weight: bold; margin: 0; margin-top: 6px;">
             ${booking?.Segments?.[0]?.Airline?.FareClass}
            </p>
           </td>
          </tr>
          <tr>
           <td style="border: 1px solid black; border-left: none; width: 50%; font-weight: normal; padding: 8px;">
            <span>Airline Ref:</span><br />
            <p style="font-weight: bold; margin: 0; margin-top: 6px;">${booking?.PNR}</p>
           </td>
           <td style="border: 1px solid black; border-right: none; width: 50%; font-weight: normal; padding: 8px;">
            <span>CSR Ref:</span><br />
            <p style="font-weight: bold; margin: 0; margin-top: 6px;">${booking?.PNR}</p>
           </td>
          </tr>
         </table>
        </div>
       </div>
       <section>
        <table style="width: 100%; border-collapse: collapse;">
         <tr style="height: 80px;">
          <td style="border-right: 1px solid gray; padding: 8px; height: 100%; vertical-align: top;">
           <div style="height: 100%;">
            <img src='${airlineImage}' style="height: 36px; width: 36px;" alt="Image" style="margin-right: 4px;" />
            <div style="height: 36px; width: 36px; vertical-align: top;">
             <span style="font-weight: bold;">
              ${booking?.Segments?.[0]?.Airline?.AirlineName}
             </span>
            </div>
           </div>
          </td>
          <td style="border-right: 1px solid gray; padding: 8px; height: 100%; vertical-align: top;">
           <div style="height: 100%;">
            <span>Travel Class</span><br />
            <p style="font-weight: bold; margin: 0; margin-top: 8px;">
             ${getCabinClass(booking?.Segments?.[0]?.CabinClass)}
            </p>
           </div>
          </td>
          <td style="border-right: 1px solid gray; padding: 8px; height: 100%; vertical-align: top;">
           <div style="height: 100%;">
            <span>Check-In Baggage</span><br />
            <p style="font-weight: bold; margin: 0; margin-top: 8px;">
             ${booking?.Segments?.[0]?.Baggage || "No Detail Available"}
            </p>
           </div>
          </td>
          <td style="padding: 8px; height: 100%; vertical-align: top;">
           <div style="height: 100%;">
            <span>Cabin Baggage</span><br />
            <p style="font-weight: bold; margin: 0; margin-top: 8px;">
             ${booking?.Segments?.[0]?.CabinBaggage || "No Detail Available"}
            </p>
           </div>
          </td>
         </tr>
        </table>
       </section>
       <section>
        <table style="width: 100%; border-collapse: collapse; border-top: 1px solid black;">
         <tr>
          <th style="font-weight: bold; padding: 5px; border-right: 1px solid black; border-bottom: 1px solid #000; text-align: left;">
           Flight Number
          </th>
          <th style="font-weight: bold; padding: 5px; border-right: 1px solid black; border-bottom: 1px solid #000; text-align: left;">
           From (Terminal)</th>
          <th style="font-weight: bold; padding: 5px; border-right: 1px solid black; border-bottom: 1px solid #000; text-align: left;">
           Departure Time
          </th>
          <th style="font-weight: bold; padding: 5px; border-right: 1px solid black; border-bottom: 1px solid #000; text-align: left;">
           Stops
          </th>
          <th style="font-weight: bold; padding: 5px; border-right: 1px solid black; border-bottom: 1px solid #000; text-align: left;">
           To (Terminal)
          </th>
          <th style="font-weight: bold; padding: 5px; border-bottom: 1px solid #000; text-align: left;">
           Arrival Time
          </th>
         </tr>
         <tr>
          <td style="font-weight: normal; padding: 5px; border-right: 1px solid gray;">
           ${booking?.Segments?.[0]?.Airline?.FlightNumber}, ${booking?.Segments?.[0]?.Airline?.AirlineCode}
          </td>
          <td style="font-weight: normal; padding: 5px; border-right: 1px solid gray;">
           Terminal ${booking?.Segments?.[0]?.Origin?.Airport?.Terminal}, <br />
           ${booking?.Segments?.[0]?.Origin?.Airport?.AirportName}, <br />
           ${booking?.Segments?.[0]?.Origin?.Airport?.CityName}
          </td>
          <td style="font-weight: normal; padding: 5px; border-right: 1px solid gray;">
           ${dayjs(booking?.Segments?.[0]?.Origin?.DepTime)?.format('DD MMM YYYY, hh:mm A')}
          </td>
          <td style="font-weight: normal; padding: 5px; border-right: 1px solid gray;">
           ${getStops()}
          </td>
          <td style="font-weight: normal; padding: 5px; border-right: 1px solid gray;">
           Terminal ${booking?.Segments?.[booking?.Segments?.length - 1]?.Destination?.Airport?.Terminal}, <br />
           ${booking?.Segments?.[booking?.Segments?.length - 1]?.Destination?.Airport?.AirportName}, <br />
           ${booking?.Segments?.[booking?.Segments?.length - 1]?.Destination?.Airport?.CityName}
          </td>
          <td style="font-weight: normal; padding: 5px;">
           ${dayjs(booking?.Segments?.[booking?.Segments?.length - 1]?.Destination?.ArrTime)?.format('DD MMM YYYY, hh:mm A')}
          </td>
         </tr>
        </table>
       </section>
      </section>
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
          ${getPassengers()}
         </tbody>
        </table>
       </section>
       <section style="padding: 8px;">
        <h3 style="margin: 0; margin-bottom: 8px;">Contact Details</h3>
        <table style="width: 100%;">
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
           <td style="border: 1px solid black; padding: 5px;">${getAmount()?.tax}</td>
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
       <p style="font-size: 14px; padding: 0 5px;">
        Important Note: Refund/date change penalties up to 100% may apply
       </p>
      </div>
      <script>
       window.onload = function() {
        ${booking?.Passenger?.map((passenger, index) => `
         bwipjs.toCanvas('barcode-${index}', {
         bcid: '${passenger?.BarcodeDetails?.Barcode?.[0]?.Format || 'code128'}',
         text: '${passenger?.BarcodeDetails?.Barcode?.[0]?.Content}',
         scale: 3,
         height: 10,
         includetext: true,
         textxalign: 'center',
        }).catch(err => console.error(err));
       `).join('')}
       };
      </script>
     </body>
    </html>
  `;

  const borderSize = "5mm"

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
   },
  };

  htmlPdf.create(htmlContent, options).toBuffer((err, buffer) => {
   if (err) return res.status(500).send('Error generating PDF');

   res.contentType('application/pdf');
   res.setHeader('Content-Disposition', 'attachment; filename=ticket.pdf');
   return res.send(buffer);
  });
 } catch (error) {
  console.log("$$$$$$$$$$$$$$$$$", error?.message);
  next(error);
 };
};

export default generateTicket;