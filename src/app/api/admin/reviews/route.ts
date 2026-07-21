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

// DELETE a review — ADMIN or SUPER_ADMIN
export async function DELETE(req: Request) {
  if (!(await requireAdminOrAbove())) return NextResponse.json({ error: "Unauthorized" }, { status: 403 });

  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");

    if (!id) return NextResponse.json({ error: "Missing Review ID" }, { status: 400 });

    const review = await prisma.review.findUnique({ where: { id } });
    if (!review) return NextResponse.json({ error: "Review not found" }, { status: 404 });

    // Delete the review
    await prisma.review.delete({ where: { id } });

    // Reset cached AI parameters for this teacher so parameters are recalculated fresh
    await prisma.user.update({
      where: { id: review.teacherId },
      data: { aiParameters: null }
    });

    return NextResponse.json({ message: "Review deleted successfully" });
  } catch (error: any) {
    console.error("Admin review delete error:", error);
    return NextResponse.json({ error: error?.message || "Failed to delete review" }, { status: 500 });
  }
}
