import {Router} from "express";
import createOrder from "../controllers/paymentControllers/createOrder";
import addTBKCredits from "../controllers/paymentControllers/addTBKCredits";
import flightBookWithTBKCredits from "../controllers/paymentControllers/flightBookWithTBKCredits";
import flightBookingPayment from "../controllers/paymentControllers/flightBookingPayment";

const router = Router();

router.post("/createOrder", createOrder);

router.post("/flightBookingPayment", flightBookingPayment);

router.post("/addTBKCredits", addTBKCredits);

router.patch('/flightBookWithTBKCredits', flightBookWithTBKCredits);

export {router as paymentRouter};