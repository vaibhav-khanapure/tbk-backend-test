import {Router} from "express";
import generateToken from "../controllers/tboControllers/generateToken";

const router = Router();

// generate Token
router.get("/generateToken", generateToken);

export {router as tboRouter};