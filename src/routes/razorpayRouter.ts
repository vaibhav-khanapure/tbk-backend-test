import {Router} from "express";
import smartCollectWebhook from "../controllers/razorpayControllers/smartCollectWebhook";

const router = Router();

// Webhooks
router.post('/webhook/smartCollect', smartCollectWebhook);

export {router as razorpayRouter};