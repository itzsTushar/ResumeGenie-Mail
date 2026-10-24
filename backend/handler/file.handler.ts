
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

export { uploadonCloudinary };

