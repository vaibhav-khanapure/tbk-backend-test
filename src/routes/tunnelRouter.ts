import {Router} from "express";
import tboMainAPITunnelController from "../controllers/tboLiveTunnelControllers/tboMainAPITunnelController";

const router = Router();

router.post("/Search", tboMainAPITunnelController.searchFlights);

router.post("/FareQuote", tboMainAPITunnelController.FareQuote);

router.post("/FareRule", tboMainAPITunnelController.FareRule);

router.post("/SSR", tboMainAPITunnelController.SSR);

router.post("/Book", tboMainAPITunnelController.Book);

// router.post("/Ticket", tboMainAPITunnelController.Ticket);

export {router as tunnelRouter};