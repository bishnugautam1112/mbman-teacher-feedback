import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

/**
 * GET /api/leaderboard?period=daily|weekly|monthly|all
 * Returns teachers ranked by a weighted score:
 *   score = (averageRating * 0.7) + (log2(reviewCount + 1) * 0.3)
 * This prevents a teacher with 1 perfect review from beating a teacher
 * with 50 reviews averaging 4.5.
 */
export async function GET(req: Request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || !session.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const user = session.user as any;

    const { searchParams } = new URL(req.url);
    const period = searchParams.get("period") || "all";

    // Calculate the date filter based on period
    let dateFilter: Date | null = null;
    const now = new Date();

    if (period === "daily") {
      dateFilter = new Date(now);
      dateFilter.setHours(0, 0, 0, 0);
    } else if (period === "weekly") {
      dateFilter = new Date(now);
      dateFilter.setDate(dateFilter.getDate() - 7);
      dateFilter.setHours(0, 0, 0, 0);
    } else if (period === "monthly") {
      dateFilter = new Date(now);
      dateFilter.setMonth(dateFilter.getMonth() - 1);
      dateFilter.setHours(0, 0, 0, 0);
    }
    // "all" → no date filter

    // Fetch all teachers
    const teacherWhereClause: any = { role: "TEACHER" };
    
    // If student, filter by their department and BASIC_SCIENCE
    if (user.role === "STUDENT") {
      teacherWhereClause.OR = [
        { department: user.department },
        { department: "BASIC_SCIENCE" }
      ];
    }
    
    const teachers = await prisma.user.findMany({
      where: teacherWhereClause,
      select: {
        id: true,
        name: true,
        department: true,
        image: true,
      },
    });

    // Fetch reviews with optional date filter
    const reviewWhereClause: any = {};
    if (dateFilter) {
      reviewWhereClause.createdAt = { gte: dateFilter };
    }

    // Build leaderboard data for each teacher
    const leaderboardData = await Promise.all(
      teachers.map(async (teacher) => {
        const reviews = await prisma.review.findMany({
          where: {
            teacherId: teacher.id,
            ...reviewWhereClause,
          },
          select: {
            rating: true,
          },
        });

        const totalReviews = reviews.length;
        const averageRating =
          totalReviews > 0
            ? Math.round(
                (reviews.reduce((sum, r) => sum + r.rating, 0) / totalReviews) * 10
              ) / 10
            : 0;

        // Weighted score formula:
        // 70% average rating + 30% log-scaled review count
        // log2(count + 1) ensures diminishing returns on volume
        const weightedScore =
          totalReviews > 0
            ? Math.round(
                (averageRating * 0.7 + Math.log2(totalReviews + 1) * 0.3) * 100
              ) / 100
            : 0;

        return {
          id: teacher.id,
          name: teacher.name || "Unknown",
          department: teacher.department || "Faculty",
          image: teacher.image,
          totalReviews,
          averageRating,
          weightedScore,
        };
      })
    );

    // Sort by weighted score descending, then by average rating as tiebreaker
    leaderboardData.sort((a, b) => {
      if (b.weightedScore !== a.weightedScore) {
        return b.weightedScore - a.weightedScore;
      }
      return b.averageRating - a.averageRating;
    });

    // Add rank
    const rankedData = leaderboardData.map((teacher, index) => ({
      ...teacher,
      rank: index + 1,
    }));

    return NextResponse.json({
      period,
      leaderboard: rankedData,
      totalTeachers: rankedData.length,
    });
  } catch (error) {
    console.error("Leaderboard Error:", error);
    return NextResponse.json(
      { error: "Failed to fetch leaderboard" },
      { status: 500 }
    );
  }
}
