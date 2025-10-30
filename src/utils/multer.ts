import multer, { Multer } from "multer";
import { Request } from "express";
import httpStatus from "http-status";
import { ApiError } from "../utils/ApiError.ts";

// Filter images mime type
const filterFile = (
  req: Request,
  file: Express.Multer.File,
  cb: multer.FileFilterCallback
) => {
  if (
    file.mimetype === "image/jpeg" ||
    file.mimetype === "image/jpg" ||
    file.mimetype === "image/png" ||
    file.mimetype === "image/webp"
  ) {
    cb(null, true);
  } else {
    cb(new ApiError(httpStatus.BAD_REQUEST, "Only JPG, JPEG, PNG and WebP images are allowed"));
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