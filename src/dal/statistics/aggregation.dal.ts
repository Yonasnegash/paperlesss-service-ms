// src/services/statistics/aggregation.service.ts
import moment from "moment-timezone";
import { Application } from "../../models/application.model";
import { DailyStats, WeeklyStats, MonthlyStats, BranchPerformance, CustomerEngagement } from "../../models/statistics.model";

export class StatisticsAggregationService {
  
  /**
   * Aggregate daily statistics for a specific date
   * This should run as a cron job every day at midnight
   */
  async aggregateDailyStats(date?: string): Promise<void> {
    const targetDate = date || moment().tz("Africa/Addis_Ababa").subtract(1, 'day').format("YYYY-MM-DD");
    
    console.log(`Starting daily aggregation for ${targetDate}`);
    
    const startOfDay = moment.tz(targetDate, "Africa/Addis_Ababa").startOf('day').toDate();
    const endOfDay = moment.tz(targetDate, "Africa/Addis_Ababa").endOf('day').toDate();
    
    // Get all unique branches that had activity on this day
    const branches = await Application.distinct('branchId', {
      createdAt: { $gte: startOfDay, $lte: endOfDay },
      isDeleted: false
    });
    
    for (const branchId of branches) {
      await this.aggregateDailyStatsForBranch(branchId, targetDate, startOfDay, endOfDay);
    }
    
    console.log(`Completed daily aggregation for ${targetDate}`);
  }
  
  /**
   * Aggregate daily stats for a specific branch
   */
  private async aggregateDailyStatsForBranch(
    branchId: string,
    date: string,
    startOfDay: Date,
    endOfDay: Date
  ): Promise<void> {
    
    // Fetch credentials to get district
    const credential = await import("../../models/credential.model").then(m => m.default);
    const branchInfo = await credential.findOne({ branchCode: branchId });
    const district = branchInfo?.district || "Unknown";
    
    // Aggregate using MongoDB aggregation pipeline for efficiency
    const aggregation = await Application.aggregate([
      {
        $match: {
          branchId,
          createdAt: { $gte: startOfDay, $lte: endOfDay },
          isDeleted: false
        }
      },
      {
        $lookup: {
          from: 'services',
          localField: 'serviceReference',
          foreignField: '_id',
          as: 'service'
        }
      },
      {
        $lookup: {
          from: 'servicecategories',
          localField: 'serviceCategoryReference',
          foreignField: '_id',
          as: 'category'
        }
      },
      {
        $unwind: { path: '$service', preserveNullAndEmptyArrays: true }
      },
      {
        $unwind: { path: '$category', preserveNullAndEmptyArrays: true }
      },
      {
        $group: {
          _id: null,
          totalQueueNumbers: { $sum: 1 },
          bankInitiated: {
            $sum: { $cond: [{ $eq: ['$channel', 'bank'] }, 1, 0] }
          },
          superAppInitiated: {
            $sum: { $cond: [{ $eq: ['$channel', 'phone'] }, 1, 0] }
          },
          qrInitiated: {
            $sum: { $cond: [{ $eq: ['$channel', 'qr'] }, 1, 0] }
          },
          uniqueCustomers: { $addToSet: '$accountNumber' },
          serviceBreakdown: {
            $push: {
              serviceId: '$serviceReference',
              serviceName: '$service.name',
              categoryId: '$serviceCategoryReference',
              categoryName: '$category.name'
            }
          }
        }
      }
    ]);
    
    if (!aggregation.length) return;
    
    const data = aggregation[0];
    
    // Process service breakdown
    const serviceMap = new Map<string, any>();
    data.serviceBreakdown.forEach((item: any) => {
      if (!item.serviceId) return;
      
      const key = item.serviceId.toString();
      if (serviceMap.has(key)) {
        serviceMap.get(key).count++;
      } else {
        serviceMap.set(key, {
          serviceId: item.serviceId,
          serviceName: item.serviceName,
          categoryId: item.categoryId,
          categoryName: item.categoryName,
          count: 1
        });
      }
    });
    
    const serviceBreakdown = Array.from(serviceMap.values());
    
    // Calculate avg response time (if you track completion times)
    // For now, using expectedResponseTime from service
    const avgResponseTime = await this.calculateAvgResponseTime(branchId, startOfDay, endOfDay);
    
    // Check for repeat vs new customers
    const { repeatCustomers, newCustomers } = await this.analyzeCustomerTypes(
      branchId,
      data.uniqueCustomers,
      startOfDay
    );
    
    // Upsert daily stats
    await DailyStats.findOneAndUpdate(
      { date, branchId },
      {
        date,
        branchId,
        district,
        totalQueueNumbers: data.totalQueueNumbers,
        bankInitiatedQueues: data.bankInitiated,
        superAppInitiatedQueues: data.superAppInitiated,
        qrInitiatedQueues: data.qrInitiated,
        uniqueCustomers: data.uniqueCustomers,
        uniqueCustomerCount: data.uniqueCustomers.length,
        serviceBreakdown,
        totalResponseTime: 0, // Implement if you track completion
        avgResponseTime,
        repeatCustomers,
        newCustomers
      },
      { upsert: true, new: true }
    );
    
    // Update branch performance
    await this.updateBranchPerformance(branchId, branchInfo?.branchName, district);
    
    // Update customer engagement
    await this.updateCustomerEngagement(branchId, data.uniqueCustomers, serviceBreakdown);
  }
  
