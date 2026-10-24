import { GoogleGenAI } from "@google/genai";
import "dotenv/config";
import { getPrivatePdfUrl } from "./file.handler.ts";

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

export { callGemini };
