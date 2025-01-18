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
import tboMainAPITunnelController from "../controllers/tboLiveTunnelControllers/tboMainAPITunnelController";

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

API.post("/tunnel/Search", tboMainAPITunnelController.searchFlights);

API.post("/tunnel/FareQuote", tboMainAPITunnelController.FareQuote);

API.post("/tunnel/FareRule", tboMainAPITunnelController.FareRule);

API.post("/tunnel/SSR", tboMainAPITunnelController.ssr);

export default API;