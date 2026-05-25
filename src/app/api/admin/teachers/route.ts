import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

async function requireAdmin() {
  const session = await getServerSession(authOptions);
  if (!session?.user || (session.user as any).role !== "ADMIN") {
    return false;
  }
  return true;
}

// Get all teachers
export async function GET() {
  if (!(await requireAdmin())) return NextResponse.json({ error: "Unauthorized" }, { status: 403 });

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

// Create a new teacher
export async function POST(req: Request) {
  if (!(await requireAdmin())) return NextResponse.json({ error: "Unauthorized" }, { status: 403 });

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

// Delete a teacher
export async function DELETE(req: Request) {
  if (!(await requireAdmin())) return NextResponse.json({ error: "Unauthorized" }, { status: 403 });

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
