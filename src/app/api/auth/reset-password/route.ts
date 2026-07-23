import { NextResponse } from "next/server";
import { prisma } from "@/backend/db/prisma";
import bcrypt from "bcryptjs";
import { rateLimit } from "@/backend/services/rate-limit";

export async function POST(req: Request) {
  try {
    const { email, otp, newPassword } = await req.json();

    if (!email || !otp || !newPassword) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    // Rate Limit: Max 5 invalid OTP/Reset attempts per 15 mins
    const isAllowed = rateLimit(`reset_pw_${email}`, 5, 15 * 60 * 1000);
    if (!isAllowed) {
      return NextResponse.json({ error: "Too many attempts. Please try again later." }, { status: 429 });
    }

    // Verify OTP
    const resetToken = await prisma.resetToken.findUnique({
      where: { token: otp },
    });

    if (!resetToken || resetToken.identifier !== email) {
      return NextResponse.json({ error: "Invalid OTP" }, { status: 400 });
    }

    if (new Date() > resetToken.expires) {
      // Clean up expired token
      await prisma.resetToken.delete({ where: { token: otp } });
      return NextResponse.json({ error: "OTP has expired" }, { status: 400 });
    }

    // Hash new password
    const hashedPassword = await bcrypt.hash(newPassword, 12);

    // Update user password
    await prisma.user.update({
      where: { email },
      data: { password: hashedPassword },
    });

    // Delete used token
    await prisma.resetToken.delete({ where: { token: otp } });

    return NextResponse.json({ message: "Password reset successfully" });
  } catch (error) {
    console.error("Reset password error:", error);
    return NextResponse.json({ error: "Something went wrong" }, { status: 500 });
  }
}
