// src/controller/statistics.controller.ts
import { Request, Response, NextFunction } from "express";
import { ResponseHandler } from "../utils/response-handler";
import { statisticsQueryService } from "../dal/statistics/query.dal";
import { statisticsAggregationService } from "../dal/statistics/aggregation.dal";
import { IStatsQuery } from "../config/types/statistics";

/**
 * Get general paperless statistics
 */
export const getGeneralStats = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const query: IStatsQuery = {
      timeRange: req.query.timeRange as any,
      startDate: req.query.startDate as string,
      endDate: req.query.endDate as string,
      district: req.query.district as string,
      branchId: req.query.branchId as string
    };
    
    const stats = await statisticsQueryService.getGeneralStats(query);
    
    return ResponseHandler.sendSuccess(
      res,
      "General statistics retrieved successfully",
      stats
    );
  } catch (error) {
    next(error);
  }
};

/**
 * Get branch insights
 */
export const getBranchInsights = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const query: IStatsQuery = {
      district: req.query.district as string
    };
    
    const insights = await statisticsQueryService.getBranchInsights(query);
    
    return ResponseHandler.sendSuccess(
      res,
      "Branch insights retrieved successfully",
      insights
    );
  } catch (error) {
    next(error);
  }
};

/**
 * Get branch detail statistics
 */
export const getBranchDetailStats = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { branchId } = req.params;
    
    const query: IStatsQuery = {
      timeRange: req.query.timeRange as any,
      startDate: req.query.startDate as string,
      endDate: req.query.endDate as string
    };
    
    const stats = await statisticsQueryService.getBranchDetailStats(
      branchId,
      query
    );
    
    return ResponseHandler.sendSuccess(
      res,
      "Branch statistics retrieved successfully",
      stats
    );
  } catch (error) {
    next(error);
  }
};

/**
 * Get customer statistics
 */
export const getCustomerStats = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const query: IStatsQuery = {
      timeRange: req.query.timeRange as any,
      startDate: req.query.startDate as string,
      endDate: req.query.endDate as string,
      district: req.query.district as string,
      branchId: req.query.branchId as string
    };
    
    const stats = await statisticsQueryService.getCustomerStats(query);
    
    return ResponseHandler.sendSuccess(
      res,
      "Customer statistics retrieved successfully",
      stats
    );
  } catch (error) {
    next(error);
  }
};

/**
 * Manually trigger statistics aggregation (admin only)
 */
export const triggerAggregation = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { type, date } = req.body;
    
    switch (type) {
      case 'daily':
        await statisticsAggregationService.aggregateDailyStats(date);
        break;
      case 'weekly':
        await statisticsAggregationService.aggregateWeeklyStats(date);
        break;
      case 'monthly':
        await statisticsAggregationService.aggregateMonthlyStats(date);
        break;
      case 'rankings':
        await statisticsAggregationService.updateBranchRankings();
        break;
      default:
        return ResponseHandler.badRequest(res, "Invalid aggregation type");
    }
    
    return ResponseHandler.sendSuccess(
      res,
      `${type} aggregation completed successfully`,
      null
    );
  } catch (error) {
    next(error);
  }
};