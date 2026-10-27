import {Request , Response } from "express";
import fs from "fs";
import {ApiError} from "../utilis/apierror.ts";
import {ApiResponse} from "../utilis/apiresponse.ts";
import { asyncHandler } from "../utilis/asynchandler.ts";
import prisma from "../database/database.ts";
import {generateRefreshToken , generateAccessToken, decodeToken } from "../handler/token.handler.ts";
import {sendEmail} from "../handler/gmail.handler.ts";
import {generateOtp} from "../handler/otp.handler.ts";
import {generateHashPassword,validateHashPassword} from "../handler/password.handler.ts";
import "dotenv/config";
import {uploadonCloudinary} from "../handler/file.handler.ts";
import {resumeData} from "./resume.controllers.ts";
//import {resumeData} from "./del.ts";
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

const loginUser = asyncHandler(async (req: Request, res: Response) => {

        // 1. Get email and password
        const { email, password } = req.body;

        // 2. Validate required fields
        if (!email?.trim() || !password) {
            throw new ApiError(
                400,
                "Email and password are required"
            );
        }

        // 3. Find user by email
        const user = await prisma.user.findUnique({
            where: {
                email: email.trim()
            },
            select: {
                userId: true,
                username: true,
                email: true,
                passwordEncrypted: true
            }
        });

        if (!user || !user.passwordEncrypted) {
            throw new ApiError(401, "Invalid email or password");
        }

        // 4. Validate password
        const isPasswordValid = await validateHashPassword(password,user.passwordEncrypted);
        //console.log(isPasswordValid);

        if (!isPasswordValid) {
            throw new ApiError(401, "Invalid email or password");
        }

        // 5. Generate access token
        const accessToken = await generateAccessToken(
            user.userId.toString(),
            user.username,
            user.email
        );

        // 6. Generate refresh token
        const refreshToken = await generateRefreshToken(
            user.userId.toString(),
            user.username,
            user.email
        );

        // 7. Save tokens in database
        await prisma.user.update({
            where: {
                userId: user.userId
            },
            data: {
                accessToken,
                refreshToken
            }
        });

        // 8. Cookie options
        const options = {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            sameSite: "strict" as const
        };

        // 9. Send response and cookies
        return res.status(200).cookie("accessToken", accessToken, {
                ...options,
                maxAge: 15 * 60 * 1000
            }).cookie("refreshToken", refreshToken, {
                ...options,
                maxAge: 7 * 24 * 60 * 60 * 1000
            }).json(new ApiResponse(
                    200,
                    {
                        userId: user.userId.toString(),
                        username: user.username,
                        email: user.email,
                        accessToken,
                        refreshToken
                    },
                    "User logged in successfully"
                )
            );
    }
);


const logoutUser = asyncHandler(async (req: Request, res: Response) => {
	//as it get the request check it has cookies
	const accessToken = req.cookies?.accessToken;
	//console.log(accessToken);

	if (!accessToken) {
		throw new ApiError(401, "Access token not found");
	}

	//find decode the token accesstoke and find the userID
	const decoded = await decodeToken(accessToken,process.env.ACCESS_TOKEN_SECRET!) as jwt.JwtPayload;

	if (!decoded._id) {
		throw new ApiError(401, "Invalid access token");
	}

	const userId = BigInt(decoded._id);

	// set the acesstoken null in user table using userId
	await prisma.user.update({
		where: {
			userId: userId
		},
		data: {
			accessToken: null,
			refreshToken: null
		}
	});

	//remove the accsesstoken from cookies
	const options = {
		httpOnly: true,
		secure: process.env.NODE_ENV === "production",
		sameSite: "strict" as const
	};

	res.clearCookie("accessToken", options);
	//res.clearCookie("refreshToken", options);
	res.clearCookie("registerToken", options);

	//return res the user logout
	return res
		.status(200)
		.json(new ApiResponse(200, {}, "User logged out successfully"));
});

