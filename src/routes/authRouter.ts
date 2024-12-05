import {Router} from "express";
import login from "../controllers/authControllers/login";
import register from "../controllers/authControllers/register";
import googleAuth from "../controllers/authControllers/googleAuth";;
import verifyLogin from "../controllers/authControllers/verifyLogin";

const router = Router();

// login
router.post('/login', login);

// register
router.post('/register', register);

// google auth
router.post("/googleAuth", googleAuth);

// verify user
router.post("/verifyUser", verifyLogin);

export {router as authRouter};