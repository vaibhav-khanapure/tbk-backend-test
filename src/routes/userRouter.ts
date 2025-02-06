import {Router} from "express";
import fetchUserLedger from "../controllers/userControllers/fetchUserLedger";
import updateEmail from "../controllers/userControllers/updateEmail";
import updatePhoneNumber from "../controllers/userControllers/updatePhoneNumber";
import updateGSTDetails from "../controllers/userControllers/updateGSTDetails";
import updateName from "../controllers/userControllers/updateName";
import getUserStatistics from "../controllers/userControllers/getUserStatistics";
import getTBKCredits from "../controllers/userControllers/getTBKCredits";

const router = Router();

// fetch user ledgers
router.get('/fetchUserLedger', fetchUserLedger);

// update email
router.patch("/updateEmail", updateEmail);

// update phone number
router.patch("/updatePhoneNumber", updatePhoneNumber);

// update GST Details
router.patch("/updateGSTDetails", updateGSTDetails);

// update user name
router.patch("/updateUserName", updateName);

// get TBK credits
router.get("/getTBKCredits", getTBKCredits);

// get user stats
router.get("/getUserStats", getUserStatistics);

export {router as userRouter};