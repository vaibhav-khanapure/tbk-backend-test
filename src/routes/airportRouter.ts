import {Router} from "express";
import fetchAirportList from "../controllers/airportListControllers/fetchAirportList";
import deleteAirportList from "../controllers/airportListControllers/deleteAirportList";

const router = Router();

// fetch airport list
router.post('/fetchairportList', fetchAirportList);

// delete airport list
router.delete('/deleteAirportList', deleteAirportList);

export {router as airportRouter};