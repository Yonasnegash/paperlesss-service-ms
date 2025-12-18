// src/services/statistics/query.service.ts
import moment from "moment-timezone";
import { DailyStats, WeeklyStats, MonthlyStats, BranchPerformance, CustomerEngagement } from "../../models/statistics.model";
import Credential from "../../models/credential.model";
import Service from "../../models/service.model";
import {
  IStatsQuery,
  IGeneralStatsResponse,
  IBranchInsightsResponse,
  IBranchDetailResponse,
  ICustomerStatsResponse,
  ITransactionsStatResponse,
  IMostUsedServicesResponse,
  IBestPerformingBranch,
  ICustomerEngagementScore,
  IBestPerformingBranches
} from "../../config/types/statistics";

export class StatisticsQueryService {
  
  /**
   * Get date range based on timeRange parameter
   */
  private getDateRange(timeRange: string, customStart?: string, customEnd?: string) {
    const now = moment().tz("Africa/Addis_Ababa");
    let startDate: string;
    let endDate: string = now.format("YYYY-MM-DD");
    
    if (customStart && customEnd) {
      startDate = customStart;
      endDate = customEnd;
    } else {
      switch (timeRange) {
        case 'daily':
          startDate = now.format("YYYY-MM-DD");
          break;
        case 'weekly':
          startDate = now.subtract(7, 'days').format("YYYY-MM-DD");
          break;
        case '1month':
          startDate = now.subtract(1, 'month').format("YYYY-MM-DD");
          break;
        case '3months':
          startDate = now.subtract(3, 'months').format("YYYY-MM-DD");
          break;
        case '6months':
          startDate = now.subtract(6, 'months').format("YYYY-MM-DD");
          break;
        case '1year':
          startDate = now.subtract(1, 'year').format("YYYY-MM-DD");
          break;
        default:
          startDate = now.subtract(30, 'days').format("YYYY-MM-DD");
      }
    }
    
    return { startDate, endDate };
  }
  
  /**
   * Get general paperless statistics
   */
  async getGeneralStats(query: IStatsQuery): Promise<IGeneralStatsResponse> {
    const { startDate, endDate } = this.getDateRange(
      query.timeRange || '1month',
      query.startDate,
      query.endDate
    );
    
    // Build filter
    const filter: any = {
      date: { $gte: startDate, $lte: endDate }
    };
    
    if (query.district) filter.district = query.district;
    if (query.branchId) filter.branchId = query.branchId;
    
    // Get activated branches count
    const activatedBranches = await DailyStats.distinct('branchId', filter);
    const totalPaperlessActivatedBranches = activatedBranches.length;
    
    // Get total unique customers across all branches
    const customerAgg = await DailyStats.aggregate([
      { $match: filter },
      { $unwind: '$uniqueCustomers' },
      { $group: { _id: '$uniqueCustomers' } },
      { $count: 'total' }
    ]);
    const totalCustomers = customerAgg[0]?.total || 0;
    
    // Get total services count
    const totalServices = await Service.countDocuments({ isActive: true });

    const bestBranch = await this.bestPerformingBranch(filter);
    
    return {
      totalPaperlessActivatedBranches,
      totalCustomers,
      totalServices,
      bestPerformingBranch: bestBranch
    };
  }

  /**
   * Get transaction overtime stats
   */
  async getTransactionsOverTime(query: IStatsQuery): Promise<ITransactionsStatResponse> {
    const { startDate, endDate } = this.getDateRange(
        query.timeRange || '1month',
        query.startDate,
        query.endDate
    );
    
    // Build filter
    const filter: any = {
        date: { $gte: startDate, $lte: endDate }
    };
    
    if (query.district) filter.district = query.district;
    if (query.branchId) filter.branchId = query.branchId;

    // Get transactions over time
    const transactionsOverTime = await DailyStats.aggregate([
      { $match: filter },
      {
        $group: {
          _id: '$date',
          count: { $sum: '$totalQueueNumbers' }
        }
      },
      { $sort: { _id: 1 } },
      {
        $project: {
          _id: 0,
          date: '$_id',
          count: 1
        }
      }
    ]);

    return {
        totalTransactionsOverTime: transactionsOverTime
    }
  }

