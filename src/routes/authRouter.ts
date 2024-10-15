import {Router} from "express";
import login from "../controllers/authControllers/login";
import register from "../controllers/authControllers/register";
import fetchUserData from "../controllers/authControllers/fetchUserData";
import googleauth from "../controllers/authControllers/googleauth";
import forgotPassword from "../controllers/authControllers/forgotpassword";
import resetPassword from "../controllers/authControllers/resetPassword";

const router = Router();

// login
router.post('/login', login);

// register
router.post('/register', register);

// google auth
router.post("/googleauth", googleauth);

// fetch user data
router.get('/fetchUserData', fetchUserData);

// forgot password
router.post("/forgotpassword", forgotPassword);

// reset password
router.put("/resetpassword", resetPassword);

export {router as authRouter};