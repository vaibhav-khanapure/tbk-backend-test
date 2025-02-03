import {Router} from "express";
import login from "../controllers/authControllers/login";
import register from "../controllers/authControllers/register";
import googleAuth from "../controllers/authControllers/googleAuth";
import checkUser from "../controllers/authControllers/checkUser";
import verifyToken from "../middlewares/verifyToken";
import verifyUser from "../controllers/authControllers/verifyUser";

const router = Router();

// login
router.post('/login', login);

// register
router.post('/register', register);

// check user
router.get("/checkUser", verifyToken, checkUser);

// google auth
router.post("/googleAuth", googleAuth);

// verify user
router.post("/verifyUser", verifyUser);

export {router as authRouter};