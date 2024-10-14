import {Router} from "express";
import checkout from "../controllers/paymentControllers/checkout";
import paymentVerification from "../controllers/paymentControllers/paymentVerification";
import updateTBKCredit from "../controllers/paymentControllers/updateTBKCredit";

const router = Router();

router.post("/checkout", checkout);

router.post("/paymentverification", paymentVerification);

router.post('/updateTBKCredit', updateTBKCredit);

export {router as paymentRouter};