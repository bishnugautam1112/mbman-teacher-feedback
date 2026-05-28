import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdminOrAbove } from "@/lib/permissions";

export async function GET() {
  if (!(await requireAdminOrAbove())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
  }

  try {
    const pendingKycs = await prisma.kycDocument.findMany({
      where: { status: "PENDING" },
      include: {
        user: {
          select: { name: true, email: true, department: true }
        }
      },
      orderBy: { submittedAt: "asc" }
    });
    return NextResponse.json(pendingKycs);
  } catch (error) {
    return NextResponse.json({ error: "Failed to fetch KYC documents" }, { status: 500 });
  }
}

export async function PUT(req: Request) {
  if (!(await requireAdminOrAbove())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
  }

  try {
    const { kycId, action } = await req.json(); // action: "APPROVE" | "REJECT"
    
    if (!kycId || !["APPROVE", "REJECT"].includes(action)) {
      return NextResponse.json({ error: "Invalid payload" }, { status: 400 });
    }

    const newStatus = action === "APPROVE" ? "APPROVED" : "REJECTED";

    // Update KYC document status
    const updatedKyc = await prisma.kycDocument.update({
      where: { id: kycId },
      data: { 
        status: newStatus,
        reviewedAt: new Date()
      },
      include: { user: true }
    });

    // If approved, update user's role and verified status
    if (newStatus === "APPROVED") {
      await prisma.user.update({
        where: { id: updatedKyc.userId },
        data: { isVerified: true }
      });
    }

    return NextResponse.json({ message: `KYC ${newStatus} successfully` });
  } catch (error) {
    return NextResponse.json({ error: "Failed to process KYC" }, { status: 500 });
  }
}