  /**
   * Get most used services stats
   */
  async getMostUsedServices(query: IStatsQuery): Promise<IMostUsedServicesResponse> {
    const { startDate, endDate } = this.getDateRange(
      query.timeRange || '1month',
      query.startDate,
      query.endDate
    );
    
    // Build filter
    const filter: any = {
      date: { $gte: startDate, $lte: endDate }
    };
    
    if (query.district) filter.district = query.district;
    if (query.branchId) filter.branchId = query.branchId;

    // Get most used services
    const serviceAgg = await DailyStats.aggregate([
        { $match: filter },
        { $unwind: '$serviceBreakdown' },
        {
            $group: {
            _id: '$serviceBreakdown.serviceId',
            serviceName: { $first: '$serviceBreakdown.serviceName' },
            totalCount: { $sum: '$serviceBreakdown.count' }
            }
        },
        { $sort: { totalCount: -1 } },
        { $limit: 10 }
    ]);
    
    const totalServiceCount = serviceAgg.reduce((sum, s) => sum + s.totalCount, 0);
    const mostUsedServices = serviceAgg.map(s => ({
        serviceId: s._id.toString(),
        serviceName: s.serviceName,
        count: s.totalCount,
        percentage: Math.round((s.totalCount / totalServiceCount) * 100)
    }));

    return {
        mostUsedServices
    }
  }

  /**
   * Get best performing branch
   */
  async getBestPerformingBranch(query: IStatsQuery): Promise<IBestPerformingBranch> {
    const { startDate, endDate } = this.getDateRange(
        query.timeRange || '1month',
        query.startDate,
        query.endDate
    );
    
    // Build filter
    const filter: any = {
        date: { $gte: startDate, $lte: endDate }
    };
    
    if (query.district) filter.district = query.district;
    if (query.branchId) filter.branchId = query.branchId;

    const branchStats = await DailyStats.aggregate([
        { $match: filter },
        {
            $group: {
            _id: '$branchId',
            totalQueueNumbers: { $sum: '$totalQueueNumbers' },
            uniqueCustomers: { $addToSet: { $arrayElemAt: ['$uniqueCustomers', 0] } }
            }
        },
        { $sort: { totalQueueNumbers: -1 } },
        { $limit: 1 }
    ]);
    
    if (!branchStats.length) {
      return {
        bestPerformingBranch: {
            branchId: '',
            branchName: '',
            totalQueueNumbers: 0,
            totalCustomers: 0
        }
      };
    }
    
    const branch = branchStats[0];
    const branchInfo = await Credential.findOne({ branchCode: branch._id });
    
    return {
        bestPerformingBranch: {
            branchId: branch._id,
            branchName: branchInfo?.branchName || branch._id,
            totalQueueNumbers: branch.totalQueueNumbers,
            totalCustomers: branch.uniqueCustomers.filter((c: any) => c).length
        }
    };
  }

  /**
   * Get best performing branch
   */
  private async bestPerformingBranch(filter: any) {
    const branchStats = await DailyStats.aggregate([
      { $match: filter },
      {
        $group: {
          _id: '$branchId',
          totalQueueNumbers: { $sum: '$totalQueueNumbers' },
          uniqueCustomers: { $addToSet: { $arrayElemAt: ['$uniqueCustomers', 0] } }
        }
      },
      { $sort: { totalQueueNumbers: -1 } },
      { $limit: 1 }
    ]);
    
    if (!branchStats.length) {
      return {
        branchId: '',
        branchName: '',
        totalQueueNumbers: 0,
        totalCustomers: 0
      };
    }
    
    const branch = branchStats[0];
    const branchInfo = await Credential.findOne({ branchCode: branch._id });
    
    return {
      branchId: branch._id,
      branchName: branchInfo?.branchName || branch._id,
      totalQueueNumbers: branch.totalQueueNumbers,
      totalCustomers: branch.uniqueCustomers.filter((c: any) => c).length
    };
  }