  /**
   * Calculate average response time
   */
  private async calculateAvgResponseTime(
    branchId: string,
    startOfDay: Date,
    endOfDay: Date
  ): Promise<number> {
    const applications = await Application.find({
      branchId,
      createdAt: { $gte: startOfDay, $lte: endOfDay },
      isDeleted: false
    }).populate('serviceReference');
    
    if (!applications.length) return 0;
    
    const totalExpectedTime = applications.reduce((sum, app: any) => {
      return sum + (app.serviceReference?.expectedResponseTime || 0);
    }, 0);
    
    return Math.round(totalExpectedTime / applications.length);
  }
  
  /**
   * Analyze repeat vs new customers
   */
  private async analyzeCustomerTypes(
    branchId: string,
    customers: string[],
    currentDate: Date
  ): Promise<{ repeatCustomers: number; newCustomers: number }> {
    
    let repeatCustomers = 0;
    let newCustomers = 0;
    
    for (const accountNumber of customers) {
      const previousVisit = await Application.findOne({
        branchId,
        accountNumber,
        createdAt: { $lt: currentDate },
        isDeleted: false
      });
      
      if (previousVisit) {
        repeatCustomers++;
      } else {
        newCustomers++;
      }
    }
    
    return { repeatCustomers, newCustomers };
  }
  
  /**
   * Update branch performance metrics
   */
  private async updateBranchPerformance(
    branchId: string,
    branchName?: string,
    district?: string
  ): Promise<void> {
    
    const allTimeStats = await Application.aggregate([
      {
        $match: { branchId, isDeleted: false }
      },
      {
        $group: {
          _id: null,
          totalQueues: { $sum: 1 },
          uniqueCustomers: { $addToSet: '$accountNumber' },
          firstQueue: { $min: '$createdAt' },
          lastQueue: { $max: '$createdAt' }
        }
      }
    ]);
    
    if (!allTimeStats.length) return;
    
    const data = allTimeStats[0];
    
    await BranchPerformance.findOneAndUpdate(
      { branchId },
      {
        branchId,
        branchName: branchName || branchId,
        district: district || "Unknown",
        isActivated: true,
        firstQueueDate: data.firstQueue,
        lastQueueDate: data.lastQueue,
        totalQueueNumbers: data.totalQueues,
        totalUniqueCustomers: data.uniqueCustomers.length,
        performanceScore: this.calculatePerformanceScore(
          data.totalQueues,
          data.uniqueCustomers.length
        )
      },
      { upsert: true, new: true }
    );
  }
  
