import { Request, Response, NextFunction } from "express";
import httpStatus from "http-status";
import jwt from "jsonwebtoken";
import { PaperlessUser } from "../models/paperless_user.model";

// Extend Express Request interface to include user property
interface AuthenticatedRequest extends Request {
  user?: any;
  accessToken?: any
}

export const authMiddleware = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      res.status(httpStatus.UNAUTHORIZED).json({ message: "Authentication token required" });
      return;
    }

    const token = authHeader.split(" ")[1];

    if (!token) {
      res.status(httpStatus.UNAUTHORIZED).json({ message: "Invalid token format" });
      return;
    }

    let decoded: any;
    try {
      decoded = jwt.verify(token, _CONFIG._JWTSECRET);
    } catch (err) {
      res.status(httpStatus.UNAUTHORIZED).json({ message: "Invalid or expired token" });
      return;
    }

    const user = await PaperlessUser.findById(decoded.sub);

    if (!user) {
      res.status(httpStatus.UNAUTHORIZED).json({ message: "User not found" });
      return;
    }

    req.user = user;
    req.accessToken = token
    req.user._id ? console.log("auth - ✅") : console.log("auth - ❌");
    next();
  } catch (error) {
    console.error("Auth Middleware Error:", error);
    res.status(httpStatus.INTERNAL_SERVER_ERROR).json({
      message: "Internal server error during authentication",
    });
  }
};