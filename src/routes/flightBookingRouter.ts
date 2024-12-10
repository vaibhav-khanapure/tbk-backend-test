import {Router} from "express"
import addBookingDetails from "../controllers/flightBookingControllers/addBookingDetails";
import getTicketDetails from "../controllers/flightBookingControllers/getTicketDetails";
import changeFlightStatus from "../controllers/flightBookingControllers/changeFlightStatus";
import addCancellationDetails from "../controllers/flightBookingControllers/addCancellationDetails";
import addUnsuccesfulFlightsDetails from "../controllers/flightBookingControllers/addUnsuccessfulFlights";
import getCancelledFlights from "../controllers/flightBookingControllers/getCancelledFlights";
import getUnsuccessfulFlights from "../controllers/flightBookingControllers/getUnsuccessfulFlights";

const router = Router();

router.post('/addBookingDetails', addBookingDetails);

router.get('/getTicketDetails', getTicketDetails);

router.post('/changeFlightStatus', changeFlightStatus);

router.post('/addCancellationDetails', addCancellationDetails);

router.get("/getCancelledFlights", getCancelledFlights);

router.post('/addUnsuccesfulFlights', addUnsuccesfulFlightsDetails);

router.get('/getUnsuccessfulFlights', getUnsuccessfulFlights);

export {router as flightBookingRouter};