import {Request , Response } from "express";
import fs from "fs";
import {ApiError} from "../utilis/apierror";
import {ApiResponse} from "../utilis/apiresponse";
import { asyncHandler } from "../utilis/asynchandler";
import prisma from "../database/database";
import { decodeToken } from "../handler/token.handler";
import "dotenv/config";
import {callGemini} from "../handler/gemini.handler";
import {RESUME_FETCH_PROMPT} from "../prompt/gemini.prompt";


// make global variable for save the user data in different tables
let resumeData: string = "";

const fetchResumeData = asyncHandler(async (req: Request, res: Response) => {
	//get the acceess token , if not present throw new ApiError
	const accessToken = req.cookies?.accessToken;

	if (!accessToken) {
		throw new ApiError(401, "Access token is required");
	}

	// decode the token and typecast it so TypeScript knows _id exists
	const decodedToken = (await decodeToken(accessToken)) as { _id?: any };

	if (!decodedToken?._id) {
		throw new ApiError(401, "Invalid access token");
	}
	
	// find userId = decodedToken._id
	const userId = decodedToken._id;

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
	resumeData = await callGemini(RESUME_FETCH_PROMPT, user.resume);
	
	//return the res.status that resume fetched
	return res.status(200).json({
		success: true,
		message: "Resume data fetched successfully",
		data: resumeData,
	});
});

export {
	fetchResumeData, resumeData
}
