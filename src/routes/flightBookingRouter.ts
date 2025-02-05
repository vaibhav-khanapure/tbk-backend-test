import {Router} from "express"
import getCancelledFlights from "../controllers/flightBookingControllers/getCancelledFlights";
import getUnsuccessfulFlights from "../controllers/flightBookingControllers/getUnsuccessfulFlights";
import getBookedFlightDetails from "../controllers/flightBookingControllers/getBookedFlightDetails";

const router = Router();

router.get("/getBookedFlightDetails", getBookedFlightDetails);

router.get("/getCancelledFlights", getCancelledFlights);

router.get("/getUnsuccessfulFlights", getUnsuccessfulFlights);

export {router as flightBookingRouter};