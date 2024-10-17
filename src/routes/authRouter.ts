import {Router} from "express";
import login from "../controllers/authControllers/login";
import register from "../controllers/authControllers/register";
import fetchUserData from "../controllers/authControllers/fetchUserData";
import googleauth from "../controllers/authControllers/googleauth";;
import verifyLogin from "../controllers/authControllers/verifyLogin";

const router = Router();

// login
router.post('/login', login);

// register
router.post('/register', register);

// google auth
router.post("/googleauth", googleauth);

// fetch user data
router.post('/fetchUserData', fetchUserData);

// verify user
router.post("/verifyuser", verifyLogin);

export {router as authRouter};