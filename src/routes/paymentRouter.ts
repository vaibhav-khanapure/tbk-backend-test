import {Router} from "express";
import createOrder from "../controllers/paymentControllers/createOrder";
import addTBKCredits from "../controllers/paymentControllers/addTBKCredits";
import fetchRazBankInfo from "../controllers/paymentControllers/fetchRazBankInfo";

const router = Router();

router.post("/createOrder", createOrder);

router.post("/addTBKCredits", addTBKCredits);

router.get("/fetchRazBankInfo", fetchRazBankInfo);

export {router as paymentRouter};