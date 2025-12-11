import multer from "multer";
import { Request, Response, NextFunction } from "express";
import { ApiError } from "../utils/ApiError";

export const handleMulterErrors = (err: any, req: Request, res: Response, next: NextFunction) => {
  if (err instanceof multer.MulterError) {
    // Multer errors (file too large, invalid field count, etc.)
    const message =
      err.code === "LIMIT_FILE_SIZE"
        ? "File too large. Maximum allowed size exceeded."
        : err.message;

    return res.status(400).json({
      statusCode: 400,
      message,
      data: null,
    });
  }

  if (err instanceof ApiError) {
    return res.status(err.statusCode).json({
      statusCode: err.statusCode,
      message: err.message,
      data: null,
    });
  }

  next(err);
};