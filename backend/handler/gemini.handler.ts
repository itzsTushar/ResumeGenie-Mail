import { GoogleGenAI } from "@google/genai";
import "dotenv/config";
import { getPrivatePdfUrl } from "./file.handler.ts";
import JOB_EMAIL_PROMPT from "../prompt/gemini.prompt.ts";
const ai = new GoogleGenAI({
    apiKey: process.env.GEMINI_API_KEY!,
});

const callGemini = async (
    prompt: string,
    publicIdOrUrl: string // Updated variable name for clarity
): Promise<string> => {
    try {
        if (typeof prompt !== "string" || !prompt.trim()) {
            throw new Error("Prompt is required");
        }

        if (typeof publicIdOrUrl !== "string" || !publicIdOrUrl.trim()) {
            throw new Error("Cloudinary public ID or URL is required");
        }

        // Pass it to your handler (which will now safely handle URLs or IDs)
        //const pdfUrl = getPrivatePdfUrl(publicIdOrUrl);
        const pdfResponse = await fetch(publicIdOrUrl);
		console.log(pdfResponse);
        if (!pdfResponse.ok) {
            throw new Error(
                `Failed to download PDF from Cloudinary: ${pdfResponse.status}`
            );
        }

        const pdfBuffer = Buffer.from(
            await pdfResponse.arrayBuffer()
        );

        if (pdfBuffer.length === 0) {
            throw new Error("The PDF file is empty");
        }

        const response = await ai.models.generateContent({
            model: "gemini-3.8-flash", // Adjusted model name format standard if needed
            contents: [
                { text: prompt },
                {
                    inlineData: {
                        mimeType: "application/pdf",
                        data: pdfBuffer.toString("base64"),
                    },
                },
            ],
        });

        return response.text ?? "";
    } catch (error) {
        console.error("Gemini API Error:", error);
        throw error;
    }
};
const geminiJobEmail = async (
	companyname: string,
	hrname: string,
	hrmail: string,
	desc: string,
	userId: string
): Promise<string> => {
	//if userId is not in usertable throw error
	const user = await prisma.user.findUnique({
		where: {
			userId: BigInt(userId)
		},
		include: {
			resumes: {
				include: {
					educations: true,
					experiences: true,
					projects: true,
					certifications: true,
					research: true,
					skills: true,
					links: true
				}
			}
		}
	});

	if (!user) {
		throw new ApiError(404, "User not found");
	}

	//find all the user info about education, exp, project, certification, research, related skills to desc
	const userData = {
		name: user.name,
		email: user.email,
		mobileNo: user.mobileNo,
		resumes: user.resumes
	};

	//make json file of user data and company data to attach with the JOB_EMAIL_PROMPT
	const companyData = {
		company_name: companyname,
		hr_name: hrname || null,
		hr_email: hrmail,
		job_description: desc
	};

	const jsonData = JSON.stringify(
		{
			user: userData,
			company: companyData
		},
		(_key, value) =>
			typeof value === "bigint" ? value.toString() : value
	);

	//concate json with JOB_EMAIL_PROMPT
	const prompt = `${JOB_EMAIL_PROMPT}
USER PROFILE AND COMPANY DATA (JSON):
${jsonData}
`;

	/*
	const response = await ai.models.generateContent({
		model: "gemini-3.8-flash",
		contents: [
			{ text: prompt }
		],
	});
	*/

	const response = await ai.models.generateContent({
		model: "gemini-3.8-flash",
		contents: [
			{
				text: prompt
			}
		]
	});

	//return the response
	const emailContent = response.text?.trim();

	if (!emailContent) {
		throw new ApiError(500, "Failed to generate job application email");
	}

	return emailContent;
};
export { callGemini,geminiJobEmail };
