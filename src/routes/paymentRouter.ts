import {Router} from "express";
import createOrder from "../controllers/paymentControllers/createOrder";
import addTBKCredits from "../controllers/paymentControllers/addTBKCredits";

const router = Router();

router.post("/createOrder", createOrder);

router.post("/addTBKCredits", addTBKCredits);

export {router as paymentRouter};