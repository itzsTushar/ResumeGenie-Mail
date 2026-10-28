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
import {geminiJobEmail} from "../handler/gemini.handler";

const sendJobMailtoCompany = asyncHandler(async (req: Request, res: Response) => {
	// get the req.body
	const {companyname, hrname, hrmail, desc } = req.body;

	if ([companyname, hrname, hrmail, desc].some((field) => !field?.trim())) {
		throw new ApiError(400, "All fields are required");
	}

	// get the access token decode the token
	const accessToken = req.cookies?.accessToken;

	if (!accessToken) {
		throw new ApiError(401, "Access token is missing");
	}

	// Typecast decodedToken so TypeScript knows _id exists
	const decodedToken = (await decodeToken(accessToken)) as { _id?: string | bigint };

	if (!decodedToken?._id) {
		throw new ApiError(401, "Invalid access token");
	}

	const user = await prisma.user.findUnique({
		where: {
			userId: decodedToken._id as any // Matches your Prisma primary key type
		}
	});

	if (!user) {
		throw new ApiError(404, "User not found");
	}

	// Convert user.userId to string if it is a bigint
	const content = await geminiJobEmail(
		companyname,
		hrname,
		hrmail,
		desc,
		String(user.userId)
	);

	return res
		.status(200)
		.json(new ApiResponse(200, {content}, "Job email generated successfully"));
});
export {
	sendJobMailtoCompany,
}
