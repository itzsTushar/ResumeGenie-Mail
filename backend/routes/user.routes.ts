import {Router} from "express";
import {registerUser,validateOTPRegistration} from "../controllers/user.controllers.ts";

const userRouter = Router();

userRouter.post("/register",registerUser);
userRouter.post("/register/otpval",validateOTPRegistration);
export default userRouter;
