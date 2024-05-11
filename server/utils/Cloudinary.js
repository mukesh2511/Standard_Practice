import { v2 as cloudinary } from "cloudinary";
import fs from "fs";

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

const uploadOnCloudinary = async (localFilePath) => {
  try {
    console.log("here");
    console.log(localFilePath);
    if (!localFilePath) {
      console.log("not found");
      return null;
    } else {
      console.log("else");
      const response = await cloudinary.uploader.upload(localFilePath, {
        resource_type: "auto",
      });
      console.log("File Uploaded Successfully", response);
      return response;
    }
  } catch (error) {
    fs.unlinkSync(localFilePath);
    console.log("Failed to upload image");
    return null;
  }
};

export { uploadOnCloudinary };
