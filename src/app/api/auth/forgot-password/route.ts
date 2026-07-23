import { NextResponse } from "next/server";
import { prisma } from "@/backend/db/prisma";
import nodemailer from "nodemailer";
import { rateLimit } from "@/backend/services/rate-limit";

export async function POST(req: Request) {
  try {
    const { email } = await req.json();

    if (!email) {
      return NextResponse.json({ error: "Email is required" }, { status: 400 });
    }

    // Rate Limit: Max 3 OTP requests per 15 minutes per email
    const isAllowed = rateLimit(`forgot_pw_${email}`, 3, 15 * 60 * 1000);
    if (!isAllowed) {
      return NextResponse.json({ error: "Too many requests. Please try again later." }, { status: 429 });
    }

    const user = await prisma.user.findUnique({
      where: { email },
    });

    if (!user) {
      // Explicit error as requested for better UX
      return NextResponse.json({ error: "Account does not exist" }, { status: 404 });
    }

    // Generate a 6 digit OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const expires = new Date(Date.now() + 3 * 60 * 1000); // 3 minutes

    // Delete existing reset tokens for this email
    await prisma.resetToken.deleteMany({
      where: { identifier: email }
    });

    // Store in ResetToken
    await prisma.resetToken.create({
      data: {
        identifier: email,
        token: otp,
        expires: expires
      }
    });

    // Send email
    if (process.env.EMAIL_USER && process.env.EMAIL_APP_PASSWORD) {
      const transporter = nodemailer.createTransport({
        service: "gmail",
        auth: {
          user: process.env.EMAIL_USER,
          pass: process.env.EMAIL_APP_PASSWORD,
        },
      });

      await transporter.sendMail({
        from: `"MBMAN Feedback" <${process.env.EMAIL_USER}>`,
        to: email,
        subject: "Password Reset OTP",
        html: `<p>Your password reset OTP is: <strong>${otp}</strong></p><p>This code will expire in 10 minutes.</p>`,
      });
    } else {
      console.log(`[DEV MODE] Password Reset OTP for ${email}: ${otp}`);
    }

    return NextResponse.json({ message: "An OTP has been sent to your email." });
  } catch (error) {
    console.error("Forgot password error:", error);
    return NextResponse.json({ error: "Something went wrong" }, { status: 500 });
  }
}