  /**
   * Calculate performance score
   */
  private calculatePerformanceScore(totalQueues: number, uniqueCustomers: number): number {
    // Weighted score: 60% queue volume, 40% customer diversity
    const queueScore = Math.min(totalQueues / 1000, 1) * 60;
    const customerScore = Math.min(uniqueCustomers / 500, 1) * 40;
    return Math.round(queueScore + customerScore);
  }
  
  /**
   * Update customer engagement metrics
   */
  private async updateCustomerEngagement(
    branchId: string,
    customers: string[],
    serviceBreakdown: any[]
  ): Promise<void> {
    
    for (const accountNumber of customers) {
      const visits = await Application.find({
        branchId,
        accountNumber,
        isDeleted: false
      }).sort({ createdAt: 1 });
      
      if (!visits.length) continue;
      
      // Find most used service
      const serviceUsage = new Map<string, number>();
      visits.forEach(visit => {
        const serviceId = visit.serviceReference?.toString();
        if (serviceId) {
          serviceUsage.set(serviceId, (serviceUsage.get(serviceId) || 0) + 1);
        }
      });
      
      let mostUsedService = null;
      let maxCount = 0;
      
      for (const [serviceId, count] of serviceUsage.entries()) {
        if (count > maxCount) {
          maxCount = count;
          const serviceInfo = serviceBreakdown.find(
            s => s.serviceId.toString() === serviceId
          );
          mostUsedService = {
            serviceId: serviceInfo?.serviceId,
            serviceName: serviceInfo?.serviceName,
            count
          };
        }
      }
      
      // Calculate engagement score
      const engagementScore = this.calculateEngagementScore(visits.length, visits);
      
      await CustomerEngagement.findOneAndUpdate(
        { accountNumber, branchId },
        {
          accountNumber,
          branchId,
          totalVisits: visits.length,
          firstVisitDate: visits[0].createdAt,
          lastVisitDate: visits[visits.length - 1].createdAt,
          mostUsedService,
          engagementScore,
          visitDates: visits.map(v => v.createdAt)
        },
        { upsert: true, new: true }
      );
    }
  }
  
  /**
   * Calculate customer engagement score (0-100)
   */
  private calculateEngagementScore(visitCount: number, visits: any[]): number {
    // Factors: visit frequency, recency, diversity
    const frequencyScore = Math.min(visitCount / 20, 1) * 50; // Max 50 points
    
    const daysSinceLastVisit = moment().diff(
      moment(visits[visits.length - 1].createdAt),
      'days'
    );
    const recencyScore = Math.max(0, 30 - daysSinceLastVisit) * (30 / 30); // Max 30 points
    
    const uniqueServices = new Set(visits.map(v => v.serviceReference?.toString())).size;
    const diversityScore = Math.min(uniqueServices / 5, 1) * 20; // Max 20 points
    
    return Math.round(frequencyScore + recencyScore + diversityScore);
  }
  
