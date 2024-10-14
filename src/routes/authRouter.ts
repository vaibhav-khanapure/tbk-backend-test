import {Router} from "express";
import login from "../controllers/authControllers/login";
import register from "../controllers/authControllers/register";
import fetchUserData from "../controllers/authControllers/fetchUserData";

const router = Router();

// login
router.post('/login', login);

// register
router.post('/register', register);

// fetch user data
router.get('/fetchUserData', fetchUserData);

export {router as authRouter};