const updateProfile = asyncHandler(async (req: Request, res: Response) => {
	// take the req.body and req.files
	console.log(req.body);
	const { name, mobileNo } = req.body;
	
	const files = req.files as { [fieldname: string]: Express.Multer.File[] };

	//fetch the accessToken find the decoded it using decodeToken()  and find user_id from it i access taken not present throw apierror
	const accessToken = req.cookies?.accessToken;

	if (!accessToken) {
		throw new ApiError(401, "Access token is required");
	}

	const decodedToken =await decodeToken(accessToken,process.env.ACCESS_TOKEN_SECRET!) as jwt.JwtPayload;
	console.log(decodedToken);
	console.log(decodedToken._id);
	const userId = decodedToken._id;
	console.log(userId);
	if (!userId) {
		throw new ApiError(401, "Invalid access token");
	}

	//check avatar is in req.files if it is then upload on cloudnary by using function - > uploadonCloudinary, save the url in a var
	let avatarUrl: string | undefined;

	if (files?.avatar?.[0]) {
		const avatarResponse = await uploadonCloudinary(files.avatar[0].path);

		if (!avatarResponse) {
			throw new ApiError(500, "Avatar upload failed");
		}

		avatarUrl = avatarResponse.secure_url;
	}

	//check the reume is in req.file if it is then upload on cloudinary by using function -> uploadonCloudinary,save a url in var
	let resumeUrl: string | undefined;

	if (files?.resume?.[0]) {
		const resumeResponse = await uploadonCloudinary(files.resume[0].path);

		if (!resumeResponse) {
			throw new ApiError(500, "Resume upload failed");
		}

		resumeUrl = resumeResponse.secure_url;
	}

	// if req.body contain any {name , mobile no } then save it var
	const updateData: {
		name?: string;
		mobileNo?: string;
		avatar?: string;
		resume?: string;
	} = {};

	if (name !== undefined) updateData.name = name;
	if (mobileNo !== undefined) updateData.mobileNo = mobileNo;
	if (avatarUrl !== undefined) updateData.avatar = avatarUrl;
	if (resumeUrl !== undefined) updateData.resume = resumeUrl;

	// upate the user table with all value
	const updatedUser = await prisma.user.update({
		where: {
			userId: userId,
		},
		data: updateData,
	});

	//give teh apiresponse
	return res
		.status(200)
		.json(
			JSON.parse(
				JSON.stringify(updatedUser, (_key, value) =>
					typeof value === "bigint" ? value.toString() : value
				)
			)
		);
});
const updateUserbyResumeData = asyncHandler(async (req: Request, res: Response) => {
	//get the acessToken
	const accessToken = req.cookies?.accessToken;

	//if access token not throw ApiError
	if (!accessToken) {
		throw new ApiError(401, "Access token is required");
	}

	//decode the token using decoedToken() function
	let decodedToken;

	try {
		decodedToken = await decodeToken(accessToken);
	} catch (error) {
		throw new ApiError(401, "Invalid or expired access token");
	}

	// if decode fail thorw api error,
	if (!decodedToken || typeof decodedToken === "string") {
		throw new ApiError(401, "Unable to decode access token");
	}

	//find user id if not present throw api error
	if (!decodedToken._id) {
		throw new ApiError(401, "User ID not found in access token");
	}

	const userId = BigInt(decodedToken._id);

	const user = await prisma.user.findUnique({
		where: {
			userId: userId
		}
	});

	if (!user) {
		throw new ApiError(404, "User not found");
	}

	//if global var resumeData is undefined thorw api error : resume is not parsed yet
	console.log(resumeData);
	if (
		typeof resumeData === "undefined" ||
		!resumeData ||
		!resumeData.resume
	) {
		throw new ApiError(400, "Resume is not parsed yet");
	}

	const data = resumeData;

	//here is the resumeData pasted and all the table pasted , u need to save the data in db according to resumeData and tables
	const savedResume = await prisma.$transaction(async (tx) => {

		// Save the main resume details
		const resume = await tx.resume.create({
			data: {
				userId: userId,
				name: data.resume.name ?? null,
				email: data.resume.email ?? null,
				mobileNo: data.resume.mobileNo ?? null,
				introduction: data.resume.introduction ?? null,
				address: data.resume.address ?? null
			}
		});

		// Save education details
		for (const education of data.educations ?? []) {
			await tx.education.create({
				data: {
					resumeId: resume.resumeId,
					institution: education.institution ?? null,
					degree: education.degree ?? null,
					field: education.field ?? null,
					startYear: education.startYear ?? null,
					endYear: education.endYear ?? null,
					cgpa: education.cgpa ?? null,
					description: education.description ?? null
				}
			});
		}

		// Save experience details and associated companies
		for (const experience of data.experiences ?? []) {
			let companyId: bigint | null = null;

			if (experience.company) {
				const company = await tx.company.findFirst({
					where: {
						name: experience.company
					}
				});

				const savedCompany = company ?? await tx.company.create({
					data: {
						name: experience.company
					}
				});

				companyId = savedCompany.companyId;
			}

			await tx.experience.create({
				data: {
					resumeId: resume.resumeId,
					companyId: companyId,
					role: experience.role ?? null,
					startDate: experience.startDate
						? new Date(experience.startDate)
						: null,
					endDate: experience.endDate
						? new Date(experience.endDate)
						: null,
					description: experience.description ?? null
				}
			});
		}

		// Save project details
		for (const project of data.projects ?? []) {
			await tx.project.create({
				data: {
					resumeId: resume.resumeId,
					title: project.title,
					description: project.description ?? null,
					technologies: project.technologies ?? null,
					github: project.github ?? null,
					liveLink: project.liveLink ?? null,
					startDate: project.startDate
						? new Date(project.startDate)
						: null,
					endDate: project.endDate
						? new Date(project.endDate)
						: null
				}
			});
		}

		// Save certification details
		for (const certification of data.certifications ?? []) {
			await tx.certification.create({
				data: {
					resumeId: resume.resumeId,
					name: certification.name,
					issuer: certification.issuer ?? null,
					issueDate: certification.issueDate
						? new Date(certification.issueDate)
						: null,
					credentialId: certification.credentialId ?? null,
					credentialUrl: certification.credentialUrl ?? null
				}
			});
		}

		// Save research details
		for (const research of data.research ?? []) {
			await tx.research.create({
				data: {
					resumeId: resume.resumeId,
					topic: research.topic ?? null,
					title: research.title ?? null,
					journal: research.journal ?? null,
					year: research.year ?? null,
					doi: research.doi ?? null,
					abstract: research.abstract ?? null,
					url: research.url ?? null
				}
			});
		}

		// Save skills and link them to the resume
		for (const skill of data.skills ?? []) {
			const skillName = skill.name?.trim();

			if (!skillName) {
				continue;
			}

			const savedSkill = await tx.skill.upsert({
				where: {
					name: skillName
				},
				update: {},
				create: {
					name: skillName
				}
			});

			await tx.resumeSkill.create({
				data: {
					resumeId: resume.resumeId,
					skillId: savedSkill.skillId
				}
			});
		}

		// Save external links
		for (const link of data.links ?? []) {
			if (!link.type || !link.url) {
				continue;
			}

			await tx.resumeLink.create({
				data: {
					resumeId: resume.resumeId,
					type: link.type,
					url: link.url
				}
			});
		}

		return resume;
	});

	// Return the saved resume
	return res.status(201).json(
		new ApiResponse(
			201,
			{
				resumeId: savedResume.resumeId.toString(),
				userId: userId.toString()
			},
			"Resume data saved successfully"
		)
	);
});

