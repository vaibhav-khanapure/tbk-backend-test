import {Router} from "express";
import getSavedTravellers from "../controllers/travellerControllers/getSavedTravellers";
import addNewTravellers from "../controllers/travellerControllers/addNewTravellers";
import updateTraveller from "../controllers/travellerControllers/updateTraveller";
import deleteTravellers from "../controllers/travellerControllers/deleteTravellers";

const router = Router();

// get travellers
router.get('/getSavedTravellers', getSavedTravellers);

// add traveller
router.post('/addNewTravellers', addNewTravellers);

// update traveller
router.put("/updateTraveller", updateTraveller);

// delete traveller
router.delete("/deleteTravellers", deleteTravellers);

export {router as travellerRouter};