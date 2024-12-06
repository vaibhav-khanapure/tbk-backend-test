import { Router } from "express";
import { airportRouter } from "./airportRouter";
import { bookingRouter } from "./bookingRouter";
import { authRouter } from "./authRouter";
import { paymentRouter } from "./paymentRouter";
import { tboFlightRouter } from "./tboFlightRouter";
import { travellerRouter } from "./travellerRouter";
import { userRouter } from "./userRouter";
import { tboRouter } from "./tboRouter";
import verifyToken from "../middlewares/verifyToken";
import { downloadRouter } from "./downloadRouter";

const API = Router();

API.use("/auth", authRouter);

API.use("/user", verifyToken, userRouter);

API.use("/airport", verifyToken, airportRouter);

API.use("/booking", verifyToken, bookingRouter);

API.use("/download", verifyToken, downloadRouter);

API.use("/payment", verifyToken, paymentRouter);

API.use("/tbo", tboRouter);

API.use("/tbo/flight", verifyToken, tboFlightRouter);

API.use("/traveller", verifyToken, travellerRouter);

API.get("/getkey", (_, res) => res.status(200).json({ key: process.env.RAZORPAY_API_KEY }));

export default API;