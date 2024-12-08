import {Router} from "express";
import checkout from "../controllers/paymentControllers/checkout";
import paymentVerification from "../controllers/paymentControllers/paymentVerification";
import updateTBKCredits from "../controllers/paymentControllers/updateTBKCredits";

const router = Router();

router.post("/checkout", checkout);

router.post("/paymentVerification", paymentVerification);

router.patch('/updateTBKCredits', updateTBKCredits);

export {router as paymentRouter};