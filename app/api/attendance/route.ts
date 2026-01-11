import { NextResponse } from "next/server";
import { z } from "zod";
import { dbConnect } from "@/lib/db";
import { Attendance } from "@/models/attendance";
import { User } from "@/models/user";
import { getBangladeshTimeParts, isAttendanceWindowOpen } from "@/lib/time";

const bodySchema = z.object({
  userId: z.string().min(1, { message: "ব্যবহারকারী সনাক্ত করা যায়নি" }),
  moduleNumber: z.number().int().min(1, { message: "মডিউল নম্বর দিন" }),
  milestoneNumber: z.number().int().min(1, { message: "মাইলস্টোন নম্বর দিন" }),
  studyHours: z
    .number()
    .min(0.5, { message: "আজ কত ঘণ্টা পড়েছেন তা দিন" })
    .max(24, { message: "ঘণ্টার সংখ্যা সঠিক নয়" }),
  learningSummary: z
    .string()
    .min(5, { message: "আজ কী শিখেছেন লিখুন" })
    .max(2000),
});

export async function POST(req: Request) {
  try {
    const json = await req.json();
    const parse = bodySchema.safeParse(json);
    if (!parse.success) {
      return NextResponse.json(
        { error: "ফর্মের তথ্য সঠিক নয়। অনুগ্রহ করে সব ঘর পূরণ করুন।" },
        { status: 400 }
      );
    }

    if (!isAttendanceWindowOpen()) {
      return NextResponse.json(
        {
          error:
            "এই সময়ে উপস্থিতি দেওয়া যাবে না। রাত ৮টা থেকে ১২টা (বাংলাদেশ সময়) এর মধ্যে চেষ্টা করুন।",
        },
        { status: 403 }
      );
    }

    await dbConnect();

    const user = await User.findById(parse.data.userId);
    if (!user) {
      return NextResponse.json(
        { error: "ব্যবহারকারী পাওয়া যায়নি।" },
        { status: 404 }
      );
    }

    const now = getBangladeshTimeParts();

    // Prevent duplicate attendance for the same date
    const existing = await Attendance.findOne({
      userId: user._id,
      attendanceDate: now.dateString,
    }).lean();
    if (existing) {
      return NextResponse.json(
        { error: "আপনি আজকের জন্য ইতিমধ্যেই উপস্থিতি দিয়েছেন।" },
        { status: 409 }
      );
    }

    const att = await Attendance.create({
      userId: user._id,
      moduleNumber: parse.data.moduleNumber,
      milestoneNumber: parse.data.milestoneNumber,
      studyHours: parse.data.studyHours,
      learningSummary: parse.data.learningSummary,
      attendanceDate: now.dateString,
      attendanceTime: now.timeString,
    });

    user.currentModuleNumber = parse.data.moduleNumber;
    user.currentMilestoneNumber = parse.data.milestoneNumber;
    user.lastAttendanceAt = new Date();
    await user.save();

    return NextResponse.json({
      message: "উপস্থিতি সংরক্ষণ সম্পন্ন হয়েছে। ধন্যবাদ!",
      attendanceId: String(att._id),
    });
  } catch (e) {
    return NextResponse.json(
      { error: "সার্ভারে সমস্যা হয়েছে। কিছুক্ষণ পর আবার চেষ্টা করুন।" },
      { status: 500 }
    );
  }
}
