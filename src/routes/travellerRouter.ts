import {Router} from "express";
import getSavedTravellerDetails from "../controllers/travellerControllers/getSavedTravellerDetails";
import addTravellerDetails from "../controllers/travellerControllers/addTravellerDetails";
import updateTraveller from "../controllers/travellerControllers/updateTraveller";
import deleteTraveller from "../controllers/travellerControllers/deleteTraveller";

const router = Router();

// get travellers
router.get('/getSavedTravellerDetails', getSavedTravellerDetails);

// add traveller
router.post('/addTravellerDetails', addTravellerDetails);

// update traveller
router.put("/updateTraveller", updateTraveller);

// delete traveller
router.delete("/deleteTraveller", deleteTraveller);

export {router as travellerRouter};