  /**
   * Get customer engagement score
   */
  async getCustomerEngagementScore(query: IStatsQuery): Promise<ICustomerEngagementScore> {
    // Calculate customer engagement score
    const engagementScores = await CustomerEngagement.find(
      query.branchId ? { branchId: query.branchId } : {}
    );

    const avgEngagementScore = engagementScores.length
      ? Math.round(
          engagementScores.reduce((sum, e) => sum + e.engagementScore, 0) / engagementScores.length
        )
      : 0;

    return {
        customerEngagementScore: avgEngagementScore
    }
  }
  
  /**
   * Get best performing branches list
   */
  async getBestPerformingBranches(query: any, limit: number = 10): Promise<IBestPerformingBranches> {
    const { startDate, endDate } = this.getDateRange(
      query.timeRange || '1month',
      query.startDate,
      query.endDate
    );
    
    // Build filter
    const filter: any = {
      date: { $gte: startDate, $lte: endDate }
    };
    
    if (query.district) filter.district = query.district;
    if (query.branchId) filter.branchId = query.branchId;

    const branchStats = await DailyStats.aggregate([
      { $match: filter },
      {
        $group: {
          _id: '$branchId',
          totalQueueNumbers: { $sum: '$totalQueueNumbers' },
          uniqueCustomers: { $addToSet: { $arrayElemAt: ['$uniqueCustomers', 0] } }
        }
      },
      { $sort: { totalQueueNumbers: -1 } },
      { $limit: limit }
    ]);
    
    const result = [];
    for (let i = 0; i < branchStats.length; i++) {
      const branch = branchStats[i];
      const branchInfo = await Credential.findOne({ branchCode: branch._id });
      
      result.push({
        branchId: branch._id,
        branchName: branchInfo?.branchName || branch._id,
        totalQueueNumbers: branch.totalQueueNumbers,
        totalCustomers: branch.uniqueCustomers.filter((c: any) => c).length,
        rank: i + 1
      });
    }
    
    return {
        bestPerformingBranches: result
    };
  }
  
  /**
   * Get branch insights
   */
  async getBranchInsights(query: IStatsQuery): Promise<IBranchInsightsResponse> {
    // Total registered branches (from credentials)
    const totalRegisteredBranches = await Credential.countDocuments();
    
    // Filter for performance data
    const performanceFilter: any = {};
    if (query.district) performanceFilter.district = query.district;
    
    // Paperless enabled branches (have generated at least one queue)
    const totalPaperlessEnabledBranches = await BranchPerformance.countDocuments({
      ...performanceFilter,
      isActivated: true
    });
    
    // Non-paperless branches
    const totalNonPaperlessBranches = totalRegisteredBranches - totalPaperlessEnabledBranches;
    
    // Best performing branch
    const bestBranch = await BranchPerformance.findOne(performanceFilter)
      .sort({ performanceRank: 1 })
      .limit(1);
    
    const bestPerformingBranch = bestBranch
      ? {
          branchId: bestBranch.branchId,
          branchName: bestBranch.branchName,
          totalQueueNumbers: bestBranch.totalQueueNumbers,
          totalCustomers: bestBranch.totalUniqueCustomers
        }
      : {
          branchId: '',
          branchName: '',
          totalQueueNumbers: 0,
          totalCustomers: 0
        };
    
    // Customer satisfaction score (placeholder - implement survey system)
    const customerSatisfactionScore = 0; // Default value
    
    return {
      totalRegisteredBranches,
      totalPaperlessEnabledBranches,
      totalNonPaperlessBranches,
      bestPerformingBranch,
      customerSatisfactionScore
    };
  }
  
