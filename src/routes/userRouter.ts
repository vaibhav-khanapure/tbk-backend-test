import {Router} from "express";
import fetchUserLedgers from "../controllers/userControllers/fetchUserLedgers";
import verifyToken from "../middlewares/verifyToken";
import downloadLedgers from "../controllers/userControllers/downloadLedgers";
import generateInvoice from "../controllers/ticketControllers/generateInvoice";
import PDFDocument from "pdfkit";

const router = Router();

// fetch user ledgers
router.get('/fetchUserLedgers', verifyToken, fetchUserLedgers);

// download ledger
router.get("/downloadLedger", verifyToken, downloadLedgers);

// generate Invoice
router.get("/generateInvoice", generateInvoice);


router.get('/generate-pdf', (req, res) => {
    // Create a document
    const doc = new PDFDocument();
  
    // Set response headers for PDF download
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', 'attachment; filename=hello-world.pdf');
  
    // Pipe the PDF directly to the response
    doc.pipe(res);
  
    // Add content to the PDF
    doc.fontSize(25)
       .text('Hello World', 100, 100);
  
    // Finalize the PDF
    doc.end();
  });

export {router as userRouter};