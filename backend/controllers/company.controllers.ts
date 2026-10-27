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
	//console.log(req.body);

	// if req.body not contain name,companyname, hrname,hemail and desc throw api error
	//console.log(companyname)
	//console.log(hrname)
	//console.log(hrmail)
	//console.log(desc)
	if ([companyname, hrname, hrmail, desc].some((field) => !field?.trim())) {
		throw new ApiError(400, "All fields are required");
	}

	// save this in db
	// Assuming a JobMail model in your Prisma schema
	// const jobMail = await prisma.jobMail.create({
	// 	data: {
	// 		name,
	// 		companyname,
	// 		hrname,
	// 		hrmail,
	// 		desc
	// 	}
	// });

	// get the acces token decode the token and is any fil thorw api error , else find user_id;
	const accessToken = req.cookies?.accessToken;

	if (!accessToken) {
		throw new ApiError(401, "Access token is missing");
	}

	const decodedToken = await decodeToken(accessToken) as jwt.JwtPayload;
	console.log(decodedToken._id)

	if (!decodedToken?._id) {
		throw new ApiError(401, "Invalid access token");
	}

	const user = await prisma.user.findUnique({
		where: {
			userId: decodedToken._id
		}
	});

	if (!user) {
		throw new ApiError(404, "User not found");
	}

	// call the contnet = geminiJobEmail func (company name ,hrname,hrmail desc,user_id);
	const content = await geminiJobEmail(companyname,hrname,hrmail,desc,user.userId);

	// call teh sendJobEmail func - > sendJobEmail(fromGmail=hrmail,toGmail=user.email,content);
	//await sendJobEmail(hrmail, user.email, content);

	//console.log(email Send)
	//console.log(`Job email sent successfully to ${user.email}`);

	// res ApiResponse(mail sent);
	return res
		.status(200)
		.json(new ApiResponse(200, {content}, "Job email generated successfully"));
});
export {
	sendJobMailtoCompany,
}
