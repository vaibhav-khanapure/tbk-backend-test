import {Router} from "express";
import {airportRouter} from "./airportRouter";
import {bookingRouter} from "./bookingRouter";
import {authRouter} from "./authRouter";
import {paymentRouter} from "./paymentRouter";
import {tboRouter} from "./tboRouter";
import {travellerRouter} from "./travellerRouter";

const API = Router();

API.use("/", authRouter);

API.use("/airport", airportRouter);

API.use("/booking", bookingRouter);

API.use("/payment", paymentRouter);

API.use("/tbo", tboRouter);

API.use("/traveller", travellerRouter);

API.get("/getkey", (_, res) => res.status(200).json({ key: process.env.RAZORPAY_API_KEY }));

export default API;