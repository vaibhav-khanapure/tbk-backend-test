import {Router} from "express";
import updateTBKCredits from "../controllers/paymentControllers/updateTBKCredits";
import createOrder from "../controllers/paymentControllers/createOrder";
import verifyPayment from "../controllers/paymentControllers/verifyPayment";
import addTBKCredits from "../controllers/paymentControllers/addTBKCredits";

const router = Router();

router.post("/createOrder", createOrder);

router.post("/verifyPayment", verifyPayment);

router.patch("/addTBKCredits", addTBKCredits);

router.patch('/updateTBKCredits', updateTBKCredits);

export {router as paymentRouter};