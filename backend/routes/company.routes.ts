import {Router} from "express";
import {sendJobMailtoCompany} from "../controllers/company.controllers.ts";

const companyRouter = Router();
companyRouter.post("/mailcontent",sendJobMailtoCompany);

export default companyRouter;
