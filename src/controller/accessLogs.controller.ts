import { Request, Response, NextFunction } from "express";
import fs from "fs";
import path from "path";
import httpStatus from "http-status";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const LOGS_DIR = path.join(__dirname, "..", "logs");

export const getLogs = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;

    // Optional date filter
    const startDate = req.query.startDate ? new Date(req.query.startDate as string) : null;
    const endDate = req.query.endDate ? new Date(req.query.endDate as string) : null;

    // Regex to match YYYY-MM-DD.log
    const logFilePattern = /^\d{4}-\d{2}-\d{2}\.log$/;

    // Filter files matching pattern
    let allFiles = fs.readdirSync(LOGS_DIR).filter(file => logFilePattern.test(file));

    // Apply date filter if provided
    if (startDate || endDate) {
      allFiles = allFiles.filter(file => {
        const fileDateStr = file.replace('.log', ''); // YYYY-MM-DD
        const fileDate = new Date(fileDateStr);

        if (startDate && fileDate < startDate) return false;
        if (endDate && fileDate > endDate) return false;
        return true;
      });
    }

    // Sort newest first
    allFiles.sort((a, b) => {
      const aTime = fs.statSync(path.join(LOGS_DIR, a)).mtime.getTime();
      const bTime = fs.statSync(path.join(LOGS_DIR, b)).mtime.getTime();
      return bTime - aTime;
    });

    const totalItems = allFiles.length;
    const totalPages = Math.ceil(totalItems / limit);

    if (page > totalPages && totalItems > 0) {
      return res.status(httpStatus.NOT_FOUND).json({
        message: "No logs found for this page",
        data: [],
        status: httpStatus.NOT_FOUND
      });
    }

    const startIndex = (page - 1) * limit;
    const endIndex = startIndex + limit;
    const paginatedFiles = allFiles.slice(startIndex, endIndex);

    const API_PREFIX = "/v1.0/paperless/services/access-log"; 
    const data = paginatedFiles.map(file => {
      const stats = fs.statSync(path.join(LOGS_DIR, file));
      return {
        filename: file,
        size: stats.size,
        url: `${_CONFIG.PAPERLESS_LOGS_BASE_URL}${API_PREFIX}/logs/file/${file}`
      };
    });

    res.status(httpStatus.OK).json({
      message: "Logs retrieved successfully",
      totalItems,
      totalPages,
      page,
      limit,
      data,
      status: httpStatus.OK
    });

  } catch (error) {
    next(error);
  }
};

// Serve individual log file
export const getLogFile = (req: Request, res: Response, next: NextFunction) => {
    try {
        const { filename } = req.params;
        const filePath = path.join(LOGS_DIR, filename);

        if (!fs.existsSync(filePath)) {
            return res.status(httpStatus.NOT_FOUND).json({
                message: "File not found",
                status: httpStatus.NOT_FOUND
            });
        }

        // Stream the file to browser
        res.setHeader("Content-Type", "text/plain");
        const stream = fs.createReadStream(filePath, { encoding: "utf-8" });
        stream.pipe(res);

    } catch (error) {
        next(error);
    }
};
