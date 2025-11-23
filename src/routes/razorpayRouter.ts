import {Router} from "express";
import smartCollectWebhook from "../controllers/razorpayController/smartCollectWebhook";

const router = Router();

// Webhooks
router.post('/webhook/smartCollect', smartCollectWebhook);

export {router as razorpayRouter};