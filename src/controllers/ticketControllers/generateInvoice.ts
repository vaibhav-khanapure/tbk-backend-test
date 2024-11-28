import htmlPdf from 'html-pdf';
import type { NextFunction, Request, Response } from "express";
import BookingDetails from '../../database/tables/bookingDetailsTable';

const generateInvoice = async (req: Request, res: Response, next: NextFunction) => {
 try {
  // Fetch booking details from the database (uncomment and implement as needed)
  // const { InvoiceNo } = req.query as { InvoiceNo: string };
  // const bookings = await BookingDetails.findAll({ where: { InvoiceNo } });
  // Generate the HTML content for the invoice
 
//   src/controllers/ticketControllers/generateInvoice.ts
  const htmlContent = `
<div style="border: 1px solid #000;">
    <header>
        <div style="display: block;">
            <div style="float: left; width: 50%; border-right: 1px solid #000; border-bottom: 1px solid #000; padding: 10px;">
                <div style="text-align: left; padding: 2px;">
                    <img src="/assets/images/common/tbklogoold2.png" style="height: 80px; width: 160px;" alt="Official logo" />
                </div>
                <div style="padding: 3px;">
                    <h3 style="font-size: 18px; font-weight: bold;">Fixfly Travels and Tours Pvt Ltd.</h3>
                    <p style="text-align: left;">
                        Ground floor, Plot No.15, L T Colony Road no.3, <br />
                        Modh Vanik vidyarthi bhuvan, Lokmanya Tilak colony <br />
                        DADAR E, Mumbai, Maharashtra, 400014 <br />
                        GSTIN/UIN: 27AADCF5384N1Z2 <br />
                        State Name : Maharashtra, Code : 27 <br />
                        Contact : 9131761489,9131761489 <br />
                        E-Mail : au@ticketbookkaro.com <br />
                        www.ticketbookkaro.com
                    </p>
                </div>
            </div>
            <div style="float: left; width: 50%; border-bottom: 1px solid #000;">
                <div style="padding: 10px; border-bottom: 1px solid #000; border-right: 1px solid #000;">
                    <p>Invoice No.</p>
                    <p style="font-weight: 700; font-size: 18px;">12345</p> <!-- Replace with dynamic data -->
                </div>
                <div style="padding: 10px; border-bottom: 1px solid #000;">
                    <p>Creation Date</p>
                    <p style="font-weight: 700; font-size: 18px;">01 Jan 2023, 10:00 AM</p> <!-- Replace with dynamic data -->
                </div>
            </div>
            <div style="clear: both;"></div> <!-- Clear floats -->
        </div>
        <div style="display: block; border-bottom: 1px solid #000;">
            <div style="text-align: left; float: left; width: 50%; padding: 10px; border-right: 1px solid #000;">
                <p>Consignee (Ship to)</p>
                <h3 style="font-size: 20px; font-weight: bold;">3 S Design private limited</h3>
                <p>
                    Plot no 9, Sarrorpur industrial area Near nagar chowk, <br />
                    Faridabad, Haryana - 121004 <br />
                    GSTIN/UIN : 06AABFZ3151G1ZC <br />
                    State Name : Haryana, Code : 06
                </p>
            </div>
            <div style="text-align: left; float: left; width: 50%; padding: 10px;">
                <p>Buyer (Bill to)</p>
                <h3 style="font-size: 20px; font-weight: bold;">3 S Design private limited</h3>
                <p>
                    Plot no 9, Sarrorpur industrial area Near nagar chowk, <br />
                    Faridabad, Haryana - 121004 <br />
                    GSTIN/UIN : 06AABFZ3151G1ZC <br />
                    State Name : Haryana, Code : 06
                </p>
            </div>
            <div style="clear: both;"></div> <!-- Clear floats -->
        </div>
  `;
  

  const options: htmlPdf.CreateOptions = {
   format: 'A4',
   orientation: 'portrait',
   border: {
    top: "10mm",
    right: "10mm",
    bottom: "10mm",
    left: "10mm"
   },
  };

  htmlPdf.create(htmlContent, options).toBuffer((err, buffer) => {
   if (err) return res.status(500).send('Error generating PDF');

   res.contentType('application/pdf');
   res.setHeader('Content-Disposition', 'attachment; filename=invoice.pdf');
   return res.send(buffer);
  });
 } catch (error) {
  return res.status(500).send('Internal Server Error');
 };
};

export default generateInvoice;