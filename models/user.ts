import { Schema, model, models } from "mongoose";

const UserSchema = new Schema(
  {
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true, index: true },
    whatsappNumber: { type: String },
    currentModuleNumber: { type: Number },
    currentMilestoneNumber: { type: Number },
    lastAttendanceAt: { type: Date },
  },
  { timestamps: true }
);

export type UserDoc = {
  _id: string;
  name: string;
  email: string;
  whatsappNumber?: string;
  currentModuleNumber?: number;
  currentMilestoneNumber?: number;
  lastAttendanceAt?: Date;
};

export const User = models.User || model("User", UserSchema);
