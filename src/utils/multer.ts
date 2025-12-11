import multer, { Multer } from "multer";
import { Request } from "express";
import httpStatus from "http-status";
import { ApiError } from "../utils/ApiError.ts";

// Allowed MIME types
const allowedImageTypes = ["image/jpeg", "image/jpg", "image/png", "image/webp"];
const allowedVideoTypes = ["video/mp4", "video/mpeg", "video/webm", "video/ogg", "video/quicktime"];

// Filter images mime type
const filterFile = (
  req: Request,
  file: Express.Multer.File,
  cb: multer.FileFilterCallback
) => {
  if (allowedImageTypes.includes(file.mimetype) || allowedVideoTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    console.log('file type', file.mimetype)
    cb(new ApiError(httpStatus.BAD_REQUEST, "Only JPG, JPEG, PNG, WebP images and MP4/WebM videos are allowed"));
  }
};

// Use memory storage since we're uploading directly to MinIO
const storage = multer.memoryStorage();

export const upload: Multer = multer({
  storage,
  limits: {
    fileSize: 15 * 1024 * 1024, // file size limit
  },
  fileFilter: filterFile,
});