import {Router} from "express";
import login from "../controllers/authControllers/login";
import register from "../controllers/authControllers/register";
import googleAuth from "../controllers/authControllers/googleAuth1";;
import verifyLogin from "../controllers/authControllers/verifyLogin";
import checkUser from "../controllers/authControllers/checkUser";
import verifyToken from "../middlewares/verifyToken";

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
router.post("/verifyUser", verifyLogin);

export {router as authRouter};