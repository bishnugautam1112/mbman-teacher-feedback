import { NextResponse } from "next/server";
import nodemailer from "nodemailer";

import { prisma } from "@/lib/prisma";

export async function POST(req: Request) {
  try {
    const { email } = await req.json();

    if (!email) {
      return NextResponse.json({ error: "Email is required" }, { status: 400 });
    }

    if (!email.endsWith("@gmail.com") && !email.endsWith("@mbman.edu.np")) {
      return NextResponse.json({ error: "Invalid domain" }, { status: 403 });
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

    // Configure Nodemailer (User needs to add their own App Password in .env)
    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.EMAIL_USER || "your-email@gmail.com",
        pass: process.env.EMAIL_APP_PASSWORD || "your-app-password",
      },
    });

    const mailOptions = {
      from: '"MBMAN Feedback System" <noreply@mbman.edu.np>',
      to: email,
      subject: "Your Login OTP Code",
      text: `Your OTP code is: ${otp}. It will expire in 5 minutes.`,
      html: `
        <div style="font-family: sans-serif; padding: 20px; text-align: center;">
          <h2>MBMAN Feedback Login</h2>
          <p>Your one-time password is:</p>
          <h1 style="color: #1A48D2; letter-spacing: 5px;">${otp}</h1>
          <p>This code will expire in 5 minutes. Do not share it with anyone.</p>
        </div>
      `,
    };

    // If no real credentials, log to console for development testing
    if (!process.env.EMAIL_APP_PASSWORD) {
      console.log(`[DEV MODE] Simulated OTP sent to ${email}: ${otp}`);
      return NextResponse.json({ message: "OTP sent (Dev Mode Console)" });
    }

    await transporter.sendMail(mailOptions);
    return NextResponse.json({ message: "OTP sent successfully" });

  } catch (error) {
    console.error("Error sending OTP:", error);
    return NextResponse.json({ error: "Failed to send OTP" }, { status: 500 });
  }
}
