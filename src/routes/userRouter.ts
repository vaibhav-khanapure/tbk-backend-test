import {Router} from "express";
import fetchUserLedger from "../controllers/userControllers/fetchUserLedger";
import updateEmail from "../controllers/userControllers/updateEmail";
import updatePhoneNumber from "../controllers/userControllers/updatePhoneNumber";
import updateGSTDetails from "../controllers/userControllers/updateGSTDetails";
import updateName from "../controllers/userControllers/updateName";
import getUserStatistics from "../controllers/userControllers/getUserStatistics";
import getTBKCredits from "../controllers/userControllers/getTBKCredits";
import getUserCoins from "../controllers/userControllers/getUserCoins";

const router = Router();

// fetch User Ledgers
router.get('/fetchUserLedger', fetchUserLedger);

// update Email
router.patch("/updateEmail", updateEmail);

// update Phone Number
router.patch("/updatePhoneNumber", updatePhoneNumber);

// update GST Details
router.patch("/updateGSTDetails", updateGSTDetails);

// update User name
router.patch("/updateUserName", updateName);

// get TBK credits
router.get("/getTBKCredits", getTBKCredits);

// get User Coins
router.get("/getUserCoins", getUserCoins);

// get User stats
router.get("/getUserStats", getUserStatistics);

export {router as userRouter};