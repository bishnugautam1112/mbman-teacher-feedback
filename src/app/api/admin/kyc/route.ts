import { NextResponse } from "next/server";
import { prisma } from "@/backend/db/prisma";
import { requireAdminOrAbove } from "@/backend/services/permissions";
import { emailQueue, getKycApprovedTemplate, getKycRejectedTemplate } from "@/backend/services/email";

export async function GET(req: Request) {
  if (!(await requireAdminOrAbove())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
  }

  try {
    const { searchParams } = new URL(req.url);
    const statusParam = searchParams.get("status");
    
    // Only fetch by status if it's PENDING, APPROVED, or REJECTED. Otherwise fetch all.
    const whereClause = ["PENDING", "APPROVED", "REJECTED"].includes(statusParam || "PENDING")
      ? { status: statusParam as any }
      : {}; // ALL

    const pendingKycs = await prisma.kycDocument.findMany({
      where: whereClause,
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

    // Send email notification to student based on decision
    if (updatedKyc.user?.email) {
      if (newStatus === "APPROVED") {
        emailQueue.sendNormalPriority(
          updatedKyc.user.email,
          "Your MBMAN KYC Verification is Approved",
          getKycApprovedTemplate(updatedKyc.user.name || "Student")
        );
      } else {
        emailQueue.sendNormalPriority(
          updatedKyc.user.email,
          "MBMAN KYC Document Update Required",
          getKycRejectedTemplate(
            updatedKyc.user.name || "Student",
            updatedKyc.rejectionReason || "Uploaded ID photo was blurry or invalid."
          )
        );
      }
    }

    return NextResponse.json({ message: `KYC ${newStatus} successfully` });
  } catch (error) {
    return NextResponse.json({ error: "Failed to process KYC" }, { status: 500 });
  }
}
