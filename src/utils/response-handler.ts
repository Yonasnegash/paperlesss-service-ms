import type { Response } from "express";

export enum HttpStatusCode {
    OK = 200,
    BAD_REQUEST = 400,
    CREATED = 201,
    UNAUTHORIZED = 401,
    FORBIDDEN = 403,
    NOT_FOUND = 404,
    CONFLICT = 409,
    INTERNAL_SERVER_ERROR = 500
}

export interface Pagination {
    page?: number
    limit: number
    totalDocs: number
    totalPages?: number
    nextCursor?: string
}

export class ResponseHandler {
    static sendSuccess<T>(
        res: Response,
        data: T,
        pagination: Pagination | null = null,
        statusCode = HttpStatusCode.OK,
    ) {
        return res.status(statusCode).json({
            statusCode,
            error: null,
            data,
            ...(pagination ? { pagination } : {})
        })
    }

    static sendError(
        res: Response,
        message: string | string[],
        statusCode: number
    ) {
        return res.status(statusCode).json({
            statusCode,
            error: message,
            data: null
        })
    }

    static badRequest(res: Response, message: string | string[] = "Bad Request") {
        return this.sendError(res, message, HttpStatusCode.BAD_REQUEST);
    }

    static unauthorized(res: Response, message = "Unauthorized") {
    return this.sendError(res, message, HttpStatusCode.UNAUTHORIZED);
  }

  static forbidden(res: Response, message = "Forbidden") {
    return this.sendError(res, message, HttpStatusCode.FORBIDDEN);
  }

  static notFound(res: Response, message = "Not found") {
    return this.sendError(res, message, HttpStatusCode.NOT_FOUND);
  }

  static conflict(res: Response, message = "Conflict occurred") {
    return this.sendError(res, message, HttpStatusCode.CONFLICT);
  }

  static validationError(res: Response, message = "Validation failed") {
    return this.sendError(res, message, HttpStatusCode.BAD_REQUEST);
  }

  static serverError(res: Response, message = "Internal server error") {
    return this.sendError(res, message, HttpStatusCode.INTERNAL_SERVER_ERROR);
  }
}