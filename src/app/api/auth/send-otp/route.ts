import { NextResponse } from "next/server";
import { prisma } from "@/backend/db/prisma";
import { emailQueue, getOtpEmailTemplate } from "@/backend/services/email";

export async function POST(req: Request) {
  try {
    const { email } = await req.json();

    if (!email) {
      return NextResponse.json({ error: "Email is required" }, { status: 400 });
    }

    if (!email.endsWith("@gmail.com") && !email.endsWith("@mbman.edu.np")) {
      return NextResponse.json({ error: "Please use gmail or mbman.edu.np mail, other are not allowed." }, { status: 403 });
    }

    const existingUser = await prisma.user.findUnique({ where: { email } });
    if (existingUser) {
      return NextResponse.json({ error: "Email already registered. Please login instead." }, { status: 400 });
    }

    // Generate a 6-digit OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    
    // Store OTP in Database with 5 minute expiration (upsert to overwrite old ones)
    const expires = new Date(Date.now() + 5 * 60 * 1000);
    
    // Check if token exists to update, else create
    const existingToken = await prisma.verificationToken.findFirst({
      where: { identifier: email }
    });

    if (existingToken) {
      await prisma.verificationToken.update({
        where: { identifier_token: { identifier: email, token: existingToken.token } },
        data: { token: otp, expires }
      });
    } else {
      await prisma.verificationToken.create({
        data: { identifier: email, token: otp, expires }
      });
    }

    // High-priority immediate email dispatch
    const sent = await emailQueue.sendHighPriority(
      email,
      "MBMAN Verification OTP Code",
      getOtpEmailTemplate(otp)
    );

    if (!sent) {
      return NextResponse.json({ error: "Failed to send OTP email" }, { status: 500 });
    }

    return NextResponse.json({ message: "OTP sent successfully" });

  } catch (error) {
    console.error("Error sending OTP:", error);
    return NextResponse.json({ error: "Failed to send OTP" }, { status: 500 });
  }
}
