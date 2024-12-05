import { Router } from "express";
import { airportRouter } from "./airportRouter";
import { bookingRouter } from "./bookingRouter";
import { authRouter } from "./authRouter";
import { paymentRouter } from "./paymentRouter";
import { tboFlightRouter } from "./tboFlightRouter";
import { travellerRouter } from "./travellerRouter";
import { userRouter } from "./userRouter";
import { tboRouter } from "./tboRouter";

const API = Router();

API.use("/auth", authRouter);

API.use("/user", userRouter);

API.use("/airport", airportRouter);

API.use("/booking", bookingRouter);

API.use("/payment", paymentRouter);

API.use("/tbo", tboRouter);

API.use("/tbo/flight", tboFlightRouter);

API.use("/traveller", travellerRouter);

API.get("/getkey", (_, res) => res.status(200).json({ key: process.env.RAZORPAY_API_KEY }));

export default API;