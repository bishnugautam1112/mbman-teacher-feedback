import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/backend/auth/auth";
import { prisma } from "@/backend/db/prisma";

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || !session.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const user = session.user as any;
    if (user.role !== "TEACHER") {
      return NextResponse.json({ error: "Forbidden: Only teachers can reply" }, { status: 403 });
    }

    const body = await req.json();
    const { reviewId, replyContent } = body;

    if (!reviewId || !replyContent) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    // Verify the review belongs to this teacher
    const review = await prisma.review.findUnique({
      where: { id: reviewId },
    });

    if (!review) {
      return NextResponse.json({ error: "Review not found" }, { status: 404 });
    }

    if (review.teacherId !== user.id) {
      return NextResponse.json({ error: "Forbidden: Not your review" }, { status: 403 });
    }

    // Update the review with the reply
    const updatedReview = await prisma.review.update({
      where: { id: reviewId },
      data: { teacherReply: replyContent.trim() },
    });

    return NextResponse.json({ message: "Reply posted successfully", review: updatedReview });
  } catch (error) {
    console.error("Teacher Reply Error:", error);
    return NextResponse.json({ error: "Failed to post reply" }, { status: 500 });
  }
}
