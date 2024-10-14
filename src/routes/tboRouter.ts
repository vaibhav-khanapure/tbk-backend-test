import {Router} from "express"
import searchFlight from "../controllers/tboControllers/searchFlight";
import fareRuleController from "../controllers/tboControllers/fareRuleController";
import fareQuoteController from "../controllers/tboControllers/fareQuoteController";
import SSRController from "../controllers/tboControllers/SSRController";
import flightBook from "../controllers/tboControllers/flightBook";
import ticketBook from "../controllers/tboControllers/ticketBook";
import getBookingDetails from "../controllers/tboControllers/getBookingDetails";
import getCancelChangeRequest from "../controllers/tboControllers/getCancelChangeRequest";
import getChangeRequestStatus from "../controllers/tboControllers/getChangeRequestStatus";

const router = Router();

// router.use(ValidateHandler)

router.post('/searchFlight', searchFlight);

router.post('/fareRule', fareRuleController);

router.post('/fareQuote', fareQuoteController);

router.post('/ssrRequest', SSRController);

router.post('/flightBook', flightBook);

router.post('/ticketBook', ticketBook);

router.post('/getBookingDetails', getBookingDetails);

router.post('/getCancelChangeRequest', getCancelChangeRequest);

router.post('/getChangeRequestStatus', getChangeRequestStatus);

export {router as tboRouter};