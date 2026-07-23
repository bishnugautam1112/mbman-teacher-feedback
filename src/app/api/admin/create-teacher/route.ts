import { NextResponse } from "next/server";
import { prisma } from "@/backend/db/prisma";
import { requireSuperAdmin } from "@/backend/services/permissions";
import bcrypt from "bcryptjs";

export async function POST(req: Request) {
  try {
    if (!(await requireSuperAdmin())) {
      return NextResponse.json({ error: "Only Super Admin can create teachers" }, { status: 403 });
    }

    const { email, name, temporaryPassword } = await req.json();

    if (!email || !name || !temporaryPassword) {
      return NextResponse.json({ error: "Email, Name, and Temporary Password are required" }, { status: 400 });
    }

    // Check if user already exists
    const existingUser = await prisma.user.findUnique({ where: { email } });
    if (existingUser) {
      return NextResponse.json({ error: "User with this email already exists" }, { status: 400 });
    }

    const hashedPassword = await bcrypt.hash(temporaryPassword, 10);

    const newTeacher = await prisma.user.create({
      data: {
        email,
        name,
        password: hashedPassword,
        role: "TEACHER",
        isVerified: true, // Teachers are manually created by admin, inherently verified
        forcePasswordChange: true // Force them to change it on first login
      }
    });

    return NextResponse.json({ 
      success: true, 
      message: "Teacher account created successfully",
      teacher: { id: newTeacher.id, email: newTeacher.email, name: newTeacher.name }
    });

  } catch (error) {
    console.error("Create teacher error:", error);
    return NextResponse.json(
      { error: "An unexpected error occurred" },
      { status: 500 }
    );
  }
}
