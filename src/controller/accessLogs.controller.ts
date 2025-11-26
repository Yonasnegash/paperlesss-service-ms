import { Request, Response, NextFunction } from "express";
import fs from "fs";
import path from "path";
import httpStatus from "http-status";
import { fileURLToPath } from "url";

// ES Modules __dirname setup
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const LOGS_DIR = path.join(__dirname, "..", "logs");

export const getLogs = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const page = parseInt(req.query.page as string) || 1;
        const limit = parseInt(req.query.limit as string) || 10;

        // Regex to match YYYY-MM-DD.log
        const logFilePattern = /^\d{4}-\d{2}-\d{2}\.log$/;

        // Filter files matching pattern, then sort newest first
        const allFiles = fs.readdirSync(LOGS_DIR)
            .filter(file => logFilePattern.test(file))
            .sort((a, b) => {
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
        // Build response with file metadata + clickable URL
        const data = paginatedFiles.map(file => {
            const stats = fs.statSync(path.join(LOGS_DIR, file));
            return {
                filename: file,
                size: stats.size,
                // createdAt: stats.birthtime,
                // updatedAt: stats.mtime,
                // clickable URL
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
