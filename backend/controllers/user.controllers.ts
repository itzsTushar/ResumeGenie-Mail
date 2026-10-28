import {Request , Response } from "express";
import fs from "fs";
import {ApiError} from "../utilis/apierror";
import {ApiResponse} from "../utilis/apiresponse";
import { asyncHandler } from "../utilis/asynchandler";
import prisma from "../database/database";
import {generateRefreshToken , generateAccessToken, decodeToken } from "../handler/token.handler";
import {sendEmail} from "../handler/gmail.handler";
import {generateOtp} from "../handler/otp.handler";
import {generateHashPassword,validateHashPassword} from "../handler/password.handler";
import "dotenv/config";
import {uploadonCloudinary} from "../handler/file.handler";
import {resumeData} from "./resume.controllers";

const registerUser = asyncHandler(async (req : Request , res : Response) => {
	const {name,username , email , password} = req.body;
	if ([name,username, email, password].some((field) => !field?.trim())) {
    	throw new ApiError(400, "All fields are required");
}

	const existingUser = await prisma.user.findFirst({
		where : {
			OR : [{username : username},{email : email}],
		},
	});

	if(existingUser){
		if(existingUser.username === username){
			throw new ApiError(409,"Username already exists");
		}
		if(existingUser.email === email){
			throw new ApiError(409,"Email already exists");
		}
	}

	const hashedPassword = await generateHashPassword(password);
	const refreshToken = await generateRefreshToken("0",username,email);
	
	const user = await prisma.user.create({
        data: {
        	name,
            username,
            email,
            passwordEncrypted: hashedPassword,
            refreshToken : refreshToken || null,
        }
    });

	const otp = await generateOtp();
	const expiresAt = new Date(Date.now() + 5 * 60 * 1000);
    const otpData = await prisma.otpSystem.create({
        data: {
            userId: user.userId,
            type: "EMAIL_VERIFICATION",
            otp: String(otp),
            expiresAt
        }
    });

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
}); 

const validateOTPRegistration = asyncHandler(async (req: Request, res: Response) => {
        const { otp } = req.body;

        if (!otp) {
            throw new ApiError(400, "OTP is required");
        }

        const registerToken = req.cookies?.registerToken;

        if (!registerToken) {
            throw new ApiError(401, "Registration token is missing");
        }

        const decoded = (await decodeToken(registerToken, process.env.REFRESH_TOKEN_SECRET!)) as {
            _id?: string;
            username?: string;
            email?: string;
        };

        if (!decoded?._id || !decoded?.username) {
            throw new ApiError(401, "Invalid registration token");
        }

        const user = await prisma.user.findUnique({
            where: {
                username: decoded.username
            }
        });

        if (!user) {
            throw new ApiError(404, "User not found");
        }

        if (
        	user.username !== decoded.username || 
            user.email !== decoded.email
        ) {
            throw new ApiError(401, "Invalid registration token");
        }

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

        if (otpRecord.expiresAt.getTime() <= Date.now()) {
            throw new ApiError(400, "OTP has expired");
        }

        if (String(otpRecord.otp) !== String(otp)) {
            throw new ApiError(400, "Invalid OTP");
        }

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

        const options = {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            sameSite: "strict" as const,
            maxAge: 7 * 24 * 60 * 60 * 1000
        };

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
});

const loginUser = asyncHandler(async (req: Request, res: Response) => {
        const { email, password } = req.body;

        if (!email?.trim() || !password) {
            throw new ApiError(
                400,
                "Email and password are required"
            );
        }

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

        const isPasswordValid = await validateHashPassword(password, user.passwordEncrypted);

        if (!isPasswordValid) {
            throw new ApiError(401, "Invalid email or password");
        }

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

        await prisma.user.update({
            where: {
                userId: user.userId
            },
            data: {
                accessToken,
                refreshToken
            }
        });

        const options = {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            sameSite: "strict" as const
        };

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
});

const logoutUser = asyncHandler(async (req: Request, res: Response) => {
	const accessToken = req.cookies?.accessToken;

	if (!accessToken) {
		throw new ApiError(401, "Access token not found");
	}

	const decoded = (await decodeToken(accessToken, process.env.ACCESS_TOKEN_SECRET!)) as {
        _id?: string;
    };

	if (!decoded?._id) {
		throw new ApiError(401, "Invalid access token");
	}

	const userId = BigInt(decoded._id);

	await prisma.user.update({
		where: {
			userId: userId
		},
		data: {
			accessToken: null,
			refreshToken: null
		}
	});

	const options = {
		httpOnly: true,
		secure: process.env.NODE_ENV === "production",
		sameSite: "strict" as const
	};

	res.clearCookie("accessToken", options);
	res.clearCookie("registerToken", options);

	return res
		.status(200)
		.json(new ApiResponse(200, {}, "User logged out successfully"));
});