const getUserData = asyncHandler(async (req: Request, res: Response) => {
    const accessToken = req.cookies?.accessToken;

    if (!accessToken) {
        throw new ApiError(401, "Access token is required");
    }

    let decodedToken;

    try {
        decodedToken = await decodeToken(
            accessToken,
            process.env.ACCESS_TOKEN_SECRET!
        ) as jwt.JwtPayload;
    } catch {
        throw new ApiError(401, "Invalid or expired access token");
    }

    if (!decodedToken?._id) {
        throw new ApiError(401, "Invalid access token");
    }

    const userId = BigInt(decodedToken._id);

    const user = await prisma.user.findUnique({
        where: {
            userId,
        },
        select: {
            userId: true,
            name: true,
            username: true,
            email: true,
            mobileNo: true,
            avatar: true,
            resume: true,
            createdAt: true,
            updatedAt: true,
            resumes: {
                include: {
                    educations: true,
                    experiences: {
                        include: {
                            company: true,
                        },
                    },
                    projects: true,
                    certifications: true,
                    research: true,
                    skills: {
                        include: {
                            skill: true,
                        },
                    },
                    links: true,
                },
                orderBy: {
                    createdAt: "desc",
                },
            },
        },
    });

    if (!user) {
        throw new ApiError(404, "User not found");
    }

    return res.status(200).json(
        new ApiResponse(
            200,
            JSON.parse(
                JSON.stringify(user, (_key, value) =>
                    typeof value === "bigint" ? value.toString() : value
                )
            ),
            "User data fetched successfully"
        )
    );
});

export{
registerUser, 
validateOTPRegistration,
loginUser,
logoutUser,
updateProfile,
updateUserbyResumeData,
getUserData
}
