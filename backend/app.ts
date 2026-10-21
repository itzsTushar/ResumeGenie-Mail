import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import dotenv from "dotenv";

dotenv.config();

const app = express();
app.use(
	cors({
		origin:process.env.CORS_ORIGIN,
		credentials : true,
		})
	);
app.use(
	express.json({
		limit:"16kb"
		})
	);
app.use(
	express.urlencoded({
		extended:true,
		limit:"16kb"
		})
	);
app.use(cookieParser());

app.get("/",(_,res)=>{
	res.json({
		success : true,
		message : "ResumeGenie-Mail Backedn is Running",
		})
	});
export default app;
