import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { generateDailyHash } from "@/lib/anonymity";
import { moderateReview } from "@/lib/gemini";

/**
 * POST /api/reviews
 * Submits an anonymous review for a teacher.
 * - Validates session and KYC status
 * - Generates a zero-linkage daily hash (HMAC-SHA256)
 * - Runs AI moderation via AIRA AI
 * - Stores the review without any student identity
 */
export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || !session.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const user = session.user as any;

    // Only verified students can submit reviews
    if (user.role !== "STUDENT") {
      return NextResponse.json({ error: "Only students can submit reviews." }, { status: 403 });
    }

    if (user.kycStatus !== "APPROVED") {
      return NextResponse.json({ error: "Your KYC must be approved before submitting reviews." }, { status: 403 });
    }

    const { teacherId, rating, rawContent } = await req.json();

    // Validate input
    if (!teacherId || !rating || !rawContent) {
      return NextResponse.json({ error: "Missing required fields (teacherId, rating, rawContent)." }, { status: 400 });
    }

    if (typeof rating !== "number" || rating < 1 || rating > 5) {
      return NextResponse.json({ error: "Rating must be between 1 and 5." }, { status: 400 });
    }

    if (typeof rawContent !== "string" || rawContent.trim().length < 10) {
      return NextResponse.json({ error: "Feedback must be at least 10 characters." }, { status: 400 });
    }

    // Verify the teacher exists
    const teacher = await prisma.user.findUnique({
      where: { id: teacherId },
    });

    if (!teacher || teacher.role !== "TEACHER") {
      return NextResponse.json({ error: "Invalid teacher." }, { status: 404 });
    }

    // Generate the zero-linkage daily hash
    // This ensures: 1 review per student, per teacher, per day — without storing the student's ID
    const dailyHash = generateDailyHash(user.id, teacherId);

    // Check if a review with this hash already exists (duplicate prevention)
    const existingReview = await prisma.review.findUnique({
      where: { dailyHash },
    });

    if (existingReview) {
      return NextResponse.json(
        { error: "You have already reviewed this teacher today. Try again tomorrow." },
        { status: 409 }
      );
    }

    // Run AI moderation on the raw feedback via AIRA AI
    const { thirdPersonSummary, firstPersonSanitized } = await moderateReview(rawContent);

    // Fetch the student's batch year (stored during KYC, never linked to the review)
    const studentRecord = await prisma.user.findUnique({
      where: { id: user.id },
      select: { batchYear: true },
    });

    // Flag as anomalous if the rating is highly critical (<= 2)
    const isAnomalous = rating <= 2;

    // Create the anonymous review — NO studentId is ever saved
    const review = await prisma.review.create({
      data: {
        dailyHash,
        teacherId,
        rawContent: rawContent.trim(),
        moderatedText: thirdPersonSummary,
        studentFacingText: firstPersonSanitized,
        rating,
        studentBatchYear: studentRecord?.batchYear || null,
        isAnomalous,
      },
    });

    return NextResponse.json({
      message: "Your anonymous feedback has been submitted and AI-sanitized. Thank you!",
      reviewId: review.id,
    });
  } catch (error: any) {
    console.error("Review Submission Error:", error);

    // Handle Prisma unique constraint violation (race condition fallback)
    if (error?.code === "P2002") {
      return NextResponse.json(
        { error: "You have already reviewed this teacher today." },
        { status: 409 }
      );
    }

    return NextResponse.json(
      { error: "An unexpected error occurred while submitting your review." },
      { status: 500 }
    );
  }
}

/**
 * GET /api/reviews?teacherId=xxx
 * Fetches all reviews for a specific teacher.
 * Used by the teacher dashboard to display feedback.
 */
export async function GET(req: Request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || !session.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const teacherId = searchParams.get("teacherId");

    if (!teacherId) {
      return NextResponse.json({ error: "teacherId is required" }, { status: 400 });
    }

    const reviews = await prisma.review.findMany({
      where: { teacherId },
      orderBy: { createdAt: "desc" },
      select: {
        id: true,
        rating: true,
        moderatedText: true,
        studentBatchYear: true,
        createdAt: true,
        teacherReply: true,
        isAnomalous: true,
        // rawContent is intentionally excluded — only sanitized text is exposed
      },
    });

    // Calculate aggregate stats
    const totalReviews = reviews.length;
    const averageRating =
      totalReviews > 0
        ? Math.round((reviews.reduce((sum, r) => sum + r.rating, 0) / totalReviews) * 10) / 10
        : 0;

    return NextResponse.json({
      reviews,
      stats: {
        totalReviews,
        averageRating,
      },
    });
  } catch (error) {
    console.error("Fetch Reviews Error:", error);
    return NextResponse.json(
      { error: "Failed to fetch reviews." },
      { status: 500 }
    );
  }
}