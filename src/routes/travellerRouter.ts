import {Router} from "express";
import fetchTravellerDetails from "../controllers/travellerControllers/fetchTravellerDetails";
import addTravellerDetails from "../controllers/travellerControllers/addTravellerDetails";
import verifyToken from "../middlewares/verifyToken";

const router = Router();

router.get('/fetchTravellerDetails', verifyToken, fetchTravellerDetails);

router.post('/addTravellerDetails', verifyToken, addTravellerDetails);

export {router as travellerRouter};