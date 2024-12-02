import {Router} from "express";
import fetchUserLedgers from "../controllers/userControllers/fetchUserLedgers";
import verifyToken from "../middlewares/verifyToken";
import downloadLedgers from "../controllers/userControllers/downloadLedgers";
import generateInvoice from "../controllers/ticketControllers/generateInvoice";
import generateETicket from "../controllers/ticketControllers/generateTicket";

const router = Router();

// fetch user ledgers
router.get('/fetchUserLedgers', verifyToken, fetchUserLedgers);

// download ledger
router.get("/downloadLedger", verifyToken, downloadLedgers);

// generate Invoice
router.get("/generateInvoice", verifyToken, generateInvoice);

// generate ETicket
router.get("/generateTicket", verifyToken, generateETicket);

export {router as userRouter};