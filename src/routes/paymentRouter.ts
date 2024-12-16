import {Router} from "express";
import updateTBKCredits from "../controllers/paymentControllers/updateTBKCredits";
import createOrder from "../controllers/paymentControllers/createOrder";
import addTBKCredits from "../controllers/paymentControllers/addTBKCredits";
import flightBookingPayment from "../controllers/paymentControllers/flightBookingPayment";

const router = Router();

router.post("/createOrder", createOrder);

router.post("/flightBookingPayment", flightBookingPayment);

router.post("/addTBKCredits", addTBKCredits);

router.patch('/updateTBKCredits', updateTBKCredits);

export {router as paymentRouter};