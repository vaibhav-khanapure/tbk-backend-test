import {Router} from "express"
import searchFlight from "../controllers/tboFlightControllers/searchFlight";
import fareRuleController from "../controllers/tboFlightControllers/fareRuleController";
import fareQuoteController from "../controllers/tboFlightControllers/fareQuoteController";
import SSRController from "../controllers/tboFlightControllers/SSRController";
import flightBook from "../controllers/tboFlightControllers/flightBook";
import ticketBook from "../controllers/tboFlightControllers/ticketBook";
import getBookingDetails from "../controllers/tboFlightControllers/getBookingDetails";
import releasePNRRequest from "../controllers/tboFlightControllers/releasePNRRequest";
import sendChangeRequest from "../controllers/tboFlightControllers/sendChangeRequest";
import getChangeRequestStatus from "../controllers/tboFlightControllers/getChangeRequestStatus";
import getCancellationCharges from "../controllers/tboFlightControllers/getCancellationCharges";
import verifyToken from "../middlewares/verifyToken";

const router = Router();

router.post('/searchFlight', verifyToken, searchFlight);

router.post('/fareRule', verifyToken, fareRuleController);

router.post('/fareQuote', verifyToken, fareQuoteController);

router.post('/ssrRequest', verifyToken, SSRController);

router.post('/flightBook', verifyToken, flightBook);

router.post('/ticketBook', verifyToken, ticketBook);

router.post('/getBookingDetails', verifyToken, getBookingDetails);

// cancellation

router.post("/releasePNRRequest", verifyToken, releasePNRRequest);

router.post('/sendChangeRequest', verifyToken, sendChangeRequest);

router.post('/getChangeRequestStatus', verifyToken, getChangeRequestStatus);

router.post("/getCancellationCharges", verifyToken, getCancellationCharges);

export {router as tboFlightRouter};