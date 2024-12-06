import { v2 as cloudinary } from 'cloudinary';
import fs from 'fs';

const uploadOnCloudinary = async (localFilePath) => {
    try {
        if (!localFilePath) return null;

        const result = await cloudinary.uploader.upload(localFilePath, {   //In upload config work as same time.
            resource_type: 'auto',
            cloud_name: process.env.CLOUDINARY_CLOUD_NAME, 
            api_key: process.env.CLOUDINARY_API_KEY, 
            api_secret: process.env.CLOUDINARY_API_SECRET
        });
        // Optionally delete the local file if upload succeeds
        fs.unlinkSync(localFilePath);
        return result;
    } catch (error) {
        // Safely handle unlink errors if local file exists
        try {
            fs.unlinkSync(localFilePath);
        } catch (unlinkError) {
            console.error("Failed to delete local file:", unlinkError.message);
        }
        console.error("Error uploading file:", error.message);
        return null;
    }
};

export {uploadOnCloudinary}