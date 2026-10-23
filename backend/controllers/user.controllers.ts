import {Request , Response } from "express";
import fs from "fs";
import {ApiError} from "../utilis/apierror.ts";
import {ApiResponse} from "../utilis/apiresponse.ts";
import { asyncHandler } from "../utilis/asynchandler.ts";
import prisma from "../database/database.ts";
import {generateRefreshToken , generateAccessToken, decodeToken } from "../handler/token.handler.ts";
import {sendEmail} from "../handler/gmail.handler.ts";
import {generateOtp} from "../handler/otp.handler.ts";
import {generateHashPassword} from "../handler/password.handler.ts";
import "dotenv/config";

// Todo list
//create user first
const registerUser = asyncHandler(async (req : Request , res : Response) => {
// get the req.body
	//console.log(req.body);
	const {name,username , email , password} = req.body
//check username email and password are their else throw new ApiError(400,"all filed are required")
	//console.log(username,email,password);
	if ([name,username, email, password].some((field) => !field?.trim())) {
    	throw new ApiError(400, "All fields are required");
    	}
// check username or email exist then throw new ApiError(409,username or email is already exist)
	//console.log("hello0");
	//console.log(prisma)
	const existingUser = await prisma.user.findFirst({
		where : {
			OR : [{username : username},{email : email}],
			},
		});
	//console.log(existingUser);
	if(existingUser){
		if(existingUser.username === username){
			throw new ApiError(409,"Username already exists");
			}
		if(existingUser.email === email){
			throw new ApiError(409,"Email already exists");
			}
		}
	 // check username and email dont exist then generate refreshToken , hash Password and save all the record in database
	 //console.log("hello");
	const hashedPassword = await generateHashPassword(password)
	console.log("password :",password);
	console.log("hashed password :",hashedPassword);
	const refreshToken = await generateRefreshToken(username,email);
	 
	const user = await prisma.user.create({
            data: {
            	name,
                username,
                email,
                passwordEncrypted: hashedPassword,
                refreshToken : refreshToken || null,
                
            }
        });
        //once the database save the record call the gerateOtp fucntion
	const otp = await generateOtp();
	const expiresAt = new Date(Date.now() + 5 * 60 * 1000);
	console.log(otp);
	console.log(expiresAt);
	console.log(user.userId);
    const otpData = await prisma.otpSystem.create({
            data: {
                userId: user.userId,
                type: "EMAIL_VERIFICATION",
                otp: String(otp),
                expiresAt
            }
        });
        //mail the otp to email and save the otp in database
    console.log("Email sending...");
    await sendEmail(email, String(otp));
    console.log("email sent");
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
const validateOTPRegistration = asyncHandler(async (req: Request, res: Response) => {

        // 1. Get OTP from request body
        const { otp } = req.body;

        if (!otp) {
            throw new ApiError(400, "OTP is required");
        }

        // 2. Get register token from cookies
        const registerToken = req.cookies?.registerToken;

        if (!registerToken) {
            throw new ApiError(401, "Registration token is missing");
        }

        // 3. Verify the registration token
        // decodeToken must verify using REFRESH_TOKEN_SECRET
        const decoded = await decodeToken(registerToken,process.env.REFRESH_TOKEN_SECRET!) as jwt.JwtPayload;
		console.log(!decoded._id || !decoded.username);
        if (!decoded._id || !decoded.username) {
            throw new ApiError(401, "Invalid registration token");
        }

        // 4. Find user using the token payload
        const user = await prisma.user.findUnique({
            where: {
                username: decoded._id
            }
        });
		//console.log(user)
        if (!user) {
            throw new ApiError(404, "User not found");
        }

        // 5. Confirm the token belongs to this user
        if (
        	user.username !== decoded._id || 
            user.email !== decoded.username
        ) {
            throw new ApiError(401, "Invalid registration token");
        }
		console.log("Hello")
        // 6. Find the latest email verification OTP
        const otpRecord = await prisma.otpSystem.findFirst({
            where: {
                userId: user.userId,
                type: "EMAIL_VERIFICATION"
            },
            orderBy: {
                createdAt: "desc"
            }
        });

        if (!otpRecord || !otpRecord.otp || !otpRecord.expiresAt) {
            throw new ApiError(400, "OTP not found. Please request a new OTP");
        }

        // 7. Check OTP expiration
        if (otpRecord.expiresAt.getTime() <= Date.now()) {
            throw new ApiError(400, "OTP has expired");
        }

        // 8. Compare OTP
        if (String(otpRecord.otp) !== String(otp)) {
            throw new ApiError(400, "Invalid OTP");
        }

        // 9. Generate access and refresh tokens
        const accessToken = await generateAccessToken(
            user.userId.toString(),
            user.username,
            user.email
        );

        const refreshToken = await generateRefreshToken(
            user.userId.toString(),
            user.username,
            user.email
        );

        // 10. Save refresh token and remove the used OTP
        await prisma.$transaction([
            prisma.user.update({
                where: {
                    userId: user.userId
                },
                data: {
                    accessToken,
                    refreshToken
                }
            }),
            prisma.otpSystem.deleteMany({
                where: {
                    userId: user.userId,
                    type: "EMAIL_VERIFICATION"
                }
            })
        ]);

        // 11. Cookie options
        const options = {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            sameSite: "strict" as const,
            maxAge: 7 * 24 * 60 * 60 * 1000
        };

        // 12. Send response and cookies
        return res.status(200).clearCookie("registerToken", options).cookie("accessToken", accessToken, {
                ...options,
                maxAge: 15 * 60 * 1000
            }).cookie("refreshToken", refreshToken, options)
            .json(new ApiResponse(200,
                    {
                        userId: user.userId.toString(),
                        name: user.name,
                        username: user.username,
                        email: user.email,
                        accessToken,
                        refreshToken
                    },
                    "Email verified and registration completed successfully"
                )
            );
    }
);

export { registerUser, validateOTPRegistration};
