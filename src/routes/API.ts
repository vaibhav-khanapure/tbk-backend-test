import { Router } from "express";
import { airportRouter } from "./airportRouter";
import { authRouter } from "./authRouter";
import { paymentRouter } from "./paymentRouter";
import { tboFlightRouter } from "./tboFlightRouter";
import { travellerRouter } from "./travellerRouter";
import { userRouter } from "./userRouter";
import { tboRouter } from "./tboRouter";
import verifyToken from "../middlewares/verifyToken";
import { downloadRouter } from "./downloadRouter";
import { flightBookingRouter } from "./flightBookingRouter";
import { apiTransactionsRouter } from "./apiTransactions";
import allTBOApisFromLocal from "../helpers/allTBOApisFromLocal";

const API = Router();

API.use("/auth", authRouter);

API.use("/user", verifyToken, userRouter);

API.use("/airport", verifyToken, airportRouter);

API.use("/booking/flight", verifyToken, flightBookingRouter);

API.use("/download", verifyToken, downloadRouter);

API.use("/payment", verifyToken, paymentRouter);

API.use("/tbo", tboRouter);

API.use("/tbo/flight", verifyToken, tboFlightRouter);

API.use("/traveller", verifyToken, travellerRouter);

API.use("/apiTransactions", apiTransactionsRouter);

API.get("/new-flights", (_, res) => res.status(200).json({message: "Server working"}));

API.post("/all-tbo-apis", allTBOApisFromLocal);

export default API;