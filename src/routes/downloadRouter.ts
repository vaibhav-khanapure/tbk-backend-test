import {Router} from "express";
import downloadLedger from "../controllers/downloadControllers/downloadLedger";
import downloadInvoice from "../controllers/downloadControllers/downloadInvoice";
import downloadTicket from "../controllers/downloadControllers/downloadTicket";

const router = Router();

// download ledger
router.get("/downloadLedger", downloadLedger);

// download Invoice
router.get("/downloadInvoice", downloadInvoice);

// download ETicket
router.get("/downloadTicket", downloadTicket);

export {router as downloadRouter};