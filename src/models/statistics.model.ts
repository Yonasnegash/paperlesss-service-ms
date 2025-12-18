import { type PaginateModel } from "mongoose";
import moment from "moment-timezone";
import {
    IDailyStats,
    IWeeklyStats,
    IMonthlyStats,
    IBranchPerformance,
    ICustomerEngagement
} from "../config/types/statistics";
import modules from './imports/index'

const Schema = modules.mongoose.Schema;

// ===================== Daily Stats Model ===================
const DailyStatsSchema = new Schema<IDailyStats>(
    {
        date: { type: String, required: true },
        branchId: { type: String, required: true },
        district: { type: String, required: true },

        // Queue metrics
        totalQueueNumbers: { type: Number, default: 0 },
        bankInitiatedQueues: { type: Number, default: 0 },
        superAppInitiatedQueues: { type: Number, default: 0 },
        qrInitiatedQueues: { type: Number, default: 0 },

        // Customer metrics
        uniqueCustomers: [{ type: String }],
        uniqueCustomerCount: { type: Number, default: 0 },

        // Service breakdown
        serviceBreakdown: {
            serviceId: { type: Schema.Types.ObjectId, ref: 'Service' },
            serviceName: { type: String },
            categoryId: { type: Schema.Types.ObjectId, ref: 'ServiceCategory' },
            categoryName: { type: String },
            count: { type: Number, default: 0 }
        },

        // Response time metrics
        totalResponseTime: { type: Number, default: 0 },
        avgResponseTime: { type: Number, default: 0 },

        // Engagement metrics
        repeatCustomers: { type: Number, default: 0 },
        newCustomers: { type: Number, default: 0 }
    },
    { timestamps: true }
);

DailyStatsSchema.plugin(modules.paginator);

DailyStatsSchema.pre<IDailyStats>(
    "save",
    function (next) {
        const now = moment().tz("Africa/Addis_Ababa").format();
        this.set({ createdAt: now, updatedAt: now });
        next();
    }
);

DailyStatsSchema.pre<IDailyStats>(
    "findOneAndUpdate",
    function (next) {
        this.set({ updatedAt: moment().tz("Africa/Addis_Ababa").format() });
        next();
    }
);

const DailyStats = modules.mongoose.model<IDailyStats, PaginateModel<IDailyStats>>(
    "DailyStats",
    DailyStatsSchema
);

// ===================== Weekly Stats Model ===================
const WeeklyStatsSchema = new Schema<IWeeklyStats>(
    {
        weekStart: { type: String, required: true },
        weekEnd: { type: String, required: true },
        branchId: { type: String, required: true },
        district: { type: String, required: true },

        totalQueueNumbers: { type: Number, default: 0 },
        uniqueCustomerCount: { type: Number, default: 0 },
        avgResponseTime: { type: Number, default: 0 },

        topServices: [{
            serviceId: { type: Schema.Types.ObjectId, ref: 'Service' },
            serviceName: { type: String },
            count: { type: Number, default: 0 }
        }]
    },
    { timestamps: true }
);

WeeklyStatsSchema.plugin(modules.paginator);

WeeklyStatsSchema.pre<IWeeklyStats>(
    "save",
    function (next) {
        const now = moment().tz("Africa/Addis_Ababa").format();
        this.set({ createdAt: now, updatedAt: now });
        next();
    }
);

WeeklyStatsSchema.pre<IWeeklyStats>(
    "findOneAndUpdate",
    function (next) {
        this.set({ updatedAt: moment().tz("Africa/Addis_Ababa").format() });
        next();
    }
);

const WeeklyStats = modules.mongoose.model<IWeeklyStats, PaginateModel<IWeeklyStats>>(
    "WeeklyStats",
    WeeklyStatsSchema
);

// ===================== Monthly Stats Model ===================
const MonthlyStatsSchema = new Schema<IMonthlyStats>(
    {
        month: { type: String, required: true },
        branchId: { type: String, required: true },
        district: { type: String, required: true },

        totalQueueNumbers: { type: Number, default: 0 },
        uniqueCustomerCount: { type: Number, default: 0 },
        avgResponseTime: { type: Number, default: 0 },

        topServices: [{
            serviceId: { type: Schema.Types.ObjectId, ref: 'Service' },
            serviceName: { type: String },
            count: { type: Number, default: 0 }
        }]
    },
    { timestamps: true }
);

