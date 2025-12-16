import type {NextFunction, Request, Response} from "express";
import type {BookedFlightTypes} from '../../types/BookedFlights';
import {officialLogoPath} from '../../config/paths';
import htmlPdf from 'html-pdf';
import FlightBookings from '../../database/tables/flightBookingsTable';
import numberToWords from 'number-to-words';
import dayjs from "dayjs";
import Users from '../../database/tables/usersTable';
import Discounts from '../../database/tables/discountsTable';

interface searchParams {
 InvoiceNo: string;
 eT?: number;
};

const downloadInvoice = async (req: Request, res: Response, next: NextFunction) => {
 try {
  const userId = res.locals?.user?.id;
  const {InvoiceNo, eT} = req?.query as unknown as searchParams;

  if (!userId) return res.status(401).json({message: "Unauthorized"});
  if (!InvoiceNo) return res.status(400).json({message: "Please Provide an Invoice No."});

  const [user, discounts, bookings] = await Promise.all([
   Users.findByPk(userId, {
    raw: true,
    attributes: ["GSTNumber", "GSTCompanyAddress", "name"],
   }),
   Discounts.findAll({where: {userId}, raw: true}),
   FlightBookings?.findAll({
    where: {InvoiceNo, userId},
    raw: true,
    limit: 2,
    attributes: {
     exclude: ["created_at", "updated_at", "tboAmount", "tboPassenger", "discountUpdatedByStaffId", "cancelledTickets", "fareType", "userId"]
    }
   }),
  ]);

  if (!user) return res.status(404).json({message: "No user found"});
  if (!bookings?.length) return res.status(404).json({message: "No bookings found"});

  const getMarkupDiscount = (fareType: string) => {
   const Discount = discounts?.find((discount) => discount?.fareType === fareType);
   if (!Discount) return 0;
   return Number(Discount?.markup || 0) - Number(Discount?.discount || 0);
  };

  const getAmounts = () => {
   let invoiceAmount = bookings?.reduce((acc, defVal) => acc + Number(defVal?.tbkAmount), 0);
   const serviceCharge = 87.99;
   const IGST = 13.33;
   const less = 0;

   let tax = bookings?.reduce((acc, defVal) => {
    const totalTax = defVal?.Passenger?.reduce((accumulator, val) => {
     type ObjectKeys<T> = keyof T;

     const fare = val?.Fare;
     const props: ObjectKeys<typeof fare>[] = ["Tax", "OtherCharges", "TransactionFee", "ServiceFee", "AdditionalTxnFeePub", "AirlineTransFee"];

     let total = 0;
     props?.forEach(prop => total += Number(fare?.[prop] || 0));

     return accumulator + total;
    }, 0);

    // return acc + totalTax + getMarkupDiscount(defVal?.fareType);
    return acc + totalTax + Number(defVal?.markup);
   }, 0);

   tax = Number(tax?.toFixed(2));

   let total = Number((invoiceAmount + serviceCharge + IGST - less)?.toFixed(2));

   if (eT && Number(eT)) {
    const eAmt = Number(eT);

    invoiceAmount += eAmt;
    tax += eAmt;
    total += eAmt;
   };

   return {invoiceAmount, tax, total, serviceCharge, IGST, less};
  };

  const getAddress = () => {
   let address = "";
 
   if (user?.GSTCompanyAddress) address = user?.GSTCompanyAddress;
   else {
    const {AddressLine1, AddressLine2, City} = bookings?.[0]?.Passenger?.[0];
    address = `${AddressLine1}, ${AddressLine2}, ${City}`;
   };

   return `${address?.split(",").join(",<br />")}`;
  };

  const getRemarks = () => {
   let remarks = "";

   bookings?.forEach(booking => {
    const flightDate = dayjs(booking?.Segments?.[0]?.Origin?.DepTime)?.format('DD-MMM-YYYY');
    const leadPassenger = booking?.Passenger?.find(traveller => traveller?.IsLeadPax) as BookedFlightTypes["Passenger"][0];
    const leadPax = `${leadPassenger?.Title || ""} ${leadPassenger?.FirstName || ""} ${leadPassenger?.LastName || ""}`;
    const FareClass = booking?.Segments?.[0]?.Airline?.FareClass;
    const FlightNumber = booking?.Segments?.[0]?.Airline?.FlightNumber;
    const flightInfo = `${FareClass || ""}-${FlightNumber || ""}`;
    const PNR = booking?.PNR;
  
    const origin = booking?.Segments?.[0]?.Origin?.Airport?.CityCode;
    let destination = booking?.Segments?.[booking?.Segments?.length - 1]?.Destination?.Airport?.CityCode;
    if (booking?.flightCities?.destination) destination = booking?.flightCities?.destination;
    const cities = `${origin}-${destination}`;

    remarks += `<p>${flightDate} ${leadPax} ${flightInfo} ${cities} ${PNR}</p>`;
   });

   return remarks;
  };

  const {IGST, invoiceAmount, less, serviceCharge, tax, total} = getAmounts();

  const htmlContent = `
   <!DOCTYPE HTML PUBLIC "-//W3C//DTD HTML 4.01 Transitional//EN" "http://www.w3.org/TR/html4/loose.dtd">
    <html lang="en">
     <head>
      <meta http-equiv="Content-Type" content="text/html; charset=UTF-8">
      <title>Invoice</title>
     </head>
     <body style="font-family: Arial, sans-serif; margin: 0; zoom: 0.5; padding: 10px; background-color: #f9f9f9;">
      <div class="invoice-box" id="eticketRef" style="max-width: 100%; margin: auto; padding: 10px; background-color: white;">
       <h2 style="text-align: center; margin-bottom: 10px; font-size: 20px; font-weight: bold;">
        Fixfly Travel and Tours Pvt Ltd.
       </h2>
       <div style="border: 1px solid #000;">
        <header>
         <table style="width: 100%; border-collapse: collapse; font-size: 12px;">
          <tr>
           <td style="width: 50%; border-right: 1px solid #000; border-bottom: 1px solid #000; padding: 5px;">
            <div style="text-align: left; padding: 2px;">
             <img src='${officialLogoPath}' style="height: 60px; width: 120px;" alt="Official logo" />
            </div>
            <div style="padding: 2px;">
             <h3 style="font-size: 16px; font-weight: bold;">Fixfly Travels and Tours Pvt Ltd.</h3>
             <p style="text-align: left; margin: 0; font-size: 16px; font-weight: 400; line-height: 1.4; letter-spacing: 0.5px;">
              Ground floor, Plot No.15, L T Colony Road no.3, <br />
              Modh Vanik vidyarthi bhuvan, Lokmanya Tilak colony, <br />
              DADAR E, Mumbai, Maharashtra, 400014, <br />
              GSTIN/UIN: 27AADCF5384N1Z2 <br />
              State Name : Maharashtra, Code : 27 <br />
              Contact : 9131761489, 9131761489 <br />
              E-Mail : au@ticketbookkaro.com <br />
              www.ticketbookkaro.com
             </p>
            </div>
           </td>
           <td style="width: 25%; border-bottom: 1px solid #000; vertical-align: top; text-align: center;">
            <div style="padding: 5px; border-bottom: 1px solid #000; border-right: 1px solid #000;">
             <p style="margin: 0;">Invoice No.</p>
             <p style="font-weight: 600; font-size: 12px; margin: 5px;">${bookings?.[0]?.InvoiceNo}</p>
            </div>
           </td>
           <td style="width: 25%; vertical-align: top; text-align: center; border-bottom: 1px solid #000;">
            <div style="padding: 5px; border-bottom: 1px solid #000;">
             <p style="margin: 0;">Creation Date</p>
             <p style="font-weight: 600; font-size: 12px; margin: 5px;">
              ${dayjs(bookings?.[0]?.bookedDate)?.format('DD MMM YYYY, hh:mm A')}
             </p>
            </div>
            </td>
           </tr>
          </table>
          <table style="width: 100%; border-collapse: collapse; border-bottom: 1px solid #000; font-size: 12px;">
           <tr>
            <td style="text-align: left; padding: 5px; border-right: 1px solid #000;">
             <p>Consignee (Ship to)</p>
             <h3 style="font-size: 14px; font-weight: bold;">${user?.name}</h3>
             <p style="margin: 0; font-size: 15px; letter-spacing: 1px; font-weight: 400; line-height: 1.4;">
              ${getAddress()}
             </p>
             <p style="font-size: 14px; letter-spacing: 0.5px;">
              GSTIN/UIN : <span style="font-weight: 600;">${user?.GSTNumber || "06AABFZ3151G1ZC"}</span>
             </p>
            </td>
            <td style="text-align: left; padding: 10px;">
             <p>Buyer (Bill to)</p>
             <h3 style="font-size: 16px; font-weight: bold;">${user?.name}</h3>
             <p style="margin: 0; font-size: 14px; letter-spacing: 1px; font-weight: 400; line-height: 1.4;">
              ${getAddress()}
             </p>
             <p style="font-size: 14px; letter-spacing: 0.5px;">
              GSTIN/UIN : <span style="font-weight: 600;">${user?.GSTNumber || "06AABFZ3151G1ZC"}</span>
             </p>
            </td>
           </tr>
          </table>
         </header>
         <section>
          <table style="width: 100%; border-collapse: collapse; margin: 10px 0;">
           <thead>
            <tr>
             <th style="border: 1px solid #222; padding: 8px; text-align: left; border-left: none;">Sr. No.</th>
             <th style="border: 1px solid #222; padding: 8px; text-align: left;">Particulars</th>
             <th style="border: 1px solid #222; padding: 8px; text-align: left;">HSN/HAC</th>
             <th style="border: 1px solid #222; padding: 8px; text-align: left; border-right: none;">Amount</th>
            </tr>
           </thead>
           <tbody>
            <tr>
             <td style="border: 1px solid #222; padding: 8px; border-left: none;">1</td>
             <td style="border: 1px solid #222; padding: 8px;">Airline Ticket Sold</td>
             <td style="border: 1px solid #222; padding: 8px;">998559</td>
             <td style="border: 1px solid #222; padding: 8px; border-right: none;">${invoiceAmount}</td>
            </tr>
            <tr>
             <td style="border: 1px solid #222; padding: 8px; border-left: none;">2</td>
             <td style="border: 1px solid #222; padding: 8px;">Service Charge Received</td>
             <td style="border: 1px solid #222; padding: 8px;">998559</td>
             <td style="border: 1px solid #222; padding: 8px; border-right: none;">${serviceCharge}</td>
            </tr>
            <tr>
             <td style="border: 1px solid #222; padding: 8px; border-left: none;"></td>
             <td style="border: 1px solid #222; padding: 8px;">IGST</td>
             <td style="border: 1px solid #222; padding: 8px;"></td>
             <td style="border: 1px solid #222; padding: 8px; border-right: none;">${IGST}</td>
            </tr>
            <tr>
             <td style="border: 1px solid #222; padding: 8px; border-left: none;"></td>
             <td style="border: 1px solid #222; padding: 8px;">Less : ROUND OFF</td>
             <td style="border: 1px solid #222; padding: 8px;"></td>
             <td style="border: 1px solid #222; padding: 8px; border-right: none;">-${less}</td>
            </tr>
           </tbody>
           <tfoot>
            <tr>
             <td style="border: 1px solid #222; padding: 8px; border-left: none;"></td>
             <td style="border: 1px solid #222; padding: 8px;">Total</td>
             <td style="border: 1px solid #222; padding: 8px;"></td>
             <td style="border: 1px solid #222; padding: 8px; border-right: none;">
              <strong>${total}</strong>
             </td>
            </tr>
           </tfoot>
          </table>
         </section>
         <section>
          <div style="padding: 5px;">
           <div style="text-align: left; margin-bottom: 5px;">
            <span>Amount Chargeable (in words)</span>
            <span style="float: right;">E. & O.E</span>
           </div>
           <p style="margin-top: 2px;">
            <strong style="text-transform: capitalize;">${numberToWords.toWords(total)} ${String(total).includes(".") ? ` and ${numberToWords.toWords(String(total).split(".")[1])}` : ""}</strong>
          </div>
          <table style="width: 100%; border-collapse: collapse; font-size: 12px;">
           <thead>
            <tr>
             <th style="border: 1px solid #222; padding: 8px; border-left: none;">HSN/SAC</th>
             <th style="border: 1px solid #222; padding: 8px;">Taxable Value</th>
             <th style="border: 1px solid #222; padding: 8px;" colspan="2">IGST</th>
             <th style="border: 1px solid #222; padding: 8px; border-right: none;">Total Tax Amount</th>
            </tr>
            <tr>
             <th style="border: 1px solid #222; padding: 8px; border-left: none;"></th>
             <th style="border: 1px solid #222; padding: 8px;"></th>
             <th style="border: 1px solid #222; padding: 8px;">Rate</th>
             <th style="border: 1px solid #222; padding: 8px;">Amount</th>
             <th style="border: 1px solid #222; padding: 8px; border-right: none;"></th>
            </tr>
           </thead>
           <tbody>
            <tr>
             <td style="border: 1px solid #222; padding: 8px; border-left: none;">998559</td>
             <td style="border: 1px solid #222; padding: 8px;">${invoiceAmount}</td>
             <td style="border: 1px solid #222; padding: 8px;">0%</td>
             <td style="border: 1px solid #222; padding: 8px;"></td>
             <td style="border: 1px solid #222; padding: 8px; border-right: none;"></td>
            </tr>
            <tr>
             <td style="border: 1px solid #222; padding: 8px; border-left: none;">998559</td>
             <td style="border: 1px solid #222; padding: 8px;">84.75</td>
             <td style="border: 1px solid #222; padding: 8px;">18%</td>
             <td style="border: 1px solid #222; padding: 8px;">15.26</td>
             <td style="border: 1px solid #222; padding: 8px; border-right: none;">15.26</td>
            </tr>
            <tr>
             <td style="border: 1px solid #222; padding: 8px; border-left: none;"><b>Total</b></td>
             <td style="border: 1px solid #222; padding: 8px;"><b>${total + 84.75}</b></td>
             <td style="border: 1px solid #222; padding: 8px;"></td>
             <td style="border: 1px solid #222; padding: 8px;"><b>15.26</b></td>
             <td style="border: 1px solid #222; padding: 8px; border-right: none;"><b>15.26</b></td>
            </tr>
           </tbody>
          </table>
          <p style="padding: 5px;"><span>Tax Amount (in words) :</span> 
           <b style="text-transform: capitalize;">
            ${numberToWords.toWords(tax)} ${String(tax)?.includes(".") ? ` and ${numberToWords.toWords(String(tax).split(".")[1])}` : ""}
           </b>
          </p>
          <table style="width: 100%; border-top: 1px solid #000; border-collapse: collapse; padding: 5px;">
           <tr>
            <td style="width: 50%; vertical-align: top; border-right: none; padding: 5px; border-right: 1px solid #000;">
             <h3 style="font-size: 16px; font-weight: bold;">Remarks:</h3>
             ${getRemarks()}
             <p>Company's PAN : AADCF5384N</p>
           </td>
           <td style="width: 50%; border-left: none; padding: 5px;">
            <h3 style="font-size: 16px; font-weight: bold;">Company's Bank Details:</h3>
            <p>A/c Holder's Name: Fixfly Travel and Tours Pvt Ltd.</p>
            <p>Bank Name : ICICI Bank Pvt Ltd.</p>
            <p>A/c No. : 003805007763</p>
            <p>Branch & IFS Code: Mumbai-Bandra & ICIC0000038</p>
           </td>
          </tr>
         </table>
        </section>
       </div>
       <footer style="text-align: center; margin-top: 10px;">
        <p style="font-size: 10px;">SUBJECT TO MUMBAI, MAHARASTRA JURISDICTION</p>
        <p style="font-size: 10px;">This is a Computer Generated Invoice</p>
       </footer>
      </div>
     </body>
    </html>
  `;

  const borderSize = "5mm"

  const options: htmlPdf.CreateOptions = {
   format: 'A4',
   orientation: 'portrait',
   width: '210mm', // Custom width for A4
   height: '297mm', // Custom height for A4
   border: {
    top: borderSize,
    right: borderSize,
    bottom: borderSize,
    left: borderSize,
   },
  };

  htmlPdf.create(htmlContent, options).toBuffer((err, buffer) => {
   if (err) return res.status(500).send({message: 'Error generating PDF'});

   res.contentType('application/pdf');
   res.setHeader('Access-Control-Expose-Headers', 'Content-Disposition');
   res.setHeader('Content-Disposition', `attachment; filename=TBK-Invoice-${InvoiceNo}.pdf`);
   return res.send(buffer);
  });
 } catch (error) {
  next(error);
 };
};

export default downloadInvoice;