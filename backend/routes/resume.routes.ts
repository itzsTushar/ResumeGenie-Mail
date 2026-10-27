import {Router} from "express";
import {fetchResumeData} from "../controllers/resume.controllers";
const resumeRouter = Router();
resumeRouter.get("/fetchResume",fetchResumeData);

export default resumeRouter;

