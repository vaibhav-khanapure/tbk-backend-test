import {Router} from "express";
import fetchUserLedger from "../controllers/userControllers/fetchUserLedger";
import verifyToken from "../middlewares/verifyToken";
import generateInvoice from "../controllers/ticketControllers/generateInvoice";
import generateETicket from "../controllers/ticketControllers/generateTicket";
import updateEmail from "../controllers/userControllers/updateEmail";
import updatePhoneNumber from "../controllers/userControllers/updatePhoneNumber";
import updateGSTDetails from "../controllers/userControllers/updateGSTDetails";
import updateName from "../controllers/userControllers/updateName";
import getUserStatistics from "../controllers/userControllers/getUserStatistics";
import generateLedger from "../controllers/userControllers/generateLedger";

const router = Router();

// fetch user ledgers
router.get('/fetchUserLedgers', verifyToken, fetchUserLedger);

// download ledger
router.get("/generateLedger", verifyToken, generateLedger);

// generate Invoice
router.get("/generateInvoice", verifyToken, generateInvoice);

// generate ETicket
router.get("/generateTicket", verifyToken, generateETicket);

// update email
router.patch("/updateEmail", verifyToken, updateEmail);

// update phone number
router.patch("/updatePhoneNumber", verifyToken, updatePhoneNumber);

// update GST Details
router.patch("/updateGSTDetails", verifyToken, updateGSTDetails);

// update user name
router.patch("/updateUserName", verifyToken, updateName);

// get user stats
router.get("/getUserStats", verifyToken, getUserStatistics);

export {router as userRouter};