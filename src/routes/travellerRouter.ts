import {Router} from "express";
import fetchTravellerDetails from "../controllers/travellerControllers/fetchTravellerDetails";
import addTravellerDetails from "../controllers/travellerControllers/addTravellerDetails";

const router = Router();

router.get('/fetchTravellerDetails', fetchTravellerDetails);

router.post('/addTravellerDetails', addTravellerDetails);

export {router as travellerRouter};