MonthlyStatsSchema.plugin(modules.paginator);

MonthlyStatsSchema.pre<IMonthlyStats>(
    "save",
    function (next) {
        const now = moment().tz("Africa/Addis_Ababa").format();
        this.set({ createdAt: now, updatedAt: now });
        next();
    }
);

MonthlyStatsSchema.pre<IMonthlyStats>(
    "findOneAndUpdate",
    function (next) {
        this.set({ updatedAt: moment().tz("Africa/Addis_Ababa").format() });
        next();
    }
);

const MonthlyStats = modules.mongoose.model<IMonthlyStats, PaginateModel<IMonthlyStats>>(
    "MonthlyStats",
    MonthlyStatsSchema
);

// ===================== Branch Performance Model ===================
const BranchPerformanceSchema = new Schema<IBranchPerformance>(
    {
        branchId: { type: String, required: true, unique: true },
        branchName: { type: String, required: true },
        district: { type: String, required: true },

        // Activation status
        isActivated: { type: Boolean, default: false },
        firstQueueDate: { type: Date },
        lastQueueDate: { type: Date },

        // Cumulative metrics
        totalQueueNumbers: { type: Number, default: 0 },
        totalUniqueCustomers: { type: Number, default: 0 },

        // Performance metrics
        performanceRank: { type: Number, default: 0 },
        performanceScore: { type: Number, default: 0 }
    },
    { timestamps: true }
);

BranchPerformanceSchema.plugin(modules.paginator);

BranchPerformanceSchema.pre<IBranchPerformance>(
    "save",
    function (next) {
        const now = moment().tz("Africa/Addis_Ababa").format();
        this.set({ createdAt: now, updatedAt: now });
        next();
    }
);

BranchPerformanceSchema.pre<IBranchPerformance>(
    "findOneAndUpdate",
    function (next) {
        this.set({ updatedAt: moment().tz("Africa/Addis_Ababa").format() });
        next();
    }
);

const BranchPerformance = modules.mongoose.model<IBranchPerformance, PaginateModel<IBranchPerformance>>(
    "BranchPerformance",
    BranchPerformanceSchema
);

// ===================== Customer Engagement Model ===================
const CustomerEngagementSchema = new Schema<ICustomerEngagement>(
    {
        accountNumber: { type: String, required: true },
        branchId: { type: String, required: true },

        // Visit metrics
        totalVisits: { type: Number, default: 0 },
        firstVisitDate: { type: Date, required: true },
        lastVisitDate: { type: Date, required: true },

        // Service usage
        mostUsedService: {
            serviceId: { type: Schema.Types.ObjectId, ref: 'Service' },
            serviceName: { type: String },
            count: { type: Number, default: 0 }
        },

        // Engagement score (0-100)
        engagementScore: { type: Number, default: 0, min: 0, max: 100 },

        // Visit frequency
        visitDates: [{ type: Date }]
    },
    { timestamps: true }
);

CustomerEngagementSchema.plugin(modules.paginator);

CustomerEngagementSchema.pre<ICustomerEngagement>(
    "save",
    function (next) {
        const now = moment().tz("Africa/Addis_Ababa").format();
        this.set({ createdAt: now, updatedAt: now });
        next();
    }
);

CustomerEngagementSchema.pre<ICustomerEngagement>(
    "findOneAndUpdate",
    function (next) {
        this.set({ updatedAt: moment().tz("Africa/Addis_Ababa").format() });
        next();
    }
);

// Compound index for unique customer-branch combination
CustomerEngagementSchema.index({ accountNumber: 1, branchId: 1 }, { unique: true });

const CustomerEngagement = modules.mongoose.model<ICustomerEngagement, PaginateModel<ICustomerEngagement>>(
    "CustomerEngagement",
    CustomerEngagementSchema
);

// Export all models
export {
    DailyStats,
    WeeklyStats,
    MonthlyStats,
    BranchPerformance,
    CustomerEngagement
};

export default {
    DailyStats,
    WeeklyStats,
    MonthlyStats,
    BranchPerformance,
    CustomerEngagement
};