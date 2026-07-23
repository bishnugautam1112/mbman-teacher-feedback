import { NextResponse } from "next/server";
import { prisma } from "@/backend/db/prisma";
import bcrypt from "bcryptjs";

export async function POST(req: Request) {
  try {
    const { email, password, name, otp } = await req.json();

    if (!email || !password || !name || !otp) {
      return NextResponse.json({ error: "All fields are required" }, { status: 400 });
    }

    // Verify OTP
    const tokenRecord = await prisma.verificationToken.findFirst({
      where: { identifier: email, token: otp }
    });

    if (!tokenRecord) {
      return NextResponse.json({ error: "Invalid OTP" }, { status: 400 });
    }

    if (tokenRecord.expires < new Date()) {
      await prisma.verificationToken.delete({
        where: { identifier_token: { identifier: email, token: otp } }
      });
      return NextResponse.json({ error: "OTP has expired" }, { status: 400 });
    }

    // Consume OTP
    await prisma.verificationToken.delete({
      where: { identifier_token: { identifier: email, token: otp } }
    });

    // Check if user already exists
    const existingUser = await prisma.user.findUnique({ where: { email } });
    if (existingUser) {
      return NextResponse.json({ error: "Email already registered" }, { status: 400 });
    }

    // Hash password and create user
    const hashedPassword = await bcrypt.hash(password, 10);
    
    const newUser = await prisma.user.create({
      data: {
        email,
        name,
        password: hashedPassword,
        role: "STUDENT",
      }
    });

    return NextResponse.json({ message: "Registration successful" });
  } catch (error) {
    console.error("Registration error:", error);
    return NextResponse.json({ error: "Failed to register" }, { status: 500 });
  }
}