  /**
   * Get branch detail statistics
   */
  async getBranchDetailStats(
    branchId: string,
    query: IStatsQuery
  ): Promise<IBranchDetailResponse> {
    const { startDate, endDate } = this.getDateRange(
      query.timeRange || '1month',
      query.startDate,
      query.endDate
    );
    
    const filter = {
      branchId,
      date: { $gte: startDate, $lte: endDate }
    };
    
    // Aggregate branch stats
    const stats = await DailyStats.aggregate([
      { $match: filter },
      {
        $group: {
          _id: null,
          totalQueueNumbers: { $sum: '$totalQueueNumbers' },
          bankInitiated: { $sum: '$bankInitiatedQueues' },
          superAppInitiated: { $sum: '$superAppInitiatedQueues' },
          qrInitiated: { $sum: '$qrInitiatedQueues' },
          avgResponseTime: { $avg: '$avgResponseTime' },
          serviceBreakdown: { $push: '$serviceBreakdown' }
        }
      }
    ]);
    
    if (!stats.length) {
      const branchInfo = await Credential.findOne({ branchCode: branchId });
      return {
        branchId,
        branchName: branchInfo?.branchName || branchId,
        totalQueueNumbers: 0,
        bankInitiatedQueues: 0,
        superAppInitiatedQueues: 0,
        qrInitiatedQueues: 0,
        avgResponseTime: 0,
        mostServedService: {
          serviceId: '',
          serviceName: '',
          count: 0
        }
      };
    }
    
    const data = stats[0];
    
    // Find most served service
    const serviceMap = new Map<string, { serviceName: string; count: number }>();
    data.serviceBreakdown.flat().forEach((item: any) => {
      if (!item.serviceId) return;
      const key = item.serviceId.toString();
      if (serviceMap.has(key)) {
        serviceMap.get(key)!.count += item.count;
      } else {
        serviceMap.set(key, { serviceName: item.serviceName, count: item.count });
      }
    });
    
    let mostServedService = { serviceId: '', serviceName: '', count: 0 };
    for (const [serviceId, data] of serviceMap.entries()) {
      if (data.count > mostServedService.count) {
        mostServedService = { serviceId, ...data };
      }
    }
    
    const branchInfo = await Credential.findOne({ branchCode: branchId });
    
    return {
      branchId,
      branchName: branchInfo?.branchName || branchId,
      totalQueueNumbers: data.totalQueueNumbers,
      bankInitiatedQueues: data.bankInitiated,
      superAppInitiatedQueues: data.superAppInitiated,
      qrInitiatedQueues: data.qrInitiated,
      avgResponseTime: Math.round(data.avgResponseTime),
      mostServedService
    };
  }
  
  /**
   * Get customer statistics
   */
  async getCustomerStats(query: IStatsQuery): Promise<ICustomerStatsResponse> {
    const { startDate, endDate } = this.getDateRange(
      query.timeRange || '1month',
      query.startDate,
      query.endDate
    );
    
    const filter: any = {
      date: { $gte: startDate, $lte: endDate }
    };
    
    if (query.district) filter.district = query.district;
    if (query.branchId) filter.branchId = query.branchId;
    
    // Total unique customers
    const customerAgg = await DailyStats.aggregate([
      { $match: filter },
      { $unwind: '$uniqueCustomers' },
      { $group: { _id: '$uniqueCustomers' } },
      { $count: 'total' }
    ]);
    const totalCustomers = customerAgg[0]?.total || 0;
    
    // Most used service
    const serviceAgg = await DailyStats.aggregate([
      { $match: filter },
      { $unwind: '$serviceBreakdown' },
      {
        $group: {
          _id: '$serviceBreakdown.serviceId',
          serviceName: { $first: '$serviceBreakdown.serviceName' },
          totalCount: { $sum: '$serviceBreakdown.count' }
        }
      },
      { $sort: { totalCount: -1 } },
      { $limit: 1 }
    ]);
    
    const mostUsedService = serviceAgg.length
      ? {
          serviceId: serviceAgg[0]._id.toString(),
          serviceName: serviceAgg[0].serviceName,
          count: serviceAgg[0].totalCount
        }
      : {
          serviceId: '',
          serviceName: '',
          count: 0
        };
    
    // Customer satisfaction score (placeholder)
    const customerSatisfactionScore = 0;
    
    return {
      totalCustomers,
      mostUsedService,
      customerSatisfactionScore
    };
  }
}

export const statisticsQueryService = new StatisticsQueryService();