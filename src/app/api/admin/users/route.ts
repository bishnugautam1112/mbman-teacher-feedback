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

// GET all users with KYC info
export async function GET() {
  if (!(await requireAdmin())) return NextResponse.json({ error: "Unauthorized" }, { status: 403 });

  try {
    const users = await prisma.user.findMany({
      include: {
        kycDocument: {
          select: { status: true, documentUrl: true }
        }
      },
      orderBy: [
        { role: "asc" },
        { name: "asc" }
      ]
    });

    const sanitized = users.map((u) => ({
      id: u.id,
      name: u.name,
      email: u.email,
      role: u.role,
      department: u.department,
      batchYear: u.batchYear,
      image: u.image,
      isVerified: u.isVerified,
      forcePasswordChange: u.forcePasswordChange,
      kycStatus: u.kycDocument?.status || "NONE",
      createdAt: u.createdAt,
    }));

    return NextResponse.json(sanitized);
  } catch (error) {
    console.error("Admin users fetch error:", error);
    return NextResponse.json({ error: "Failed to fetch users" }, { status: 500 });
  }
}

// PUT — update user details
export async function PUT(req: Request) {
  if (!(await requireAdmin())) return NextResponse.json({ error: "Unauthorized" }, { status: 403 });

  try {
    const { id, name, email, department, batchYear, role } = await req.json();

    if (!id) {
      return NextResponse.json({ error: "User ID is required" }, { status: 400 });
    }

    const updateData: any = {};
    if (name !== undefined) updateData.name = name;
    if (email !== undefined) updateData.email = email;
    if (department !== undefined) updateData.department = department;
    if (batchYear !== undefined) updateData.batchYear = batchYear ? parseInt(batchYear) : null;
    if (role !== undefined) updateData.role = role;

    const updated = await prisma.user.update({
      where: { id },
      data: updateData,
    });

    return NextResponse.json({ message: "User updated successfully", user: updated });
  } catch (error) {
    console.error("Admin user update error:", error);
    return NextResponse.json({ error: "Failed to update user" }, { status: 500 });
  }
}
