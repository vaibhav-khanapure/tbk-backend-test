import {Router} from "express"
import addBookingDetails from "../controllers/bookingControllers/addBookingDetails";
import getTicketDetails from "../controllers/bookingControllers/getTicketDetails";
import changeFlightStatus from "../controllers/bookingControllers/changeFlightStatus";
import addCancellationDetails from "../controllers/bookingControllers/addCancellationDetails";
import addUnsuccesfullFlightsDetails from "../controllers/bookingControllers/addUnsuccessfullFlightDetails";
import getUnsuccessfullDetails from "../controllers/bookingControllers/getUnsuccessfullDetails";
import verifyToken from "../middlewares/verifyToken";

const router = Router();

router.post('/addBookingDetails', verifyToken, addBookingDetails);

router.get('/getTicketDetails', verifyToken, getTicketDetails);

router.post('/changeFlightStatus', changeFlightStatus);

router.post('/addCancellationDetails', verifyToken, addCancellationDetails);

router.post('/addUnsuccesfullFlightDetails', verifyToken, addUnsuccesfullFlightsDetails);

router.get('/getUnsuccessfullFlightDetails', verifyToken, getUnsuccessfullDetails);

export {router as bookingRouter};