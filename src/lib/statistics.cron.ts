// src/lib/statistics.cron.ts
import cron from "node-cron";
import { statisticsAggregationService } from "../dal/statistics/aggregation.dal";

/**
 * Initialize all statistics cron jobs
 */
export const initializeStatisticsCron = () => {
  
  // Run daily aggregation every day at 1:00 AM
  cron.schedule("0 1 * * *", async () => {
    console.log("Starting daily statistics aggregation...");
    try {
      await statisticsAggregationService.aggregateDailyStats();
      console.log("Daily aggregation completed successfully");
    } catch (error) {
      console.error("Error in daily aggregation:", error);
    }
  }, {
    timezone: "Africa/Addis_Ababa"
  });
  
  // Run weekly aggregation every Monday at 2:00 AM
  cron.schedule("0 2 * * 1", async () => {
    console.log("Starting weekly statistics aggregation...");
    try {
      await statisticsAggregationService.aggregateWeeklyStats();
      console.log("Weekly aggregation completed successfully");
    } catch (error) {
      console.error("Error in weekly aggregation:", error);
    }
  }, {
    timezone: "Africa/Addis_Ababa"
  });
  
  // Run monthly aggregation on the 1st of each month at 3:00 AM
  cron.schedule("0 3 1 * *", async () => {
    console.log("Starting monthly statistics aggregation...");
    try {
      await statisticsAggregationService.aggregateMonthlyStats();
      console.log("Monthly aggregation completed successfully");
    } catch (error) {
      console.error("Error in monthly aggregation:", error);
    }
  }, {
    timezone: "Africa/Addis_Ababa"
  });
  
  // Update branch rankings every day at 4:00 AM
  cron.schedule("0 4 * * *", async () => {
    console.log("Starting branch rankings update...");
    try {
      await statisticsAggregationService.updateBranchRankings();
      console.log("Branch rankings updated successfully");
    } catch (error) {
      console.error("Error updating branch rankings:", error);
    }
  }, {
    timezone: "Africa/Addis_Ababa"
  });
  
  console.log("✅ Statistics cron jobs initialized");
};