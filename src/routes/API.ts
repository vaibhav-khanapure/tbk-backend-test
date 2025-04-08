import { Router } from "express";
import { airportRouter } from "./airportRouter";
import { authRouter } from "./authRouter";
import { paymentRouter } from "./paymentRouter";
import { tboFlightRouter } from "./tboFlightRouter";
import { travellerRouter } from "./travellerRouter";
import { userRouter } from "./userRouter";
import { tboRouter } from "./tboRouter";
import { downloadRouter } from "./downloadRouter";
import { flightBookingRouter } from "./flightBookingRouter";
import { apiTransactionsRouter } from "./apiTransactionsRouter";
import { tunnelRouter } from "./tunnelRouter";
import verifyToken from "../middlewares/verifyToken";
import isTunnelOpen from "../middlewares/isTunnelOpen";
import getChangeRequestStatus from "../controllers/tboFlightControllers/getChangeRequestStatus";
import changeRequestMiddleware from "../middlewares/changeRequestMiddleware";

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

API.use("/apiTransactions", verifyToken, apiTransactionsRouter);

API.use("/tunnel", [isTunnelOpen, verifyToken], tunnelRouter);

API.post("/larticketchange", changeRequestMiddleware, getChangeRequestStatus);

export default API;