const updateProfile = asyncHandler(async (req: Request, res: Response) => {
	const { name, mobileNo } = req.body;
	const files = req.files as { [fieldname: string]: Express.Multer.File[] };

	const accessToken = req.cookies?.accessToken;

	if (!accessToken) {
		throw new ApiError(401, "Access token is required");
	}

	const decodedToken = (await decodeToken(accessToken, process.env.ACCESS_TOKEN_SECRET!)) as {
        _id?: string;
    };
    
	const userIdStr = decodedToken?._id;
	if (!userIdStr) {
		throw new ApiError(401, "Invalid access token");
	}
    const userId = BigInt(userIdStr);

	let avatarUrl: string | undefined;
	if (files?.avatar?.[0]) {
		const avatarResponse = await uploadonCloudinary(files.avatar[0].path);
		if (!avatarResponse) {
			throw new ApiError(500, "Avatar upload failed");
		}
		avatarUrl = avatarResponse.secure_url;
	}

	let resumeUrl: string | undefined;
	if (files?.resume?.[0]) {
		const resumeResponse = await uploadonCloudinary(files.resume[0].path);
		if (!resumeResponse) {
			throw new ApiError(500, "Resume upload failed");
		}
		resumeUrl = resumeResponse.secure_url;
	}

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

	const updatedUser = await prisma.user.update({
		where: {
			userId: userId,
		},
		data: updateData,
	});

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
	const accessToken = req.cookies?.accessToken;

	if (!accessToken) {
		throw new ApiError(401, "Access token is required");
	}

	let decodedToken;
	try {
		decodedToken = (await decodeToken(accessToken)) as { _id?: string };
	} catch (error) {
		throw new ApiError(401, "Invalid or expired access token");
	}

	if (!decodedToken || typeof decodedToken === "string" || !decodedToken._id) {
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

	if (
		typeof resumeData === "undefined" ||
		!resumeData
	) {
		throw new ApiError(400, "Resume is not parsed yet");
	}

	// Safely parse resumeData if it is a string representation of JSON
	const data: any = typeof resumeData === "string" ? JSON.parse(resumeData) : resumeData;

	if (!data?.resume) {
		throw new ApiError(400, "Invalid resume structure");
	}

	const savedResume = await prisma.$transaction(async (tx : any) => {
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
					startDate: experience.startDate ? new Date(experience.startDate) : null,
					endDate: experience.endDate ? new Date(experience.endDate) : null,
					description: experience.description ?? null
				}
			});
		}

		for (const project of data.projects ?? []) {
			await tx.project.create({
				data: {
					resumeId: resume.resumeId,
					title: project.title,
					description: project.description ?? null,
					technologies: project.technologies ?? null,
					github: project.github ?? null,
					liveLink: project.liveLink ?? null,
					startDate: project.startDate ? new Date(project.startDate) : null,
					endDate: project.endDate ? new Date(project.endDate) : null
				}
			});
		}

		for (const certification of data.certifications ?? []) {
			await tx.certification.create({
				data: {
					resumeId: resume.resumeId,
					name: certification.name,
					issuer: certification.issuer ?? null,
					issueDate: certification.issueDate ? new Date(certification.issueDate) : null,
					credentialId: certification.credentialId ?? null,
					credentialUrl: certification.credentialUrl ?? null
				}
			});
		}

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

		for (const skill of data.skills ?? []) {
			const skillName = skill.name?.trim();
			if (!skillName) continue;

			const savedSkill = await tx.skill.upsert({
				where: { name: skillName },
				update: {},
				create: { name: skillName }
			});

			await tx.resumeSkill.create({
				data: {
					resumeId: resume.resumeId,
					skillId: savedSkill.skillId
				}
			});
		}

		for (const link of data.links ?? []) {
			if (!link.type || !link.url) continue;

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
        decodedToken = (await decodeToken(
            accessToken,
            process.env.ACCESS_TOKEN_SECRET!
        )) as { _id?: string };
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

export {
    registerUser, 
    validateOTPRegistration,
    loginUser,
    logoutUser,
    updateProfile,
    updateUserbyResumeData,
    getUserData
};
