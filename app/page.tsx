"use client";

import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

type VerifiedUser = {
  id: string;
  name: string;
  email: string;
  hasWhatsapp: boolean;
  whatsappNumber?: string | null;
};

const emailSchema = z.object({
  email: z
    .string()
    .email({ message: "সঠিক ইমেইল দিন" })
    .min(1, { message: "ইমেইল দিন" }),
});

const whatsappSchema = z.object({
  whatsappNumber: z
    .string()
    .min(1, { message: "ওয়াটসঅ্যাপ নম্বর দিন" })
    .regex(/^\+?[0-9]{7,15}$/, {
      message: "সঠিক ওয়াটসঅ্যাপ নম্বর দিন (৭-১৫ সংখ্যা, + চিহ্ন ঐচ্ছিক)",
    }),
});

const attendanceSchema = z.object({
  moduleNumber: z.string().min(1, { message: "মডিউল নম্বর দিন" }),
  milestoneNumber: z.string().min(1, { message: "মাইলস্টোন নম্বর দিন" }),
  studyHours: z.string().min(1, { message: "ঘণ্টার সংখ্যা দিন" }),
  learningSummary: z.string().min(5, { message: "আজ কী শিখেছেন লিখুন" }),
});

export default function Home() {
  const [allowed, setAllowed] = useState<boolean | null>(null);
  const [windowMsg, setWindowMsg] = useState<string>("");
  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [user, setUser] = useState<VerifiedUser | null>(null);
  const [serverError, setServerError] = useState<string>("");
  const [successMsg, setSuccessMsg] = useState<string>("");

  useEffect(() => {
    (async () => {
      try {
        const res = await fetch("/api/attendance/window");
        const data = await res.json();
        setAllowed(data.allowed);
        setWindowMsg(data.message);
      } catch {
        setAllowed(false);
        setWindowMsg("সার্ভারে সমস্যা হয়েছে। পরে চেষ্টা করুন।");
      }
    })();
  }, []);

  const emailForm = useForm<z.infer<typeof emailSchema>>({
    resolver: zodResolver(emailSchema),
    defaultValues: { email: "" },
  });
  const whatsappForm = useForm<z.infer<typeof whatsappSchema>>({
    resolver: zodResolver(whatsappSchema),
    defaultValues: { whatsappNumber: "" },
  });
  const attendanceForm = useForm<z.infer<typeof attendanceSchema>>({
    resolver: zodResolver(attendanceSchema),
    defaultValues: {
      moduleNumber: "",
      milestoneNumber: "",
      studyHours: "",
      learningSummary: "",
    },
  });

  async function handleVerifyEmail(values: z.infer<typeof emailSchema>) {
    setServerError("");
    setSuccessMsg("");
    try {
      const res = await fetch("/api/verify-email", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(values),
      });
      const data = await res.json();
      if (!res.ok) {
        setServerError(data.error || "ইমেইল যাচাই করা যায়নি।");
        return;
      }
      setUser(data.user);
      if (data.user.hasWhatsapp) {
        setStep(3);
      } else {
        setStep(2);
      }
      setSuccessMsg("ইমেইল যাচাই সম্পন্ন");
    } catch {
      setServerError("সার্ভারে সমস্যা হয়েছে। পরে চেষ্টা করুন।");
    }
  }

  async function handleSaveWhatsapp(values: z.infer<typeof whatsappSchema>) {
    if (!user) return;
    setServerError("");
    setSuccessMsg("");
    try {
      const res = await fetch("/api/update-whatsapp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId: user.id, ...values }),
      });
      const data = await res.json();
      if (!res.ok) {
        setServerError(data.error || "নম্বর সংরক্ষণ করা যায়নি।");
        return;
      }
      setSuccessMsg("ওয়াটসঅ্যাপ নম্বর সংরক্ষণ হয়েছে।");
      setStep(3);
    } catch {
      setServerError("সার্ভারে সমস্যা হয়েছে। পরে চেষ্টা করুন।");
    }
  }

  async function handleSubmitAttendance(
    values: z.infer<typeof attendanceSchema>
  ) {
    if (!user) return;
    setServerError("");
    setSuccessMsg("");
    try {
      const payload = {
        userId: user.id,
        moduleNumber: Number(values.moduleNumber),
        milestoneNumber: Number(values.milestoneNumber),
        studyHours: Number(values.studyHours),
        learningSummary: values.learningSummary,
      };
      const res = await fetch("/api/attendance", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (!res.ok) {
        setServerError(data.error || "উপস্থিতি সংরক্ষণ করা যায়নি।");
        return;
      }
      setSuccessMsg("উপস্থিতি সংরক্ষণ সম্পন্ন হয়েছে। ধন্যবাদ!");
      attendanceForm.reset();
    } catch {
      setServerError("সার্ভারে সমস্যা হয়েছে। পরে চেষ্টা করুন।");
    }
  }

  return (
    <div className="min-h-dvh w-full flex items-center justify-center p-4">
      <div className="max-w-md w-full">
        <Card>
          <CardHeader>
            <CardTitle>উপস্থিতি ফর্ম</CardTitle>
            <CardDescription>
              রাত ৮টা থেকে ১২টা (বাংলাদেশ সময়) এর মধ্যে উপস্থিতি দিন
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {allowed === null ? (
              <div>লোড হচ্ছে...</div>
            ) : !allowed ? (
              <Alert className="border-yellow-300 bg-yellow-50">
                <AlertTitle>সময় নয়</AlertTitle>
                <AlertDescription>{windowMsg}</AlertDescription>
              </Alert>
            ) : (
              <div className="space-y-6">
                {serverError && (
                  <Alert className="border-destructive bg-destructive/10">
                    <AlertTitle>ত্রুটি</AlertTitle>
                    <AlertDescription>{serverError}</AlertDescription>
                  </Alert>
                )}
                {successMsg && (
                  <Alert className="border-green-300 bg-green-50">
                    <AlertTitle>সফল</AlertTitle>
                    <AlertDescription>{successMsg}</AlertDescription>
                  </Alert>
                )}

                {step === 1 && (
                  <form
                    className="space-y-3"
                    onSubmit={emailForm.handleSubmit(handleVerifyEmail)}
                  >
                    <div className="space-y-2">
                      <Label htmlFor="email">ইমেইল</Label>
                      <Input
                        id="email"
                        type="email"
                        placeholder="আপনার ইমেইল লিখুন"
                        {...emailForm.register("email")}
                      />
                      {emailForm.formState.errors.email && (
                        <p className="text-destructive text-sm">
                          {emailForm.formState.errors.email.message as string}
                        </p>
                      )}
                    </div>
                    <Button
                      type="submit"
                      className="w-full"
                      disabled={emailForm.formState.isSubmitting}
                    >
                      {emailForm.formState.isSubmitting
                        ? "যাচাই হচ্ছে..."
                        : "যাচাই করুন"}
                    </Button>
                  </form>
                )}

                {step === 2 && (
                  <form
                    className="space-y-3"
                    onSubmit={whatsappForm.handleSubmit(handleSaveWhatsapp)}
                  >
                    <div className="space-y-2">
                      <Label htmlFor="whatsappNumber">ওয়াটসঅ্যাপ নম্বর</Label>
                      <Input
                        id="whatsappNumber"
                        type="tel"
                        placeholder="01XXXXXXXXX"
                        {...whatsappForm.register("whatsappNumber")}
                      />
                      {whatsappForm.formState.errors.whatsappNumber && (
                        <p className="text-destructive text-sm">
                          {
                            whatsappForm.formState.errors.whatsappNumber
                              .message as string
                          }
                        </p>
                      )}
                    </div>
                    <div className="flex gap-2">
                      <Button
                        type="button"
                        variant="outline"
                        className="flex-1"
                        onClick={() => setStep(1)}
                      >
                        পেছনে যান
                      </Button>
                      <Button
                        type="submit"
                        className="flex-1"
                        disabled={whatsappForm.formState.isSubmitting}
                      >
                        {whatsappForm.formState.isSubmitting
                          ? "সংরক্ষণ হচ্ছে..."
                          : "সংরক্ষণ করুন"}
                      </Button>
                    </div>
                  </form>
                )}

                {step === 3 && (
                  <form
                    className="space-y-3"
                    onSubmit={attendanceForm.handleSubmit(
                      handleSubmitAttendance
                    )}
                  >
                    <div className="space-y-2">
                      <Label htmlFor="moduleNumber">মডিউল নম্বর</Label>
                      <Input
                        id="moduleNumber"
                        type="number"
                        placeholder="মডিউল"
                        {...attendanceForm.register("moduleNumber")}
                      />
                      {attendanceForm.formState.errors.moduleNumber && (
                        <p className="text-destructive text-sm">
                          {
                            attendanceForm.formState.errors.moduleNumber
                              .message as string
                          }
                        </p>
                      )}
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="milestoneNumber">মাইলস্টোন নম্বর</Label>
                      <Input
                        id="milestoneNumber"
                        type="number"
                        placeholder="মাইলস্টোন"
                        {...attendanceForm.register("milestoneNumber")}
                      />
                      {attendanceForm.formState.errors.milestoneNumber && (
                        <p className="text-destructive text-sm">
                          {
                            attendanceForm.formState.errors.milestoneNumber
                              .message as string
                          }
                        </p>
                      )}
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="studyHours">আজ পড়াশোনা (ঘণ্টা)</Label>
                      <Input
                        id="studyHours"
                        type="number"
                        step="0.5"
                        placeholder="যেমন: 2"
                        {...attendanceForm.register("studyHours")}
                      />
                      {attendanceForm.formState.errors.studyHours && (
                        <p className="text-destructive text-sm">
                          {
                            attendanceForm.formState.errors.studyHours
                              .message as string
                          }
                        </p>
                      )}
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="learningSummary">আজ কী শিখেছেন</Label>
                      <Textarea
                        id="learningSummary"
                        rows={4}
                        placeholder="সংক্ষেপে লিখুন"
                        {...attendanceForm.register("learningSummary")}
                      />
                      {attendanceForm.formState.errors.learningSummary && (
                        <p className="text-destructive text-sm">
                          {
                            attendanceForm.formState.errors.learningSummary
                              .message as string
                          }
                        </p>
                      )}
                    </div>
                    <Button
                      type="submit"
                      className="w-full"
                      disabled={attendanceForm.formState.isSubmitting}
                    >
                      {attendanceForm.formState.isSubmitting
                        ? "জমা হচ্ছে..."
                        : "জমা দিন"}
                    </Button>
                  </form>
                )}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
