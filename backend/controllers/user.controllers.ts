import {Request , Response } from "express";
import fs from "fs";
import {ApiError} from "../utilis/apierror.ts";
import {ApiResponse} from "../utilis/apiresponse.ts";
import { asyncHandler } from "../utilis/asynchandler.ts";
import {prisma} from "../database/database.ts";
import {generateRefreshtoken , generateAccesstoken, decodeToken } from "../handler/token.handler.ts";
import {sendEmail} from "../handler/gmail.handler.ts";
import {genrateOtp} from "../handler/otp.handler.ts";
import {generateHashPassword} from "../handler/password.handler.ts";

// Todo list
//create user first
const registerUser = asyncHandler(async (req : Request , res : Response) => {
// get the req.body
	//console.log(req.body);
	const {username , email , password} = req.body
//check username email and password are their else throw new ApiError(400,"all filed are required")
	//console.log(username,email,password);
	if ([username, email, password].some((field) => !field?.trim())) {
    	throw new ApiError(400, "All fields are required");
    	}
// check username or email exist then throw new ApiError(409,username or email is already exist)
	console.log("hello0");
	const existingUser = await prisma.User.findFirst({
		where : {
			OR : [{username},{email}],
			},
		});
	console.log("hello1");
	if(existingUser.username === username){
		throw new ApiError(409,"Username already exists");
		}
	if(existingUser.email === email){
		throw new ApiError(409,"Email already exists");
		}
	 // check username and email dont exist then generate refreshToken , hash Password and save all the record in database
	const hasedPassword = await generateHashPassword(password)
	const refreshToken = await generateRefreshtoken(username,email);
	 
	const user = await prisma.user.create({
            data: {
                username,
                username,
                email,
                mobileNo: mobileNo || null,
                passwordEncrypted: hashedPassword,
                refreshToken : refreshToken || null,
                
            }
        });
        //once the database save the record call the gerateOtp fucntion
	const otp = await genrateOtp();
	const expiresAt = new Date(Date.now() + 5 * 60 * 1000);
        await prisma.otpSystem.create({
            data: {
                userId: user.userId,
                type: "EMAIL_VERIFICATION",
                otp: String(otp),
                expiresAt
            }
        });
        //mail the otp to email and save the otp in database
        await sendEmail(email, String(otp));
        const options = {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            sameSite: "strict" as const,
            maxAge: 7 * 24 * 60 * 60 * 1000
        };
        return res.status(201).cookie("registerToken", refreshToken, options).json(new ApiResponse(201,{
                        userId: user.userId.toString(),
                        name: user.name,
                        username: user.username,
                        email: user.email},
                    "User registered successfully. OTP sent to your email."));
    }
); 
export { registerUser };
