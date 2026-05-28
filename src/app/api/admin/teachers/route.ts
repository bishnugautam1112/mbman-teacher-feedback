import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdminOrAbove, requireSuperAdmin } from "@/lib/permissions";

// Get all teachers — both ADMIN and SUPER_ADMIN
export async function GET() {
  if (!(await requireAdminOrAbove())) return NextResponse.json({ error: "Unauthorized" }, { status: 403 });

  try {
    const teachers = await prisma.user.findMany({
      where: { role: "TEACHER" },
      orderBy: { name: "asc" }
    });
    return NextResponse.json(teachers);
  } catch (error) {
    return NextResponse.json({ error: "Failed to fetch teachers" }, { status: 500 });
  }
}

// Create a new teacher — SUPER_ADMIN only
export async function POST(req: Request) {
  if (!(await requireSuperAdmin())) return NextResponse.json({ error: "Only Super Admin can create teachers" }, { status: 403 });

  try {
    const { name, email, department, image } = await req.json();

    if (!name || !email || !department) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    const existingUser = await prisma.user.findUnique({ where: { email } });
    if (existingUser) {
      return NextResponse.json({ error: "Email already exists" }, { status: 400 });
    }

    const newTeacher = await prisma.user.create({
      data: {
        name,
        email,
        department,
        image,
        role: "TEACHER",
        isVerified: true, // Teachers are verified by default when created by admin
      }
    });

    return NextResponse.json({ message: "Teacher created successfully", teacher: newTeacher });
  } catch (error) {
    return NextResponse.json({ error: "Failed to create teacher" }, { status: 500 });
  }
}

// Delete a teacher — SUPER_ADMIN only
export async function DELETE(req: Request) {
  if (!(await requireSuperAdmin())) return NextResponse.json({ error: "Only Super Admin can delete teachers" }, { status: 403 });

  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");

    if (!id) return NextResponse.json({ error: "Missing Teacher ID" }, { status: 400 });

    await prisma.user.delete({ where: { id } });

    return NextResponse.json({ message: "Teacher deleted successfully" });
  } catch (error) {
    return NextResponse.json({ error: "Failed to delete teacher" }, { status: 500 });
  }
}
