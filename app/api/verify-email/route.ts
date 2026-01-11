import { NextResponse } from "next/server";
import { z } from "zod";
import { dbConnect } from "@/lib/db";
import { User } from "@/models/user";

const bodySchema = z.object({
  email: z.string().email({ message: "সঠিক ইমেইল দিন" }).trim().toLowerCase(),
});

export async function POST(req: Request) {
  try {
    const json = await req.json();
    const parse = bodySchema.safeParse(json);
    if (!parse.success) {
      return NextResponse.json(
        { error: "ইমেইল সঠিক নয়। অনুগ্রহ করে আবার চেষ্টা করুন।" },
        { status: 400 }
      );
    }

    await dbConnect();
    const user = await User.findOne({ email: parse.data.email }).lean();
    if (!user) {
      return NextResponse.json(
        {
          error:
            "এই ইমেইলটি আমাদের ডাটাবেজে নেই। অ্যাডমিনের সাথে যোগাযোগ করুন WhatsApp গ্রুপে।",
        },
        { status: 404 }
      );
    }

    return NextResponse.json({
      user: {
        id: String(user._id),
        name: user.name,
        email: user.email,
        hasWhatsapp: !!user.whatsappNumber,
        whatsappNumber: user.whatsappNumber ?? null,
      },
      message: "ইমেইল যাচাই সম্পন্ন হয়েছে।",
    });
  } catch (e) {
    return NextResponse.json(
      { error: "সার্ভারে সমস্যা হয়েছে। কিছুক্ষণ পর আবার চেষ্টা করুন।" },
      { status: 500 }
    );
  }
}
