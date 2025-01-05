import {Router} from "express"
import addBookingDetails from "../controllers/flightBookingControllers/addBookingDetails";
import addUnsuccesfulFlightsDetails from "../controllers/flightBookingControllers/addUnsuccessfulFlights";
import getCancelledFlights from "../controllers/flightBookingControllers/getCancelledFlights";
import getUnsuccessfulFlights from "../controllers/flightBookingControllers/getUnsuccessfulFlights";
import getBookedFlightDetails from "../controllers/flightBookingControllers/getBookedFlightDetails";

const router = Router();

router.post("/addFlightBookings", addBookingDetails);

router.get("/getBookedFlightDetails", getBookedFlightDetails);

router.get("/getCancelledFlights", getCancelledFlights);

router.post("/addUnsuccesfulFlights", addUnsuccesfulFlightsDetails);

router.get("/getUnsuccessfulFlights", getUnsuccessfulFlights);

export {router as flightBookingRouter};