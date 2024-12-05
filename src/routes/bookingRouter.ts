import {Router} from "express"
import addBookingDetails from "../controllers/bookingControllers/addBookingDetails";
import getTicketDetails from "../controllers/bookingControllers/getTicketDetails";
import changeFlightStatus from "../controllers/bookingControllers/changeFlightStatus";
import addCancellationDetails from "../controllers/bookingControllers/addCancellationDetails";
import addUnsuccesfullFlightsDetails from "../controllers/bookingControllers/addUnsuccessfullFlightDetails";
import getCancelledFlights from "../controllers/bookingControllers/getCancelledFlights";
import getUnsuccessfullFlights from "../controllers/bookingControllers/getUnsuccessfullFlights";

const router = Router();

router.post('/addBookingDetails', addBookingDetails);

router.get('/getTicketDetails', getTicketDetails);

router.post('/changeFlightStatus', changeFlightStatus);

router.post('/addCancellationDetails', addCancellationDetails);

router.get("/getCancelledFlights", getCancelledFlights);

router.post('/addUnsuccesfullFlightDetails', addUnsuccesfullFlightsDetails);

router.get('/getUnsuccessfullFlightDetails', getUnsuccessfullFlights);

export {router as bookingRouter};