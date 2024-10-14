import {Router} from "express"
import addBookingDetails from "../controllers/bookingControllers/addBookingDetails";
import getTicketDetails from "../controllers/bookingControllers/getTicketDetails";
import changeFlightStatus from "../controllers/bookingControllers/changeFlightStatus";
import addCancellationDetails from "../controllers/bookingControllers/addCancellationDetails";
import addUnsuccesfullFlightsDetails from "../controllers/bookingControllers/addUnsuccessfullFlightDetails";
import getUnsuccessfullDetails from "../controllers/bookingControllers/getUnsuccessfullDetails";

const router = Router();

router.post('/addBookingDetails', addBookingDetails);

router.post('/getTicketDetails', getTicketDetails);

router.post('/ChangeFlightStatus', changeFlightStatus);

router.post('/addCancellationDetails', addCancellationDetails);

router.post('/addunsuccesfullFlightsDetails', addUnsuccesfullFlightsDetails);

router.post('/getUnsuccessfullDetails', getUnsuccessfullDetails);

export {router as bookingRouter};