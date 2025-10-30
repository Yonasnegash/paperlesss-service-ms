import { Request, Response, NextFunction } from "express";
import httpStatus from "http-status";
import { ApiError } from "../utils/ApiError";

function getDateRange(filter: string) {
    const now = new Date();
    let startDate: Date | undefined;
    let endDate: Date = now;
    const allowedFilterValues = ["Daily", "Weekly", "1M", "3M", "6M", "1Y"]
    if (!allowedFilterValues.includes(filter)) {
        throw new ApiError(httpStatus.BAD_REQUEST, 'Invalid filter value')
    }
    switch (filter) {
        case "Daily":
            startDate = new Date(now.getFullYear(), now.getMonth(), now.getDate());
            break;
        case "Weekly":
            startDate = new Date();
            startDate.setDate(now.getDate() - 7);
            break;
        case "1M":
            startDate = new Date();
            startDate.setMonth(now.getMonth() - 1);
            break;
        case "3M":
            startDate = new Date();
            startDate.setMonth(now.getMonth() - 3);
            break;
        case "6M":
            startDate = new Date();
            startDate.setMonth(now.getMonth() - 6);
            break;
        case "1Y":
            startDate = new Date();
            startDate.setFullYear(now.getFullYear() - 1);
            break;
        default:
            startDate = undefined; // No date filter for "All"
    }

    return { startDate, endDate };
}

// Middleware function
export function dateFilterMiddleware(req: Request, res: Response, next: NextFunction) {
    const { filter } = req.query;

    if (!filter) {
        throw new ApiError(httpStatus.BAD_REQUEST, 'filter cannot be empyt')
    }

    if (typeof filter === "string") {
        const { startDate, endDate } = getDateRange(filter);
        const startDateIsoString = startDate ? startDate.toISOString() : undefined;
        const endDateIsoString = endDate.toISOString();
        res.locals.dateRange = { startDateIsoString, endDateIsoString };
    }

    next();
}
