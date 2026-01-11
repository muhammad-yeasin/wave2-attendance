import { Schema, model, models, Types } from "mongoose";

const AttendanceSchema = new Schema(
  {
    userId: { type: Types.ObjectId, ref: "User", required: true },
    moduleNumber: { type: Number, required: true },
    milestoneNumber: { type: Number, required: true },
    studyHours: { type: Number, required: true },
    learningSummary: { type: String, required: true },
    attendanceDate: { type: String, required: true }, // YYYY-MM-DD (Asia/Dhaka)
    attendanceTime: { type: String, required: true }, // HH:mm:ss (Asia/Dhaka)
  },
  { timestamps: true }
);

AttendanceSchema.index({ userId: 1, attendanceDate: 1 }, { unique: true });

export type AttendanceDoc = {
  _id: string;
  userId: string;
  moduleNumber: number;
  milestoneNumber: number;
  studyHours: number;
  learningSummary: string;
  attendanceDate: string;
  attendanceTime: string;
};

export const Attendance =
  models.Attendance || model("Attendance", AttendanceSchema);
