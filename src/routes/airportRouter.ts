import {Router} from "express";
import searchAirports from "../controllers/airportListControllers/searchAirports";
import getAllAirports from "../controllers/airportListControllers/getAllAirports";
import addAirports from "../controllers/airportListControllers/addAirports";

const router = Router();

// fetch airport list
router.get('/searchAirports', searchAirports);

// add airport list
router.post("/addAirports", addAirports);

// get all airports
router.get("/getAllAirports", getAllAirports);

export {router as airportRouter};