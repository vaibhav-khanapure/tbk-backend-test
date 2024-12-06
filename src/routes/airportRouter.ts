import {Router} from "express";
import deleteAirportList from "../controllers/airportListControllers/deleteAirportList";
import searchAirports from "../controllers/airportListControllers/searchAirports";
import getAllAirports from "../controllers/airportListControllers/getAllAirports";
import addAirports from "../controllers/airportListControllers/addAirports";
import verifyToken from "../middlewares/verifyToken";

const router = Router();

// fetch airport list
router.get('/searchAirports', verifyToken, searchAirports);

// delete airport list
router.delete('/deleteAirportList', verifyToken, deleteAirportList);

// add airport list
router.post("/addAirports", verifyToken, addAirports);

// get all airports
router.get("/getAllAirports", verifyToken, getAllAirports);

export {router as airportRouter};