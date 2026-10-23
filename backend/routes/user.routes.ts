import {Router} from "express";
import {registerUser,validateOTPRegistration,
loginUser,logoutUser} from "../controllers/user.controllers.ts";

const userRouter = Router();

userRouter.post("/register",registerUser);
userRouter.post("/register/otpval",validateOTPRegistration);
userRouter.post("/login",loginUser);
userRouter.get("/logout",logoutUser);
export default userRouter;
