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

/**
 * GET /api/admin/reviews
 * Returns all reviews with raw + moderated text side-by-side.
 * Teacher name is manually joined via teacherId.
 * Student identity is NEVER stored — zero privacy risk by design.
 */
export async function GET() {
  if (!(await requireAdmin())) return NextResponse.json({ error: "Unauthorized" }, { status: 403 });

  try {
    // Review has no Prisma relation to User, so we join manually
    const reviews = await prisma.review.findMany({
      orderBy: { createdAt: "desc" },
    });

    // Fetch all teacher IDs referenced in reviews
    const teacherIds = [...new Set(reviews.map((r) => r.teacherId))];
    const teachers = await prisma.user.findMany({
      where: { id: { in: teacherIds } },
      select: { id: true, name: true, department: true },
    });

    const teacherMap = new Map(teachers.map((t) => [t.id, t]));

    const formatted = reviews.map((r) => {
      const teacher = teacherMap.get(r.teacherId);
      return {
        id: r.id,
        rating: r.rating,
        rawContent: r.rawContent,
        moderatedText: r.moderatedText,
        teacherName: teacher?.name || "Unknown",
        teacherDepartment: teacher?.department || "N/A",
        studentBatchYear: r.studentBatchYear,
        createdAt: r.createdAt,
      };
    });

    return NextResponse.json(formatted);
  } catch (error) {
    console.error("Admin reviews fetch error:", error);
    return NextResponse.json({ error: "Failed to fetch reviews" }, { status: 500 });
  }
}
