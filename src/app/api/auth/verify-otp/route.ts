import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { rateLimit } from "@/lib/rate-limit";

export async function POST(req: Request) {
  try {
    const { email, otp } = await req.json();

    if (!email || !otp) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    // Rate Limit: Max 5 invalid OTP attempts per 15 mins
    const isAllowed = rateLimit(`verify_otp_${email}`, 5, 15 * 60 * 1000);
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

    // Extend expiration by 5 minutes for the password reset phase
    await prisma.resetToken.update({
      where: { token: otp },
      data: { expires: new Date(Date.now() + 5 * 60 * 1000) }
    });

    // If valid, return success, but DON'T delete the token yet (reset-password needs it)
    return NextResponse.json({ message: "OTP Verified" });
  } catch (error) {
    console.error("Verify OTP error:", error);
    return NextResponse.json({ error: "Something went wrong" }, { status: 500 });
  }
}
