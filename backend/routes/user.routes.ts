import {Router} from "express";
import {registerUser,validateOTPRegistration,
loginUser,logoutUser,updateProfile,updateUserbyResumeData} from "../controllers/user.controllers.ts";
import {upload} from "../middleware/multer.middleware.ts";
const userRouter = Router();

userRouter.post("/register",registerUser);
userRouter.post("/register/otpval",validateOTPRegistration);
userRouter.post("/login",loginUser);
userRouter.get("/logout",logoutUser);
userRouter.post(
	"/updateusr",
	upload.fields([
		{ name: "avatar", maxCount: 1 },
		{ name: "resume", maxCount: 1 },
	]),
	updateProfile
);
userRouter.get("/resumedata",updateUserbyResumeData );
export default userRouter;
