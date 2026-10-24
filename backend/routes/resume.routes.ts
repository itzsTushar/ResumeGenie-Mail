import {Router} from "express";
import {fetchResumeData} from "../controllers/resume.controllers.ts";
const resumeRouter = Router();
resumeRouter.get("/fetchResume",fetchResumeData);

export default resumeRouter;

