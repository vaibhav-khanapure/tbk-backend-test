import htmlPdf from 'html-pdf';
import type {NextFunction, Request, Response} from "express";
import FlightBookings from '../../database/tables/flightBookingsTable';
import type {BookedFlightTypes, Segment} from '../../types/BookedFlights';
import dayjs from "dayjs";
import getCabinClass from '../../utils/getCabinClass';
import getTimeDifference from '../../utils/getTimeDifference';
import getCurrencySymbol from '../../utils/getCurrencySymbol';
import bwip from "bwip-js";

const downloadTicket = async (req: Request, res: Response, next: NextFunction) => {
 try {
  const {id: userId} = res.locals?.user;
  const {bookingId} = req.query as {bookingId: string;};
  if(!bookingId) return res.status(400).json({message: "Please Provide Booking Id"});

  const booking = await FlightBookings?.findOne({where: {id: bookingId, userId}}) as unknown as BookedFlightTypes;
  if(!booking) return res.status(404).json({message: "No bookings found"});
  if(booking?.flightStatus === "Cancelled") return res.status(400).json({message: "Booking has been Cancelled"});

  const logo = `${process.env.SERVER_URL}/images/tbklogo.png`;
  const airlineImage = `${process.env.SERVER_URL}/images/Airline_images/${booking?.Segments?.[0]?.Airline?.AirlineCode}.gif`;

  const isPassportRequired = booking?.Passenger?.find(passenger => passenger?.PassportNo);

  const getStops = (segments: Segment[]) => {
   if(segments?.length  === 1) return {info: `<span>No Stops</span>`, fullInfo: ""};
   const stops = [] as {CityName: string; stopTime: string; CityCode: string; nextFlight: string}[];

   let info = "";
   let fullInfo = "";

   segments?.forEach((item, index) => {
    if(index === booking?.Segments?.length - 1) return;

    const {CityCode, CityName} = item?.Destination?.Airport;
    const arrTime = item?.Destination?.ArrTime;
    const depTime = booking?.Segments?.[index + 1]?.Origin?.DepTime;
    const stopTime = getTimeDifference(depTime, arrTime);
    const {AirlineCode, FlightNumber} =  booking?.Segments?.[index + 1]?.Airline;
    const nextFlight = `${AirlineCode} ${FlightNumber}`;
    stops.push({CityName, CityCode, stopTime, nextFlight});
   });

   stops?.forEach((stop) => {
    info += `<p">${stop?.CityName}: ${stop?.stopTime}</p>`;
    fullInfo += `<p style="margin: 4px 0">${stop?.stopTime} layover Stopover in ${stop?.CityName} (${stop?.CityCode}), then you will have to change the Flight to ${stop?.nextFlight}</p>`;
   });

   return {info, fullInfo};
  };

  const getAmount = () => {
   let baseFare = 0;
   let tax = 0;
   let seats = 0;
   let meals = 0;
   let serviceFee = 0;
   let paymentMarkup = 0;
   let discount = 0;

   booking?.Passenger?.forEach((passenger) => {
    baseFare += passenger?.tbkFare ? Number(passenger?.tbkFare?.BaseFare) : Number(passenger?.Fare?.BaseFare);

    tax += passenger?.tbkFare ? (Number(passenger?.tbkFare?.Tax) + Number(passenger?.tbkFare?.OtherCharges || 0)) : (Number(passenger?.Fare?.Tax) + Number(passenger?.Fare?.OtherCharges || 0));

    if(passenger?.tbkSeatDynamic || passenger?.SeatDynamic) {
     const Seats = passenger?.tbkSeatDynamic || passenger?.SeatDynamic;
     Seats?.forEach(seat => seats += Number(seat?.Price || 0));
    };

    if(passenger?.tbkMealDynamic || passenger?.MealDynamic) {
     const Meals = passenger?.tbkMealDynamic || passenger?.MealDynamic;
     Meals?.forEach(meal => meals += ((Number(meal?.Price || 0) * Number(meal?.Quantity || 1))));
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
     const barcodes = await Promise.all(passenger?.BarcodeDetails?.Barcode?.map(async (item) => {
      const png = await bwip.toBuffer({
       bcid: item?.Format?.toLocaleLowerCase(),
       text: item?.Content,
       scale: 3,
       height: 10,
       textxalign: 'center',
      //  width: 22,
      // includetext: true,
      });

      return png.toString('base64');
     }) || []);

     barcodes.forEach(img => {
      barcodeList += `<div style="margin: 4px 0;"><img src="data:image/png;base64,${img}" alt="Barcode" style="height: 40px; width: 140px;" /></div>`;
     });
    };

    const dynamicMeal = passenger?.tbkMealDynamic || passenger?.MealDynamic;

    const traveller = `
     <tr>
      <td style="border: 1px solid black; padding: 5px;">${passenger?.Title} ${passenger?.FirstName} ${passenger?.LastName}</td>
      <td style="border: 1px solid black; padding: 5px;">${passenger?.Ticket?.TicketId}</td>
      <td style="border: 1px solid black; padding: 5px;">
       ${(passenger?.Seat || passenger?.SeatDynamic) ? (passenger?.Seat ? passenger?.Seat?.Code : passenger?.SeatDynamic?.map(seat => seat?.Code).join(", ")) : "-"}
      </td>
      <td style="border: 1px solid black; padding: 5px;">
       ${(passenger?.Meal || dynamicMeal) ? (passenger?.Meal ? passenger?.Meal?.Code : dynamicMeal?.map((meal) => `<p>${meal?.AirlineDescription || meal?.Description} X ${meal?.Quantity || 1}</p>`)) : "-"}
      </td>
      <td style="border: 1px solid black; padding: 5px;">-</td>
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
   } else segments?.push(booking?.Segments);

   segments?.forEach(segment => {
    layovers += getStops(segment)?.fullInfo ? (
     `
      <section style="padding: 8px">
       <div style="font-size: 14px; padding: 5px; border: 1px solid #000">
        <h3 style="margin: 0; padding: 0;">Stopover(s)</h3>
        ${getStops(segment)?.fullInfo}
       </div>
      </section>
     `
    ) : "";
   });

   return layovers;
  };

  const generateFlightDetails = () => {
   const isFlightCombo = booking?.isFlightCombo;
   let segments = [];

   if(isFlightCombo) segments?.push([booking?.Segments?.[0]],[booking?.Segments?.[1]]);
   else segments?.push(booking?.Segments);

   let details = ``;

   segments?.forEach(segment => {
    details += `
     <section style="margin: 8px; border: 1px solid black;">
      <div style="border-bottom: 1px solid black; display: table; width: 100%;">
       <div style="display: table-cell; vertical-align: top; padding: 8px; border-right: 1px solid black; font-weight: normal; width: 50%;">
        <p style="margin: 0;">
         Terminal ${segment?.[0].Origin?.Airport?.Terminal}, <br />
         ${segment?.[0].Origin?.Airport?.AirportName}, ${segment?.[0]?.Origin?.Airport?.CityName}
         to <br />
         Terminal ${segment?.[segment?.length - 1]?.Destination?.Airport?.Terminal}, <br />
         ${segment?.[segment?.length - 1]?.Destination?.Airport?.AirportName}, ${segment?.[segment?.length - 1]?.Destination?.Airport?.CityName}
        </p>
        <p style="margin-top: 4px; font-weight: bold;">
         ${dayjs(segment?.[0]?.Origin?.DepTime)?.format('DD MMM YYYY, hh:mm A')}
        </p>
        </div>
        <div style="display: table-cell; width: 50%;">
         <table style="width: 100%; border-collapse: collapse;">
          <tr>
           <td style="border-right: 1px solid black; border-bottom: 1px solid #000; width: 50%; font-weight: normal; padding: 8px;">
            <span>Flight Number</span><br />
            <p style="font-weight: bold; margin: 0; margin-top: 6px;">
             ${segment?.[0]?.Airline?.FlightNumber}
            </p>
           </td>
           <td style="border-bottom: 1px solid black; width: 50%; font-weight: normal; padding: 8px;">
            <span>Fare Class</span><br />
            <p style="font-weight: bold; margin: 0; margin-top: 6px;">
             ${segment?.[0]?.Airline?.FareClass}
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
              ${segment?.[0]?.Airline?.AirlineName}
             </span>
            </div>
           </div>
          </td>
          <td style="border-right: 1px solid gray; padding: 8px; height: 100%; vertical-align: top;">
           <div style="height: 100%;">
            <span>Travel Class</span><br />
            <p style="font-weight: bold; margin: 0; margin-top: 8px;">
            ${getCabinClass(segment?.[0]?.CabinClass)}
            </p>
           </div>
          </td>
          <td style="border-right: 1px solid gray; padding: 8px; height: 100%; vertical-align: top;">
           <div style="height: 100%;">
            <span>Check-In Baggage</span><br />
            <p style="font-weight: bold; margin: 0; margin-top: 8px;">
             ${segment?.[0]?.Baggage || "No Detail Available"}
            </p>
           </div>
          </td>
          <td style="padding: 8px; height: 100%; vertical-align: top;">
           <div style="height: 100%;">
            <span>Cabin Baggage</span><br />
            <p style="font-weight: bold; margin: 0; margin-top: 8px;">
             ${segment?.[0]?.CabinBaggage || "No Detail Available"}
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
           From (Terminal)
          </th>
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
           ${segment?.[0]?.Airline?.FlightNumber}, ${segment?.[0]?.Airline?.AirlineCode}
          </td>
          <td style="font-weight: normal; padding: 5px; border-right: 1px solid gray;">
           Terminal ${segment?.[0]?.Origin?.Airport?.Terminal}, <br />
           ${segment?.[0]?.Origin?.Airport?.AirportName}, <br />
           ${segment?.[0]?.Origin?.Airport?.CityName}
          </td>
          <td style="font-weight: normal; padding: 5px; border-right: 1px solid gray;">
           ${dayjs(segment?.[0]?.Origin?.DepTime)?.format('DD MMM YYYY, hh:mm A')}
          </td>
          <td style="font-weight: normal; padding: 5px; border-right: 1px solid gray;">
           ${getStops(segment)?.info}
          </td>
          <td style="font-weight: normal; padding: 5px; border-right: 1px solid gray;">
           Terminal ${segment?.[segment?.length - 1]?.Destination?.Airport?.Terminal}, <br />
           ${segment?.[segment?.length - 1]?.Destination?.Airport?.AirportName}, <br />
           ${segment?.[segment?.length - 1]?.Destination?.Airport?.CityName}
          </td>
          <td style="font-weight: normal; padding: 5px;">
           ${dayjs(segment?.[segment?.length - 1]?.Destination?.ArrTime)?.format('DD MMM YYYY, hh:mm A')}
          </td>
         </tr>
        </table>
       </section>
      </section>
    `;
   });

   return details;
  };

  const htmlContent = `
  <!DOCTYPE html>
   <html lang="en">
   <head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>ETicket</title>
   </head>
   <body style="font-family: Arial, sans-serif; margin: 0 auto; zoom: 0.75; padding: 5px; background-color: #f9f9f9;">
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

  let filename = "";

  if(booking?.isFlightCombo) {
   const {origin, destination} = booking?.flightCities;
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