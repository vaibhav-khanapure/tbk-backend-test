import { Router } from "express";
import { airportRouter } from "./airportRouter";
import { bookingRouter } from "./bookingRouter";
import { authRouter } from "./authRouter";
import { paymentRouter } from "./paymentRouter";
import { tboRouter } from "./tboRouter";
import { travellerRouter } from "./travellerRouter";
import { userRouter } from "./userRouter";
import generateInvoice from "../controllers/ticketControllers/generateInvoice";

const API = Router();

API.use("/", authRouter);

API.use("/", userRouter);

API.use("/", airportRouter);

API.use("/", bookingRouter);

API.use("/", paymentRouter);

API.use("/", tboRouter);

API.use("/", travellerRouter);

API.get("/getkey", (_, res) => res.status(200).json({ key: process.env.RAZORPAY_API_KEY }));

export default API;