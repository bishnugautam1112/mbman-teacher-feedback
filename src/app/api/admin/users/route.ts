import { NextResponse } from "next/server";
import { prisma } from "@/backend/db/prisma";
import { requireAdminOrAbove, getSessionRole, isSuperAdmin } from "@/backend/services/permissions";

// GET all users with KYC info
export async function GET() {
  if (!(await requireAdminOrAbove())) return NextResponse.json({ error: "Unauthorized" }, { status: 403 });

  try {
    const callerRole = await getSessionRole();
    const isSuper = isSuperAdmin(callerRole || "");

    const users = await prisma.user.findMany({
      where: isSuper ? undefined : {
        role: { not: "SUPER_ADMIN" }
      },
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
  if (!(await requireAdminOrAbove())) return NextResponse.json({ error: "Unauthorized" }, { status: 403 });

  try {
    const { id, name, email, department, batchYear, role } = await req.json();

    if (!id) {
      return NextResponse.json({ error: "User ID is required" }, { status: 400 });
    }

    // Prevent privilege escalation: only SUPER_ADMIN can assign ADMIN or SUPER_ADMIN roles
    const callerRole = await getSessionRole();
    const isSuper = isSuperAdmin(callerRole || "");
    
    if (role && (role === "ADMIN" || role === "SUPER_ADMIN") && !isSuper) {
      return NextResponse.json({ error: "Only Super Admin can assign admin roles" }, { status: 403 });
    }

    // Prevent regular ADMIN from modifying a SUPER_ADMIN
    if (!isSuper) {
      const targetUser = await prisma.user.findUnique({ where: { id } });
      if (targetUser?.role === "SUPER_ADMIN") {
        return NextResponse.json({ error: "You cannot modify a Super Admin" }, { status: 403 });
      }
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
