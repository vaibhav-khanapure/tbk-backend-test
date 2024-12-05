import {Router} from "express";
import getSavedTravellerDetails from "../controllers/travellerControllers/getSavedTravellerDetails";
import addTravellerDetails from "../controllers/travellerControllers/addTravellerDetails";
import verifyToken from "../middlewares/verifyToken";
import updateTraveller from "../controllers/travellerControllers/updateTraveller";
import deleteTraveller from "../controllers/travellerControllers/deleteTraveller";

const router = Router();

// get travellers
router.get('/getSavedTravellerDetails', verifyToken, getSavedTravellerDetails);

// add traveller
router.post('/addTravellerDetails', verifyToken, addTravellerDetails);

// update traveller
router.put("/updateTraveller", verifyToken, updateTraveller);

// delete traveller
router.delete("/deleteTraveller", verifyToken, deleteTraveller);

export {router as travellerRouter};