  /**
   * Aggregate weekly statistics
   */
  async aggregateWeeklyStats(weekStart?: string): Promise<void> {
    const targetWeekStart = weekStart || 
      moment().tz("Africa/Addis_Ababa").subtract(1, 'week').startOf('isoWeek').format("YYYY-MM-DD");
    
    const weekEnd = moment(targetWeekStart).endOf('isoWeek').format("YYYY-MM-DD");
    
    console.log(`Aggregating weekly stats from ${targetWeekStart} to ${weekEnd}`);
    
    const branches = await DailyStats.distinct('branchId', {
      date: { $gte: targetWeekStart, $lte: weekEnd }
    });
    
    for (const branchId of branches) {
      const dailyRecords = await DailyStats.find({
        branchId,
        date: { $gte: targetWeekStart, $lte: weekEnd }
      });
      
      if (!dailyRecords.length) continue;
      
      const totalQueueNumbers = dailyRecords.reduce((sum, d) => sum + d.totalQueueNumbers, 0);
      const uniqueCustomersSet = new Set<string>();
      const serviceMap = new Map<string, { serviceName: string; count: number }>();
      
      dailyRecords.forEach(day => {
        day.uniqueCustomers.forEach(c => uniqueCustomersSet.add(c));
        day.serviceBreakdown.forEach(s => {
          const key = s.serviceId.toString();
          if (serviceMap.has(key)) {
            serviceMap.get(key)!.count += s.count;
          } else {
            serviceMap.set(key, { serviceName: s.serviceName, count: s.count });
          }
        });
      });
      
      const topServices = Array.from(serviceMap.entries())
        .map(([serviceId, data]) => ({
          serviceId: serviceId as any,
          serviceName: data.serviceName,
          count: data.count
        }))
        .sort((a, b) => b.count - a.count)
        .slice(0, 10);
      
      const avgResponseTime = dailyRecords.reduce((sum, d) => sum + d.avgResponseTime, 0) / dailyRecords.length;
      
      await WeeklyStats.findOneAndUpdate(
        { weekStart: targetWeekStart, branchId },
        {
          weekStart: targetWeekStart,
          weekEnd,
          branchId,
          district: dailyRecords[0].district,
          totalQueueNumbers,
          uniqueCustomerCount: uniqueCustomersSet.size,
          avgResponseTime: Math.round(avgResponseTime),
          topServices
        },
        { upsert: true, new: true }
      );
    }
  }
  
  /**
   * Aggregate monthly statistics
   */
  async aggregateMonthlyStats(month?: string): Promise<void> {
    const targetMonth = month || 
      moment().tz("Africa/Addis_Ababa").subtract(1, 'month').format("YYYY-MM");
    
    console.log(`Aggregating monthly stats for ${targetMonth}`);
    
    const monthStart = `${targetMonth}-01`;
    const monthEnd = moment(monthStart).endOf('month').format("YYYY-MM-DD");
    
    const branches = await DailyStats.distinct('branchId', {
      date: { $gte: monthStart, $lte: monthEnd }
    });
    
    for (const branchId of branches) {
      const dailyRecords = await DailyStats.find({
        branchId,
        date: { $gte: monthStart, $lte: monthEnd }
      });
      
      if (!dailyRecords.length) continue;
      
      const totalQueueNumbers = dailyRecords.reduce((sum, d) => sum + d.totalQueueNumbers, 0);
      const uniqueCustomersSet = new Set<string>();
      const serviceMap = new Map<string, { serviceName: string; count: number }>();
      
      dailyRecords.forEach(day => {
        day.uniqueCustomers.forEach(c => uniqueCustomersSet.add(c));
        day.serviceBreakdown.forEach(s => {
          const key = s.serviceId.toString();
          if (serviceMap.has(key)) {
            serviceMap.get(key)!.count += s.count;
          } else {
            serviceMap.set(key, { serviceName: s.serviceName, count: s.count });
          }
        });
      });
      
      const topServices = Array.from(serviceMap.entries())
        .map(([serviceId, data]) => ({
          serviceId: serviceId as any,
          serviceName: data.serviceName,
          count: data.count
        }))
        .sort((a, b) => b.count - a.count)
        .slice(0, 10);
      
      const avgResponseTime = dailyRecords.reduce((sum, d) => sum + d.avgResponseTime, 0) / dailyRecords.length;
      
      await MonthlyStats.findOneAndUpdate(
        { month: targetMonth, branchId },
        {
          month: targetMonth,
          branchId,
          district: dailyRecords[0].district,
          totalQueueNumbers,
          uniqueCustomerCount: uniqueCustomersSet.size,
          avgResponseTime: Math.round(avgResponseTime),
          topServices
        },
        { upsert: true, new: true }
      );
    }
  }
  
  /**
   * Update branch performance rankings
   */
  async updateBranchRankings(): Promise<void> {
    const branches = await BranchPerformance.find({ isActivated: true })
      .sort({ performanceScore: -1 });
    
    for (let i = 0; i < branches.length; i++) {
      branches[i].performanceRank = i + 1;
      await branches[i].save();
    }
    
    console.log(`Updated rankings for ${branches.length} branches`);
  }
}

export const statisticsAggregationService = new StatisticsAggregationService();