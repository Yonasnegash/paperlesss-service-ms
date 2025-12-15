import mongoose, { Schema } from "mongoose";

const QueueCounterSchema = new Schema({
  branchId: { type: String, required: true },
  channelGroup: { type: String, required: true }, // 'Phone' or 'Bank/QR'
  date: { type: String, required: true }, // format: YYYY-MM-DD
  lastQueueNumber: { type: Number, default: 0 },
});

// Ensure uniqueness per branch, channel, and date
QueueCounterSchema.index({ branchId: 1, channelGroup: 1, date: 1 }, { unique: true });

export const QueueCounter = mongoose.model("QueueCounter", QueueCounterSchema);
