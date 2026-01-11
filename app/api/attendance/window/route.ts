import { NextResponse } from "next/server";
import { getBangladeshTimeParts, isAttendanceWindowOpen } from "@/lib/time";

export async function GET() {
  const nowParts = getBangladeshTimeParts();
  const allowed = isAttendanceWindowOpen();
  return NextResponse.json({
    allowed,
    now: nowParts,
    message: allowed
      ? "উপস্থিতি দেওয়ার সময় চলছে। ফর্মটি পূরণ করুন।"
      : "এই মুহূর্তে উপস্থিতি দেওয়ার সময় নয়। অনুগ্রহ করে পড়াশোনা চালিয়ে যান এবং রাত ৮টা থেকে ১২টা (বাংলাদেশ সময়) এর মধ্যে উপস্থিতি দিন।",
  });
}
