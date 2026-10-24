
import { v2 as cloudinary } from "cloudinary";
import fs from "fs";

cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET
});

const uploadonCloudinary = async (
    localFilePath: string
): Promise<typeof cloudinary.uploader.upload extends (...args: any[]) => Promise<infer R> ? R | null : null> => {
    if (!localFilePath) return null;

    try {
        const response = await cloudinary.uploader.upload(
            localFilePath,
            { resource_type: "auto" }
        );

        console.log("File uploaded to Cloudinary:", response.secure_url);

        return response;
    } catch (error) {
        console.error("Cloudinary upload failed:", error);
        return null;
    } finally {
        try {
            if (fs.existsSync(localFilePath)) {
                fs.unlinkSync(localFilePath);
                console.log("Temporary file deleted:", localFilePath);
            }
        } catch (cleanupError) {
            console.error("Temporary file deletion failed:", cleanupError);
        }
    }
};
const getPrivatePdfUrl = (input: string): string => {
    let publicId = input;

    // If a full URL was accidentally passed, extract the public ID from it
    if (input.startsWith("http")) {
        const urlParts = input.split("/upload/");
        if (urlParts.length > 1) {
            // Remove version part (e.g., v179fffgd36020/) and file extension if present
            const pathAfterUpload = urlParts[1].replace(/^v\d+\//, "");
            publicId = pathAfterUpload.substring(0, pathAfterUpload.lastIndexOf(".")) || pathAfterUpload;
        }
    }

    return cloudinary.url(publicId, {
        resource_type: "raw", // or "image" depending on your upload type
        type: "private",
        sign_url: true,
        secure: true,
    });
};
export { uploadonCloudinary,getPrivatePdfUrl };

