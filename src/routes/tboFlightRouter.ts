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

const router = Router();

router.post('/searchFlight', searchFlight);

router.post('/fareRule', fareRuleController);

router.post('/fareQuote', fareQuoteController);

router.post('/ssrRequest', SSRController);

router.post('/flightBook', flightBook);

router.post('/ticketBook', ticketBook);

router.post('/getBookingDetails', getBookingDetails);

// cancellation

router.post("/releasePNRRequest", releasePNRRequest);

router.post('/sendChangeRequest', sendChangeRequest);

router.post('/getChangeRequestStatus', getChangeRequestStatus);

router.post("/getCancellationCharges", getCancellationCharges);

export {router as tboFlightRouter};