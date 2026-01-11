import { NextResponse } from "next/server";
import { z } from "zod";
import { dbConnect } from "@/lib/db";
import { User } from "@/models/user";

const bodySchema = z.object({
  userId: z.string().min(1, { message: "ব্যবহারকারী সনাক্ত করা যায়নি" }),
  whatsappNumber: z.string().regex(/^01\d{9}$/, {
    message: "১১ সংখ্যার বাংলা মোবাইল নম্বর দিন, যা 01 দিয়ে শুরু",
  }),
});

export async function POST(req: Request) {
  try {
    const json = await req.json();
    const parse = bodySchema.safeParse(json);
    if (!parse.success) {
      return NextResponse.json(
        { error: "ওয়াটসঅ্যাপ নম্বরটি সঠিক নয়।" },
        { status: 400 }
      );
    }
    await dbConnect();
    const updated = await User.findByIdAndUpdate(
      parse.data.userId,
      { whatsappNumber: parse.data.whatsappNumber },
      { new: true }
    ).lean();
    if (!updated) {
      return NextResponse.json(
        { error: "ব্যবহারকারী পাওয়া যায়নি।" },
        { status: 404 }
      );
    }
    return NextResponse.json({
      message: "ওয়াটসঅ্যাপ নম্বর সংরক্ষণ করা হয়েছে।",
    });
  } catch (e) {
    return NextResponse.json(
      { error: "সার্ভারে সমস্যা হয়েছে। কিছুক্ষণ পর আবার চেষ্টা করুন।" },
      { status: 500 }
    );
  }
}
