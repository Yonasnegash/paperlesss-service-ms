// src/config/types/statistics.d.ts
import { Document, Types } from "mongoose";

// ==================== Analytics Aggregation Models ====================

export interface IDailyStats extends Document {
  date: string; // YYYY-MM-DD
  branchId: string;
  district: string;
  
  // Queue metrics
  totalQueueNumbers: number;
  bankInitiatedQueues: number;
  superAppInitiatedQueues: number;
  qrInitiatedQueues: number;
  
  // Customer metrics
  uniqueCustomers: string[]; // Array of account numbers
  uniqueCustomerCount: number;
  
  // Service breakdown
  serviceBreakdown: {
    serviceId: Types.ObjectId;
    serviceName: string;
    categoryId: Types.ObjectId;
    categoryName: string;
    count: number;
  }[];
  
  // Response time metrics
  totalResponseTime: number; // in minutes
  avgResponseTime: number;
  
  // Engagement metrics
  repeatCustomers: number;
  newCustomers: number;
  
  createdAt: Date;
  updatedAt: Date;
}

export interface IWeeklyStats extends Document {
  weekStart: string; // YYYY-MM-DD (Monday)
  weekEnd: string;
  branchId: string;
  district: string;
  
  totalQueueNumbers: number;
  uniqueCustomerCount: number;
  avgResponseTime: number;
  
  topServices: {
    serviceId: Types.ObjectId;
    serviceName: string;
    count: number;
  }[];
  
  createdAt: Date;
  updatedAt: Date;
}

export interface IMonthlyStats extends Document {
  month: string; // YYYY-MM
  branchId: string;
  district: string;
  
  totalQueueNumbers: number;
  uniqueCustomerCount: number;
  avgResponseTime: number;
  
  topServices: {
    serviceId: Types.ObjectId;
    serviceName: string;
    count: number;
  }[];
  
  createdAt: Date;
  updatedAt: Date;
}

// ==================== Branch Performance Model ====================

export interface IBranchPerformance extends Document {
  branchId: string;
  branchName: string;
  district: string;
  
  // Activation status
  isActivated: boolean;
  firstQueueDate: Date | null;
  lastQueueDate: Date | null;
  
  // Cumulative metrics
  totalQueueNumbers: number;
  totalUniqueCustomers: number;
  
  // Performance rank (updated periodically)
  performanceRank: number;
  performanceScore: number;
  
  createdAt: Date;
  updatedAt: Date;
}

// ==================== Customer Engagement Model ====================

export interface ICustomerEngagement extends Document {
  accountNumber: string;
  branchId: string;
  
  // Visit metrics
  totalVisits: number;
  firstVisitDate: Date;
  lastVisitDate: Date;
  
  // Service usage
  mostUsedService: {
    serviceId: Types.ObjectId;
    serviceName: string;
    count: number;
  };
  
  // Engagement score (0-100)
  engagementScore: number;
  
  // Visit frequency
  visitDates: Date[];
  
  createdAt: Date;
  updatedAt: Date;
}

// ==================== Query Types ====================

export interface IStatsQuery {
  timeRange?: 'daily' | 'weekly' | '1month' | '3months' | '6months' | '1year';
  startDate?: string;
  endDate?: string;
  district?: string;
  branchId?: string;
}

// ==================== Response Types ====================

export interface IGeneralStatsResponse {
  totalPaperlessActivatedBranches: number;
  totalCustomers: number;
  totalServices: number;
  bestPerformingBranch: {
    branchId: string;
    branchName: string;
    totalQueueNumbers: number;
    totalCustomers: number;
  };
}
export interface ITransactionsStatResponse {
  totalTransactionsOverTime: {
    date: string;
    count: number;
  }[];
}

export interface IMostUsedServicesResponse {
  mostUsedServices: {
      serviceId: string;
      serviceName: string;
      count: number;
      percentage: number;
  }[];
}

export interface IBestPerformingBranch {
  bestPerformingBranch: {
      branchId: string;
      branchName: string;
      totalQueueNumbers: number;
      totalCustomers: number;
  };
}

export interface ICustomerEngagementScore {
  customerEngagementScore: number
}

export interface IBestPerformingBranches {
  bestPerformingBranches: {
    branchId: string;
    branchName: string;
    totalQueueNumbers: number;
    totalCustomers: number;
    rank: number;
  }[];
}

export interface IBranchInsightsResponse {
  totalRegisteredBranches: number;
  totalPaperlessEnabledBranches: number;
  totalNonPaperlessBranches: number;
  bestPerformingBranch: {
    branchId: string;
    branchName: string;
    totalQueueNumbers: number;
    totalCustomers: number;
  };
  customerSatisfactionScore: number;
}

export interface IBranchDetailResponse {
  branchId: string;
  branchName: string;
  totalQueueNumbers: number;
  bankInitiatedQueues: number;
  superAppInitiatedQueues: number;
  qrInitiatedQueues: number;
  avgResponseTime: number;
  mostServedService: {
    serviceId: string;
    serviceName: string;
    count: number;
  };
}

export interface ICustomerStatsResponse {
  totalCustomers: number;
  mostUsedService: {
    serviceId: string;
    serviceName: string;
    count: number;
  };
  customerSatisfactionScore: number;
}