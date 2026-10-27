import {Request , Response } from "express";
import fs from "fs";
import {ApiError} from "../utilis/apierror.ts";
import {ApiResponse} from "../utilis/apiresponse.ts";
import { asyncHandler } from "../utilis/asynchandler.ts";
import prisma from "../database/database.ts";
import { decodeToken } from "../handler/token.handler.ts";
import "dotenv/config";
import {callGemini} from "../handler/gemini.handler.ts";
import {RESUME_FETCH_PROMPT} from "../prompt/gemini.prompt.ts";


// make global variable for save the user data in different tables
let resumeData: string = "";

const fetchResumeData = asyncHandler(async (req: Request, res: Response) => {
	//get the acceess token , if not present throw new ApiError
	const accessToken = req.cookies?.accessToken;

	if (!accessToken) {
		throw new ApiError(401, "Access token is required");
	}

	// decode the token by using await decodeToken()
	const decodedToken = await decodeToken(accessToken);

	//finde userId = decodedToken._id ,if userid not throw new ApiError
	const userId = decodedToken?._id;

	if (!userId) {
		throw new ApiError(401, "Invalid access token");
	}

	//find the link
	const user = await prisma.user.findUnique({
		where: {
			userId: userId,
		},
		select: {
			resume: true,
		},
	});

	if (!user?.resume) {
		throw new ApiError(404, "Resume PDF not found");
	}

	//try to callgemini function with a callGemini(RESUME_FETCH_PROMPT,resumelink);
	// store the data in global varibale return from callGemini
	//console.log(user.resume);
	//console.log(RESUME_FETCH_PROMPT);
	resumeData = await callGemini(RESUME_FETCH_PROMPT, user.resume);
	
	//return the res.status that resume fetched
	return res.status(200).json({
		success: true,
		message: "Resume data fetched successfully",
		data: resumeData,
	});
});

export {
	fetchResumeData,resumeData
}
