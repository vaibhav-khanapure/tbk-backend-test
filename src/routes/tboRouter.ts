import {Router} from "express"
import searchFlight from "../controllers/tboControllers/searchFlight";
import fareRuleController from "../controllers/tboControllers/fareRuleController";
import fareQuoteController from "../controllers/tboControllers/fareQuoteController";
import SSRController from "../controllers/tboControllers/SSRController";
import flightBook from "../controllers/tboControllers/flightBook";
import ticketBook from "../controllers/tboControllers/ticketBook";
import getBookingDetails from "../controllers/tboControllers/getBookingDetails";
import tokenGenerate from "../controllers/tboControllers/generalController";
import releasePNRRequest from "../controllers/tboControllers/releasePNRRequest";
import sendChangeRequest from "../controllers/tboControllers/sendChangeRequest";
import getChangeRequestStatus from "../controllers/tboControllers/getChangeRequestStatus";
import getCancellationCharges from "../controllers/tboControllers/getCancellationCharges";

const router = Router();

// router.use(ValidateHandler)

router.get('/tokenGenerator', tokenGenerate);

router.post('/searchFlight', searchFlight);

router.post('/fareRule', fareRuleController);

router.post('/fareQuote', fareQuoteController);

router.post('/ssrRequest', SSRController);

router.post('/flightBook', flightBook);

router.post('/ticketBook', ticketBook);

router.post('/getBookingDetails', getBookingDetails);

// cancel

router.post("/releasePNRRequest", releasePNRRequest);

router.post('/sendChangeRequest', sendChangeRequest);

router.post('/getChangeRequestStatus', getChangeRequestStatus);

router.post("/getCancellationCharges", getCancellationCharges);

export {router as tboRouter};