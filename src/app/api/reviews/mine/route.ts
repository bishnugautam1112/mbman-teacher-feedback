import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

/**
 * POST /api/reviews/mine
 * Fetches specific reviews by ID for the Anonymous Inbox feature.
 * We use POST to easily send an array of IDs in the JSON body.
 */
export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || !session.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { ids } = await req.json();

    if (!Array.isArray(ids) || ids.length === 0) {
      return NextResponse.json({ reviews: [] });
    }

    // Limit the number of IDs to prevent abuse
    const limitedIds = ids.slice(0, 50);

    const reviews = await prisma.review.findMany({
      where: {
        id: { in: limitedIds }
      },
      orderBy: { createdAt: "desc" },
    });

    const teacherIds = Array.from(new Set(reviews.map(r => r.teacherId)));
    const teachers = await prisma.user.findMany({
      where: { id: { in: teacherIds } },
      select: { id: true, name: true, department: true }
    });
    
    const teacherMap = Object.fromEntries(teachers.map(t => [t.id, t]));

    const reviewsWithTeacher = reviews.map(r => ({
      ...r,
      teacher: teacherMap[r.teacherId] || { name: "Unknown", department: "Unknown" }
    }));

    return NextResponse.json({ reviews: reviewsWithTeacher });
  } catch (error) {
    console.error("Fetch My Reviews Error:", error);
    return NextResponse.json(
      { error: "Failed to fetch reviews." },
      { status: 500 }
    );
  }
}
