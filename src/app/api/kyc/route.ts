import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/backend/auth/auth";
import { prisma } from "@/backend/db/prisma";
import { calculateBatchYear } from "@/backend/services/academic";

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session || !session.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { department, semester, fileUrl } = await req.json();

    if (!department || !semester) {
      return NextResponse.json({ error: "Department and Semester are required" }, { status: 400 });
    }

    // Server-side image validation
    if (!fileUrl || typeof fileUrl !== "string") {
      return NextResponse.json({ error: "ID card image is required" }, { status: 400 });
    }

    // Validate that it's a base64 image data URL
    const validImagePrefixes = ["data:image/jpeg", "data:image/png", "data:image/webp", "data:image/jpg"];
    const isValidImage = validImagePrefixes.some((prefix) => fileUrl.startsWith(prefix));

    if (!isValidImage) {
      return NextResponse.json(
        { error: "Only image files are accepted (JPG, PNG, WebP). Please upload a photo of your ID card." },
        { status: 400 }
      );
    }

    // Check base64 size (rough estimate: base64 is ~33% larger than raw)
    const estimatedSize = (fileUrl.length * 3) / 4;
    if (estimatedSize > 5 * 1024 * 1024) {
      return NextResponse.json({ error: "Image must be under 5MB" }, { status: 400 });
    }

    const user = session.user as any;
    
    // Calculate the student's batch year based on the semester they claim right now
    const batchYear = calculateBatchYear(Number(semester));

    // Update user with department and computed batchYear
    await prisma.user.update({
      where: { email: user.email },
      data: {
        department: department as any,
        batchYear: batchYear,
      }
    });

    // Upsert the KYC Document record (create if new, update if they are resubmitting after a rejection)
    await prisma.kycDocument.upsert({
      where: { userId: user.id },
      update: {
        documentUrl: fileUrl,
        status: "PENDING",
        rejectionReason: null, // Clear any previous rejection
      },
      create: {
        userId: user.id,
        documentUrl: fileUrl,
        status: "PENDING",
      }
    });

    return NextResponse.json({ success: true, message: "KYC Submitted" });
  } catch (error) {
    console.error("KYC Error:", error);
    return NextResponse.json(
      { error: "An unexpected error occurred" },
      { status: 500 }
    );
  }
}
