import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdminOrAbove, getSessionRole, isSuperAdmin } from "@/lib/permissions";

/**
 * GET /api/admin/reviews
 * Returns all reviews.
 * - SUPER_ADMIN: sees raw + moderated text side-by-side (for AI tuning)
 * - ADMIN: sees only the AI-moderated output (no raw student input)
 * Student identity is NEVER stored — zero privacy risk by design.
 */
export async function GET() {
  if (!(await requireAdminOrAbove())) return NextResponse.json({ error: "Unauthorized" }, { status: 403 });

  const callerRole = await getSessionRole();
  const showRaw = isSuperAdmin(callerRole || "");

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
        // Only SUPER_ADMIN can see raw content for AI comparison
        rawContent: showRaw ? r.rawContent : null,
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
